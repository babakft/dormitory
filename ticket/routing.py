from django.urls import path
from ticket import consumers

websocket_urlpatterns = [
    path('ws/ticket/<int:ticket_id>/', consumers.TicketChatConsumer.as_asgi()),
    path('ws/admin-notifications/', consumers.AdminNotificationConsumer.as_asgi()),  # ADD THIS
]