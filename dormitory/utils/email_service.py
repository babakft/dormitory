from abc import ABC
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.urls import reverse
from django.utils import timezone
from celery import shared_task
import logging

logger = logging.getLogger(__name__)


class BaseEmailService(ABC):
    """Abstract base class for all email services"""

    @staticmethod
    def _send_email(subject, message, recipient_list, fail_silently=False):
        """Base method for sending emails - now used by tasks"""
        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=recipient_list,
                fail_silently=fail_silently,
            )
            return True
        except Exception as e:
            logger.error(f"Failed to send email to {recipient_list}: {str(e)}")
            # Re-raise exception so Celery can handle retries
            raise e

    @classmethod
    def _get_base_url(cls):
        """Get base URL for the application"""
        return getattr(settings, 'BASE_URL', 'http://127.0.0.1:8000')


class StudentEmailService(BaseEmailService):

    @staticmethod
    @shared_task(bind=True, max_retries=5, default_retry_delay=15)
    def send_verification_email(self, student_id, verification_url):
        """Async task for sending verification email"""
        try:
            from student.models import Student
            student = Student.objects.select_related('user').get(id=student_id)

            context = {
                'student': student,
                'verification_url': verification_url,
            }

            message = render_to_string('emails/student/verification_email.txt', context)

            StudentEmailService._send_email(
                subject='Verify Your Email - Dormitory Registration',
                message=message,
                recipient_list=[student.user.email]
            )

            logger.info(f"Verification email sent successfully to {student.user.email}")

        except Exception as exc:
            if self.request.retries >= self.max_retries:
                # All retries exhausted - log to file
                with open('failed_emails.log', 'a') as f:
                    f.write(
                        f"{timezone.now()}: Failed to send verification email to student {student_id} ({student.user.email if 'student' in locals() else 'unknown'}): {exc}\n")
                return False
            else:
                logger.warning(f"Verification email failed (attempt {self.request.retries + 1}), retrying: {exc}")
                raise self.retry(exc=exc)

    @staticmethod
    @shared_task(bind=True, max_retries=5, default_retry_delay=15)
    def send_approval_email(self, student_id):
        """Async task for sending approval email"""
        try:
            from student.models import Student
            student = Student.objects.select_related('user').get(id=student_id)

            context = {
                'student': student,
                'username': student.user.username,
                'student_number': student.student_number,
                'room': student.room,
                'processed_by': student.processed_by_name,
                'processed_at': student.processed_at,
            }

            message = render_to_string('emails/student/approval_notification.txt', context)

            StudentEmailService._send_email(
                subject='✅ Registration Approved - Dormitory Management System',
                message=message,
                recipient_list=[student.user.email]
            )

            logger.info(f"Approval email sent successfully to {student.user.email}")

        except Exception as exc:
            if self.request.retries >= self.max_retries:
                with open('failed_emails.log', 'a') as f:
                    f.write(
                        f"{timezone.now()}: Failed to send approval email to student {student_id} ({student.user.email if 'student' in locals() else 'unknown'}): {exc}\n")
                return False
            else:
                logger.warning(f"Approval email failed (attempt {self.request.retries + 1}), retrying: {exc}")
                raise self.retry(exc=exc)

    @staticmethod
    @shared_task(bind=True, max_retries=5, default_retry_delay=15)
    def send_rejection_email(self, student_id):
        """Async task for sending rejection email"""
        try:
            from student.models import Student
            student = Student.objects.select_related('user').get(id=student_id)

            context = {
                'student': student,
                'username': student.user.username,
                'student_number': student.student_number,
                'rejection_reason': student.rejection_reason or 'Please contact administration for details.',
                'processed_by': student.processed_by_name,
                'processed_at': student.processed_at,
                'contact_email': settings.DEFAULT_FROM_EMAIL,
            }

            message = render_to_string('emails/student/rejection_notification.txt', context)

            StudentEmailService._send_email(
                subject='❌ Registration Update - Dormitory Management System',
                message=message,
                recipient_list=[student.user.email]
            )

            logger.info(f"Rejection email sent successfully to {student.user.email}")

        except Exception as exc:
            if self.request.retries >= self.max_retries:
                with open('failed_emails.log', 'a') as f:
                    f.write(
                        f"{timezone.now()}: Failed to send rejection email to student {student_id} ({student.user.email if 'student' in locals() else 'unknown'}): {exc}\n")
                return False
            else:
                logger.warning(f"Rejection email failed (attempt {self.request.retries + 1}), retrying: {exc}")
                raise self.retry(exc=exc)

    @staticmethod
    @shared_task(bind=True, max_retries=5, default_retry_delay=15)
    def send_deactivation_email(self, student_id):
        """Async task for sending deactivation email"""
        try:
            from student.models import Student
            student = Student.objects.select_related('user').get(id=student_id)

            context = {
                'student': student,
                'username': student.user.username,
                'student_number': student.student_number,
                'room': student.room,
            }

            message = render_to_string('emails/student/deactivation_notification.txt', context)

            StudentEmailService._send_email(
                subject='⚠️ Account Deactivated - Dormitory Management System',
                message=message,
                recipient_list=[student.user.email]
            )

            logger.info(f"Deactivation email sent successfully to {student.user.email}")

        except Exception as exc:
            if self.request.retries >= self.max_retries:
                with open('failed_emails.log', 'a') as f:
                    f.write(
                        f"{timezone.now()}: Failed to send deactivation email to student {student_id} ({student.user.email if 'student' in locals() else 'unknown'}): {exc}\n")
                return False
            else:
                logger.warning(f"Deactivation email failed (attempt {self.request.retries + 1}), retrying: {exc}")
                raise self.retry(exc=exc)

    @staticmethod
    @shared_task(bind=True, max_retries=5, default_retry_delay=15)
    def send_password_reset_email(self, student_id, new_password):
        """Async task for sending password reset email"""
        try:
            from student.models import Student
            student = Student.objects.select_related('user').get(id=student_id)

            context = {
                'student': student,
                'new_password': new_password,
                'username': student.user.username,
                'student_number': student.student_number,
            }

            message = render_to_string('emails/student/password_reset_student.txt', context)

            StudentEmailService._send_email(
                subject='🔐 Password Reset - Dormitory Management System',
                message=message,
                recipient_list=[student.user.email]
            )

            logger.info(f"Password reset email sent successfully to {student.user.email}")

        except Exception as exc:
            if self.request.retries >= self.max_retries:
                with open('failed_emails.log', 'a') as f:
                    f.write(
                        f"{timezone.now()}: Failed to send password reset email to student {student_id} ({student.user.email if 'student' in locals() else 'unknown'}): {exc}\n")
                return False
            else:
                logger.warning(f"Password reset email failed (attempt {self.request.retries + 1}), retrying: {exc}")
                raise self.retry(exc=exc)


