# ticket/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from ticket.models import Ticket, TicketMessage

User = get_user_model()


class TicketChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.ticket_id = self.scope['url_route']['kwargs']['ticket_id']
        self.room_group_name = f'ticket_{self.ticket_id}'
        self.user = self.scope["user"]

        if not self.user.is_authenticated:
            await self.close()
            return

        if not await self.has_permission():
            await self.close()
            return

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()
        await self.send_message_history()

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_type = data.get('type')

            if message_type == 'chat_message':
                await self.handle_chat_message(data)

        except Exception as e:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': str(e)
            }))

    async def handle_chat_message(self, data):
        message_content = data.get('message', '').strip()

        if not message_content:
            return

        # Save message to database
        message = await self.save_message(message_content)

        # Broadcast to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': {
                    'id': message.id,
                    'content': message.content,
                    'author': message.author.username,
                    'is_admin_message': message.is_admin_message,
                    'created_at': message.created_at.isoformat(),
                    'author_type': 'admin' if message.is_admin_message else 'user'
                }
            }
        )

        # Send notification to admin if user message
        if not message.is_admin_message:
            await self.notify_admins(message)  # ADD THIS LINE

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'message',
            'message': event['message']
        }))

    async def notify_admins(self, message):  # ADD THIS METHOD
        """Send notification to all connected admin users"""
        await self.channel_layer.group_send(
            'admin_notifications',
            {
                'type': 'admin_notification',
                'data': {
                    'ticket_id': self.ticket_id,
                    'message': message.content[:50] + '...' if len(message.content) > 50 else message.content,
                    'author': message.author.username,
                    'timestamp': message.created_at.isoformat()
                }
            }
        )

    @database_sync_to_async
    def has_permission(self):
        try:
            ticket = Ticket.objects.get(id=self.ticket_id)
            return (self.user.is_staff or ticket.created_by == self.user)
        except Ticket.DoesNotExist:
            return False

    @database_sync_to_async
    def save_message(self, content):
        ticket = Ticket.objects.get(id=self.ticket_id)
        message = TicketMessage.objects.create(
            ticket=ticket,
            author=self.user,
            content=content
        )
        return message

    @database_sync_to_async
    def get_message_history(self):
        try:
            ticket = Ticket.objects.get(id=self.ticket_id)
            messages = ticket.messages.select_related('author').order_by('created_at')
            return [
                {
                    'id': msg.id,
                    'content': msg.content,
                    'author': msg.author.username,
                    'is_admin_message': msg.is_admin_message,
                    'created_at': msg.created_at.isoformat(),
                    'author_type': 'admin' if msg.is_admin_message else 'user'
                }
                for msg in messages
            ]
        except Ticket.DoesNotExist:
            return []

    async def send_message_history(self):
        messages = await self.get_message_history()
        await self.send(text_data=json.dumps({
            'type': 'message_history',
            'messages': messages
        }))


# ADD THIS SECOND CONSUMER CLASS TOO:
class AdminNotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]

        if not self.user.is_staff:
            await self.close()
            return

        await self.channel_layer.group_add(
            'admin_notifications',
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            'admin_notifications',
            self.channel_name
        )

    async def admin_notification(self, event):
        await self.send(text_data=json.dumps({
            'type': 'notification',
            'data': event['data']
        }))