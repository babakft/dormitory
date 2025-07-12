from django import forms
from django.contrib.auth.forms import UserCreationForm
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
