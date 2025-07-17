from django import forms
from django.core.exceptions import ValidationError
from maintenance.models import MaintenanceRequest, MaintenanceImage
from student.models import Room


class MaintenanceRequestForm(forms.ModelForm):
    """Form for creating maintenance requests with location selection"""

    # Add room as a field that can be changed
    room = forms.ModelChoiceField(
        queryset=Room.objects.select_related('building').all().order_by('building__name', 'floor', 'number'),
        empty_label="Select location for the issue",
        widget=forms.Select(attrs={
            'class': 'form-control'
        }),
        help_text='Select where the maintenance issue is located (can be different from your assigned room)'
    )

    # Add image field that's not part of the model
    issue_image = forms.ImageField(
        required=True,
        widget=forms.FileInput(attrs={
            'class': 'form-control',
            'accept': 'image/*'
        }),
        help_text='Please upload an image showing the maintenance issue (required)'
    )

    class Meta:
        model = MaintenanceRequest
        fields = ['title', 'description', 'service_type', 'room']
        widgets = {
            'title': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Brief description of the issue',
                'maxlength': 200
            }),
            'description': forms.Textarea(attrs={
                'class': 'form-control',
                'placeholder': 'Provide detailed description of the maintenance issue...',
                'rows': 4
            }),
            'service_type': forms.Select(attrs={
                'class': 'form-control'
            })
        }

    def __init__(self, *args, **kwargs):
        # Get the student from kwargs if provided
        self.student = kwargs.pop('student', None)
        super().__init__(*args, **kwargs)

        # Add help text for fields
        self.fields['title'].help_text = 'Enter a brief, clear title for your maintenance request'
        self.fields[
            'description'].help_text = 'Provide detailed information about the problem, including specific location within the room/area'
        self.fields['service_type'].help_text = 'Select the type of service needed for this issue'

        # Set initial room to student's room if available
        if self.student and self.student.room and not self.instance.pk:
            self.fields['room'].initial = self.student.room

        # Customize room field choices to show more detailed information
        self.fields['room'].queryset = Room.objects.select_related('building').all().order_by(
            'building__name', 'floor', 'number'
        )

        # Custom label method for room choices
        self.fields['room'].label_from_instance = self._room_label

    def _room_label(self, room):
        """Custom label for room choices showing building, floor, and room number"""
        return f"{room.building.name} - Floor {room.floor} - Room {room.number}"

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

    def clean_room(self):
        room = self.cleaned_data.get('room')
        if not room:
            raise ValidationError('Please select a location for the maintenance issue.')
        return room

    def clean_issue_image(self):
        image = self.cleaned_data.get('issue_image')
        if not image:
            raise ValidationError('An image showing the maintenance issue is required.')

        # Validate file size (max 5MB)
        if image.size > 5 * 1024 * 1024:
            raise ValidationError('Image file size cannot exceed 5MB.')

        # Validate file type
        if not image.content_type.startswith('image/'):
            raise ValidationError('Only image files are allowed.')

        return image

    def save(self, commit=True):
        """Save the maintenance request and create associated image"""
        instance = super().save(commit=commit)

        if commit and self.cleaned_data.get('issue_image'):
            # Create the MaintenanceImage for the issue
            MaintenanceImage.objects.create(
                maintenance_request=instance,
                image=self.cleaned_data['issue_image'],
                image_type='issue'
            )

        return instance