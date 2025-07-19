from django.urls import path
from maintenance.views import MaintenanceRequestCreateView, maintenance_request_detail, rate_maintenance_request

app_name = 'maintenance'

urlpatterns = [
    path('create/', MaintenanceRequestCreateView.as_view(), name='create'),
    path('<int:pk>/', maintenance_request_detail, name='detail'),
    path('<int:pk>/rate/', rate_maintenance_request, name='rate'),
]