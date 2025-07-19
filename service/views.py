from django.shortcuts import redirect, get_object_or_404, render
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib import messages
from django.views.generic import TemplateView
from django.urls import reverse_lazy
from django.contrib.auth.views import LoginView, LogoutView
from django.utils.decorators import method_decorator
from django.db import transaction
from service.forms import ServiceExpertLoginForm, StartWorkForm, CompleteWorkForm
from functools import wraps


class ServiceExpertLoginView(LoginView):
    form_class = ServiceExpertLoginForm
    template_name = 'service/login.html'
    redirect_authenticated_user = True

    def get_success_url(self):
        return reverse_lazy('service_dashboard')

    def form_valid(self, form):
        user = form.get_user()
        messages.success(self.request, f'Welcome back, {user.username}!')
        return super().form_valid(form)


class ServiceExpertLogoutView(LoginRequiredMixin, LogoutView):
    next_page = reverse_lazy('service_login')


@method_decorator(login_required(login_url='service_login'), name='dispatch')
class ServiceDashboardView(TemplateView):
    template_name = 'service/dashboard.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context.update(self.request.user.expert_profile.get_dashboard_data())
        return context


@login_required(login_url='service_login')
def claim_request(request, request_id):
    from maintenance.models import MaintenanceRequest
    maintenance_request = get_object_or_404(MaintenanceRequest, id=request_id)
    expert = request.user.expert_profile

    try:
        expert.claim_request(maintenance_request)
        messages.success(request, f'Successfully claimed request: {maintenance_request.title}')
    except ValueError as e:
        messages.error(request, str(e))

    return redirect('service_dashboard')


##################decorator###################
def service_expert_required(view_func):
    """
    Decorator to ensure user is an authenticated and active service expert
    """

    @wraps(view_func)
    @login_required(login_url='service_login')
    def _wrapped_view(request, *args, **kwargs):
        # Check if user has expert_profile
        if not hasattr(request.user, 'expert_profile'):
            messages.error(request, 'Access denied. Service expert account required.')
            return redirect('service_login')

        # Check if expert profile is active
        if not request.user.expert_profile.is_active:
            messages.error(request, 'Your service expert account is inactive.')
            return redirect('service_login')

        # Check if user type is expert
        if request.user.user_type != 'expert':
            messages.error(request, 'Access denied. Service expert account required.')
            return redirect('service_login')

        return view_func(request, *args, **kwargs)

    return _wrapped_view


#############decorator#############################

@service_expert_required
def start_work(request, request_id):
    """Expert starts work on maintenance request"""
    from maintenance.models import MaintenanceRequest
    maintenance_request = get_object_or_404(
        MaintenanceRequest,
        id=request_id,
        assigned_expert=request.user.expert_profile,
        status='approved'
    )

    if request.method == 'POST':
        form = StartWorkForm(request.POST)
        if form.is_valid():
            try:
                maintenance_request.start_work(form.cleaned_data['expert_notes'])
                messages.success(request, f'Work started on: {maintenance_request.title}')
                return redirect('service_dashboard')
            except ValueError as e:
                messages.error(request, str(e))
    else:
        form = StartWorkForm()

    return render(request, 'service/start_work.html', {
        'form': form,
        'maintenance_request': maintenance_request
    })


@service_expert_required
def complete_work(request, request_id):
    """Expert completes maintenance request"""
    from maintenance.models import MaintenanceRequest
    maintenance_request = get_object_or_404(
        MaintenanceRequest,
        id=request_id,
        assigned_expert=request.user.expert_profile,
        status='in_progress'
    )

    if request.method == 'POST':
        form = CompleteWorkForm(request.POST, request.FILES)
        if form.is_valid():
            try:
                with transaction.atomic():
                    maintenance_request.complete_work(
                        completion_notes=form.cleaned_data['completion_notes'],
                        completion_image=form.cleaned_data['completion_image']
                    )
                messages.success(request, f'Work completed on: {maintenance_request.title}')
                return redirect('service_dashboard')
            except ValueError as e:
                messages.error(request, str(e))
    else:
        form = CompleteWorkForm()

    return render(request, 'service/complete_work.html', {
        'form': form,
        'maintenance_request': maintenance_request
    })


@service_expert_required
def completed_tasks(request):
    """Show all completed tasks for the service expert"""
    expert = request.user.expert_profile
    completed_requests = expert.get_my_completed_requests()

    context = {
        'expert': expert,
        'completed_requests': completed_requests,
        'total_completed': completed_requests.count(),
    }

    return render(request, 'service/completed_tasks.html', context)
