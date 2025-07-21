import secrets
import string


class PasswordGenerator:
    @staticmethod
    def generate_secure_password(length=8):
        """
        Generate a cryptographically secure random password

        Args:
            length (int): Length of the password to generate

        Returns:
            str: A secure random password
        """
        characters = string.ascii_letters + string.digits
        return ''.join(secrets.choice(characters) for _ in range(length))
