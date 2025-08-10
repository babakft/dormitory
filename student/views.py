from django.shortcuts import redirect, reverse
from django.contrib.auth import login, logout
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import FormView, TemplateView
from django.urls import reverse_lazy
from student.forms import StudentRegistrationForm, StudentLoginForm, ForgotPasswordForm
from django.contrib.auth.views import LoginView, LogoutView
from student.models import Student,Room
from django.utils.decorators import method_decorator
from django.db import transaction
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods

from dormitory.utils.password_generator import PasswordGenerator
from dormitory.utils.email_service import StudentEmailService
import json


class StudentRegisterView(FormView):
    form_class = StudentRegistrationForm
    template_name = 'student/register.html'
    success_url = reverse_lazy('student:email_verification_sent')

    def form_valid(self, form):
        try:
            with transaction.atomic():
                student = form.save()

                verification_path = reverse('student:verify_email', kwargs={'token': student.verification_token})
                verification_url = self.request.build_absolute_uri(verification_path)

                # Handle email service separately (don't let it break registration)
                try:
                    StudentEmailService.send_verification_email.delay(student.id, verification_url)
                except Exception as email_error:
                    # Log email error but don't fail the registration
                    print(f"Email service error: {email_error}")

            # Only add success message if everything worked
            messages.success(
                self.request,
                'Registration successful! Please check your email to verify your account.'
            )
            return super().form_valid(form)

        except Exception as e:
            print(f"Registration error: {e}")  # Debug this
            messages.error(self.request, 'Registration failed. Please try again.')
            return self.form_invalid(form)


class EmailVerificationSentView(TemplateView):
    template_name = 'emails/student/email_verification_sent.html'


class RegistrationSuccessView(TemplateView):
    template_name = 'student/registration_success.html'

    def get(self, request, token=None):
        # If token is provided, handle email verification
        if token:
            try:
                student = Student.objects.select_related('user').get(
                    verification_token=token,
                    user__is_active=False
                )
                student.verify_email()
                messages.success(request, 'Email verified successfully! Your account is pending admin approval.')

            except Student.DoesNotExist:
                messages.error(request, 'Invalid or already used verification link.')
                return redirect('student_register')

        return super().get(request)


@require_http_methods(["GET"])
def get_rooms_by_building(request, building_id):
    """API endpoint to get rooms for a specific building"""
    try:
        rooms = Room.objects.filter(building_id=building_id).order_by('floor', 'number')
        rooms_data = [
            {
                'id': room.id,
                'number': room.number,
                'floor': room.floor,
                'capacity': room.capacity
            }
            for room in rooms
        ]
        return JsonResponse({'rooms': rooms_data})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


class StudentLoginView(LoginView):
    template_name = 'student/login.html'
    form_class = StudentLoginForm
    redirect_authenticated_user = False

    def get_success_url(self):
        return reverse_lazy('student:student_dashboard')

    def dispatch(self, request, *args, **kwargs):
        if request.user.is_authenticated and request.user.is_approved_student():
            return redirect('student:student_dashboard')
        elif request.user.is_authenticated:
            logout(request)
            messages.warning(request, 'Please login with a valid student account.')
        return super().dispatch(request, *args, **kwargs)

    def form_valid(self, form):
        user = form.get_user()
        if not user.is_approved_student():
            messages.error(self.request, user.student_profile.get_login_error_message())
            return self.form_invalid(form)

        # If there was a previous user logged in, logout first
        if self.request.user.is_authenticated:
            logout(self.request)

        # Set the backend attribute on the user
        user.backend = 'student.backends.StudentNumberBackend'

        # Login the new user
        login(self.request, user)

        messages.success(self.request, f'Welcome back, {user.username}!')

        # Redirect to success URL
        return redirect(self.get_success_url())


class StudentLogoutView(LoginRequiredMixin, LogoutView):
    next_page = reverse_lazy('student:student_login')

    def dispatch(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            messages.success(request, 'You have been logged out successfully.')
        return super().dispatch(request, *args, **kwargs)


@method_decorator(login_required(login_url='student:student_login'), name='dispatch')
class StudentDashboardView(TemplateView):
    template_name = 'student/dashboard.html'

    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_approved_student():
            messages.error(request, 'Access denied. Valid student profile required.')
            logout(request)
            return redirect('student:student_login')
        return super().dispatch(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context.update(self.request.user.student_profile.get_dashboard_data())
        return context


class ForgotPasswordView(FormView):
    form_class = ForgotPasswordForm
    template_name = 'student/forgot_password.html'
    success_url = reverse_lazy('student:student_login')

    def form_valid(self, form):
        email = form.cleaned_data['email']

        try:
            # Find student by email
            student = Student.objects.select_related('user').get(
                user__email=email,
                registration_status='approved',
                user__is_active=True
            )

            # Generate new password
            new_password = PasswordGenerator.generate_secure_password(12)

            with transaction.atomic():
                # Update user password
                student.user.set_password(new_password)
                student.user.save()

                # Send email with new password
                StudentEmailService.send_student_password_reset_email.delay(
                    student.id,
                    new_password
                )

            messages.success(
                self.request,
                'A new password has been sent to your email address. Please check your email and login with the new password.'
            )

        except Student.DoesNotExist:
            # Don't reveal if email exists or not for security
            messages.success(
                self.request,
                'If the email exists in our system, a new password has been sent to that address.'
            )
        except Exception as e:
            print(f"Forgot password error: {e}")
            messages.error(
                self.request,
                'An error occurred while processing your request. Please try again later.'
            )

        return super().form_valid(form)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['page_title'] = 'Reset Password'
        return context