class ServiceEmailService(BaseEmailService):

    @staticmethod
    @shared_task(bind=True, max_retries=5, default_retry_delay=15)
    def send_password_reset_email(self, expert_id, new_password):
        """Async task for sending service expert password reset email"""
        try:
            from service.models import ServiceExpert
            expert = ServiceExpert.objects.select_related('user').get(id=expert_id)

            context = {
                'expert': expert,
                'new_password': new_password,
                'username': expert.user.username,
                'employee_id': expert.employee_id,
            }

            message = render_to_string('emails/service/password_reset_expert.txt', context)

            ServiceEmailService._send_email(
                subject='🔐 Password Reset - Service Expert Portal',
                message=message,
                recipient_list=[expert.user.email]
            )

            logger.info(f"Service expert password reset email sent successfully to {expert.user.email}")

        except Exception as exc:
            if self.request.retries >= self.max_retries:
                with open('failed_emails.log', 'a') as f:
                    f.write(
                        f"{timezone.now()}: Failed to send service expert password reset email to expert {expert_id} ({expert.user.email if 'expert' in locals() else 'unknown'}): {exc}\n")
                return False
            else:
                logger.warning(
                    f"Service expert password reset email failed (attempt {self.request.retries + 1}), retrying: {exc}")
                raise self.retry(exc=exc)


