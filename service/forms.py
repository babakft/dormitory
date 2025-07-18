from django import forms
from django.contrib.auth.forms import AuthenticationForm


class ServiceExpertLoginForm(AuthenticationForm):
    """Simple login form for service experts using employee ID"""

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
