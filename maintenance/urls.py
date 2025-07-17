from django.urls import path
from maintenance.views import MaintenanceRequestCreateView,maintenance_request_detail

app_name = 'maintenance'

urlpatterns = [
    path('create/', MaintenanceRequestCreateView.as_view(), name='create'),
    path('<int:pk>/', maintenance_request_detail, name='detail'),
]