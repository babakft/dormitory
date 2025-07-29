# ticket/urls.py - Complete with Image Upload URL
from django.urls import path
from ticket.views import (
    TicketCreateView, TicketListView, ticket_detail,
    admin_chat_list, admin_chat_interface, upload_chat_image,
    close_ticket
)

app_name = 'ticket'

urlpatterns = [
    path('create/', TicketCreateView.as_view(), name='create'),
    path('', TicketListView.as_view(), name='list'),
    path('<int:pk>/', ticket_detail, name='detail'),

    # Image upload endpoint
    path('upload-image/<int:ticket_id>/', upload_chat_image, name='upload_chat_image'),

    # Admin chat URLs
    path('admin-chat/', admin_chat_list, name='admin_chat_list'),
    path('admin-chat/<int:ticket_id>/', admin_chat_interface, name='admin_chat_interface'),
    path('admin-chat/<int:ticket_id>/close/', close_ticket, name='admin_close_ticket'),
]
