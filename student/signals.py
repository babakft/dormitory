from django.db.models.signals import post_save, post_init
from django.dispatch import receiver
from student.models import Student, User
import threading
from dormitory.utils.email_service import StudentEmailService

@receiver(post_init, sender=Student)
@receiver(post_init, sender=User)
def capture_initial_state(sender, instance, **kwargs):
    if isinstance(instance, Student):
        instance._original_registration_status = instance.registration_status
    elif isinstance(instance, User):
        instance._original_is_active = instance.is_active


@receiver(post_save, sender=Student)
def student_status_change_notification(sender, instance, created, **kwargs):
    original_status = getattr(instance, '_original_registration_status', None)
    current_status = instance.registration_status

    if original_status != current_status:
        if current_status == 'approved' and original_status in ['pending', 'rejected']:
            # Status changed to approved - send async task
            StudentEmailService.send_approval_email.delay(instance.id)

        elif current_status == 'rejected' and original_status == 'pending':
            # Status changed to rejected - send async task
            StudentEmailService.send_rejection_email.delay(instance.id)


@receiver(post_save, sender=User)
def user_activation_status_notification(sender, instance, created, **kwargs):
    original_is_active = getattr(instance, '_original_is_active', None)
    current_is_active = instance.is_active

    if original_is_active != current_is_active:
        if original_is_active is True and current_is_active is False:
            # User was deactivated
            if hasattr(instance, 'student_profile'):
                StudentEmailService.send_deactivation_email.delay(instance.student_profile.id)


######## Delete student if email not verified after 15 minutes ############
def delete_unverified_student(student_id):
    try:
        student = Student.objects.get(id=student_id)
        # Check if still not verified (user is still inactive)
        if not student.user.is_active:
            print(f"Deleting unverified student: {student.user.username}")
            student.user.delete()
    except Student.DoesNotExist:
        pass  # Student already deleted or verified


@receiver(post_save, sender=Student)
def schedule_student_deletion(sender, instance, created, **kwargs):
    """Schedule student deletion if email not verified in 15 minutes"""
    if created and not instance.user.is_active:
        # Schedule deletion after 15 minutes (900 seconds)
        timer = threading.Timer(900.0, delete_unverified_student, args=[instance.id])
        timer.start()