from django import forms
from django.core.exceptions import ValidationError
from ticket.models import Ticket, TicketMessage, TicketAttachment


class TicketForm(forms.ModelForm):
    """Form for creating new tickets"""

    # Add image field that's not part of the model
    image = forms.ImageField(
        required=False,
        widget=forms.FileInput(attrs={
            'class': 'form-control',
            'accept': 'image/*'
        }),
        help_text='Optional - attach an image if relevant to your ticket'
    )

    class Meta:
        model = Ticket
        fields = ['title', 'description']
        widgets = {
            'title': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Brief description of your issue or question',
                'maxlength': 200
            }),
            'description': forms.Textarea(attrs={
                'class': 'form-control',
                'placeholder': 'Please provide detailed information about your issue or question...',
                'rows': 5
            })
        }

    def __init__(self, *args, **kwargs):
        # Get the user from kwargs if provided
        self.user = kwargs.pop('user', None)
        super().__init__(*args, **kwargs)

        # Add help text for fields
        self.fields['title'].help_text = 'Enter a clear, brief title for your ticket'
        self.fields['description'].help_text = 'Provide detailed information about your issue, question, or concern'

    def clean_title(self):
        title = self.cleaned_data.get('title')
        if not title or len(title.strip()) < 5:
            raise ValidationError('Title must be at least 5 characters long.')
        return title.strip()

    def clean_description(self):
        description = self.cleaned_data.get('description')
        if not description or len(description.strip()) < 10:
            raise ValidationError('Description must be at least 10 characters long.')
        return description.strip()

    def clean_image(self):
        image = self.cleaned_data.get('image')
        if image:
            # Validate file size (max 5MB)
            if image.size > 5 * 1024 * 1024:
                raise ValidationError('Image file size cannot exceed 5MB.')

            # Validate file type
            if not image.content_type.startswith('image/'):
                raise ValidationError('Only image files are allowed.')

        return image

    def save(self, commit=True):
        """Save the ticket and create associated image if provided"""
        instance = super().save(commit=False)

        if self.user:
            instance.created_by = self.user

        if commit:
            instance.save()

            # Create initial message with the description
            message = TicketMessage.objects.create(
                ticket=instance,
                author=instance.created_by,
                content=instance.description
            )

            # Create attachment if image was provided
            if self.cleaned_data.get('image'):
                TicketAttachment.objects.create(
                    message=message,
                    image=self.cleaned_data['image']
                )

        return instance


class TicketReplyForm(forms.Form):
    """Form for replying to tickets - used by students, service experts, and admins"""

    content = forms.CharField(
        widget=forms.Textarea(attrs={
            'class': 'form-control',
            'rows': 4,
            'placeholder': 'Type your reply here...'
        }),
        label='Your Reply',
        help_text='Write your response or additional information'
    )

    image = forms.ImageField(
        required=False,
        widget=forms.FileInput(attrs={
            'class': 'form-control',
            'accept': 'image/*'
        }),
        label='Attach Image (Optional)',
        help_text='Attach an image if it helps explain your response'
    )

    def clean_content(self):
        content = self.cleaned_data.get('content')
        if not content or len(content.strip()) < 3:
            raise ValidationError('Reply must be at least 3 characters long.')
        return content.strip()

    def clean_image(self):
        image = self.cleaned_data.get('image')
        if image:
            # Validate file size (max 5MB)
            if image.size > 5 * 1024 * 1024:
                raise ValidationError('Image file size cannot exceed 5MB.')

            # Validate file type
            if not image.content_type.startswith('image/'):
                raise ValidationError('Only image files are allowed.')

        return image

    def save_message(self, ticket, author):
        """Save the reply as a new TicketMessage - works for both users and admins"""
        if not self.is_valid():
            raise ValueError("Form is not valid")

        # Create the message
        message = TicketMessage.objects.create(
            ticket=ticket,
            author=author,
            content=self.cleaned_data['content']
        )

        # Create attachment if image was provided
        if self.cleaned_data.get('image'):
            TicketAttachment.objects.create(
                message=message,
                image=self.cleaned_data['image']
            )

        return message
