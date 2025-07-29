# ticket/forms.py
from django import forms
from django.core.exceptions import ValidationError
from ticket.models import Ticket


class TicketForm(forms.ModelForm):
    """Simple form for creating tickets - real-time chat handles communication"""

    class Meta:
        model = Ticket
        fields = ['title', 'description']
        widgets = {
            'title': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Brief description of your issue',
                'maxlength': 200
            }),
            'description': forms.Textarea(attrs={
                'class': 'form-control',
                'placeholder': 'Describe your issue in detail...',
                'rows': 4
            })
        }

    def clean_title(self):
        title = self.cleaned_data.get('title')
        if not title or len(title.strip()) < 5:
            raise ValidationError('Title must be at least 5 characters.')
        return title.strip()

    def clean_description(self):
        description = self.cleaned_data.get('description')
        if not description or len(description.strip()) < 10:
            raise ValidationError('Description must be at least 10 characters.')
        return description.strip()

    def save(self, commit=True):
        instance = super().save(commit=False)
        if commit:
            instance.save()
        return instance