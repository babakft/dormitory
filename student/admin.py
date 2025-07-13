from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib import messages
from django.utils.timezone import now
from student.models import User, Student, Room, Building


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['email', 'username', 'user_type', 'is_active', 'is_staff', 'date_joined']
    list_filter = ['user_type', 'is_active', 'is_staff', 'date_joined']
    search_fields = ['email', 'username', 'phone']
    ordering = ['-date_joined']

    fieldsets = (
        (None, {'fields': ('email', 'username', 'password')}),
        ('Personal info', {'fields': ('phone', 'user_type')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'user_type', 'password1', 'password2'),
        }),
    )

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('student_profile')


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ['student_number', 'username', 'email', 'room_info', 'registration_status', 'created_at']
    list_filter = ['registration_status', 'room__building', 'room__floor', 'created_at']
    search_fields = ['student_number', 'user__username', 'user__email']
    ordering = ['-created_at']
    raw_id_fields = ['user', 'room']
    actions = ['approve_students', 'reject_students', 'deactivate_students']

    fieldsets = (
        ('Student Information', {
            'fields': ('user', 'student_number', 'room')
        }),
        ('Registration Status', {
            'fields': ('registration_status', 'processed_by_name', 'processed_at', 'rejection_reason')
        }),
    )

    def username(self, obj):
        return obj.user.username

    username.short_description = 'Username'
    username.admin_order_field = 'user__username'

    def email(self, obj):
        return obj.user.email

    email.short_description = 'Email'
    email.admin_order_field = 'user__email'

    def room_info(self, obj):
        return str(obj.room) if obj.room else 'No room assigned'

    room_info.short_description = 'Room'
    room_info.admin_order_field = 'room__number'

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'user', 'room', 'room__building'
        ).prefetch_related('maintenance_requests')

    # Admin Actions
    def approve_students(self, request, queryset):
        """Approve selected student registrations"""
        for student in queryset.filter(registration_status='pending'):
            student.registration_status = 'approved'
            student.processed_by_name = request.user.username
            student.processed_at = now()
            student.rejection_reason = ''  # Clear any previous rejection reason
            student.save()



    approve_students.short_description = "✅ Approve selected students"

    def reject_students(self, request, queryset):
        """Reject selected student registrations"""
        for student in queryset.filter(registration_status='pending'):
            student.registration_status = 'rejected'
            student.processed_by_name = request.user.username
            student.processed_at = now()
            student.rejection_reason = 'Rejected by admin'  # Default reason
            student.save()


    reject_students.short_description = "❌ Reject selected students"

    def deactivate_students(self, request, queryset):
        """Deactivate selected student accounts"""
        for student in queryset:
            student.user.is_active = False
            student.user.save()

    deactivate_students.short_description = "🚫 Deactivate selected students"


@admin.register(Building)
class BuildingAdmin(admin.ModelAdmin):
    list_display = ['name', 'total_floors', 'created_at']
    search_fields = ['name']
    list_filter = ['total_floors', 'created_at']
    ordering = ['name']


@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ['building', 'number', 'floor', 'capacity', 'student_count']
    list_filter = ['building', 'floor', 'capacity']
    search_fields = ['number', 'building__name']
    ordering = ['building', 'floor', 'number']

    def student_count(self, obj):
        return obj.students.count()

    student_count.short_description = 'Students'
