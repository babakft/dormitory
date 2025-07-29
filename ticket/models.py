# ticket/models.py - Updated with Image Support
from django.db import models
from django.utils import timezone
from student.models import User


class Ticket(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('answered', 'Answered'),
        ('closed', 'Closed'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_tickets')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"#{self.id} - {self.title}"

    @property
    def days_since_created(self):
        return (timezone.now() - self.created_at).days

    def get_creator_type(self):
        """Get the type of user who created this ticket"""
        if hasattr(self.created_by, 'student_profile'):
            return 'Student'
        elif hasattr(self.created_by, 'expert_profile'):
            return 'Service Expert'
        return 'Admin'

    @property
    def latest_message(self):
        """Get the most recent message"""
        return self.messages.order_by('-created_at').first()

    @property
    def unread_admin_messages_count(self):
        return self.messages.filter(is_admin_message=False).count()

    def mark_as_viewed_by_admin(self):
        if self.status == 'pending':
            self.status = 'answered'
            self.save(update_fields=['status', 'updated_at'])

    def close_ticket(self, closed_by_admin=None):
        """Close ticket and prevent further messages"""
        if self.status != 'closed':
            self.status = 'closed'
            self.save(update_fields=['status', 'updated_at'])

            # Log closure in messages
            if closed_by_admin:
                TicketMessage.objects.create(
                    ticket=self,
                    author=closed_by_admin,
                    content="🔒 This ticket has been closed by admin. No further messages can be sent.",
                    is_admin_message=True
                )
            return True
        return False

    def can_send_messages(self):
        """Check if ticket accepts new messages"""
        return self.status != 'closed'


class TicketMessage(models.Model):
    """Messages for real-time chat with image support"""

    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='messages')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ticket_messages')
    content = models.TextField()
    is_admin_message = models.BooleanField(default=False)
    read_by_admin = models.BooleanField(default=False)

    # Add image field
    image = models.ImageField(
        upload_to='ticket_images/%Y/%m/%d/',
        null=True,
        blank=True,
        help_text='Optional image attachment'
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        message_type = "Admin" if self.is_admin_message else "User"
        return f"{message_type} message in ticket #{self.ticket.id}"

    def save(self, *args, **kwargs):
        """Automatically detect if message is from admin"""
        # Check if user is admin/staff OR doesn't have student/expert profile
        self.is_admin_message = (
                self.author.is_staff or
                self.author.is_superuser or
                not (hasattr(self.author, 'student_profile') or hasattr(self.author, 'expert_profile'))
        )
        super().save(*args, **kwargs)

        # Update ticket's updated_at timestamp
        self.ticket.save(update_fields=['updated_at'])

    @property
    def has_image(self):
        """Check if message has an image attachment"""
        return bool(self.image)

    @property
    def image_url(self):
        """Get image URL if exists"""
        return self.image.url if self.image else None

    def to_dict(self):
        """Convert message to dictionary for WebSocket transmission"""
        return {
            'id': self.id,
            'content': self.content,
            'author': self.author.username,
            'is_admin_message': self.is_admin_message,
            'created_at': self.created_at.isoformat(),
            'author_type': 'admin' if self.is_admin_message else 'user',
            'has_image': self.has_image,
            'image_url': self.image_url,
        }
