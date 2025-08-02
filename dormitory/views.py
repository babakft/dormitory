# dormitory/views.py
from django.shortcuts import render
from django.views.generic import TemplateView
from django.db.models import Count, Q, Avg
from django.utils import timezone
from datetime import timedelta
from student.models import Student, Building, Room
from maintenance.models import MaintenanceRequest
from service.models import ServiceExpert
from ticket.models import Ticket


class HomeView(TemplateView):
    """
    Main home page view for the dormitory management system
    Displays system statistics and overview
    """
    template_name = 'home/index.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        # Get system statistics for display
        context.update(self.get_system_stats())

        # Get recent activity summary
        context.update(self.get_recent_activity())

        return context

    def get_system_stats(self):
        """Get overall system statistics"""

        # Student statistics
        total_students = Student.objects.filter(registration_status='approved').count()

        # Service expert statistics
        total_experts = ServiceExpert.objects.filter(is_active=True).count()

        # Maintenance request statistics
        completed_requests = MaintenanceRequest.objects.filter(status='completed').count()

        # Calculate satisfaction rate
        rated_requests = MaintenanceRequest.objects.filter(
            status='completed',
            student_rating__isnull=False
        )

        if rated_requests.exists():
            avg_rating = rated_requests.aggregate(
                avg_rating=Avg('student_rating')
            )['avg_rating']
            satisfaction_rate = int((avg_rating / 5.0) * 100) if avg_rating else 0
        else:
            satisfaction_rate = 98  # Default display value

        return {
            'total_students': total_students,
            'total_experts': total_experts,
            'completed_requests': completed_requests,
            'satisfaction_rate': satisfaction_rate
        }

    def get_recent_activity(self):
        """Get recent system activity for display"""

        # Recent registrations (last 7 days)
        week_ago = timezone.now() - timedelta(days=7)
        recent_registrations = Student.objects.filter(
            created_at__gte=week_ago,
            registration_status='approved'
        ).count()

        # Recent maintenance requests
        recent_maintenance = MaintenanceRequest.objects.filter(
            created_at__gte=week_ago
        ).count()

        # Recent tickets
        recent_tickets = Ticket.objects.filter(
            created_at__gte=week_ago
        ).count()

        return {
            'recent_registrations': recent_registrations,
            'recent_maintenance': recent_maintenance,
            'recent_tickets': recent_tickets
        }


def home_view(request):
    """
    Simple function-based view for home page
    Alternative to class-based view for simpler needs
    """

    # Get basic statistics
    context = {
        'total_students': Student.objects.filter(registration_status='approved').count(),
        'total_experts': ServiceExpert.objects.filter(is_active=True).count(),
        'completed_requests': MaintenanceRequest.objects.filter(status='completed').count(),
        'satisfaction_rate': 98,  # Can be calculated from actual ratings
    }

    return render(request, 'home/index.html', context)