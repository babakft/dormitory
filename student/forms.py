from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.core.exceptions import ValidationError
from student.models import User, Student, Room
from django.contrib.auth import authenticate

class StudentRegistrationForm(UserCreationForm):
    """Simplified form focusing on field definition and basic validation"""

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
        if not student_number:
            raise ValidationError("Student number is required.")

        if Student.objects.filter(student_number=student_number).exists():
            raise ValidationError(f"A student with this student number already exists. \n"
                                  f"in case you didn't verify email waite and try again later ")

            # Remove any spaces or non-digit characters
        student_number = str(student_number).replace(' ', '').replace('-', '')
        if not student_number.isdigit():
            raise ValidationError("Student number must contain only digits.")

        if len(student_number) != 9:
            raise ValidationError("Student number must be exactly 9 digits.")

        # Convert to integer
        student_number = int(student_number)

        student_number = int(student_number)
        return student_number

    def clean_phone(self):
        phone = self.cleaned_data.get('phone')
        if phone:  # Only validate if phone is provided (since it's optional)
            # Remove any spaces or dashes
            phone = phone.replace(' ', '').replace('-', '')

            # Check if it's exactly 11 digits
            if not phone.isdigit():
                raise ValidationError("Phone number must contain only digits.")

            if len(phone) != 11:
                raise ValidationError("Phone number must be exactly 11 digits.")

            return phone
        return phone

    def save(self, commit=True):
        if commit:
            student = Student()
            return student.create_from_registration(self.cleaned_data)
        return super().save(commit=False)


class StudentLoginForm(AuthenticationForm):
    """Simplified login form with remember me functionality"""

    remember_me = forms.BooleanField(
        required=False,
        widget=forms.CheckboxInput(attrs={
            'class': 'form-check-input'
        }),
        label='Remember me'
    )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['username'].widget.attrs.update({
            'class': 'form-control',
            'placeholder': 'Enter your student number'
        })
        self.fields['password'].widget.attrs.update({
            'class': 'form-control',
            'placeholder': 'Enter your password'
        })
        self.fields['username'].label = 'Student Number'

    def clean_username(self):
        student_number = self.cleaned_data.get('username')
        if not student_number:
            raise ValidationError("Student number is required.")
        student_number = str(student_number).replace(' ', '').replace('-', '')
        if not student_number.isdigit():
            raise ValidationError("Student number must contain only digits.")
        if len(student_number) != 9:
            raise ValidationError("Student number must be exactly 9 digits.")

        return student_number

    def clean(self):
        student_number = self.cleaned_data.get('username')
        password = self.cleaned_data.get('password')

        if student_number and password:
            try:
                student = Student.objects.select_related('user').get(student_number=student_number)

                # Check if password is correct
                if not student.user.check_password(password):
                    raise ValidationError("Invalid student number or password.")

                # Check if student can login (handles pending/rejected status)
                if not student.can_login():
                    raise ValidationError(student.get_login_error_message())

                # If we get here, student should be able to login
                self.user_cache = student.user

            except Student.DoesNotExist:
                raise ValidationError("Invalid student number or password.")

        return self.cleaned_data

    def get_user(self):
        """Return the authenticated user."""
        return getattr(self, 'user_cache', None)

class ForgotPasswordForm(forms.Form):
    email = forms.EmailField(
        widget=forms.EmailInput(attrs={
            'class': 'form-input',
            'placeholder': 'Enter your email address',
            'id': 'id_email'
        }),
        label='Email Address',
        help_text='Enter the email address associated with your student account'
    )

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if email:
            email = email.strip().lower()
            # We don't validate if email exists here for security reasons
            # The actual check happens in the view
        return email