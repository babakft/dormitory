from django.db import models
from student.models import User
class ServiceExpert(models.Model):
    """Expert/technician who handles maintenance requests"""

    SPECIALIZATION_CHOICES = [
        ('electrical', 'Electrical'),
        ('plumbing', 'Plumbing'),
        ('hvac', 'HVAC/Air Conditioning'),
        ('carpentry', 'Carpentry'),
        ('general', 'General Maintenance'),
        ('cleaning', 'Cleaning'),
        ('security', 'Security Systems'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='expert_profile')
    employee_id = models.CharField(max_length=50, unique=True)
    specialization = models.CharField(max_length=20, choices=SPECIALIZATION_CHOICES)

    @property
    def display_name(self):
        return self.user.display_name

    # Status
    is_active = models.BooleanField(default=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.get_specialization_display()}"

    class Meta:
        verbose_name = 'Service Expert'
        verbose_name_plural = 'Service Experts'