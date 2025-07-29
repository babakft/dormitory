# ticket/consumers.py - Complete with Close Ticket Prevention
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

        # Allow both ticket creator and admin staff
        if not await self.has_permission():
            await self.close()
            return

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

        # Send message history immediately after connection
        await self.send_message_history()

        # Mark messages as read if admin connects
        if self.user.is_staff:
            await self.mark_messages_as_read()

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
                'message': f'Error processing message: {str(e)}'
            }))

    async def handle_chat_message(self, data):
        message_content = data.get('message', '').strip()

        if not message_content:
            return

        # Check if ticket is closed - prevent any new messages
        if not await self.can_send_message():
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'This ticket is closed. No messages can be sent.'
            }))
            return

        # Save message to database
        message = await self.save_message(message_content)

        # Update ticket status based on who sent the message (only if not closed)
        await self.update_ticket_status(message)

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
                    'author_type': 'admin' if message.is_admin_message else 'user',
                    'has_image': message.has_image,
                    'image_url': message.image_url,
                }
            }
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'message',
            'message': event['message']
        }))

    async def ticket_closed(self, event):
        """Handle ticket closure broadcast"""
        await self.send(text_data=json.dumps({
            'type': 'ticket_closed',
            'message': event['message']
        }))

    @database_sync_to_async
    def has_permission(self):
        """Check if user can access this ticket"""
        try:
            ticket = Ticket.objects.get(id=self.ticket_id)
            # Allow ticket creator OR admin staff
            return (self.user.is_staff or ticket.created_by == self.user)
        except Ticket.DoesNotExist:
            return False

    @database_sync_to_async
    def can_send_message(self):
        """Check if user can send message to this ticket"""
        try:
            ticket = Ticket.objects.get(id=self.ticket_id)
            return ticket.can_send_messages()
        except Ticket.DoesNotExist:
            return False

    @database_sync_to_async
    def save_message(self, content):
        """Save text message (images handled separately via HTTP)"""
        ticket = Ticket.objects.get(id=self.ticket_id)
        message = TicketMessage.objects.create(
            ticket=ticket,
            author=self.user,
            content=content
        )
        return message

    @database_sync_to_async
    def update_ticket_status(self, message):
        """Update ticket status based on who sent the message"""
        ticket = Ticket.objects.get(id=self.ticket_id)

        # Don't change status if ticket is closed
        if ticket.status == 'closed':
            return

        if message.is_admin_message:
            # Admin replied - mark as answered
            if ticket.status == 'pending':
                ticket.status = 'answered'
                ticket.save(update_fields=['status', 'updated_at'])
        else:
            # User replied - mark as pending if it was answered
            if ticket.status == 'answered':
                ticket.status = 'pending'
                ticket.save(update_fields=['status', 'updated_at'])

    @database_sync_to_async
    def get_message_history(self):
        """Get all messages with image support"""
        try:
            ticket = Ticket.objects.get(id=self.ticket_id)
            messages = ticket.messages.select_related('author').order_by('created_at')
            return [msg.to_dict() for msg in messages]
        except Ticket.DoesNotExist:
            return []

    async def send_message_history(self):
        """Send complete message history to newly connected client"""
        messages = await self.get_message_history()
        await self.send(text_data=json.dumps({
            'type': 'message_history',
            'messages': messages
        }))

    @database_sync_to_async
    def mark_messages_as_read(self):
        """Mark all user messages as read when admin connects"""
        try:
            ticket = Ticket.objects.get(id=self.ticket_id)
            # Mark all unread user messages as read
            updated_count = ticket.messages.filter(
                is_admin_message=False,
                read_by_admin=False
            ).update(read_by_admin=True)

            print(f"Admin connected to ticket #{self.ticket_id}: Marked {updated_count} messages as read")

        except Ticket.DoesNotExist:
            pass


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