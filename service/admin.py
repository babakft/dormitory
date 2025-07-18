from django.contrib import admin
from service.models import ServiceExpert

@admin.register(ServiceExpert)
class ServiceExpertAdmin(admin.ModelAdmin):
    list_display = ('user', 'employee_id', 'specialization', 'is_active', 'created_at')
    search_fields = ('user__username', 'employee_id', 'specialization')
    list_filter = ('specialization', 'is_active', 'created_at')
    ordering = ('-created_at',)
