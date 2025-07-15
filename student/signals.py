from django.db.models.signals import post_save, post_init
from django.dispatch import receiver
from student.models import Student,User


@receiver(post_init, sender=Student)
def capture_initial_state(sender, instance, **kwargs):
    instance._original_registration_status = instance.registration_status

@receiver(post_save, sender=Student)
def student_status_change_notification(sender, instance, created, **kwargs):
    original_status = getattr(instance, '_original_registration_status', None)
    current_status = instance.registration_status

    if original_status != current_status:
        if current_status == 'approved' and original_status in ['pending', 'rejected']:
            # Status changed to approved
            instance.send_approval_email()

        elif current_status == 'rejected' and original_status == 'pending':
            # Status changed to rejected
            instance.send_rejection_email()


@receiver(post_init, sender=User)
def capture_user_initial_state(sender, instance, **kwargs):
    instance._original_is_active = instance.is_active


@receiver(post_save, sender=User)
def user_activation_status_notification(sender, instance, created, **kwargs):

    original_is_active = getattr(instance, '_original_is_active', None)
    current_is_active = instance.is_active

    if original_is_active != current_is_active:
        if original_is_active is True and current_is_active is False:
            # User was deactivated
            instance.student_profile.send_deactivation_email()

    instance._original_is_active = current_is_active