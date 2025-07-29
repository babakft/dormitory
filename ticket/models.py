# ticket/models.py
from django.db import models
from django.utils import timezone
from student.models import User


class Ticket(models.Model):
    """Ticket system for real-time chat with admin"""

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

    @property
    def latest_message(self):
        return self.messages.first()

    def get_creator_type(self):
        if hasattr(self.created_by, 'student_profile'):
            return 'Student'
        elif hasattr(self.created_by, 'expert_profile'):
            return 'Service Expert'
        return 'Admin'


class TicketMessage(models.Model):
    """Messages for real-time chat"""

    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='messages')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ticket_messages')
    content = models.TextField()
    is_admin_message = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        message_type = "Admin" if self.is_admin_message else "User"
        return f"{message_type} message in ticket #{self.ticket.id}"

    def save(self, *args, **kwargs):
        self.is_admin_message = (
            self.author.is_staff or
            self.author.is_superuser or
            not (hasattr(self.author, 'student_profile') or hasattr(self.author, 'expert_profile'))
        )
        super().save(*args, **kwargs)