from django.db.models.signals import post_save
from django.dispatch import receiver
from ticket.models import TicketMessage, Ticket
from dormitory.utils.email_service import TicketEmailService


@receiver(post_save, sender=TicketMessage)
def ticket_message_notification(sender, instance, created, **kwargs):
    """Handle ticket status changes and email notifications when messages are added"""

    if created:  # Only for new messages
        ticket = instance.ticket

        # Don't change status if ticket is already closed
        if ticket.status == 'closed':
            return

        if instance.is_admin_message:
            # Admin replied to ticket - only change to answered if not closed
            if ticket.status != 'closed':
                ticket.status = 'answered'
                ticket.save()

            # Send async email notification to ticket creator
            TicketEmailService.send_admin_reply_notification.delay(ticket.id, instance.id)

        else:
            # User replied to ticket - only change to pending if was answered and not closed
            if ticket.status == 'answered':
                ticket.status = 'pending'
                ticket.save()