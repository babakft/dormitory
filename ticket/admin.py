# ticket/admin.py
from django.contrib import admin
from django.utils.html import format_html
from ticket.models import Ticket, TicketMessage


@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ['id', 'title_short', 'creator_info', 'status', 'message_count', 'created_at']
    list_filter = ['status', 'created_at', 'created_by__user_type']
    search_fields = ['title', 'description', 'created_by__username']
    ordering = ['-updated_at']
    readonly_fields = ['created_by', 'created_at', 'updated_at']

    fieldsets = (
        ('Ticket Information', {
            'fields': ('created_by', 'title', 'description', 'status')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )

    def title_short(self, obj):
        return obj.title[:40] + '...' if len(obj.title) > 40 else obj.title
    title_short.short_description = 'Title'

    def creator_info(self, obj):
        user_type = obj.get_creator_type()
        return format_html(
            '<strong>{}</strong><br><small>{}</small>',
            obj.created_by.username, user_type
        )
    creator_info.short_description = 'Created By'

    def message_count(self, obj):
        return obj.messages.count()
    message_count.short_description = 'Messages'


@admin.register(TicketMessage)
class TicketMessageAdmin(admin.ModelAdmin):
    list_display = ['ticket_id', 'author', 'content_short', 'is_admin_message', 'created_at']
    list_filter = ['is_admin_message', 'created_at']
    search_fields = ['content', 'ticket__title', 'author__username']
    readonly_fields = ['ticket', 'author', 'is_admin_message', 'created_at']
    ordering = ['-created_at']

    def content_short(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_short.short_description = 'Content'

    def ticket_id(self, obj):
        return f"#{obj.ticket.id}"
    ticket_id.short_description = 'Ticket'