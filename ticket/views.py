# ticket/views.py - Complete with Image Upload
from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib import messages
from django.views.generic import CreateView, ListView
from django.urls import reverse_lazy
from django.contrib.admin.views.decorators import staff_member_required
from django.db.models import Q, Count, Max
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import transaction
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from ticket.models import Ticket, TicketMessage
from ticket.forms import TicketForm, ChatImageUploadForm


class TicketCreateView(LoginRequiredMixin, CreateView):
    """Create new ticket for real-time chat"""
    model = Ticket
    form_class = TicketForm
    template_name = 'ticket/ticket_create.html'
    success_url = reverse_lazy('ticket:list')

    def get_login_url(self):
        if hasattr(self.request.user, 'student_profile'):
            return reverse_lazy('student_login')
        elif hasattr(self.request.user, 'expert_profile'):
            return reverse_lazy('service_login')
        return reverse_lazy('student_login')

    def form_valid(self, form):
        form.instance.created_by = self.request.user
        response = super().form_valid(form)
        messages.success(
            self.request,
            f'Ticket "{self.object.title}" created! Click to start real-time chat.'
        )
        return response


class TicketListView(LoginRequiredMixin, ListView):
    """List user's tickets"""
    model = Ticket
    template_name = 'ticket/ticket_list.html'
    context_object_name = 'tickets'
    paginate_by = 10

    def get_login_url(self):
        if hasattr(self.request.user, 'student_profile'):
            return reverse_lazy('student_login')
        elif hasattr(self.request.user, 'expert_profile'):
            return reverse_lazy('service_login')
        return reverse_lazy('student_login')

    def get_queryset(self):
        return Ticket.objects.filter(
            created_by=self.request.user
        ).prefetch_related('messages')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        user_tickets = self.get_queryset()
        context.update({
            'total_tickets': user_tickets.count(),
            'pending_tickets': user_tickets.filter(status='pending').count(),
            'answered_tickets': user_tickets.filter(status='answered').count(),
            'closed_tickets': user_tickets.filter(status='closed').count(),
        })
        return context


@login_required
def ticket_detail(request, pk):
    """View ticket with real-time chat interface"""
    ticket = get_object_or_404(Ticket, pk=pk)

    # Check permissions - user must be ticket creator or admin
    if not (request.user.is_staff or ticket.created_by == request.user):
        messages.error(request, 'Access denied.')
        return redirect('ticket:list')

    context = {
        'ticket': ticket,
        'can_chat': ticket.status != 'closed',
    }
    return render(request, 'ticket/ticket_chat.html', context)


# NEW: Image Upload Function
@login_required
@csrf_exempt
def upload_chat_image(request, ticket_id):
    """Upload image for chat message"""
    if request.method != 'POST':
        return JsonResponse({'error': 'POST method required'}, status=405)

    try:
        ticket = get_object_or_404(Ticket, id=ticket_id)

        # Check permissions
        if not (request.user.is_staff or ticket.created_by == request.user):
            return JsonResponse({'error': 'Permission denied'}, status=403)

        # Validate that we have an image file
        if 'image' not in request.FILES:
            return JsonResponse({'error': 'No image file provided'}, status=400)

        image_file = request.FILES['image']

        # Basic validation
        if not image_file.content_type.startswith('image/'):
            return JsonResponse({'error': 'Only image files are allowed'}, status=400)

        if image_file.size > 5 * 1024 * 1024:  # 5MB limit
            return JsonResponse({'error': 'Image size cannot exceed 5MB'}, status=400)

        # Create message with image
        with transaction.atomic():
            message = TicketMessage.objects.create(
                ticket=ticket,
                author=request.user,
                content="📷 Image shared",  # Default text for image messages
                image=image_file
            )

            # Update ticket timestamp
            ticket.save(update_fields=['updated_at'])

            # Broadcast via WebSocket
            channel_layer = get_channel_layer()
            if channel_layer:
                async_to_sync(channel_layer.group_send)(
                    f'ticket_{ticket_id}',
                    {
                        'type': 'chat_message',
                        'message': message.to_dict()
                    }
                )

        return JsonResponse({
            'success': True,
            'message': message.to_dict()
        })

    except Exception as e:
        return JsonResponse({'error': f'Upload failed: {str(e)}'}, status=500)


@staff_member_required
def admin_chat_list(request):
    """Admin dashboard showing all tickets with proper message counts"""

    # Updated query to count only unread messages
    tickets = Ticket.objects.select_related('created_by').annotate(
        message_count=Count('messages'),
        # Count only unread user messages
        unread_count=Count('messages', filter=Q(
            messages__is_admin_message=False,
            messages__read_by_admin=False
        ))
    ).prefetch_related('messages').order_by('-updated_at')

    # Filter by status if requested
    status_filter = request.GET.get('status')
    if status_filter and status_filter in ['pending', 'answered', 'closed']:
        tickets = tickets.filter(status=status_filter)

    # Calculate stats
    all_tickets = Ticket.objects.all()
    stats = {
        'total_tickets': all_tickets.count(),
        'pending_count': all_tickets.filter(status='pending').count(),
        'answered_count': all_tickets.filter(status='answered').count(),
        'closed_count': all_tickets.filter(status='closed').count(),
    }

    context = {
        'tickets': tickets,
        'current_status': status_filter,
        **stats
    }

    return render(request, 'admin/chat_list.html', context)


@staff_member_required
def admin_chat_interface(request, ticket_id):
    """Individual ticket chat interface for admin with message history"""

    ticket = get_object_or_404(
        Ticket.objects.select_related('created_by'),
        pk=ticket_id
    )

    # Mark ticket as viewed by admin when they open it
    if ticket.status == 'pending':
        ticket.status = 'answered'
        ticket.save(update_fields=['status', 'updated_at'])

    # NEW: Mark all user messages as read by admin
    ticket.messages.filter(is_admin_message=False, read_by_admin=False).update(read_by_admin=True)

    # Get existing messages for display
    existing_messages = ticket.messages.select_related('author').order_by('created_at')

    # Determine creator type for better display
    creator_type = ticket.get_creator_type()

    context = {
        'ticket': ticket,
        'existing_messages': existing_messages,
        'creator_type': creator_type,
    }

    return render(request, 'admin/chat_interface.html', context)