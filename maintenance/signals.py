# maintenance/signals.py
from django.db.models.signals import pre_save, post_init, post_save
from django.dispatch import receiver
from django.core.exceptions import ValidationError
from maintenance.models import MaintenanceRequest
from dormitory.utils.email_service import MaintenanceEmailService


@receiver(pre_save, sender=MaintenanceRequest)
def validate_priority_on_approval(sender, instance, **kwargs):
    """Ensure priority is set when approving requests"""
    if (instance.status == 'approved' and
            instance.priority == 'not_decided'):
        raise ValidationError(
            'Priority must be set when approving a request.'
        )


@receiver(post_init, sender=MaintenanceRequest)
def capture_maintenance_initial_state(sender, instance, **kwargs):
    """Capture initial status and assigned_expert for comparison"""
    instance._original_status = getattr(instance, 'status', None)
    instance._original_assigned_expert = getattr(instance, 'assigned_expert', None)


@receiver(post_save, sender=MaintenanceRequest)
def maintenance_status_notification(sender, instance, created, **kwargs):
    """Send email notifications when maintenance request status changes and track all changes"""

    # Skip for new creations
    if created:
        print(f"DEBUG: New maintenance request created: {instance.id} - {instance.status}")
        return

    # Skip if instance doesn't have an ID yet
    if not instance.id:
        return

    # Get original values (with fallback)
    original_status = getattr(instance, '_original_status', None)
    original_assigned_expert = getattr(instance, '_original_assigned_expert', None)
    current_status = instance.status
    current_assigned_expert = instance.assigned_expert

    print(f"DEBUG: Maintenance request {instance.id} signal triggered:")
    print(f"  - Original status: {original_status}")
    print(f"  - Current status: {current_status}")
    print(f"  - Original expert: {original_assigned_expert}")
    print(f"  - Current expert: {current_assigned_expert}")
    print(f"  - Updated at: {instance.updated_at}")

    # Track status changes
    status_changed = original_status and original_status != current_status
    expert_assigned = (original_assigned_expert != current_assigned_expert and
                       current_assigned_expert is not None)

    if status_changed:
        print(f"DEBUG: Status changed from {original_status} to {current_status}")

        try:
            if current_status == 'approved':
                MaintenanceEmailService.send_approved_email.delay(instance.id)
            elif current_status == 'rejected':
                MaintenanceEmailService.send_rejected_email.delay(instance.id)
            elif current_status == 'in_progress':
                MaintenanceEmailService.send_in_progress_email.delay(instance.id)
            elif current_status == 'completed':
                MaintenanceEmailService.send_completed_email.delay(instance.id)
        except Exception as e:
            # Log the error but don't crash the save operation
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to queue email task for maintenance request {instance.id}: {e}")

    if expert_assigned:
        print(f"DEBUG: Expert assigned: {current_assigned_expert.user.username}")

    # The key insight: ANY change (status or expert assignment) should trigger notification count update
    # The notification system checks updated_at timestamp, so we're good!