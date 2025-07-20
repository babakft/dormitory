import secrets, string
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib import messages
from django.utils.timezone import now
from student.models import User, Student, Room, Building
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.db import transaction


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
    actions = ['approve_students', 'reject_students', 'deactivate_students', 'reset_student_passwords']

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
        # show only email-verified students
        qs = super().get_queryset(request)
        if not request.GET.get('user__is_active__exact'):
            return qs.filter(user__is_active=True)
        return qs

    # Admin Actions
    def approve_students(self, request, queryset):
        """Approve selected student registrations"""
        for student in queryset.filter(registration_status__in=['pending', 'rejected']):
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

    @staticmethod
    def generate_secure_password():
        """Generate a cryptographically secure random password"""
        length = 8
        characters = string.ascii_letters + string.digits
        return ''.join(secrets.choice(characters) for _ in range(length))

    @staticmethod
    def send_password_reset_email(student, new_password):
        """Send password reset email to student using template"""
        context = {
            'student': student,
            'new_password': new_password,
            'username': student.user.username,
            'student_number': student.student_number,
        }

        message = render_to_string('emails/password_reset_student.txt', context)

        send_mail(
            subject='🔐 Password Reset - Dormitory Management System',
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[student.user.email],
            fail_silently=False,
        )

    def reset_student_passwords(self, request, queryset):
        """Reset passwords for selected students and send new passwords via email"""
        success_count = 0
        failed_count = 0

        for student in queryset:
            try:
                with transaction.atomic():
                    # Generate new secure password
                    new_password = self.generate_secure_password()

                    # Set the new password (automatically hashes it)
                    student.user.set_password(new_password)
                    student.user.save()

                    # Send email with new password
                    self.send_password_reset_email(student, new_password)

                    # Only increment success if everything completed without exception
                    success_count += 1

            except Exception as e:
                messages.error(request, f'Failed to reset password for {student.user.username}: {str(e)}')
                failed_count += 1
                # Transaction will automatically rollback due to exception

        if success_count > 0:
            messages.success(request,
                             f'Successfully reset passwords for {success_count} students. New passwords sent via email.')

        if failed_count > 0:
            messages.warning(request, f'{failed_count} password resets failed.')

    reset_student_passwords.short_description = "🔐 Reset student passwords (generate random)"


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
