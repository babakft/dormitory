from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone


class UserManager(BaseUserManager):
    """Custom user manager for our User model"""

    def create_user(self, email, username, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        if not username:
            raise ValueError('The Username field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        # Superusers don't need user_type - they are identified by is_superuser=True

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, username, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """Custom user model with email and username for authentication"""

    USER_TYPE_CHOICES = [
        ('student', 'Student'),
        ('expert', 'Service Expert'),
    ]

    email = models.EmailField(unique=True)
    username = models.CharField(max_length=50, unique=True)
    phone = models.CharField(max_length=11, blank=True)
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES, null=True, blank=True)

    # Django required fields
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)

    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name='groups',
        blank=True,
        help_text='The groups this user belongs to.',
        related_name='custom_user_set',
        related_query_name='custom_user',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name='user permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        related_name='custom_user_set',
        related_query_name='custom_user',
    )

    objects = UserManager()

    USERNAME_FIELD = 'email'  # Primary login field
    REQUIRED_FIELDS = ['username']  # Required when creating superuser

    def __str__(self):
        user_type_display = self.get_user_type_display() if self.user_type else 'Superuser'
        return f"{self.username} ({self.email}) - {user_type_display}"

    @property
    def display_name(self):
        return self.username

    def is_approved_student(self):
        """Check if user is an approved student"""
        return (hasattr(self, 'student_profile') and
                self.student_profile.registration_status == 'approved')

    @staticmethod
    def authenticate_as_student(student_number, password):
        """Authenticate user as student using student number"""
        try:
            student = Student.objects.select_related('user').get(student_number=student_number)
            if student.user.check_password(password) and student.can_login():
                return student.user
        except Student.DoesNotExist:
            pass
        return None


class Building(models.Model):
    """Building information"""
    name = models.CharField(max_length=50, unique=True)
    total_floors = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Room(models.Model):
    """Room information"""
    number = models.IntegerField()
    building = models.ForeignKey(Building, on_delete=models.CASCADE, related_name='rooms')
    floor = models.IntegerField()
    capacity = models.IntegerField(default=6)

    class Meta:
        unique_together = ['number', 'building', 'floor']
        ordering = ['building', 'floor', 'number']

    def __str__(self):
        return f"Room {self.number}, Floor {self.floor}, {self.building.name}"


class Student(models.Model):
    """Student model linked to User"""

    REGISTRATION_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    student_number = models.CharField(max_length=50, unique=True)

    @property
    def display_name(self):
        return self.user.display_name

    # Room Information
    room = models.ForeignKey(Room, on_delete=models.SET_NULL, null=True, blank=True, related_name='students')

    # Registration Status
    registration_status = models.CharField(
        max_length=10,
        choices=REGISTRATION_STATUS_CHOICES,
        default='pending'
    )

    # Admin approval
    processed_by_name = models.CharField(max_length=100, blank=True, null=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.student_number}"

    @property
    def is_approved(self):
        return self.registration_status == 'approved'

    @property
    def full_room_address(self):
        if self.room:
            return str(self.room)
        return "No room assigned"

    def can_login(self):
        """Check if student can login"""
        return (self.registration_status == 'approved' and
                self.user.is_active and
                self.user.user_type == 'student')

    def get_login_error_message(self):
        """Get appropriate error message for login failure"""
        if self.registration_status == 'pending':
            return 'Your registration is still pending approval. Please wait for admin approval.'
        elif self.registration_status == 'rejected':
            return 'Your registration has been rejected. Please contact administration.'
        elif not self.user.is_active:
            return 'Your account has been disabled.'
        return 'Access denied.'

    def get_dashboard_data(self):
        """Get all dashboard data for student"""
        maintenance_requests = self.maintenance_requests.all()[:5]
        return {
            'student': self,
            'maintenance_requests': maintenance_requests,
            'total_requests': self.maintenance_requests.count(),
            'pending_requests': self.maintenance_requests.filter(status='pending').count(),
            'completed_requests': self.maintenance_requests.filter(status='completed').count(),
        }

    def create_from_registration(self, validated_data):
        """Create student from registration form data"""
        user_data = {
            'email': validated_data['email'],
            'username': validated_data['username'],
            'phone': validated_data.get('phone', ''),
            'user_type': 'student'
        }

        # Create user
        user = User.objects.create_user(
            email=user_data['email'],
            username=user_data['username'],
            password=validated_data['password1'],
            phone=user_data['phone'],
            user_type=user_data['user_type']
        )

        # Create student profile
        return self.__class__.objects.create(
            user=user,
            student_number=validated_data['student_number'],
            room=validated_data.get('room'),
            registration_status='pending'
        )
