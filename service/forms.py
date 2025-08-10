from django import forms
from django.contrib.auth.forms import AuthenticationForm

from django import forms
from django.contrib.auth.forms import AuthenticationForm
from django.core.exceptions import ValidationError
from service.models import ServiceExpert


class ServiceExpertLoginForm(AuthenticationForm):
    """Enhanced login form for service experts with proper validation and remember me"""

    remember_me = forms.BooleanField(
        required=False,
        widget=forms.CheckboxInput(attrs={
            'class': 'form-check-input'
        }),
        label='Keep me signed in'
    )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['username'].widget.attrs.update({
            'class': 'form-control',
            'placeholder': 'Enter your employee ID'
        })
        self.fields['password'].widget.attrs.update({
            'class': 'form-control',
            'placeholder': 'Enter your password'
        })
        self.fields['username'].label = 'Employee ID'

    def clean_username(self):
        employee_id = self.cleaned_data.get('username')
        if not employee_id:
            raise ValidationError("Employee ID is required.")

        # Clean the employee ID (remove spaces, dashes, etc.)
        employee_id = str(employee_id).replace(' ', '').replace('-', '')
        return employee_id

    def clean(self):
        cleaned_data = super().clean()
        employee_id = cleaned_data.get('username')
        password = cleaned_data.get('password')

        if employee_id and password:
            try:
                # Check if service expert exists with this employee ID
                expert = ServiceExpert.objects.select_related('user').get(
                    employee_id=employee_id,
                    is_active=True
                )

                # Check if password is correct
                if not expert.user.check_password(password):
                    raise ValidationError("Invalid employee ID or password.")

                # Check if user is active and has correct type
                if not expert.user.is_active:
                    raise ValidationError("Your account has been deactivated.")

                if expert.user.user_type != 'expert':
                    raise ValidationError("Access denied. Service expert account required.")

                # If we get here, expert should be able to login
                self.user_cache = expert.user

            except ServiceExpert.DoesNotExist:
                raise ValidationError("Invalid employee ID or password.")

        return cleaned_data

    def get_user(self):
        """Return the authenticated user."""
        return getattr(self, 'user_cache', None)


class StartWorkForm(forms.Form):
    """Form for starting work on a maintenance request"""

    expert_notes = forms.CharField(
        widget=forms.Textarea(attrs={
            'class': 'form-control',
            'rows': 3,
            'placeholder': 'Add any initial notes about the work...'
        }),
        required=False,
        help_text='Optional notes about how you plan to approach this work'
    )


class CompleteWorkForm(forms.Form):
    """Form for completing maintenance work"""

    completion_notes = forms.CharField(
        widget=forms.Textarea(attrs={
            'class': 'form-control',
            'rows': 4,
            'placeholder': 'Describe the work completed, materials used, etc.'
        }),
        help_text='Describe what work was done to resolve the issue'
    )

    completion_image = forms.ImageField(
        required=True,
        widget=forms.FileInput(attrs={
            'class': 'form-control',
            'accept': 'image/*'
        }),
        help_text='Upload an image showing the completed work (required)'
    )

    def clean_completion_notes(self):
        notes = self.cleaned_data.get('completion_notes')
        if not notes or len(notes.strip()) < 10:
            raise forms.ValidationError('Completion notes must be at least 10 characters.')
        return notes.strip()

class ServiceExpertForgotPasswordForm(forms.Form):
    employee_id = forms.CharField(
        widget=forms.TextInput(attrs={
            'class': 'form-input',
            'placeholder': 'Enter your employee ID',
            'id': 'id_employee_id'
        }),
        label='Employee ID',
        help_text='Enter the employee ID associated with your service expert account'
    )

    def clean_employee_id(self):
        employee_id = self.cleaned_data.get('employee_id')
        if employee_id:
            employee_id = employee_id.strip()
            # We don't validate if employee_id exists here for security reasons
            # The actual check happens in the view
        return employee_id