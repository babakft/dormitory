# management/commands/create_test_scenarios.py
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.contrib.auth import get_user_model
from student.models import Student, Building, Room
from service.models import ServiceExpert
from maintenance.models import MaintenanceRequest
from ticket.models import Ticket, TicketMessage
from datetime import timedelta
import random

User = get_user_model()


class Command(BaseCommand):
    help = 'Create specific test scenarios for different user types and admin testing'

    def add_arguments(self, parser):
        parser.add_argument(
            '--scenario',
            type=str,
            choices=['admin_demo', 'student_demo', 'expert_demo', 'notification_test', 'all'],
            default='all',
            help='Type of test scenario to create'
        )

    def handle(self, *args, **options):
        scenario = options['scenario']

        if scenario in ['all', 'admin_demo']:
            self.create_admin_demo_data()

        if scenario in ['all', 'student_demo']:
            self.create_student_demo_data()

        if scenario in ['all', 'expert_demo']:
            self.create_expert_demo_data()

        if scenario in ['all', 'notification_test']:
            self.create_notification_test_data()

        self.stdout.write(
            self.style.SUCCESS(f'Created {scenario} test scenarios successfully!')
        )

    def create_admin_demo_data(self):
        """Create demo data specifically for admin panel testing"""
        self.stdout.write('Creating admin demo data...')

        # Ensure we have buildings and rooms
        if not Building.objects.exists():
            building = Building.objects.create(
                name="Demo Building",
                total_floors=5
            )

            for floor in range(1, 6):
                for room_num in range(1, 11):
                    Room.objects.create(
                        number=floor * 100 + room_num,
                        building=building,
                        floor=floor,
                        capacity=random.choice([2, 4])
                    )

        # Create students with different statuses for admin review
        demo_students_data = [
            {
                'username': 'pending.student1',
                'email': 'pending1@student.demo',
                'student_number': 140100001,
                'status': 'pending',
                'days_ago': 1
            },
            {
                'username': 'pending.student2',
                'email': 'pending2@student.demo',
                'student_number': 140100002,
                'status': 'pending',
                'days_ago': 3
            },
            {
                'username': 'approved.student',
                'email': 'approved@student.demo',
                'student_number': 140100003,
                'status': 'approved',
                'days_ago': 7
            },
            {
                'username': 'rejected.student',
                'email': 'rejected@student.demo',
                'student_number': 140100004,
                'status': 'rejected',
                'days_ago': 10
            }
        ]

        for student_data in demo_students_data:
            if not User.objects.filter(username=student_data['username']).exists():
                user = User.objects.create_user(
                    username=student_data['username'],
                    email=student_data['email'],
                    password='demo123',
                    user_type='student',
                    is_active=True
                )

                Student.objects.create(
                    user=user,
                    student_number=student_data['student_number'],
                    room=random.choice(available_rooms),
                    registration_status=student_data['status'],
                    processed_by_name='admin' if student_data['status'] != 'pending' else None,
                    processed_at=timezone.now() - timedelta(days=student_data['days_ago']) if student_data[
                                                                                                  'status'] != 'pending' else None,
                    rejection_reason='Documentation incomplete' if student_data['status'] == 'rejected' else '',
                    created_at=timezone.now() - timedelta(days=student_data['days_ago'])
                )

        # Create maintenance requests for admin testing
        if Student.objects.filter(registration_status='approved').exists():
            approved_student = Student.objects.filter(registration_status='approved').first()

            # Recent pending requests
            for i in range(3):
                MaintenanceRequest.objects.create(
                    student=approved_student,
                    title=f"Demo Maintenance Request {i + 1}",
                    description=f"This is a demo maintenance request for admin testing purposes - Request {i + 1}",
                    service_type=random.choice(['electrical', 'plumbing', 'general']),
                    priority='not_decided',
                    room=approved_student.room or Room.objects.first(),
                    status='pending',
                    created_at=timezone.now() - timedelta(hours=random.randint(1, 24))
                )

        self.stdout.write('✓ Admin demo data created')

    def create_student_demo_data(self):
        """Create demo data for student dashboard testing"""
        self.stdout.write('Creating student demo data...')

        # Check if rooms exist
        available_rooms = list(Room.objects.all())
        if not available_rooms:
            self.stdout.write(self.style.ERROR('No rooms found! Please create buildings and rooms first.'))
            return

        # Create demo student with full workflow examples
        if not User.objects.filter(username='demo.student').exists():
            user = User.objects.create_user(
                username='demo.student',
                email='demo@student.test',
                password='demo123',
                user_type='student',
                is_active=True
            )

            room = available_rooms[0]
            student = Student.objects.create(
                user=user,
                student_number=140200001,
                room=room,
                registration_status='approved',
                processed_by_name='admin',
                processed_at=timezone.now() - timedelta(days=5)
            )

            # Create maintenance requests in different stages
            request_scenarios = [
                {
                    'title': 'Light Bulb Replacement',
                    'description': 'The ceiling light bulb in my room needs replacement.',
                    'service_type': 'electrical',
                    'status': 'pending',
                    'days_ago': 1
                },
                {
                    'title': 'Faucet Repair',
                    'description': 'The bathroom faucet is dripping constantly.',
                    'service_type': 'plumbing',
                    'status': 'approved',
                    'days_ago': 3
                },
                {
                    'title': 'Heater Maintenance',
                    'description': 'Room heater is making unusual noises.',
                    'service_type': 'hvac',
                    'status': 'in_progress',
                    'days_ago': 5
                },
                {
                    'title': 'Door Lock Fixed',
                    'description': 'Door lock was sticking and difficult to turn.',
                    'service_type': 'carpentry',
                    'status': 'completed',
                    'days_ago': 10,
                    'rating': 5,
                    'feedback': 'Excellent work! Very professional and quick service.'
                }
            ]

            for scenario in request_scenarios:
                created_date = timezone.now() - timedelta(days=scenario['days_ago'])

                request = MaintenanceRequest.objects.create(
                    student=student,
                    title=scenario['title'],
                    description=scenario['description'],
                    service_type=scenario['service_type'],
                    priority='medium',
                    room=student.room,
                    status=scenario['status'],
                    created_at=created_date,
                    updated_at=created_date
                )

                # Set up workflow progression based on status
                if scenario['status'] != 'pending':
                    request.approved_by_name = 'admin'
                    request.approved_at = created_date + timedelta(hours=2)

                if scenario['status'] in ['in_progress', 'completed']:
                    # Assign expert
                    expert = ServiceExpert.objects.filter(
                        specialization=scenario['service_type']
                    ).first() or ServiceExpert.objects.first()

                    if expert:
                        request.assigned_expert = expert
                        request.assigned_at = request.approved_at + timedelta(hours=4)
                        request.work_started_at = request.assigned_at + timedelta(hours=2)
                        request.expert_notes = f"Working on {scenario['title'].lower()}"

                if scenario['status'] == 'completed':
                    request.completed_at = request.work_started_at + timedelta(hours=6)
                    request.completion_notes = f"Successfully completed {scenario['title'].lower()}"

                    if 'rating' in scenario:
                        request.student_rating = scenario['rating']
                        request.student_feedback = scenario['feedback']
                        request.feedback_at = request.completed_at + timedelta(hours=12)

                request.save()

        self.stdout.write('✓ Student demo data created')

    def create_expert_demo_data(self):
        """Create demo data for service expert dashboard testing"""
        self.stdout.write('Creating expert demo data...')

        # Check if rooms exist
        available_rooms = list(Room.objects.all())
        if not available_rooms:
            self.stdout.write(self.style.ERROR('No rooms found! Please create buildings and rooms first.'))
            return

        # Create demo expert
        if not User.objects.filter(username='demo.expert').exists():
            user = User.objects.create_user(
                username='demo.expert',
                email='demo@expert.test',
                password='demo123',
                user_type='expert',
                is_active=True
            )

            expert = ServiceExpert.objects.create(
                user=user,
                employee_id='DEMO001',
                specialization='electrical',
                is_active=True
            )

            # Create approved student for requests
            demo_student = Student.objects.filter(registration_status='approved').first()
            if not demo_student:
                student_user = User.objects.create_user(
                    username='student.for.expert',
                    email='student@expert.demo',
                    password='demo123',
                    user_type='student',
                    is_active=True
                )
                demo_student = Student.objects.create(
                    user=student_user,
                    student_number=140300001,
                    room=available_rooms[0],
                    registration_status='approved'
                )

            # Create available requests for claiming
            available_requests = [
                {
                    'title': 'Replace Broken Light Switch',
                    'description': 'Light switch in common room is broken and needs replacement.',
                    'service_type': 'electrical',
                    'priority': 'medium'
                },
                {
                    'title': 'Fix Flickering Lights',
                    'description': 'Corridor lights are flickering intermittently.',
                    'service_type': 'electrical',
                    'priority': 'low'
                }
            ]

            for req_data in available_requests:
                MaintenanceRequest.objects.create(
                    student=demo_student,
                    title=req_data['title'],
                    description=req_data['description'],
                    service_type=req_data['service_type'],
                    priority=req_data['priority'],
                    room=demo_student.room,
                    status='approved',
                    approved_by_name='admin',
                    approved_at=timezone.now() - timedelta(hours=random.randint(1, 12)),
                    created_at=timezone.now() - timedelta(hours=random.randint(12, 48))
                )

            # Create assigned request for expert
            assigned_request = MaintenanceRequest.objects.create(
                student=demo_student,
                title='Repair Electrical Outlet',
                description='Electrical outlet in room 301 is not working.',
                service_type='electrical',
                priority='high',
                room=demo_student.room,
                status='approved',
                approved_by_name='admin',
                approved_at=timezone.now() - timedelta(hours=6),
                assigned_expert=expert,
                assigned_at=timezone.now() - timedelta(hours=2),
                created_at=timezone.now() - timedelta(hours=24)
            )

            # Create completed request with rating
            completed_request = MaintenanceRequest.objects.create(
                student=demo_student,
                title='Fixed Ceiling Fan',
                description='Ceiling fan was making noise and wobbling.',
                service_type='electrical',
                priority='medium',
                room=demo_student.room,
                status='completed',
                approved_by_name='admin',
                approved_at=timezone.now() - timedelta(days=3),
                assigned_expert=expert,
                assigned_at=timezone.now() - timedelta(days=3) + timedelta(hours=2),
                work_started_at=timezone.now() - timedelta(days=2),
                expert_notes='Balanced fan blades and tightened mounting screws',
                completed_at=timezone.now() - timedelta(days=1),
                completion_notes='Fan is now operating smoothly and quietly',
                student_rating=5,
                student_feedback='Great work! Expert was very professional and efficient.',
                feedback_at=timezone.now() - timedelta(hours=12),
                created_at=timezone.now() - timedelta(days=4)
            )

            # Update expert rating
            expert.update_average_rating()

        self.stdout.write('✓ Expert demo data created')

    def create_notification_test_data(self):
        """Create data specifically for testing notification system"""
        self.stdout.write('Creating notification test data...')

        # Check if rooms exist
        available_rooms = list(Room.objects.all())
        if not available_rooms:
            self.stdout.write(self.style.ERROR('No rooms found! Please create buildings and rooms first.'))
            return

        # Create fresh pending students (for new registrations notification)
        for i in range(3):
            user = User.objects.create_user(
                username=f'new.student{i}',
                email=f'new{i}@notification.test',
                password='test123',
                user_type='student',
                is_active=True
            )

            Student.objects.create(
                user=user,
                student_number=140400000 + i,
                room=random.choice(available_rooms),
                registration_status='pending',
                created_at=timezone.now() - timedelta(minutes=random.randint(10, 60))
            )

        # Create new maintenance requests (for new requests notification)
        approved_students = Student.objects.filter(registration_status='approved')
        if approved_students.exists():
            for i in range(3):
                MaintenanceRequest.objects.create(
                    student=approved_students.first(),
                    title=f'New Test Request {i + 1}',
                    description=f'This is a new maintenance request for notification testing - {i + 1}',
                    service_type=random.choice(['electrical', 'plumbing', 'general']),
                    priority='not_decided',  # Students don't set priority, admin does during approval
                    room=approved_students.first().room or available_rooms[0],
                    status='pending',
                    created_at=timezone.now() - timedelta(minutes=random.randint(5, 30))
                )

        # Create new tickets (for ticket notifications)
        users_for_tickets = User.objects.filter(user_type__in=['student', 'expert'])[:3]
        ticket_titles = [
            'New Notification Test Ticket 1',
            'New Notification Test Ticket 2',
            'New Notification Test Ticket 3'
        ]

        for i, user in enumerate(users_for_tickets):
            ticket = Ticket.objects.create(
                title=ticket_titles[i],
                description=f'This is a test ticket for notification system - {i + 1}',
                created_by=user,
                status='pending',
                created_at=timezone.now() - timedelta(minutes=random.randint(1, 15))
            )

            # Add unread message
            TicketMessage.objects.create(
                ticket=ticket,
                author=user,
                content=f'This is a new unread message for testing notifications - {i + 1}',
                read_by_admin=False,
                created_at=timezone.now() - timedelta(minutes=random.randint(1, 10))
            )

        self.stdout.write('✓ Notification test data created')
        self.stdout.write('  - 3 new pending student registrations')
        self.stdout.write('  - 3 new maintenance requests')
        self.stdout.write('  - 3 new tickets with unread messages')