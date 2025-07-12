from django import forms
from django.contrib.auth.forms import UserCreationForm,AuthenticationForm
from django.core.exceptions import ValidationError
from student.models import User, Student, Room


class StudentRegistrationForm(UserCreationForm):
    """Form for student registration"""

    student_number = forms.CharField(
        max_length=50,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Enter your student number'
        })
    )

    phone = forms.CharField(
        max_length=11,
        required=False,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Enter phone number (optional)'
        })
    )

    room = forms.ModelChoiceField(
        queryset=Room.objects.all(),
        required=False,
        empty_label="Select room (optional)",
        widget=forms.Select(attrs={'class': 'form-control'})
    )

    class Meta:
        model = User
        fields = ('email', 'username', 'phone', 'password1', 'password2')
        widgets = {
            'email': forms.EmailInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter your email'
            }),
            'username': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter your username'
            }),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Add Bootstrap classes to password fields
        self.fields['password1'].widget.attrs.update({
            'class': 'form-control',
            'placeholder': 'Enter password'
        })
        self.fields['password2'].widget.attrs.update({
            'class': 'form-control',
            'placeholder': 'Confirm password'
        })

    def clean_student_number(self):
        student_number = self.cleaned_data.get('student_number')
        if Student.objects.filter(student_number=student_number).exists():
            raise ValidationError("A student with this student number already exists.")
        return student_number

    def save(self, commit=True):
        # Save the User instance
        user = super().save(commit=False)
        user.user_type = 'student'  # Set user type to student

        if commit:
            user.save()
            # Create Student profile
            Student.objects.create(
                user=user,
                student_number=self.cleaned_data['student_number'],
                room=self.cleaned_data.get('room'),
                registration_status='pending'  # Default status
            )
        return user


# Simpler form version
from django.contrib.auth.forms import AuthenticationForm
from django.core.exceptions import ValidationError
from django.contrib.auth import authenticate
from student.models import Student


class StudentLoginForm(AuthenticationForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['username'].widget.attrs.update({
            'class': 'form-control',
            'placeholder': 'Enter your student number'  # Updated placeholder
        })
        self.fields['password'].widget.attrs.update({
            'class': 'form-control',
            'placeholder': 'Enter your password'
        })

        # Update label
        self.fields['username'].label = 'Student Number'

    def clean_username(self):
        """Validate student number format"""
        student_number = self.cleaned_data.get('username')

        if not student_number:
            raise ValidationError("Student number is required.")

        # Add any student number format validation here
        if len(student_number) != 9:  # Example validation
            raise ValidationError("Please enter a valid student number.")

        return student_number

    def clean(self):
        """Custom validation for student login"""
        cleaned_data = super().clean()
        student_number = cleaned_data.get('username')
        password = cleaned_data.get('password')

        if student_number and password:
            # Check if student exists
            try:
                student = Student.objects.select_related('user').get(student_number=student_number)
            except Student.DoesNotExist:
                raise ValidationError("Invalid student number or password.")

            # Check registration status
            if student.registration_status != 'approved':
                if student.registration_status == 'pending':
                    raise ValidationError("Your registration is pending approval.")
                elif student.registration_status == 'rejected':
                    raise ValidationError("Your registration has been rejected.")

            # Check if user account is active
            if not student.user.is_active:
                raise ValidationError("Your account has been disabled.")

            # Authenticate using custom backend
            user = authenticate(
                self.request,
                username=student_number,
                password=password
            )

            if user is None:
                raise ValidationError("Invalid student number or password.")

        return cleaned_data