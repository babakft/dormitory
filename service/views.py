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
from django.contrib.auth import logout,login


class ServiceExpertLoginView(LoginView):
    form_class = ServiceExpertLoginForm
    template_name = 'service/login.html'
    redirect_authenticated_user = False

    def get_success_url(self):
        return reverse_lazy('service:service_dashboard')

    def dispatch(self, request, *args, **kwargs):
        # If user is authenticated and is a service expert, redirect to dashboard
        if (request.user.is_authenticated and
                hasattr(request.user, 'expert_profile') and
                request.user.expert_profile.is_active and
                request.user.user_type == 'expert'):
            return redirect('service:service_dashboard')

        # If user is authenticated but is not a service expert, show message
        if request.user.is_authenticated:
            if hasattr(request.user, 'student_profile'):
                messages.info(request,
                              'You are logged in as a student. Please logout first to login as a service expert.')
            else:
                messages.info(request, 'Please logout first to login as a service expert.')

        return super().dispatch(request, *args, **kwargs)

    def form_valid(self, form):
        user = form.get_user()

        # Double-check that user has expert profile
        if not hasattr(user, 'expert_profile'):
            messages.error(self.request, 'Invalid service expert account.')
            return self.form_invalid(form)

        # If there was a previous user logged in, logout first
        if self.request.user.is_authenticated:
            logout(self.request)

        # Set the backend attribute on the user
        user.backend = 'service.backends.ServiceExpertEmployeeIdBackend'

        # Login the new user
        login(self.request, user)

        messages.success(self.request, f'Welcome back, {user.username}!')

        # Redirect to success URL
        return redirect(self.get_success_url())
class ServiceExpertLogoutView(LoginRequiredMixin, LogoutView):
    next_page = reverse_lazy('service:service_login')


@method_decorator(login_required(login_url='service:service_login'), name='dispatch')
class ServiceDashboardView(TemplateView):
    template_name = 'service/dashboard.html'

    def dispatch(self, request, *args, **kwargs):
        # Check if user has expert_profile before proceeding
        if not hasattr(request.user, 'expert_profile'):
            messages.error(request, 'Access denied. Service expert account required.')
            logout(request)
            return redirect('service:service_login')

        # Check if expert profile is active
        if not request.user.expert_profile.is_active:
            messages.error(request, 'Your service expert account is inactive.')
            logout(request)
            return redirect('service:service_login')

        # Check if user type is expert
        if request.user.user_type != 'expert':
            messages.error(request, 'Access denied. Service expert account required.')
            logout(request)
            return redirect('service:service_login')

        return super().dispatch(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context.update(self.request.user.expert_profile.get_dashboard_data())
        return context


@login_required(login_url='service:service_login')
def claim_request(request, request_id):
    """Expert claims a maintenance request"""
    from maintenance.models import MaintenanceRequest

    maintenance_request = get_object_or_404(MaintenanceRequest, id=request_id)
    expert = request.user.expert_profile

    try:
        with transaction.atomic():
            # Use the model method which properly updates timestamps
            maintenance_request.assign_to_expert(expert)

            messages.success(request, f'Successfully claimed request: {maintenance_request.title}')
            print(f"DEBUG: Expert {expert.user.username} claimed request {maintenance_request.id}")

    except ValueError as e:
        messages.error(request, str(e))
        print(f"ERROR: Failed to claim request {maintenance_request.id}: {e}")

    return redirect('service:service_dashboard')


##################decorator###################
def service_expert_required(view_func):
    """
    Enhanced decorator to ensure user is an authenticated and active service expert
    """
    @wraps(view_func)
    @login_required(login_url='service:service_login')
    def _wrapped_view(request, *args, **kwargs):
        # Check if user has expert_profile
        if not hasattr(request.user, 'expert_profile'):
            messages.error(request, 'Access denied. Service expert account required.')
            logout(request)
            return redirect('service:service_login')

        # Check if expert profile is active
        if not request.user.expert_profile.is_active:
            messages.error(request, 'Your service expert account is inactive.')
            logout(request)
            return redirect('service:service_login')

        # Check if user type is expert
        if request.user.user_type != 'expert':
            messages.error(request, 'Access denied. Service expert account required.')
            logout(request)
            return redirect('service:service_login')

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
                with transaction.atomic():
                    # Use the model method which properly updates timestamps
                    maintenance_request.start_work(form.cleaned_data['expert_notes'])

                    messages.success(request, f'Work started on: {maintenance_request.title}')
                    print(
                        f"DEBUG: Expert {request.user.expert_profile.user.username} started work on request {maintenance_request.id}")

                return redirect('service:service_dashboard')
            except ValueError as e:
                messages.error(request, str(e))
                print(f"ERROR: Failed to start work on request {maintenance_request.id}: {e}")
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
                    # Use the model method which properly updates timestamps
                    maintenance_request.complete_work(
                        completion_notes=form.cleaned_data['completion_notes'],
                        completion_image=form.cleaned_data['completion_image']
                    )

                messages.success(request, f'Work completed on: {maintenance_request.title}')
                print(
                    f"DEBUG: Expert {request.user.expert_profile.user.username} completed work on request {maintenance_request.id}")

                return redirect('service:service_dashboard')
            except ValueError as e:
                messages.error(request, str(e))
                print(f"ERROR: Failed to complete work on request {maintenance_request.id}: {e}")
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