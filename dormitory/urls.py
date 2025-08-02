# dormitory/urls.py
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from .views import HomeView

urlpatterns = [
                  # Home page
                  path('', HomeView.as_view(), name='home'),

                  # Admin and notifications
                  path('admin/notifications/', include('notification.urls')),
                  path('admin/', admin.site.urls),

                  # App URLs
                  path('student/', include('student.urls')),
                  path('maintenance/', include('maintenance.urls')),
                  path('service/', include('service.urls')),
                  path('ticket/', include('ticket.urls')),

              ] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)