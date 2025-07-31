from django.shortcuts import render
from django.contrib.admin.views.decorators import staff_member_required
from django.views.decorators.http import require_http_methods
from django.http import HttpResponse
from django.utils.decorators import method_decorator
from django.views import View
from .models import AdminActivityTracker


@staff_member_required
@require_http_methods(["GET"])
def notification_badge(request):
    """HTMX endpoint that returns the notification badge HTML"""
    counts = AdminActivityTracker.get_new_counts(request.user)

    # DEBUG: Print what we're getting
    print(f"DEBUG Notification Counts: {counts}")

    # Force some test data to verify template is working
    if not any(counts.values()):  # If all counts are 0
        counts = {
            'student_registrations': 2,
            'maintenance_requests': 3,
            'tickets': 1,
            'ticket_messages': 4,
            'total': 10
        }

    # Create tooltip text
    details = []
    if counts.get('student_registrations', 0) > 0:
        details.append(f"{counts['student_registrations']} new student registration(s)")
    if counts.get('maintenance_requests', 0) > 0:
        details.append(f"{counts['maintenance_requests']} new maintenance request(s)")
    if counts.get('tickets', 0) > 0:
        details.append(f"{counts['tickets']} new ticket(s)")
    if counts.get('ticket_messages', 0) > 0:
        details.append(f"{counts['ticket_messages']} new message(s)")

    tooltip_text = ", ".join(details) if details else "No new notifications"

    context = {
        'notification_count': counts.get('total', 0),
        'counts': counts,
        'tooltip_text': tooltip_text,
    }

    return render(request, 'notification/badge_fragment.html', context)


@staff_member_required
@require_http_methods(["GET"])
def notification_dropdown(request):
    """HTMX endpoint for the dropdown detail view"""
    counts = AdminActivityTracker.get_new_counts(request.user)

    context = {
        'counts': counts,
    }

    return render(request, 'notification/dropdown_fragment.html', context)


@method_decorator(staff_member_required, name='dispatch')
class MarkAsViewedView(View):
    """Mark specific activity types as viewed"""

    def post(self, request, activity_type):
        if activity_type in dict(AdminActivityTracker.ACTIVITY_TYPES):
            AdminActivityTracker.mark_as_viewed(request.user, activity_type)
            return HttpResponse(status=204)
        return HttpResponse(status=400)


# Mixin to auto-mark sections as viewed
class AutoMarkViewedMixin:
    """Mixin for admin views to automatically mark sections as viewed"""
    activity_type = None

    def dispatch(self, request, *args, **kwargs):
        if self.activity_type and request.user.is_staff:
            AdminActivityTracker.mark_as_viewed(request.user, self.activity_type)
        return super().dispatch(request, *args, **kwargs)
