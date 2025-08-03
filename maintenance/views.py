from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib import messages
from django.views.generic import CreateView
from django.urls import reverse_lazy
from django.db import transaction
from maintenance.models import MaintenanceRequest
from maintenance.forms import MaintenanceRequestForm, MaintenanceRatingForm
from django.utils import timezone


class MaintenanceRequestCreateView(LoginRequiredMixin, CreateView):
    """Create new maintenance request"""
    model = MaintenanceRequest
    form_class = MaintenanceRequestForm
    template_name = 'maintenance/request_create.html'
    login_url = 'student:student_login'
    success_url = reverse_lazy('student:student_dashboard')

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


@login_required(login_url='student:student_login')
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


@login_required(login_url='student:student_login')
def rate_maintenance_request(request, pk):
    """Allow students to rate completed maintenance work"""
    maintenance_request = get_object_or_404(
        MaintenanceRequest.objects.select_related(
            'student__user', 'assigned_expert__user'
        ),
        pk=pk,
        student=request.user.student_profile,
        status='completed'
    )

    # Check if already rated
    if maintenance_request.student_rating:
        messages.warning(request, 'You have already rated this maintenance request.')
        return redirect('maintenance:detail', pk=pk)

    if request.method == 'POST':
        form = MaintenanceRatingForm(request.POST)
        if form.is_valid():
            try:
                with transaction.atomic():
                    # Update the maintenance request with rating and feedback
                    maintenance_request.student_rating = form.cleaned_data['student_rating']
                    maintenance_request.student_feedback = form.cleaned_data['student_feedback']
                    maintenance_request.feedback_at = timezone.now()
                    maintenance_request.save()

                messages.success(
                    request,
                    f'Thank you for rating the service! Your feedback helps improve our maintenance services.'
                )
                return redirect('maintenance:detail', pk=pk)
            except Exception as e:
                messages.error(request, 'Failed to submit rating. Please try again.')
                return render(request, 'maintenance/rate_request.html', {
                    'form': form,
                    'maintenance_request': maintenance_request
                })
    else:
        form = MaintenanceRatingForm()

    return render(request, 'maintenance/rate_request.html', {
        'form': form,
        'maintenance_request': maintenance_request
    })