class MaintenanceEmailService(BaseEmailService):
    """Email service for maintenance-related notifications"""

    @staticmethod
    @shared_task(bind=True, max_retries=5, default_retry_delay=15)
    def send_approved_email(self, maintenance_request_id):
        """Async task for sending maintenance request approval email"""
        try:
            from maintenance.models import MaintenanceRequest
            maintenance_request = MaintenanceRequest.objects.select_related(
                'student__user', 'room__building'
            ).get(id=maintenance_request_id)

            context = {
                'student': maintenance_request.student,
                'request': maintenance_request,
                'priority': maintenance_request.get_priority_display(),
                'approved_by': maintenance_request.approved_by_name,
                'approved_at': maintenance_request.approved_at,
            }

            message = render_to_string('emails/maintenance/maintenance_approved.txt', context)

            MaintenanceEmailService._send_email(
                subject='✅ Maintenance Request Approved',
                message=message,
                recipient_list=[maintenance_request.student.user.email]
            )

            logger.info(f"Maintenance approval email sent successfully to {maintenance_request.student.user.email}")

        except Exception as exc:
            if self.request.retries >= self.max_retries:
                with open('failed_emails.log', 'a') as f:
                    f.write(
                        f"{timezone.now()}: Failed to send maintenance approval email for request {maintenance_request_id}: {exc}\n")
                return False
            else:
                logger.warning(
                    f"Maintenance approval email failed (attempt {self.request.retries + 1}), retrying: {exc}")
                raise self.retry(exc=exc)

    @staticmethod
    @shared_task(bind=True, max_retries=5, default_retry_delay=15)
    def send_rejected_email(self, maintenance_request_id):
        """Async task for sending maintenance request rejection email"""
        try:
            from maintenance.models import MaintenanceRequest
            maintenance_request = MaintenanceRequest.objects.select_related(
                'student__user', 'room__building'
            ).get(id=maintenance_request_id)

            context = {
                'student': maintenance_request.student,
                'request': maintenance_request,
                'rejected_by': maintenance_request.approved_by_name,
                'rejected_at': maintenance_request.approved_at,
                'rejection_reason': maintenance_request.rejection_reason,
            }

            message = render_to_string('emails/maintenance/maintenance_rejected.txt', context)

            MaintenanceEmailService._send_email(
                subject='❌ Maintenance Request Update',
                message=message,
                recipient_list=[maintenance_request.student.user.email]
            )

            logger.info(f"Maintenance rejection email sent successfully to {maintenance_request.student.user.email}")

        except Exception as exc:
            if self.request.retries >= self.max_retries:
                with open('failed_emails.log', 'a') as f:
                    f.write(
                        f"{timezone.now()}: Failed to send maintenance rejection email for request {maintenance_request_id}: {exc}\n")
                return False
            else:
                logger.warning(
                    f"Maintenance rejection email failed (attempt {self.request.retries + 1}), retrying: {exc}")
                raise self.retry(exc=exc)

    @staticmethod
    @shared_task(bind=True, max_retries=5, default_retry_delay=15)
    def send_in_progress_email(self, maintenance_request_id):
        """Async task for sending maintenance in progress email"""
        try:
            from maintenance.models import MaintenanceRequest
            maintenance_request = MaintenanceRequest.objects.select_related(
                'student__user', 'assigned_expert__user', 'room__building'
            ).get(id=maintenance_request_id)

            context = {
                'student': maintenance_request.student,
                'request': maintenance_request,
                'assigned_expert': maintenance_request.assigned_expert,
                'work_started_at': maintenance_request.work_started_at,
            }

            message = render_to_string('emails/maintenance/maintenance_in_progress.txt', context)

            MaintenanceEmailService._send_email(
                subject='🔧 Work Started on Your Maintenance Request',
                message=message,
                recipient_list=[maintenance_request.student.user.email]
            )

            logger.info(f"Maintenance in-progress email sent successfully to {maintenance_request.student.user.email}")

        except Exception as exc:
            if self.request.retries >= self.max_retries:
                with open('failed_emails.log', 'a') as f:
                    f.write(
                        f"{timezone.now()}: Failed to send maintenance in-progress email for request {maintenance_request_id}: {exc}\n")
                return False
            else:
                logger.warning(
                    f"Maintenance in-progress email failed (attempt {self.request.retries + 1}), retrying: {exc}")
                raise self.retry(exc=exc)

    @staticmethod
    @shared_task(bind=True, max_retries=5, default_retry_delay=15)
    def send_completed_email(self, maintenance_request_id):
        """Async task for sending maintenance work completed email with review link"""
        try:
            from maintenance.models import MaintenanceRequest
            maintenance_request = MaintenanceRequest.objects.select_related(
                'student__user', 'assigned_expert__user', 'room__building'
            ).get(id=maintenance_request_id)

            # Simple URL building
            review_path = reverse('maintenance:rate', kwargs={'pk': maintenance_request.pk})
            review_url = MaintenanceEmailService._get_base_url() + review_path

            context = {
                'student': maintenance_request.student,
                'request': maintenance_request,
                'assigned_expert': maintenance_request.assigned_expert,
                'completed_at': maintenance_request.completed_at,
                'completion_notes': maintenance_request.completion_notes,
                'review_url': review_url,
            }

            message = render_to_string('emails/maintenance/maintenance_completed.txt', context)

            MaintenanceEmailService._send_email(
                subject='✅ Maintenance Request Completed - Please Rate Our Service',
                message=message,
                recipient_list=[maintenance_request.student.user.email]
            )

            logger.info(f"Maintenance completion email sent successfully to {maintenance_request.student.user.email}")

        except Exception as exc:
            if self.request.retries >= self.max_retries:
                with open('failed_emails.log', 'a') as f:
                    f.write(
                        f"{timezone.now()}: Failed to send maintenance completion email for request {maintenance_request_id}: {exc}\n")
                return False
            else:
                logger.warning(
                    f"Maintenance completion email failed (attempt {self.request.retries + 1}), retrying: {exc}")
                raise self.retry(exc=exc)


