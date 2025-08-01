from django.contrib import admin
from django.utils.html import format_html
from django.utils import timezone
from django.db.models import Q
from maintenance.models import MaintenanceRequest, MaintenanceImage
from service.models import ServiceExpert
from notification.models import AdminActivityTracker

class MaintenanceImageInline(admin.TabularInline):
    """Inline for viewing maintenance images"""
    model = MaintenanceImage
    extra = 0
    readonly_fields = ['image_preview', 'uploaded_at']
    fields = ['image_type', 'image', 'image_preview', 'uploaded_at']

    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="max-height: 100px; max-width: 100px; object-fit: cover;" />',
                obj.image.url
            )
        return "No image"

    image_preview.short_description = 'Preview'


@admin.register(MaintenanceRequest)
class MaintenanceRequestAdmin(admin.ModelAdmin):
    activity_type = 'maintenance_requests'

    list_display = [
        'id',
        'title_with_truncation',
        'student_info',
        'service_type',
        'priority',
        'status',
        'assigned_expert_info',
        'student_rating_display',
        'created_at',
        'days_since_created'
    ]

    list_filter = [
        'status', 'priority', 'service_type', 'created_at',
        'assigned_expert__specialization', 'room__building', 'student_rating'
    ]

    search_fields = [
        'title', 'description', 'student__user__username',
        'student__student_number', 'assigned_expert__user__username', 'student_feedback'
    ]

    ordering = ['-created_at']

    actions = [
        'approve_requests', 'reject_requests', 'assign_expert_action',
        'set_high_priority', 'set_medium_priority', 'set_low_priority',
        'mark_in_progress', 'mark_completed'
    ]

    readonly_fields = [
        'student', 'created_at', 'updated_at', 'days_since_created',
        'issue_image_preview', 'completion_image_preview', 'feedback_at'
    ]

    def dispatch(self, request, *args, **kwargs):
        """Mark maintenance requests as viewed when admin accesses them"""
        if request.user.is_staff:
            from notification.models import AdminActivityTracker
            AdminActivityTracker.mark_as_viewed(request.user, 'maintenance_requests')

        return super().dispatch(request, *args, **kwargs)

    inlines = [MaintenanceImageInline]

    def get_queryset(self, request):
        """Optimize queryset with select_related"""
        return super().get_queryset(request).select_related(
            'student__user', 'room__building', 'assigned_expert__user'
        ).prefetch_related('images')

    def title_with_truncation(self, obj):
        """Display truncated title with tooltip"""
        if len(obj.title) > 30:
            return format_html(
                '<span title="{}">{}</span>',
                obj.title,
                obj.title[:30] + '...'
            )
        return obj.title

    title_with_truncation.short_description = 'Title'
    title_with_truncation.admin_order_field = 'title'

    def student_info(self, obj):
        """Display student information with link"""
        return format_html(
            '<strong>{}</strong><br><small>#{}</small>',
            obj.student.user.username,
            obj.student.student_number
        )

    student_info.short_description = 'Student'

    def assigned_expert_info(self, obj):
        """Display assigned expert's information"""
        if obj.assigned_expert:
            return format_html(
                '<strong>{}</strong><br><small>{}</small>',
                obj.assigned_expert.user.username,
                obj.assigned_expert.get_specialization_display()
            )
        return "No expert assigned"

    assigned_expert_info.short_description = 'Assigned Expert'

    def student_rating_display(self, obj):
        """Display student rating with stars"""
        if obj.student_rating:
            stars = '★' * obj.student_rating + '☆' * (5 - obj.student_rating)
            return format_html(
                '<span style="color: #ffc107;">{}</span><br><small>({}/5)</small>',
                stars, obj.student_rating
            )
        return format_html('<span class="text-muted">Not rated</span>')

    student_rating_display.short_description = 'Student Rating'

    def days_since_created(self, obj):
        """Display how many days ago the request was created"""
        days = obj.days_since_created
        return f"{days} days"

    days_since_created.short_description = 'Days Since Created'

    def issue_image_preview(self, obj):
        """Display all issue image previews"""
        issue_images = obj.images.filter(image_type='issue')
        if issue_images.exists():
            images_html = ''.join(
                f'<img src="{image.image.url}" style="max-height: 200px; max-width: 200px; object-fit: cover;" />'
                for image in issue_images
            )
            return format_html(images_html)
        return "No issue images uploaded"

    issue_image_preview.short_description = 'Issue Images'

    def completion_image_preview(self, obj):
        """Display all completion image previews"""
        completion_images = obj.images.filter(image_type='completion')
        if completion_images.exists():
            images_html = ''.join(
                f'<img src="{image.image.url}" style="max-height: 200px; max-width: 200px; object-fit: cover;" />'
                for image in completion_images
            )
            return format_html(images_html)
        return "No completion images"

    completion_image_preview.short_description = 'Completion Images'

    # Admin Actions
    def approve_requests(self, request, queryset):
        """Approve selected maintenance requests"""
        for maintenance_request in queryset.filter(status='pending'):
            maintenance_request.status = 'approved'
            maintenance_request.approved_by_name = request.user.username
            maintenance_request.approved_at = timezone.now()
            maintenance_request.save()  # Triggers signals

    approve_requests.short_description = "✅ Approve selected requests"

    def reject_requests(self, request, queryset):
        """Reject selected maintenance requests"""
        for maintenance_request in queryset.filter(status='pending'):
            maintenance_request.status = 'rejected'
            maintenance_request.approved_by_name = request.user.username
            maintenance_request.approved_at = timezone.now()
            maintenance_request.rejection_reason = "Rejected by admin - contact administration for details"
            maintenance_request.save()  # Triggers signals

    reject_requests.short_description = "❌ Reject selected requests"

    def assign_expert_action(self, request, queryset):
        """Auto-assign experts based on service type"""
        for maintenance_request in queryset.filter(
                Q(assigned_expert__isnull=True) & Q(status__in=['approved', 'pending'])
        ):
            expert = ServiceExpert.objects.filter(
                specialization=maintenance_request.service_type,
                is_active=True
            ).first()

            if expert:
                maintenance_request.assigned_expert = expert
                maintenance_request.assigned_at = timezone.now()
                if maintenance_request.status == 'pending':
                    maintenance_request.status = 'approved'
                    maintenance_request.approved_by_name = request.user.username
                    maintenance_request.approved_at = timezone.now()
                maintenance_request.save()

    assign_expert_action.short_description = "👨‍🔧 Auto-assign experts"

    # Priority Actions
    def set_high_priority(self, request, queryset):
        """Set selected requests to high priority"""
        queryset.update(priority='high')

    set_high_priority.short_description = "🔴 Set high priority"

    def set_medium_priority(self, request, queryset):
        """Set selected requests to medium priority"""
        queryset.update(priority='medium')

    set_medium_priority.short_description = "🟡 Set medium priority"

    def set_low_priority(self, request, queryset):
        """Set selected requests to low priority"""
        queryset.update(priority='low')

    set_low_priority.short_description = "🟢 Set low priority"

    # Status Actions
    def mark_in_progress(self, request, queryset):
        """Mark selected requests as in progress"""
        queryset.filter(status='approved').update(status='in_progress', work_started_at=timezone.now())

    mark_in_progress.short_description = "🔄 Mark in progress"

    def mark_completed(self, request, queryset):
        """Mark selected requests as completed"""
        queryset.filter(status='in_progress').update(status='completed', completed_at=timezone.now())

    mark_completed.short_description = "✅ Mark completed"


@admin.register(MaintenanceImage)
class MaintenanceImageAdmin(admin.ModelAdmin):
    list_display = ['maintenance_request', 'image_type', 'image_preview', 'uploaded_at']
    list_filter = ['image_type', 'uploaded_at']
    search_fields = ['maintenance_request__title']
    readonly_fields = ['image_preview', 'uploaded_at']

    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="max-height: 100px; max-width: 100px; object-fit: cover;" />',
                obj.image.url
            )
        return "No image"

    image_preview.short_description = 'Preview'
