from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator


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
        extra_fields.setdefault('user_type', 'admin')

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, username, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """Custom user model with email and username for authentication"""

    USER_TYPE_CHOICES = [
        ('student', 'Student'),
        ('admin', 'Admin'),
        ('expert', 'Service Expert'),
    ]

    email = models.EmailField(unique=True)
    username = models.CharField(max_length=50, unique=True)
    phone = models.CharField(max_length=11, blank=True)
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES)

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
    REQUIRED_FIELDS = ['username', 'user_type']  # Required when creating superuser

    def __str__(self):
        return f"{self.username} ({self.email}) - {self.get_user_type_display()}"

    @property
    def display_name(self):
        return self.username


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
    capacity = models.IntegerField(default=1)
    is_occupied = models.BooleanField(default=False)

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
    ]  # Convenience properties for easier access to user fields

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

    # Admin who approved/rejected
    processed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='processed_students',
        limit_choices_to={'user_type': 'admin'}
    )
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
        return f"Room {self.room_number}, Floor {self.floor_number}, {self.building_name}"
