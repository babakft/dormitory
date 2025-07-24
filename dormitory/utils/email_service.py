from abc import ABC
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.urls import reverse
import logging

logger = logging.getLogger(__name__)


class BaseEmailService(ABC):
    """Abstract base class for all email services"""

    @staticmethod
    def _send_email(subject, message, recipient_list, fail_silently=False):
        """Base method for sending emails"""
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
            return False

    @classmethod
    def _get_base_url(cls):
        """Get base URL for the application"""
        return getattr(settings, 'BASE_URL', 'http://127.0.0.1:8000')

class StudentEmailService(BaseEmailService):
    @classmethod
    def send_verification_email(cls, student, request):
        verification_url = request.build_absolute_uri(
            reverse('verify_email', kwargs={'token': student.verification_token})
        )

        context = {
            'student': student,
            'verification_url': verification_url,
        }

        message = render_to_string('emails/student/verification_email.txt', context)

        return cls._send_email(
            subject='Verify Your Email - Dormitory Registration',
            message=message,
            recipient_list=[student.user.email]
        )

    @classmethod
    def send_approval_email(cls, student):
        context = {
            'student': student,
            'username': student.user.username,
            'student_number': student.student_number,
            'room': student.room,
            'processed_by': student.processed_by_name,
            'processed_at': student.processed_at,
        }

        message = render_to_string('emails/student/approval_notification.txt', context)

        return cls._send_email(
            subject='✅ Registration Approved - Dormitory Management System',
            message=message,
            recipient_list=[student.user.email]
        )

    @classmethod
    def send_rejection_email(cls, student):
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

        return cls._send_email(
            subject='❌ Registration Update - Dormitory Management System',
            message=message,
            recipient_list=[student.user.email]
        )

    @classmethod
    def send_deactivation_email(cls, student):
        context = {
            'student': student,
            'username': student.user.username,
            'student_number': student.student_number,
            'room': student.room,
        }

        message = render_to_string('emails/student/deactivation_notification.txt', context)

        return cls._send_email(
            subject='⚠️ Account Deactivated - Dormitory Management System',
            message=message,
            recipient_list=[student.user.email]
        )

    @classmethod
    def send_password_reset_email(cls, student, new_password):
        context = {
            'student': student,
            'new_password': new_password,
            'username': student.user.username,
            'student_number': student.student_number,
        }

        message = render_to_string('emails/student/password_reset_student.txt', context)

        return cls._send_email(
            subject='🔐 Password Reset - Dormitory Management System',
            message=message,
            recipient_list=[student.user.email]
        )


class ServiceEmailService(BaseEmailService):

    @classmethod
    def send_password_reset_email(cls, expert, new_password):
        context = {
            'expert': expert,
            'new_password': new_password,
            'username': expert.user.username,
            'employee_id': expert.employee_id,
        }

        message = render_to_string('emails/service/password_reset_expert.txt', context)

        return cls._send_email(
            subject='🔐 Password Reset - Service Expert Portal',
            message=message,
            recipient_list=[expert.user.email]
        )


class MaintenanceEmailService(BaseEmailService):
    """Email service for maintenance-related notifications"""

    @classmethod
    def send_approved_email(cls, maintenance_request):
        """Send maintenance request approval email"""
        context = {
            'student': maintenance_request.student,
            'request': maintenance_request,
            'priority': maintenance_request.get_priority_display(),
            'approved_by': maintenance_request.approved_by_name,
            'approved_at': maintenance_request.approved_at,
        }

        message = render_to_string('emails/maintenance/maintenance_approved.txt', context)

        return cls._send_email(
            subject='✅ Maintenance Request Approved',
            message=message,
            recipient_list=[maintenance_request.student.user.email]
        )

    @classmethod
    def send_rejected_email(cls, maintenance_request):
        context = {
            'student': maintenance_request.student,
            'request': maintenance_request,
            'rejected_by': maintenance_request.approved_by_name,
            'rejected_at': maintenance_request.approved_at,
            'rejection_reason': maintenance_request.rejection_reason,
        }

        message = render_to_string('emails/maintenance/maintenance_rejected.txt', context)

        return cls._send_email(
            subject='❌ Maintenance Request Update',
            message=message,
            recipient_list=[maintenance_request.student.user.email]
        )

    @classmethod
    def send_in_progress_email(cls, maintenance_request):
        context = {
            'student': maintenance_request.student,
            'request': maintenance_request,
            'assigned_expert': maintenance_request.assigned_expert,
            'work_started_at': maintenance_request.work_started_at,
        }

        message = render_to_string('emails/maintenance/maintenance_in_progress.txt', context)

        return cls._send_email(
            subject='🔧 Work Started on Your Maintenance Request',
            message=message,
            recipient_list=[maintenance_request.student.user.email]
        )

    @classmethod
    def send_completed_email(cls, maintenance_request):
        """Send maintenance work completed email with review link"""

        # Simple URL building
        review_path = reverse('maintenance:rate', kwargs={'pk': maintenance_request.pk})
        review_url = cls._get_base_url() + review_path

        context = {
            'student': maintenance_request.student,
            'request': maintenance_request,
            'assigned_expert': maintenance_request.assigned_expert,
            'completed_at': maintenance_request.completed_at,
            'completion_notes': maintenance_request.completion_notes,
            'review_url': review_url,
        }

        message = render_to_string('emails/maintenance/maintenance_completed.txt', context)

        return cls._send_email(
            subject='✅ Maintenance Request Completed - Please Rate Our Service',
            message=message,
            recipient_list=[maintenance_request.student.user.email]
        )


class TicketEmailService(BaseEmailService):
    """Email service for ticket-related notifications"""

    @classmethod
    def send_admin_reply_notification(cls, ticket, admin_message):
        """Send notification when admin replies to a ticket"""

        # Determine user type for personalized message
        user_type = ticket.get_creator_type()

        context = {
            'ticket': ticket,
            'user': ticket.created_by,
            'user_type': user_type,
            'ticket_url': cls._get_base_url() + f'/ticket/{ticket.pk}/',
        }

        message = render_to_string('emails/ticket/admin_reply_notification.txt', context)

        return cls._send_email(
            subject=f'📩 Admin Response to Your Ticket #{ticket.id}',
            message=message,
            recipient_list=[ticket.created_by.email]
        )