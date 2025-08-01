# notification/models.py
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class AdminActivityTracker(models.Model):
    """Track when admin users last viewed different sections"""

    ACTIVITY_TYPES = [
        ('student_registrations', 'Student Registrations'),
        ('maintenance_requests', 'Maintenance Requests'),
        ('maintenance_status_changes', 'Maintenance Status Changes'),
        ('tickets', 'Tickets'),
        ('ticket_messages', 'Ticket Messages'),
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

        # Validate activity_type
        valid_types = [choice[0] for choice in cls.ACTIVITY_TYPES]
        if activity_type not in valid_types:
            print(f"WARNING: Invalid activity_type '{activity_type}'. Valid types: {valid_types}")
            return

        tracker, created = cls.objects.get_or_create(
            admin_user=user,
            activity_type=activity_type,
            defaults={'last_viewed_at': timezone.now()}
        )

        if not created:
            tracker.last_viewed_at = timezone.now()
            tracker.save(update_fields=['last_viewed_at'])

        print(f"DEBUG: Marked {activity_type} as viewed for {user.username}")

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
            'maintenance_status_changes': 0,
            'tickets': 0,
            'ticket_messages': 0,
            'total': 0
        }

        # Get trackers for this admin
        trackers = {
            tracker.activity_type: tracker.last_viewed_at
            for tracker in cls.objects.filter(admin_user=user)
        }

        # Default to very old date if never viewed
        default_date = timezone.now() - timezone.timedelta(days=365)

        print(f"DEBUG: Getting notification counts for {user.username}")
        print(f"DEBUG: Trackers: {trackers}")

        # 1. New student registrations (pending only)
        last_viewed = trackers.get('student_registrations', default_date)
        counts['student_registrations'] = Student.objects.filter(
            registration_status='pending',
            created_at__gt=last_viewed
        ).count()
        print(f"DEBUG: Student registrations since {last_viewed}: {counts['student_registrations']}")

        # 2. New maintenance requests (pending only, created after last view)
        last_viewed = trackers.get('maintenance_requests', default_date)
        counts['maintenance_requests'] = MaintenanceRequest.objects.filter(
            status='pending',
            created_at__gt=last_viewed
        ).count()
        print(f"DEBUG: New maintenance requests since {last_viewed}: {counts['maintenance_requests']}")

        # 3. Maintenance status changes (ALL status changes: approved, rejected, in_progress, completed)
        last_viewed = trackers.get('maintenance_status_changes', default_date)

        # Get all requests that have been updated since last view AND have non-pending status
        status_change_requests = MaintenanceRequest.objects.filter(
            updated_at__gt=last_viewed,
            status__in=['approved', 'rejected', 'in_progress', 'completed']
        ).exclude(
            # Exclude requests created after last view (those are "new requests", not "status changes")
            created_at__gt=last_viewed
        )

        counts['maintenance_status_changes'] = status_change_requests.count()

        print(f"DEBUG: Maintenance status changes since {last_viewed}: {counts['maintenance_status_changes']}")
        if counts['maintenance_status_changes'] > 0:
            print("DEBUG: Status change requests:")
            for req in status_change_requests[:5]:  # Show first 5
                print(f"  - Request {req.id}: {req.title} - Status: {req.status} - Updated: {req.updated_at}")

        # 4. New tickets (created after last view)
        last_viewed = trackers.get('tickets', default_date)
        counts['tickets'] = Ticket.objects.filter(
            created_at__gt=last_viewed
        ).count()
        print(f"DEBUG: New tickets since {last_viewed}: {counts['tickets']}")

        # 5. New ticket messages (unread user messages created after last view)
        last_viewed = trackers.get('ticket_messages', default_date)
        counts['ticket_messages'] = TicketMessage.objects.filter(
            is_admin_message=False,
            read_by_admin=False,
            created_at__gt=last_viewed
        ).count()
        print(f"DEBUG: New ticket messages since {last_viewed}: {counts['ticket_messages']}")

        counts['total'] = sum(v for k, v in counts.items() if k != 'total')

        print(f"DEBUG: Final notification counts for {user.username}: {counts}")

        return counts