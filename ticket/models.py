from django.db import models
from django.utils import timezone
from student.models import User


class Ticket(models.Model):
    """Ticket system for students and service experts to communicate with admin"""

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('viewed', 'Viewed'),
        ('answered', 'Answered'),
        ('closed', 'Closed'),
    ]

    # Basic ticket information
    title = models.CharField(max_length=200)
    description = models.TextField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')

    # User relationships
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_tickets')

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']  # Most recent activity first

    def __str__(self):
        return f"#{self.id} - {self.title} ({self.created_by.username})"

    @property
    def days_since_created(self):
        return (timezone.now() - self.created_at).days

    @property
    def latest_message(self):
        """Get the most recent message in this ticket"""
        return self.messages.first()

    @property
    def unread_admin_messages(self):
        """Check if there are unread admin messages"""
        return self.messages.filter(is_admin_message=True).exists()

    def get_creator_type(self):
        """Return creator type for admin interface"""
        if hasattr(self.created_by, 'student_profile'):
            return 'Student'
        elif hasattr(self.created_by, 'expert_profile'):
            return 'Service Expert'
        return 'Admin'

    def close_ticket(self):
        """Close the ticket"""
        self.status = 'closed'
        self.save()

    def mark_as_viewed(self):
        """Mark ticket as viewed by admin"""
        if self.status == 'pending':
            self.status = 'viewed'
            self.save()


class TicketMessage(models.Model):
    """Messages within a ticket conversation"""

    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='messages')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ticket_messages')
    content = models.TextField()
    is_admin_message = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']  # Most recent first

    def __str__(self):
        message_type = "Admin" if self.is_admin_message else "User"
        return f"{message_type} message in ticket #{self.ticket.id}"

    def save(self, *args, **kwargs):
        # Determine if this is an admin message
        self.is_admin_message = (
                self.author.is_staff or
                self.author.is_superuser or
                not (hasattr(self.author, 'student_profile') or hasattr(self.author, 'expert_profile'))
        )
        super().save(*args, **kwargs)


class TicketAttachment(models.Model):
    """File attachments for ticket messages"""

    def get_upload_path(self, filename):
        """Dynamic upload path for ticket attachments"""
        return f'ticket_attachments/{self.message.ticket.id}/{filename}'

    message = models.ForeignKey(TicketMessage, on_delete=models.CASCADE, related_name='attachments')
    image = models.ImageField(upload_to=get_upload_path)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['uploaded_at']

    def __str__(self):
        return f"Attachment for ticket #{self.message.ticket.id}"