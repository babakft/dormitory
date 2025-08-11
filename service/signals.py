from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from django.core.exceptions import ValidationError
from maintenance.models import MaintenanceRequest


@receiver(pre_save, sender=MaintenanceRequest)
def validate_priority_on_approval(sender, instance, **kwargs):
    """Ensure priority is set when approving requests"""
    if (instance.status == 'approved' and
            instance.priority == 'not_decided'):
        raise ValidationError(
            'Priority must be set when approving a request.'
        )


@receiver(post_save, sender=MaintenanceRequest)
def update_expert_rating_on_save(sender, instance, created, **kwargs):
    """Update expert rating when maintenance request is completed with rating"""

    # Only update if request is completed and has an assigned expert and rating
    if (instance.status == 'completed' and
            instance.assigned_expert and
            instance.student_rating is not None):
        instance.assigned_expert.update_average_rating()
