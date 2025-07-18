from django.urls import path
from service.views import (
    ServiceExpertLoginView, ServiceExpertLogoutView, ServiceDashboardView,
    claim_request, start_work,complete_work
)

urlpatterns = [
    path('login/', ServiceExpertLoginView.as_view(), name='service_login'),
    path('logout/', ServiceExpertLogoutView.as_view(), name='service_logout'),
    path('dashboard/', ServiceDashboardView.as_view(), name='service_dashboard'),
    path('claim/<int:request_id>/', claim_request, name='claim_request'),
    path('start/<int:request_id>/', start_work, name='start_work'),
    path('complete/<int:request_id>/', complete_work, name='complete_work'),
]