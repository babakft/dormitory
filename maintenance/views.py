from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib import messages
from django.views.generic import CreateView
from django.urls import reverse_lazy
from django.db import transaction
from maintenance.models import MaintenanceRequest
from maintenance.forms import MaintenanceRequestForm


class MaintenanceRequestCreateView(LoginRequiredMixin, CreateView):
    """Create new maintenance request"""
    model = MaintenanceRequest
    form_class = MaintenanceRequestForm
    template_name = 'maintenance/request_create.html'
    login_url = 'student_login'
    success_url = reverse_lazy('student_dashboard')

    def get_form_kwargs(self):
        """Pass the student to the form"""
        kwargs = super().get_form_kwargs()
        kwargs['student'] = self.request.user.student_profile
        return kwargs

    def form_valid(self, form):
        try:
            with transaction.atomic():
                form.instance.student = self.request.user.student_profile
                response = super().form_valid(form)

                messages.success(
                    self.request,
                    f'Maintenance request "{self.object.title}" has been submitted successfully for {self.object.room} and is pending approval.'
                )
                return response

        except Exception as e:
            messages.error(self.request, 'Failed to submit maintenance request. Please try again.')
            return self.form_invalid(form)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['student'] = self.request.user.student_profile
        return context


@login_required(login_url='student_login')
def maintenance_request_detail(request, pk):
    """View individual maintenance request details"""
    maintenance_request = get_object_or_404(
        MaintenanceRequest.objects.select_related(
            'student__user', 'room__building', 'assigned_expert__user'
        ).prefetch_related('images'),
        pk=pk,
        student=request.user.student_profile
    )

    # Get issue and completion images separately
    issue_images = maintenance_request.images.filter(image_type='issue')
    completion_images = maintenance_request.images.filter(image_type='completion')

    context = {
        'request': maintenance_request,
        'issue_images': issue_images,
        'completion_images': completion_images,
        'can_provide_feedback': (
                maintenance_request.status == 'completed'
                and not maintenance_request.student_rating
        )
    }

    return render(request, 'maintenance/request_detail.html', context)