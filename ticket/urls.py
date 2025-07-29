# ticket/urls.py (Add admin URLs)
from django.urls import path
from ticket.views import (
    TicketCreateView, TicketListView, ticket_detail,
    admin_chat_list, admin_chat_interface  # ADD THESE
)

app_name = 'ticket'

urlpatterns = [
    path('create/', TicketCreateView.as_view(), name='create'),
    path('', TicketListView.as_view(), name='list'),
    path('<int:pk>/', ticket_detail, name='detail'),

    # Admin chat URLs
    path('admin-chat/', admin_chat_list, name='admin_chat_list'),  # ADD THIS
    path('admin-chat/<int:ticket_id>/', admin_chat_interface, name='admin_chat_interface'),  # ADD THIS
]