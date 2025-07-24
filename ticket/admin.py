from django.contrib import admin
from django.utils.html import format_html
from ticket.models import Ticket, TicketMessage, TicketAttachment
from ticket.forms import TicketReplyForm
from django.shortcuts import render, get_object_or_404, redirect
from django.contrib import messages
from django.db import transaction


class TicketMessageInline(admin.TabularInline):
    """Inline for viewing ticket messages in admin"""
    model = TicketMessage
    extra = 0
    readonly_fields = ['author', 'content', 'is_admin_message', 'created_at', 'attachment_preview']
    fields = ['author', 'content', 'is_admin_message', 'created_at', 'attachment_preview']

    def attachment_preview(self, obj):
        if obj.attachments.exists():
            attachment = obj.attachments.first()
            return format_html(
                '<img src="{}" style="max-height: 50px; max-width: 50px; object-fit: cover;" />',
                attachment.image.url
            )
        return "No attachment"

    attachment_preview.short_description = 'Attachment'

    def has_add_permission(self, request, obj=None):
        return False  # Don't allow adding messages through inline

    def has_delete_permission(self, request, obj=None):
        return False  # Don't allow deleting messages


@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'title_with_truncation',
        'creator_info',
        'status',
        'message_count',
        'created_at',
        'updated_at',
        'days_since_created'
    ]

    list_filter = ['status', 'created_at', 'updated_at', 'created_by__user_type']

    search_fields = [
        'title', 'description', 'created_by__username',
        'created_by__email', 'messages__content'
    ]

    ordering = ['-updated_at']

    actions = [
        'close_tickets'
    ]

    readonly_fields = [
        'created_by', 'created_at', 'updated_at', 'days_since_created',
        'message_count', 'latest_message_preview'
    ]

    fieldsets = (
        ('Ticket Information', {
            'fields': ('created_by', 'title', 'description', 'status')
        }),
        ('Conversation Preview', {
            'fields': ('latest_message_preview',),
            'classes': ('collapse',)
        }),
        ('Statistics', {
            'fields': ('message_count', 'days_since_created'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )

    inlines = [TicketMessageInline]

    def get_queryset(self, request):
        """Optimize queryset with select_related and annotations"""
        return super().get_queryset(request).select_related('created_by').prefetch_related('messages')

    def title_with_truncation(self, obj):
        """Display truncated title with tooltip"""
        if len(obj.title) > 40:
            return format_html(
                '<span title="{}">{}</span>',
                obj.title,
                obj.title[:40] + '...'
            )
        return obj.title

    title_with_truncation.short_description = 'Title'
    title_with_truncation.admin_order_field = 'title'

    def creator_info(self, obj):
        """Display creator information with user type"""
        user_type = obj.get_creator_type()
        return format_html(
            '<strong>{}</strong><br><small>{} ({})</small>',
            obj.created_by.username,
            obj.created_by.email,
            user_type
        )

    creator_info.short_description = 'Created By'

    def message_count(self, obj):
        """Display number of messages in conversation"""
        count = obj.messages.count()
        return f"{count} messages"

    message_count.short_description = 'Messages'

    def days_since_created(self, obj):
        """Display how many days ago the ticket was created"""
        days = obj.days_since_created
        return f"{days} days"

    days_since_created.short_description = 'Age'

    def latest_message_preview(self, obj):
        """Display preview of latest message"""
        latest = obj.latest_message
        if latest:
            message_type = "Admin" if latest.is_admin_message else "User"
            return format_html(
                '<strong>{}:</strong> {}<br><small>{}</small>',
                message_type,
                latest.content[:100] + ('...' if len(latest.content) > 100 else ''),
                latest.created_at.strftime('%M d, %Y at %H:%M')
            )
        return "No messages yet"

    latest_message_preview.short_description = 'Latest Message'

    # Admin Actions
    def close_tickets(self, request, queryset):
        """Close selected tickets"""
        closed_count = 0
        for ticket in queryset.exclude(status='closed'):
            ticket.close_ticket()
            closed_count += 1

        self.message_user(
            request,
            f'Successfully closed {closed_count} tickets.'
        )

    close_tickets.short_description = "🔒 Close selected tickets"

    # Custom admin views for replying to tickets
    def change_view(self, request, object_id, form_url='', extra_context=None):
        """Custom change view with reply functionality"""
        ticket = get_object_or_404(Ticket, pk=object_id)

        # Handle admin reply form submission
        if request.method == 'POST' and 'admin_reply' in request.POST:
            reply_form = TicketReplyForm(request.POST, request.FILES)
            if reply_form.is_valid():
                try:
                    with transaction.atomic():
                        # Save the admin reply
                        message = reply_form.save_message(ticket, request.user)
                        messages.success(request, f'Reply sent successfully to {ticket.created_by.username}')
                        return redirect(f'/admin/ticket/ticket/{object_id}/change/')
                except Exception as e:
                    messages.error(request, f'Failed to send reply: {str(e)}')
            else:
                messages.error(request, 'Please correct the errors in your reply.')
        else:
            reply_form = TicketReplyForm()

        # Mark ticket as viewed if it's pending
        if ticket.status == 'pending':
            ticket.mark_as_viewed()

        extra_context = extra_context or {}
        extra_context.update({
            'ticket': ticket,
            'reply_form': reply_form,
            'conversation_messages': ticket.messages.all(),
            'can_reply': ticket.status != 'closed',
        })

        return super().change_view(request, object_id, form_url, extra_context)


@admin.register(TicketMessage)
class TicketMessageAdmin(admin.ModelAdmin):
    list_display = ['ticket_info', 'author_info', 'message_preview', 'is_admin_message', 'created_at']
    list_filter = ['is_admin_message', 'created_at', 'author__user_type']
    search_fields = ['content', 'ticket__title', 'author__username']
    readonly_fields = ['ticket', 'author', 'is_admin_message', 'created_at']
    ordering = ['-created_at']

    def ticket_info(self, obj):
        """Display ticket information"""
        return format_html(
            '<strong>#{}</strong><br><small>{}</small>',
            obj.ticket.id,
            obj.ticket.title[:30] + ('...' if len(obj.ticket.title) > 30 else '')
        )

    ticket_info.short_description = 'Ticket'

    def author_info(self, obj):
        """Display author information"""
        message_type = "Admin" if obj.is_admin_message else "User"
        return format_html(
            '<strong>{}</strong><br><small>{}</small>',
            obj.author.username,
            message_type
        )

    author_info.short_description = 'Author'

    def message_preview(self, obj):
        """Display message content preview"""
        return obj.content[:50] + ('...' if len(obj.content) > 50 else '')

    message_preview.short_description = 'Content'


@admin.register(TicketAttachment)
class TicketAttachmentAdmin(admin.ModelAdmin):
    list_display = ['ticket_info', 'message_info', 'image_preview', 'uploaded_at']
    list_filter = ['uploaded_at']
    search_fields = ['message__ticket__title', 'message__author__username']
    readonly_fields = ['message', 'image_preview', 'uploaded_at']

    def ticket_info(self, obj):
        """Display ticket information"""
        return format_html(
            '<strong>#{}</strong><br><small>{}</small>',
            obj.message.ticket.id,
            obj.message.ticket.title[:30] + ('...' if len(obj.message.ticket.title) > 30 else '')
        )

    ticket_info.short_description = 'Ticket'

    def message_info(self, obj):
        """Display message information"""
        message_type = "Admin" if obj.message.is_admin_message else "User"
        return format_html(
            '<strong>{}</strong><br><small>{}</small>',
            obj.message.author.username,
            message_type
        )

    message_info.short_description = 'Message Author'

    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="max-height: 100px; max-width: 100px; object-fit: cover;" />',
                obj.image.url
            )
        return "No image"

    image_preview.short_description = 'Preview'