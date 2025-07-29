from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from django.conf import settings

urlpatterns = [
    path('admin/', admin.site.urls),
    path('student/', include('student.urls')),
    path('maintenance/', include('maintenance.urls')),
    path('service/', include('service.urls')),
    path('ticket/', include('ticket.urls')),
    # Add direct admin access
    path('admin-chat/', include('ticket.urls')),  # Add this line
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
