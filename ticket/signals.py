from django.db.models.signals import post_save
from django.dispatch import receiver
from ticket.models import TicketMessage, Ticket
from dormitory.utils.email_service import TicketEmailService


@receiver(post_save, sender=TicketMessage)
def ticket_message_notification(sender, instance, created, **kwargs):
    """Handle ticket status changes and email notifications when messages are added"""

    if created:  # Only for new messages
        ticket = instance.ticket

        if instance.is_admin_message:
            # Admin replied to ticket
            ticket.status = 'answered'
            ticket.save()

            # Send async email notification to ticket creator
            TicketEmailService.send_admin_reply_notification.delay(ticket.id, instance.id)

        else:
            # User replied to ticket
            if ticket.status == 'answered':
                # Change status back to pending if user replies after admin answer
                ticket.status = 'pending'
                ticket.save()