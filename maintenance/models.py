# maintenance/models.py - FINAL FIX
from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator
from student.models import User, Student, Room
from service.models import ServiceExpert


class MaintenanceRequest(models.Model):
    """Maintenance request from students"""

    STATUS_CHOICES = [
        ('pending', 'در انتظار بررسی'),
        ('approved', 'تایید شده'),
        ('rejected', 'رد شده'),
        ('in_progress', 'در حال انجام'),
        ('completed', 'تکمیل شده'),
    ]

    PRIORITY_CHOICES = [
        ('not_decided', 'تعیین نشده'),
        ('low', 'کم'),
        ('medium', 'متوسط'),
        ('high', 'زیاد'),
    ]

    SERVICE_TYPE_CHOICES = [
        ('electrical', 'برق'),
        ('plumbing', 'لوله‌کشی'),
        ('hvac', 'تهویه مطبوع'),
        ('carpentry', 'نجاری'),
        ('general', 'تعمیرات عمومی'),
        ('cleaning', 'نظافت'),
        ('security', 'سیستم‌های امنیتی'),
    ]

    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name='maintenance_requests',
        verbose_name='دانشجو'
    )

    title = models.CharField(max_length=200, verbose_name='عنوان')
    description = models.TextField(verbose_name='توضیحات')
    service_type = models.CharField(
        max_length=20,
        choices=SERVICE_TYPE_CHOICES,
        help_text='نوع خدمات مورد نیاز',
        verbose_name='نوع سرویس'
    )
    priority = models.CharField(
        max_length=20,
        choices=PRIORITY_CHOICES,
        default='not_decided',
        verbose_name='اولویت'
    )

    room = models.ForeignKey(
        Room,
        on_delete=models.CASCADE,
        related_name='maintenance_requests',
        verbose_name='اتاق'
    )

    status = models.CharField(
        max_length=15,
        choices=STATUS_CHOICES,
        default='pending',
        verbose_name='وضعیت'
    )

    approved_by_name = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name='تایید شده توسط'
    )
    approved_at = models.DateTimeField(null=True, blank=True, verbose_name='تاریخ تایید')
    rejection_reason = models.TextField(blank=True, verbose_name='دلیل رد')

    assigned_expert = models.ForeignKey(
        ServiceExpert,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_requests',
        verbose_name='متخصص تخصیص داده شده'
    )
    assigned_at = models.DateTimeField(null=True, blank=True, verbose_name='تاریخ تخصیص')

    work_started_at = models.DateTimeField(null=True, blank=True, verbose_name='شروع کار')
    expert_notes = models.TextField(blank=True, verbose_name='یادداشت‌های متخصص')

    completion_notes = models.TextField(blank=True, verbose_name='یادداشت‌های تکمیل')
    completed_at = models.DateTimeField(null=True, blank=True, verbose_name='تاریخ تکمیل')

    student_rating = models.IntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text='امتیاز از ۱ تا ۵',
        verbose_name='امتیاز دانشجو'
    )
    student_feedback = models.TextField(blank=True, verbose_name='نظر دانشجو')
    feedback_at = models.DateTimeField(null=True, blank=True, verbose_name='تاریخ نظر')

    created_at = models.DateTimeField(auto_now_add=True, verbose_name='تاریخ ایجاد')
    updated_at = models.DateTimeField(default=timezone.now, verbose_name='تاریخ به‌روزرسانی')

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.student.user.username} ({self.get_status_display()})"

    class Meta:
        verbose_name = 'درخواست تعمیرات'
        verbose_name_plural = 'درخواست‌های تعمیرات'
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        """Override save to ALWAYS update updated_at timestamp"""
        self.updated_at = timezone.now()
        super().save(*args, **kwargs)

    @property
    def full_location(self):
        return str(self.room)

    @property
    def days_since_created(self):
        return (timezone.now() - self.created_at).days

    def assign_to_expert(self, expert):
        """Assign request to expert and update timestamps"""
        if self.assigned_expert:
            raise ValueError("Request already assigned to an expert")

        if not expert.can_claim_request(self):
            raise ValueError("Expert cannot claim this request")

        self.assigned_expert = expert
        self.assigned_at = timezone.now()
        self.save()

    def start_work(self, expert_notes=""):
        """Start work and update status"""
        self.status = 'in_progress'
        self.work_started_at = timezone.now()
        if expert_notes:
            self.expert_notes = expert_notes
        self.save()

    def complete_work(self, completion_notes, completion_image=None):
        """Complete work and update status"""
        self.status = 'completed'
        self.completion_notes = completion_notes
        self.completed_at = timezone.now()
        self.save()

        if completion_image:
            MaintenanceImage.objects.create(
                maintenance_request=self,
                image=completion_image,
                image_type='completion'
            )


class MaintenanceImage(models.Model):
    """Images for maintenance requests"""

    IMAGE_TYPE_CHOICES = [
        ('issue', 'تصویر مشکل'),
        ('completion', 'تصویر تکمیل'),
    ]

    def get_upload_path(self, filename):
        """Dynamic upload path based on image type"""
        if self.image_type == 'issue':
            return f'maintenance_issues/{filename}'
        elif self.image_type == 'completion':
            return f'maintenance_completed/{filename}'
        else:
            return f'maintenance_images/{filename}'

    maintenance_request = models.ForeignKey(
        MaintenanceRequest,
        on_delete=models.CASCADE,
        related_name='images',
        verbose_name='درخواست تعمیرات'
    )
    image = models.ImageField(upload_to=get_upload_path, verbose_name='تصویر')
    image_type = models.CharField(max_length=10, choices=IMAGE_TYPE_CHOICES,verbose_name='نوع تصویر')
    uploaded_at = models.DateTimeField(auto_now_add=True, verbose_name='تاریخ بارگذاری')


    def __str__(self):
        return f"{self.get_image_type_display()} - {self.maintenance_request.title}"

    class Meta:
        verbose_name = 'تصویر تعمیرات'
        verbose_name_plural = 'تصاویر تعمیرات'