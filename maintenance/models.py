from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator
from student.models import User, Student, Room
from service.models import ServiceExpert


class MaintenanceRequest(models.Model):
    """Maintenance request from students"""

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
    ]

    PRIORITY_CHOICES = [
        ('not_decided', 'Not Decided'),
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ]

    # Service type choices matching expert specializations
    SERVICE_TYPE_CHOICES = [
        ('electrical', 'Electrical'),
        ('plumbing', 'Plumbing'),
        ('hvac', 'HVAC/Air Conditioning'),
        ('carpentry', 'Carpentry'),
        ('general', 'General Maintenance'),
        ('cleaning', 'Cleaning'),
        ('security', 'Security Systems'),
    ]

    # Student who made the request
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='maintenance_requests')

    # Request details
    title = models.CharField(max_length=200)
    description = models.TextField()
    service_type = models.CharField(
        max_length=20,
        choices=SERVICE_TYPE_CHOICES,
        help_text='Type of service required'
    )
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='not_decided')

    # Location details - Using FK to Room
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='maintenance_requests')

    # Status tracking
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='pending')

    # Admin approval tracking - CharField approach
    approved_by_name = models.CharField(max_length=100, blank=True, null=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)

    # Assignment to expert
    assigned_expert = models.ForeignKey(
        ServiceExpert,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_requests'
    )
    assigned_at = models.DateTimeField(null=True, blank=True)

    # Work progress
    work_started_at = models.DateTimeField(null=True, blank=True)
    expert_notes = models.TextField(blank=True)

    # Completion details
    completion_notes = models.TextField(blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    # Student feedback
    student_rating = models.IntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text='Rating from 1 to 5'
    )
    student_feedback = models.TextField(blank=True)
    feedback_at = models.DateTimeField(null=True, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.student.user.username} ({self.get_status_display()})"

    @property
    def full_location(self):
        return str(self.room)

    @property
    def days_since_created(self):
        return (timezone.now() - self.created_at).days

    # Add these methods to your existing MaintenanceRequest class

    def assign_to_expert(self, expert):
        if self.assigned_expert:
            raise ValueError("Request already assigned to an expert")

        if not expert.can_claim_request(self):
            raise ValueError("Expert cannot claim this request")

        self.assigned_expert = expert
        self.assigned_at = timezone.now()
        self.save()

    def start_work(self, expert_notes=""):
        self.status = 'in_progress'
        self.work_started_at = timezone.now()
        if expert_notes:
            self.expert_notes = expert_notes
        self.save()

    def complete_work(self, completion_notes, completion_image=None):
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
        ('issue', 'Issue Image'),
        ('completion', 'Completion Image'),
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
        related_name='images'
    )
    image = models.ImageField(upload_to=get_upload_path)
    image_type = models.CharField(max_length=10, choices=IMAGE_TYPE_CHOICES)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['uploaded_at']

    def __str__(self):
        return f"{self.get_image_type_display()} - {self.maintenance_request.title}"
