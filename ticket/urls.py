from django.urls import path
from ticket.views import (
    TicketCreateView,
    TicketListView,
    ticket_detail,
    ticket_reply
)

app_name = 'ticket'

urlpatterns = [
    path('create/', TicketCreateView.as_view(), name='create'),
    path('', TicketListView.as_view(), name='list'),  # My tickets list
    path('<int:pk>/', ticket_detail, name='detail'),
    path('<int:pk>/reply/', ticket_reply, name='reply'),
]