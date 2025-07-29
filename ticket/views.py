# ticket/views.py - Fix the import and query

from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib import messages
from django.views.generic import CreateView, ListView
from django.urls import reverse_lazy
from django.contrib.admin.views.decorators import staff_member_required
from django.db.models import Q, Count, Max, F  # Add F import here
from ticket.models import Ticket
from ticket.forms import TicketForm


@staff_member_required
def admin_chat_list(request):
    """Admin dashboard showing all tickets with proper message counts"""

    # Simplified version without the complex F() query that was causing issues
    tickets = Ticket.objects.select_related('created_by').annotate(
        message_count=Count('messages'),
        # Simplified unread count - count all user messages
        unread_count=Count('messages', filter=Q(messages__is_admin_message=False))
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

###################### real_time ############3
@login_required
def ticket_detail(request, pk):
    """View ticket with real-time chat interface"""
    # Temporary: Remove user filter for testing
    ticket = get_object_or_404(Ticket, pk=pk)

    # Later we'll add this back:
    # ticket = get_object_or_404(
    #     Ticket.objects.select_related('created_by'),
    #     pk=pk,
    #     created_by=request.user
    # )

    context = {
        'ticket': ticket,
        'can_chat': ticket.status != 'closed',
    }
    return render(request, 'ticket/ticket_chat.html', context)


@staff_member_required
def admin_chat_list(request):
    """Admin dashboard showing all tickets with proper message counts"""

    # Simplified version without the complex F() query that was causing issues
    tickets = Ticket.objects.select_related('created_by').annotate(
        message_count=Count('messages'),
        # Simplified unread count - count all user messages
        unread_count=Count('messages', filter=Q(messages__is_admin_message=False))
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