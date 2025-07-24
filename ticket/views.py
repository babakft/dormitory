from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib import messages
from django.views.generic import CreateView, ListView
from django.urls import reverse_lazy
from django.db import transaction
from ticket.models import Ticket
from ticket.forms import TicketForm, TicketReplyForm


class TicketCreateView(LoginRequiredMixin, CreateView):
    """Create new ticket"""
    model = Ticket
    form_class = TicketForm
    template_name = 'ticket/ticket_create.html'
    success_url = reverse_lazy('ticket:list')

    def get_login_url(self):
        """Redirect to appropriate login based on user type"""
        if hasattr(self.request.user, 'student_profile'):
            return reverse_lazy('student_login')
        elif hasattr(self.request.user, 'expert_profile'):
            return reverse_lazy('service_login')
        return reverse_lazy('student_login')

    def get_form_kwargs(self):
        """Pass the user to the form"""
        kwargs = super().get_form_kwargs()
        kwargs['user'] = self.request.user
        return kwargs

    def form_valid(self, form):
        try:
            with transaction.atomic():
                response = super().form_valid(form)
                messages.success(
                    self.request,
                    f'Ticket "{self.object.title}" has been created successfully. You will receive email notifications when admin responds.'
                )
                return response
        except Exception as e:
            messages.error(self.request, 'Failed to create ticket. Please try again.')
            return self.form_invalid(form)


class TicketListView(LoginRequiredMixin, ListView):
    """List user's tickets"""
    model = Ticket
    template_name = 'ticket/ticket_list.html'
    context_object_name = 'tickets'
    paginate_by = 10

    def get_login_url(self):
        """Redirect to appropriate login based on user type"""
        if hasattr(self.request.user, 'student_profile'):
            return reverse_lazy('student_login')
        elif hasattr(self.request.user, 'expert_profile'):
            return reverse_lazy('service_login')
        return reverse_lazy('student_login')

    def get_queryset(self):
        """Only show user's own tickets"""
        return Ticket.objects.filter(
            created_by=self.request.user
        ).prefetch_related('messages')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        # Add statistics
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
    """View ticket details with full conversation"""

    # Get appropriate login URL
    login_url = 'student_login'
    if hasattr(request.user, 'expert_profile'):
        login_url = 'service_login'

    # Only allow users to see their own tickets
    ticket = get_object_or_404(
        Ticket.objects.prefetch_related('messages__attachments', 'messages__author'),
        pk=pk,
        created_by=request.user
    )

    # Get all messages in conversation (most recent first)
    messages_list = ticket.messages.all()

    context = {
        'ticket': ticket,
        'messages': messages_list,
        'can_reply': ticket.status != 'closed',  # Users can't reply to closed tickets
    }

    return render(request, 'ticket/ticket_detail.html', context)


@login_required
def ticket_reply(request, pk):
    """Reply to a ticket"""

    # Get appropriate login URL
    login_url = 'student_login'
    if hasattr(request.user, 'expert_profile'):
        login_url = 'service_login'

    # Only allow users to reply to their own tickets
    ticket = get_object_or_404(
        Ticket.objects.select_related('created_by'),
        pk=pk,
        created_by=request.user
    )

    # Check if ticket is closed
    if ticket.status == 'closed':
        messages.error(request, 'Cannot reply to a closed ticket.')
        return redirect('ticket:detail', pk=pk)

    if request.method == 'POST':
        form = TicketReplyForm(request.POST, request.FILES)
        if form.is_valid():
            try:
                with transaction.atomic():
                    # Save the reply message
                    message = form.save_message(ticket, request.user)

                    messages.success(
                        request,
                        'Your reply has been added successfully. You will receive an email when admin responds.'
                    )
                    return redirect('ticket:detail', pk=pk)
            except Exception as e:
                messages.error(request, 'Failed to add reply. Please try again.')
    else:
        form = TicketReplyForm()

    context = {
        'form': form,
        'ticket': ticket,
    }

    return render(request, 'ticket/ticket_reply.html', context)