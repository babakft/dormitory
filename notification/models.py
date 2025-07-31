from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class AdminActivityTracker(models.Model):
    """Track when admin users last viewed different sections"""

    ACTIVITY_TYPES = [
        ('student_registrations', 'Student Registrations'),
        ('maintenance_requests', 'Maintenance Requests'),
        ('tickets', 'Tickets'),
        ('ticket_messages', 'Ticket Messages'),
        ('maintenance_status_changes', 'Maintenance Status Changes'),
    ]

    admin_user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='activity_trackers'
    )
    activity_type = models.CharField(max_length=30, choices=ACTIVITY_TYPES)
    last_viewed_at = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ['admin_user', 'activity_type']
        indexes = [
            models.Index(fields=['admin_user', 'activity_type']),
        ]

    def __str__(self):
        return f"{self.admin_user.username} - {self.get_activity_type_display()}"

    @classmethod
    def mark_as_viewed(cls, user, activity_type):
        """Mark an activity type as viewed by updating timestamp"""
        if not user.is_staff:
            return

        tracker, created = cls.objects.get_or_create(
            admin_user=user,
            activity_type=activity_type,
            defaults={'last_viewed_at': timezone.now()}
        )

        if not created:
            tracker.last_viewed_at = timezone.now()
            tracker.save(update_fields=['last_viewed_at'])

    @classmethod
    def get_new_counts(cls, user):
        """Get counts of new items since last view"""
        from student.models import Student
        from maintenance.models import MaintenanceRequest
        from ticket.models import Ticket, TicketMessage

        if not user.is_staff:
            return {}

        counts = {
            'student_registrations': 0,
            'maintenance_requests': 0,
            'maintenance_completed': 0,
            'tickets': 0,
            'ticket_messages': 0,
            'maintenance_status_changes': 0,
            'total': 0
        }

        # Get or create trackers for this admin
        trackers = {
            tracker.activity_type: tracker.last_viewed_at
            for tracker in cls.objects.filter(admin_user=user)
        }

        # New student registrations (pending only)
        last_viewed = trackers.get('student_registrations', timezone.now() - timezone.timedelta(days=365))
        counts['student_registrations'] = Student.objects.filter(
            registration_status='pending',
            created_at__gt=last_viewed
        ).count()

        # New maintenance requests
        last_viewed = trackers.get('maintenance_requests', timezone.now() - timezone.timedelta(days=365))
        counts['maintenance_requests'] = MaintenanceRequest.objects.filter(
            created_at__gt=last_viewed
        ).count()

        # New tickets
        last_viewed = trackers.get('tickets', timezone.now() - timezone.timedelta(days=365))
        counts['tickets'] = Ticket.objects.filter(
            created_at__gt=last_viewed
        ).count()

        # New ticket messages (from users only, not admin)
        last_viewed = trackers.get('ticket_messages', timezone.now() - timezone.timedelta(days=365))
        counts['ticket_messages'] = TicketMessage.objects.filter(
            is_admin_message=False,
            created_at__gt=last_viewed
        ).count()

        # Maintenance status changes (approved/rejected since last view)
        last_viewed = trackers.get('maintenance_status_changes', timezone.now() - timezone.timedelta(days=365))
        counts['maintenance_status_changes'] = MaintenanceRequest.objects.filter(
            updated_at__gt=last_viewed,
            status__in=['approved', 'rejected', 'completed']
        ).exclude(
            created_at__gt=last_viewed  # Don't count brand new ones
        ).count()

        # Maintenance completed by service experts (admins need to know!)
        last_viewed = trackers.get('maintenance_completed', timezone.now() - timezone.timedelta(days=365))
        counts['maintenance_completed'] = MaintenanceRequest.objects.filter(
            completed_at__gt=last_viewed,
            status='completed'
        ).count()

        counts['total'] = sum(v for k, v in counts.items() if k != 'total')

        return counts