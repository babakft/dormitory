from django.urls import path
from student.views import StudentRegisterView, RegistrationSuccessView, StudentLoginView, StudentLogoutView, \
    StudentDashboardView, EmailVerificationSentView

app_name = 'student'

urlpatterns = [
    path('register/', StudentRegisterView.as_view(), name='student_register'),
    path('login/', StudentLoginView.as_view(), name='student_login'),
    path('logout/', StudentLogoutView.as_view(), name='student_logout'),
    path('dashboard/', StudentDashboardView.as_view(), name='student_dashboard'),
    path('email-verification-sent/', EmailVerificationSentView.as_view(), name='email_verification_sent'),
    path('verify-email/<uuid:token>/', RegistrationSuccessView.as_view(), name='verify_email'),
]
