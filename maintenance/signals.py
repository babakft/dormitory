from django.db.models.signals import pre_save
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