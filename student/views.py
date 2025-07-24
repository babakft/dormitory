from django.shortcuts import redirect
from django.contrib.auth import login, logout
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import FormView, TemplateView
from django.urls import reverse_lazy
from student.forms import StudentRegistrationForm, StudentLoginForm
from django.contrib.auth.views import LoginView, LogoutView
from student.models import Student
from django.utils.decorators import method_decorator
from django.db import transaction
from dormitory.utils.email_service import StudentEmailService

class StudentRegisterView(FormView):
    form_class = StudentRegistrationForm
    template_name = 'student/register.html'
    success_url = reverse_lazy('email_verification_sent')

    def form_valid(self, form):
        try:
            with transaction.atomic():
                student = form.save()
                StudentEmailService.send_verification_email(student, self.request)

            messages.success(
                self.request,
                'Registration successful! Please check your email to verify your account. \n'
                'NOTE THAT YOU ONLY HAVE 15 MINUTES TO VERIFY IT'
            )
            return super().form_valid(form)
        except Exception as e:
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


class StudentLoginView(LoginView):
    template_name = 'student/login.html'
    form_class = StudentLoginForm
    redirect_authenticated_user = False

    def get_success_url(self):
        return reverse_lazy('student_dashboard')

    def dispatch(self, request, *args, **kwargs):
        # If user is authenticated and is an approved student, redirect to dashboard
        if request.user.is_authenticated and request.user.is_approved_student():
            return redirect('student_dashboard')

        # If user is authenticated but is not a student (e.g., service expert),
        # don't automatically logout - let them choose
        if request.user.is_authenticated and hasattr(request.user, 'expert_profile'):
            messages.info(request,
                          'You are currently logged in as a service expert. Please logout first to login as a student.')

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
    next_page = reverse_lazy('student_login')

    def dispatch(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            messages.success(request, 'You have been logged out successfully.')
        return super().dispatch(request, *args, **kwargs)


@method_decorator(login_required(login_url='student_login'), name='dispatch')
class StudentDashboardView(TemplateView):
    template_name = 'student/dashboard.html'

    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_approved_student():
            messages.error(request, 'Access denied. Valid student profile required.')
            logout(request)
            return redirect('student_login')
        return super().dispatch(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context.update(self.request.user.student_profile.get_dashboard_data())
        return context
