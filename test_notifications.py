# Create this as: test_notifications.py in your project root
# Run with: python manage.py shell < test_notifications.py

from django.contrib.auth import get_user_model
from maintenance.models import MaintenanceRequest
from service.models import ServiceExpert
from notification.models import AdminActivityTracker
from django.utils import timezone

User = get_user_model()


def test_notification_system():
    """Test the notification system with maintenance requests"""

    print("=== TESTING NOTIFICATION SYSTEM ===")

    # Get or create an admin user
    admin_user, created = User.objects.get_or_create(
        username='testadmin',
        defaults={
            'email': 'admin@test.com',
            'is_staff': True,
            'is_superuser': True
        }
    )

    if created:
        admin_user.set_password('testpass')
        admin_user.save()
        print("Created test admin user")

    # Get initial counts
    print("\n1. Initial notification counts:")
    initial_counts = AdminActivityTracker.get_new_counts(admin_user)

    # Find a maintenance request to test with
    test_request = MaintenanceRequest.objects.filter(
        status__in=['approved', 'in_progress']
    ).first()

    if not test_request:
        print("No suitable maintenance request found for testing")
        return

    print(f"\n2. Testing with request: {test_request.id} - {test_request.title}")
    print(f"   Current status: {test_request.status}")
    print(f"   Updated at: {test_request.updated_at}")

    # Find a service expert
    expert = ServiceExpert.objects.filter(
        specialization=test_request.service_type,
        is_active=True
    ).first()

    if not expert:
        print("No suitable expert found for testing")
        return

    print(f"   Expert: {expert.user.username}")

    # Mark maintenance_status_changes as viewed (reset)
    AdminActivityTracker.mark_as_viewed(admin_user, 'maintenance_status_changes')
    print("\n3. Marked maintenance_status_changes as viewed (reset)")

    # Get counts after reset
    print("\n4. Counts after reset:")
    reset_counts = AdminActivityTracker.get_new_counts(admin_user)

    # Simulate status change by updating the request
    old_status = test_request.status
    old_updated_at = test_request.updated_at

    if test_request.status == 'approved':
        # Simulate expert claiming the request
        if not test_request.assigned_expert:
            test_request.assign_to_expert(expert)
            print(f"\n5. Assigned expert {expert.user.username} to request")

        # Start work
        test_request.start_work("Starting work on this issue")
        print(f"6. Started work (status: {old_status} -> {test_request.status})")

    elif test_request.status == 'in_progress':
        # Complete work
        test_request.complete_work("Work completed successfully")
        print(f"\n5. Completed work (status: {old_status} -> {test_request.status})")

    print(f"   Updated at changed: {old_updated_at} -> {test_request.updated_at}")

    # Get counts after change
    print("\n6. Counts after status change:")
    final_counts = AdminActivityTracker.get_new_counts(admin_user)

    # Check if the change was detected
    change_detected = final_counts['maintenance_status_changes'] > reset_counts['maintenance_status_changes']

    print(f"\n=== RESULT ===")
    print(f"Status change detected: {change_detected}")
    print(f"Before: {reset_counts['maintenance_status_changes']}")
    print(f"After: {final_counts['maintenance_status_changes']}")

    if change_detected:
        print("✅ Notification system is working!")
    else:
        print("❌ Issue detected - status changes not being counted")

        # Debug info
        tracker = AdminActivityTracker.objects.filter(
            admin_user=admin_user,
            activity_type='maintenance_status_changes'
        ).first()

        if tracker:
            print(f"Last viewed at: {tracker.last_viewed_at}")
            print(f"Request updated at: {test_request.updated_at}")
            print(f"Should count: {test_request.updated_at > tracker.last_viewed_at}")


if __name__ == "__main__":
    test_notification_system()