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
    """Capture initial status for comparison"""
    instance._original_status = getattr(instance, 'status', None)


@receiver(post_save, sender=MaintenanceRequest)
def maintenance_status_notification(sender, instance, created, **kwargs):
    """Send email notifications when maintenance request status changes"""

    # Skip for new creations or if instance doesn't have an ID yet
    if created or not instance.id:
        return

    # Get original status (with fallback)
    original_status = getattr(instance, '_original_status', None)
    current_status = instance.status

    # Only send emails if status actually changed
    if original_status and original_status != current_status:
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