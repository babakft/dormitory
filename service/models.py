from django.db import models
from student.models import User
from django.db.models import Avg


class ServiceExpert(models.Model):
    """Expert/technician who handles maintenance requests"""

    SPECIALIZATION_CHOICES = [
        ('electrical', 'برق'),
        ('plumbing', 'لوله‌کشی'),
        ('hvac', 'تهویه مطبوع'),
        ('carpentry', 'نجاری'),
        ('general', 'تعمیرات عمومی'),
        ('cleaning', 'نظافت'),
        ('security', 'سیستم‌های امنیتی'),
    ]

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='expert_profile',
        verbose_name='کاربر'
    )
    employee_id = models.CharField(max_length=50, unique=True, verbose_name='شماره کارمندی')
    specialization = models.CharField(
        max_length=20,
        choices=SPECIALIZATION_CHOICES,
        verbose_name='تخصص'
    )

    is_active = models.BooleanField(default=True, verbose_name='فعال')

    average_rating = models.DecimalField(
        max_digits=3, decimal_places=2,
        null=True, blank=True,
        help_text="میانگین امتیاز از درخواست‌های تکمیل شده",
        verbose_name='میانگین امتیاز'
    )

    created_at = models.DateTimeField(auto_now_add=True, verbose_name='تاریخ ایجاد')

    @property
    def display_name(self):
        return self.user.display_name

    def __str__(self):
        return f"{self.user.username} - {self.get_specialization_display()}"

    class Meta:
        verbose_name = 'متخصص خدمات'
        verbose_name_plural = 'متخصصان خدمات'


    @property
    def rating_display(self):
        """Display rating as stars"""
        if self.average_rating:
            stars = '★' * int(self.average_rating) + '☆' * (5 - int(self.average_rating))
            return f"{stars} ({self.average_rating}/5)"
        return "No ratings yet"

    def update_average_rating(self):
        """Update average rating from actual requests"""
        from maintenance.models import MaintenanceRequest

        completed_requests = MaintenanceRequest.objects.filter(
            assigned_expert=self,
            status='completed',
            student_rating__isnull=False
        )
        rating_data = completed_requests.aggregate(
            avg_rating=Avg('student_rating')
        )
        self.average_rating = rating_data['avg_rating']

        self.save(update_fields=['average_rating'])

    def get_available_requests(self):
        from maintenance.models import MaintenanceRequest

        return MaintenanceRequest.objects.filter(
            service_type=self.specialization,
            status='approved',
            assigned_expert__isnull=True
        ).select_related('student__user', 'room__building').order_by('-priority', 'created_at')

    def get_my_assigned_requests(self):
        from maintenance.models import MaintenanceRequest
        return MaintenanceRequest.objects.filter(
            assigned_expert=self,
            status__in=['approved', 'in_progress']
        ).select_related('student__user', 'room__building').order_by('-priority', 'created_at')

    def get_my_completed_requests(self):
        from maintenance.models import MaintenanceRequest
        return MaintenanceRequest.objects.filter(
            assigned_expert=self,
            status='completed'
        ).select_related('student__user', 'room__building').order_by('-completed_at')

    def can_claim_request(self, maintenance_request):
        return (
                maintenance_request.service_type == self.specialization and
                maintenance_request.status == 'approved' and
                maintenance_request.assigned_expert is None and
                self.is_active
        )

    def claim_request(self, maintenance_request):
        """Claim a maintenance request"""
        if not self.can_claim_request(maintenance_request):
            raise ValueError("Cannot claim this request")

        maintenance_request.assign_to_expert(self)
        return maintenance_request

    def get_dashboard_data(self):
        """Get dashboard data for service expert"""
        available_requests = self.get_available_requests()
        assigned_requests = self.get_my_assigned_requests()

        return {
            'expert': self,
            'available_requests': available_requests[:5],
            'assigned_requests': assigned_requests,
            'total_available': available_requests.count(),
            'total_assigned': assigned_requests.count(),
            'total_completed': self.get_my_completed_requests().count(),
        }
