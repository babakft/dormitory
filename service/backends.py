# service/backends.py
from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model
from service.models import ServiceExpert

User = get_user_model()

class ServiceExpertEmployeeIdBackend(ModelBackend):
    """
    Custom authentication backend to allow login with employee ID
    """

    def authenticate(self, request, username=None, password=None, **kwargs):
        if username is None or password is None:
            return None

        # Check if username is an employee ID format
        try:
            # Clean the username (remove spaces, etc.)
            clean_username = str(username).replace(' ', '').replace('-', '')

            # Try to find service expert by employee_id
            try:
                expert = ServiceExpert.objects.select_related('user').get(
                    employee_id=clean_username,
                    is_active=True
                )
                user = expert.user

                # Check password
                if user.check_password(password):
                    # Additional validations
                    if (user.user_type == 'expert' and
                        user.is_active and
                        expert.is_active):
                        return user
            except ServiceExpert.DoesNotExist:
                pass
        except (ValueError, TypeError):
            # If conversion fails, it's not a valid employee ID
            pass

        return None

    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None