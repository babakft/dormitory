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
        form.save()
        messages.success(
            self.request,
            'Registration successful! Your account is pending admin approval.'
        )
        return super().form_valid(form)

    def form_invalid(self, form):
        messages.error(self.request, 'Please correct the errors below.')
        return super().form_invalid(form)


class RegistrationSuccessView(TemplateView):
    template_name = 'student/registration_success.html'


class StudentLoginView(LoginView):
    template_name = 'student/login.html'
    form_class = StudentLoginForm
    redirect_authenticated_user = False

    def get_success_url(self):
        return reverse_lazy('student_dashboard')

    def dispatch(self, request, *args, **kwargs):
        if request.user.is_authenticated and request.user.is_approved_student():
            return redirect('student_dashboard')
        elif request.user.is_authenticated:
            logout(request)
            messages.warning(request, 'Please login with a valid student account.')
        return super().dispatch(request, *args, **kwargs)

    def form_valid(self, form):
        user = form.get_user()
        if not user.is_approved_student():
            messages.error(self.request, user.student_profile.get_login_error_message())
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
        if not request.user.is_approved_student():
            messages.error(request, 'Access denied. Valid student profile required.')
            logout(request)
            return redirect('student_login')
        return super().dispatch(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context.update(self.request.user.student_profile.get_dashboard_data())
        return context
