# notification/views.py
from django.shortcuts import render
from django.contrib.admin.views.decorators import staff_member_required
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse, JsonResponse
from django.utils.decorators import method_decorator
from django.views import View
from .models import AdminActivityTracker


@staff_member_required
@require_http_methods(["GET"])
def notification_badge(request):
    """HTMX endpoint that returns the notification badge HTML"""
    counts = AdminActivityTracker.get_new_counts(request.user)

    # Create tooltip text
    details = []
    if counts.get('student_registrations', 0) > 0:
        details.append(f"{counts['student_registrations']} new student registration(s)")
    if counts.get('maintenance_requests', 0) > 0:
        details.append(f"{counts['maintenance_requests']} new maintenance request(s)")
    if counts.get('maintenance_status_changes', 0) > 0:
        details.append(f"{counts['maintenance_status_changes']} maintenance update(s)")
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


@staff_member_required
@csrf_exempt  # Since this is admin-only and we verify staff status, CSRF exempt is acceptable
@require_http_methods(["POST"])
def mark_as_viewed(request, activity_type):
    """Mark specific activity types as viewed - CSRF exempt for HTMX"""
    try:
        valid_types = [choice[0] for choice in AdminActivityTracker.ACTIVITY_TYPES]
        print(f"DEBUG: Mark as viewed request for '{activity_type}' (valid types: {valid_types})")

        if activity_type in valid_types:
            AdminActivityTracker.mark_as_viewed(request.user, activity_type)
            print(f"DEBUG: Successfully marked '{activity_type}' as viewed for {request.user.username}")

            # Return JSON success response for HTMX
            return JsonResponse({
                'success': True,
                'message': f'Marked {activity_type} as viewed'
            })

        print(f"ERROR: Invalid activity type '{activity_type}'")
        return JsonResponse({
            'success': False,
            'error': f'Invalid activity type: {activity_type}'
        }, status=400)

    except Exception as e:
        print(f"ERROR: Exception in mark_as_viewed: {e}")
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


# Mixin to auto-mark sections as viewed
class AutoMarkViewedMixin:
    """Mixin for admin views to automatically mark sections as viewed"""
    activity_type = None

    def dispatch(self, request, *args, **kwargs):
        if self.activity_type and request.user.is_staff:
            AdminActivityTracker.mark_as_viewed(request.user, self.activity_type)
        return super().dispatch(request, *args, **kwargs)