class TicketEmailService(BaseEmailService):
    """Email service for ticket-related notifications"""

    @staticmethod
    @shared_task(bind=True, max_retries=5, default_retry_delay=15)
    def send_admin_reply_notification(self, ticket_id, admin_message_id):
        """Async task for sending notification when admin replies to a ticket"""
        try:
            from ticket.models import Ticket, TicketMessage
            ticket = Ticket.objects.select_related('created_by').get(id=ticket_id)
            admin_message = TicketMessage.objects.get(id=admin_message_id)

            # Determine user type for personalized message
            user_type = ticket.get_creator_type()

            context = {
                'ticket': ticket,
                'user': ticket.created_by,
                'user_type': user_type,
                'ticket_url': TicketEmailService._get_base_url() + f'/ticket/{ticket.pk}/',
            }

            message = render_to_string('emails/ticket/admin_reply_notification.txt', context)

            TicketEmailService._send_email(
                subject=f'📩 Admin Response to Your Ticket #{ticket.id}',
                message=message,
                recipient_list=[ticket.created_by.email]
            )

            logger.info(f"Ticket reply notification email sent successfully to {ticket.created_by.email}")

        except Exception as exc:
            if self.request.retries >= self.max_retries:
                with open('failed_emails.log', 'a') as f:
                    f.write(
                        f"{timezone.now()}: Failed to send ticket reply notification email for ticket {ticket_id}: {exc}\n")
                return False
            else:
                logger.warning(
                    f"Ticket reply notification email failed (attempt {self.request.retries + 1}), retrying: {exc}")
                raise self.retry(exc=exc)