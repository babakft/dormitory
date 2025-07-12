from django.urls import path
from student.views import StudentRegisterView, RegistrationSuccessView

urlpatterns = [
    path('register/', StudentRegisterView.as_view(), name='student_register'),
    path('registration-success/', RegistrationSuccessView.as_view(), name='registration_success'),
    #path('registration-status/', views.RegistrationStatusView.as_view(), name='registration_status'),
    #path('dashboard/', views.StudentDashboardView.as_view(), name='student_dashboard'),
]