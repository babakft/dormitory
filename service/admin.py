import secrets, string
from django.contrib import admin
from django.db.models import Count, Q
from django.utils import timezone
from service.models import ServiceExpert
from maintenance.models import MaintenanceRequest
from datetime import timedelta
from django.db import transaction
from django.conf import settings
from django.template.loader import render_to_string
from django.core.mail import send_mail
from django.contrib import messages
from django.utils.html import format_html
from dormitory.utils.email_service import ServiceEmailService
from dormitory.utils.password_generator import PasswordGenerator


@admin.register(ServiceExpert)
class ServiceExpertAdmin(admin.ModelAdmin):
    list_display = [
        'user_info', 'employee_id', 'specialization',
        'is_active', 'current_workload', 'completed_count',
        'average_rating_stars'
    ]

    list_filter = ['specialization', 'is_active']
    search_fields = ['user__username', 'employee_id', 'user__email']
    ordering = ['user__username']

    actions = [
        'activate_experts', 'deactivate_experts',
        'view_expert_workload', 'force_complete_requests', 'view_completed_requests',
        'reset_expert_passwords'
    ]

    fieldsets = (
        ('Expert Information', {
            'fields': ('user', 'employee_id', 'specialization')
        }),
        ('Status & Performance', {
            'fields': ('is_active', 'average_rating')
        }),
        ('Statistics', {
            'fields': ('current_workload',),
            'classes': ('collapse',)
        }),
    )

    readonly_fields = ['current_workload']

    def get_queryset(self, request):
        """Optimize queryset with select_related and annotations"""
        return super().get_queryset(request).select_related('user').annotate(
            assigned_requests_count=Count(
                'assigned_requests',
                filter=Q(assigned_requests__status__in=['approved', 'in_progress'])
            ),
            total_completed=Count(
                'assigned_requests',
                filter=Q(assigned_requests__status='completed')
            )
        )

    def user_info(self, obj):
        """Display user information"""
        return f"{obj.user.username} ({obj.user.email})"

    user_info.short_description = 'Expert Info'

    def current_workload(self, obj):
        """Display current assigned requests count"""
        workload = getattr(obj, 'assigned_requests_count', 0)
        return workload

    current_workload.short_description = 'Current Workload'

    def completed_count(self, obj):
        """Display total completed requests from annotation"""
        completed = getattr(obj, 'total_completed', 0)
        return completed

    completed_count.short_description = 'Completed'

    def average_rating_stars(self, obj):
        """Display average rating with stars"""
        if obj.average_rating:
            rating = int(round(obj.average_rating))  # Round to nearest integer for star display
            stars = '★' * rating + '☆' * (5 - rating)
            return format_html(
                '<span style="color: #ffc107;">{}</span><br><small>({}/5)</small>',
                stars, obj.average_rating
            )
        return format_html('<span class="text-muted">No rating</span>')

    average_rating_stars.short_description = 'Rating'
    average_rating_stars.admin_order_field = 'average_rating'

    # Admin Actions
    def activate_experts(self, request, queryset):
        """Activate selected experts"""
        updated = queryset.update(is_active=True)
        self.message_user(request, f'Activated {updated} experts.')

    activate_experts.short_description = "✅ Activate experts"

    def deactivate_experts(self, request, queryset):
        """Deactivate selected experts"""
        updated = queryset.update(is_active=False)
        self.message_user(request, f'Deactivated {updated} experts.')

    deactivate_experts.short_description = "🚫 Deactivate experts"

    def view_expert_workload(self, request, queryset):

        # Get the date one month ago from today
        one_month_ago = timezone.now() - timedelta(days=30)

        report = "WORKLOAD REPORT:\n"
        for expert in queryset:
            # Get the number of requests assigned and in progress
            assigned = MaintenanceRequest.objects.filter(
                assigned_expert=expert, status__in=['approved', 'in_progress']
            ).count()

            # Get the number of requests completed in the last month
            completed = MaintenanceRequest.objects.filter(
                assigned_expert=expert, status='completed', completed_at__gte=one_month_ago
            ).count()

            rating = expert.average_rating or 0

            report += f"{expert.user.username}: {assigned} assigned, {completed} completed (last month), {rating}/5 rating\n"

        # Send the report as a message to the user
        self.message_user(request, report)

    view_expert_workload.short_description = "📊 View workload"

    def force_complete_requests(self, request, queryset):
        """Force complete stuck requests"""

        completed_count = 0
        for expert in queryset:
            stuck = MaintenanceRequest.objects.filter(assigned_expert=expert, status='in_progress')
            for req in stuck:
                req.status = 'completed'
                req.completed_at = timezone.now()
                req.completion_notes = f"Force completed by {request.user.username}"
                req.save()
                completed_count += 1

        self.message_user(request, f'Force completed {completed_count} requests.')

    force_complete_requests.short_description = "⚡ Force complete"

    def view_completed_requests(self, request, queryset):
        """View completed requests summary"""

        report = "COMPLETED REQUESTS:\n"
        for expert in queryset:
            completed = MaintenanceRequest.objects.filter(
                assigned_expert=expert, status='completed'
            ).count()
            rating = expert.average_rating or 0

            report += f"{expert.user.username}: {completed} completed, {rating}/5 average rating\n"

        self.message_user(request, report)

    view_completed_requests.short_description = "✅ View completed"

    def reset_expert_passwords(self, request, queryset):
        """Reset passwords for selected service experts and send new passwords via email"""
        success_count = 0
        failed_count = 0

        for expert in queryset:
            try:
                with transaction.atomic():
                    # Generate new secure password using PasswordGenerator
                    new_password = PasswordGenerator.generate_secure_password()

                    # Set the new password (automatically hashes it)
                    expert.user.set_password(new_password)
                    expert.user.save()

                    # Send async email with new password
                    ServiceEmailService.send_service_password_reset_email.delay(expert.id, new_password)

                    success_count += 1

            except Exception as e:
                messages.error(request, f'Failed to reset password for {expert.user.username}: {str(e)}')
                failed_count += 1

        if success_count > 0:
            messages.success(request,
                             f'Successfully reset passwords for {success_count} service experts. Password reset emails are being sent.')

        if failed_count > 0:
            messages.warning(request, f'{failed_count} password resets failed.')

    reset_expert_passwords.short_description = "🔐 Reset expert passwords"
