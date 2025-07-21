from django.db.models.signals import pre_save,post_init,post_save
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


###email###
@receiver(post_init, sender=MaintenanceRequest)
def capture_maintenance_initial_state(sender, instance, **kwargs):
    instance._original_status = instance.status


@receiver(post_save, sender=MaintenanceRequest)
def maintenance_status_notification(sender, instance, created, **kwargs):
    """Send email notifications when maintenance request status changes"""
    if not created:  # Only for updates, not new creations
        original_status = getattr(instance, '_original_status', None)
        current_status = instance.status

        if original_status != current_status:
            if current_status == 'approved':
                MaintenanceEmailService.send_approved_email(instance)
            elif current_status == 'rejected':
                MaintenanceEmailService.send_rejected_email(instance)
            elif current_status == 'in_progress':
                MaintenanceEmailService.send_in_progress_email(instance)
            elif current_status == 'completed':
                MaintenanceEmailService.send_completed_email(instance)
