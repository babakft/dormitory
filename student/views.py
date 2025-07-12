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


class StudentRegisterView(FormView):
    form_class = StudentRegistrationForm
    template_name = 'student/register.html'
    success_url = reverse_lazy('registration_success')

    def form_valid(self, form):
        user = form.save()
        messages.success(
            self.request,
            'Registration successful! Your account is pending admin approval. '
            'You will be notified once your registration is approved.'
        )
        return super().form_valid(form)

    def form_invalid(self, form):
        messages.error(self.request, 'Please correct the errors below.')
        return super().form_invalid(form)


class StudentLoginView(LoginView):
    template_name = 'student/login.html'
    form_class = StudentLoginForm
    redirect_authenticated_user = False  # ← Changed to False to prevent circular redirect

    def get_success_url(self):
        return reverse_lazy('student_dashboard')

    def dispatch(self, request, *args, **kwargs):
        # If user is already authenticated, check if they should access dashboard
        if request.user.is_authenticated:
            if (hasattr(request.user, 'student_profile') and
                    request.user.student_profile.registration_status == 'approved'):
                return redirect('student_dashboard')
            else:
                # Logout user if they don't meet student requirements
                logout(request)
                messages.warning(request, 'Please login with a valid student account.')

        return super().dispatch(request, *args, **kwargs)

    def form_valid(self, form):
        user = form.get_user()

        # Check if user is a student
        if not hasattr(user, 'student_profile'):
            messages.error(self.request, 'This account is not registered as a student.')
            return self.form_invalid(form)

        # Check if student registration is approved
        if user.student_profile.registration_status != 'approved':
            status = user.student_profile.get_registration_status_display()
            if user.student_profile.registration_status == 'pending':
                messages.error(
                    self.request,
                    'Your registration is still pending approval. Please wait for admin approval.'
                )
            elif user.student_profile.registration_status == 'rejected':
                messages.error(
                    self.request,
                    'Your registration has been rejected. Please contact administration.'
                )
            else:
                messages.error(self.request, f'Your registration status is: {status}')
            return self.form_invalid(form)

        messages.success(self.request, f'Welcome back, {user.username}!')
        return super().form_valid(form)


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
        # Check if user has student profile
        if not hasattr(request.user, 'student_profile'):
            messages.error(request, 'Access denied. Student profile required.')
            logout(request)  # ← Logout user to prevent circular redirect
            return redirect('student_login')

        # Check if student is approved
        if request.user.student_profile.registration_status != 'approved':
            messages.error(request, 'Your registration is still pending approval.')
            logout(request)  # ← Logout user to prevent circular redirect
            return redirect('student_login')

        return super().dispatch(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        student = self.request.user.student_profile

        # Get student's maintenance requests
        maintenance_requests = student.maintenance_requests.all()[:5]  # Latest 5 requests

        context.update({
            'student': student,
            'maintenance_requests': maintenance_requests,
            'total_requests': student.maintenance_requests.count(),
            'pending_requests': student.maintenance_requests.filter(status='pending').count(),
            'completed_requests': student.maintenance_requests.filter(status='completed').count(),
        })
        return context


class RegistrationSuccessView(TemplateView):
    template_name = 'student/registration_success.html'