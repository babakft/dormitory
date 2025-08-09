# notification/urls.py
from django.urls import path
from . import views

app_name = 'notification'

urlpatterns = [
    path('badge/', views.notification_badge, name='badge'),
    path('dropdown/', views.notification_dropdown, name='dropdown'),  # You already have this
    path('mark-viewed/<str:activity_type>/', views.mark_as_viewed, name='mark_viewed'),
]