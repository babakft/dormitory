from django.shortcuts import redirect
from django.contrib.auth import login
from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import FormView, TemplateView
from django.urls import reverse_lazy
from .forms import StudentRegistrationForm
from .models import Student


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


class RegistrationSuccessView(TemplateView):
    """Registration success page"""
    template_name = 'student/registration_success.html'
