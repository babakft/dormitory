# dormitory/asgi.py (Fixed version)
import os
import django
from django.core.asgi import get_asgi_application

# Set Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dormitory.settings')

# Setup Django before importing anything else
django.setup()

# Now import Django Channels after Django is setup
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack

# Get the Django ASGI application
django_asgi_app = get_asgi_application()

# Import routing after Django setup
import ticket.routing

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AuthMiddlewareStack(
        URLRouter(
            ticket.routing.websocket_urlpatterns
        )
    ),
})