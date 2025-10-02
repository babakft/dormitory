# ticket/models.py - Updated with Image Support
from django.db import models
from django.utils import timezone
from student.models import User


class Ticket(models.Model):
    STATUS_CHOICES = [
        ('pending', 'در انتظار پاسخ'),
        ('answered', 'پاسخ داده شده'),
        ('closed', 'بسته شده'),
    ]

    title = models.CharField(max_length=200, verbose_name='عنوان')
    description = models.TextField(verbose_name='توضیحات')
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='pending',
        verbose_name='وضعیت'
    )
    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='created_tickets',
        verbose_name='ایجاد شده توسط'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='تاریخ ایجاد')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='تاریخ به‌روزرسانی')

    def __str__(self):
        return f"#{self.id} - {self.title}"

    class Meta:
        verbose_name = 'تیکت'
        verbose_name_plural = 'تیکت‌ها'
        ordering = ['-created_at']

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
            # Update status and save
            self.status = 'closed'
            self.save(update_fields=['status', 'updated_at'])

            # Add closure message
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

    ticket = models.ForeignKey(
        Ticket,
        on_delete=models.CASCADE,
        related_name='messages',
        verbose_name='تیکت'
    )
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='ticket_messages',
        verbose_name='نویسنده'
    )
    content = models.TextField(verbose_name='محتوا')
    is_admin_message = models.BooleanField(default=False, verbose_name='پیام ادمین')
    read_by_admin = models.BooleanField(default=False, verbose_name='خوانده شده توسط ادمین')

    image = models.ImageField(
        upload_to='ticket_images/%Y/%m/%d/',
        null=True,
        blank=True,
        help_text='تصویر پیوست اختیاری',
        verbose_name='تصویر'
    )

    created_at = models.DateTimeField(auto_now_add=True, verbose_name='تاریخ ایجاد')

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        message_type = "Admin" if self.is_admin_message else "User"
        return f"{message_type} message in ticket #{self.ticket.id}"

    class Meta:
        verbose_name = 'پیام تیکت'
        verbose_name_plural = 'پیام‌های تیکت'
        ordering = ['created_at']

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
