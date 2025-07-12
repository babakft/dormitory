from django.urls import path
from student.views import StudentRegisterView, RegistrationSuccessView,StudentLoginView,StudentLogoutView,StudentDashboardView

urlpatterns = [
    path('register/', StudentRegisterView.as_view(), name='student_register'),
    path('login/', StudentLoginView.as_view(), name='student_login'),  # ← Missing
    path('logout/', StudentLogoutView.as_view(), name='student_logout'),  # ← Missing
    path('dashboard/', StudentDashboardView.as_view(), name='student_dashboard'),  # ← Missing
    path('registration-success/', RegistrationSuccessView.as_view(), name='registration_success'),
]