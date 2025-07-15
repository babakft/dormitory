from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model
from student.models import Student

User = get_user_model()


class StudentNumberBackend(ModelBackend):
    """
    Custom authentication backend to allow login with student number
    """

    def authenticate(self, request, username=None, password=None, **kwargs):
        if username is None or password is None:
            return None

        # Check if username is a 9-digit student number
        try:
            # Clean the username (remove spaces, etc.)
            clean_username = str(username).replace(' ', '').replace('-', '')

            # Check if it's exactly 9 digits
            if len(clean_username) == 9 and clean_username.isdigit():
                student_number = int(clean_username)

                try:
                    # Try to find student by student_number
                    student = Student.objects.select_related('user').get(student_number=student_number)
                    user = student.user

                    # Check password
                    if user.check_password(password):
                        # Additional validations
                        if user.user_type == 'student' and student.registration_status == 'approved':
                            return user
                except Student.DoesNotExist:
                    pass
        except (ValueError, TypeError):
            # If conversion fails, it's not a valid student number
            pass

        return None

    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None