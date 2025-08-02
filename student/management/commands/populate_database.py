# management/commands/populate_database.py
import random
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.contrib.auth import get_user_model
from student.models import Student, Building, Room
from service.models import ServiceExpert
from maintenance.models import MaintenanceRequest, MaintenanceImage
from ticket.models import Ticket, TicketMessage
from datetime import timedelta
import uuid

User = get_user_model()


class Command(BaseCommand):
    help = 'Populate database with sample data for dormitory management system'

    def add_arguments(self, parser):
        parser.add_argument(
            '--buildings',
            type=int,
            default=5,
            help='Number of buildings to create'
        )
        parser.add_argument(
            '--students',
            type=int,
            default=50,
            help='Number of students to create'
        )
        parser.add_argument(
            '--experts',
            type=int,
            default=15,
            help='Number of service experts to create'
        )
        parser.add_argument(
            '--maintenance',
            type=int,
            default=100,
            help='Number of maintenance requests to create'
        )

    def handle(self, *args, **options):
        self.stdout.write('Starting database population...')

        # Skip admin user creation (already exists)

        # Check if buildings exist, create only if needed
        buildings = list(Building.objects.all())
        if not buildings:
            buildings = self.create_buildings_and_rooms(options['buildings'])
        else:
            self.stdout.write(f'✓ Using existing {len(buildings)} buildings')

        # Create students
        students = self.create_students(options['students'], buildings)

        # Create service experts
        experts = self.create_service_experts(options['experts'])

        # Create maintenance requests
        self.create_maintenance_requests(options['maintenance'], students, experts)

        # Create tickets
        self.create_tickets(students, experts)

        self.stdout.write(
            self.style.SUCCESS('Database populated successfully!')
        )

    # Admin user creation removed - assuming it already exists

    def create_buildings_and_rooms(self, building_count):
        """Create buildings with rooms"""
        buildings = []
        building_names = [
            'North Tower', 'South Tower', 'East Wing', 'West Wing',
            'Central Block', 'Garden View', 'Mountain View', 'Lake View'
        ]

        for i in range(building_count):
            building_name = building_names[i % len(building_names)]
            if Building.objects.filter(name=building_name).exists():
                building_name = f"{building_name} {i + 1}"

            building = Building.objects.create(
                name=building_name,
                total_floors=random.randint(3, 8)
            )
            buildings.append(building)

            # Create rooms for each floor
            for floor in range(1, building.total_floors + 1):
                rooms_per_floor = random.randint(10, 20)
                for room_num in range(1, rooms_per_floor + 1):
                    actual_room_number = floor * 100 + room_num
                    Room.objects.create(
                        number=actual_room_number,
                        building=building,
                        floor=floor,
                        capacity=random.choice([1, 2, 4, 6])
                    )

            self.stdout.write(f'Created building: {building.name} with {building.rooms.count()} rooms')

        return buildings

    def create_students(self, student_count, buildings):
        """Create students with various registration statuses"""
        students = []

        # Sample student data
        first_names = [
            'Ali', 'Sara', 'Mohammad', 'Fatima', 'Hassan', 'Zahra', 'Ahmad', 'Maryam',
            'Hossein', 'Aisha', 'Reza', 'Khadija', 'Omar', 'Nour', 'Yusuf', 'Layla'
        ]
        last_names = [
            'Ahmadi', 'Hosseini', 'Rezaei', 'Moradi', 'Karimi', 'Asadi', 'Mohammadi',
            'Rahimi', 'Ghorbani', 'Mousavi', 'Kazemi', 'Sadeghi', 'Hashemi', 'Rostami'
        ]

        # Get available rooms
        available_rooms = list(Room.objects.all())

        for i in range(student_count):
            # Generate student data
            first_name = random.choice(first_names)
            last_name = random.choice(last_names)
            username = f"{first_name.lower()}.{last_name.lower()}{i}"
            email = f"{username}@student.dormitory.edu"
            student_number = 140000000 + i

            # Create user
            user = User.objects.create_user(
                username=username,
                email=email,
                password='student123',
                phone=f"0912{random.randint(1000000, 9999999)}",
                user_type='student',
                is_active=True  # Email verified
            )

            # Assign room (some students might not have rooms)
            room = None
            if available_rooms and random.choice([True, True, False]):  # 66% chance
                room = random.choice(available_rooms)

            # Create student with various statuses
            registration_status = random.choices(
                ['approved', 'pending', 'rejected'],
                weights=[70, 20, 10],  # 70% approved, 20% pending, 10% rejected
                k=1
            )[0]

            student = Student.objects.create(
                user=user,
                student_number=student_number,
                room=room,
                registration_status=registration_status,
                processed_by_name='admin' if registration_status != 'pending' else None,
                processed_at=timezone.now() - timedelta(
                    days=random.randint(1, 30)) if registration_status != 'pending' else None,
                rejection_reason='Incomplete documentation' if registration_status == 'rejected' else '',
                created_at=timezone.now() - timedelta(days=random.randint(0, 60))
            )
            students.append(student)

        self.stdout.write(f'Created {len(students)} students')
        return students

    def create_service_experts(self, expert_count):
        """Create service experts with different specializations"""
        experts = []
        specializations = [
            'electrical', 'plumbing', 'hvac', 'carpentry',
            'general', 'cleaning', 'security'
        ]

        expert_names = [
            'John Smith', 'Mike Johnson', 'David Brown', 'Robert Wilson',
            'James Davis', 'William Miller', 'Richard Garcia', 'Joseph Rodriguez',
            'Thomas Martinez', 'Christopher Lopez', 'Charles Gonzalez', 'Daniel Anderson'
        ]

        for i in range(expert_count):
            name_parts = expert_names[i % len(expert_names)].split()
            if len(expert_names) <= i:
                name_parts = [f"Expert{i}", f"User{i}"]

            first_name, last_name = name_parts[0], name_parts[1]
            username = f"{first_name.lower()}.{last_name.lower()}{i}"
            email = f"{username}@maintenance.dormitory.edu"
            employee_id = f"EMP{1000 + i}"

            # Create user
            user = User.objects.create_user(
                username=username,
                email=email,
                password='expert123',
                phone=f"0911{random.randint(1000000, 9999999)}",
                user_type='expert',
                is_active=True
            )

            # Create service expert
            expert = ServiceExpert.objects.create(
                user=user,
                employee_id=employee_id,
                specialization=random.choice(specializations),
                is_active=True
            )
            experts.append(expert)

        self.stdout.write(f'Created {len(experts)} service experts')
        return experts

    def create_maintenance_requests(self, request_count, students, experts):
        """Create maintenance requests with realistic data and reviews"""

        # Sample maintenance issues
        maintenance_issues = [
            {
                'title': 'Broken Light Fixture',
                'description': 'The ceiling light in my room is flickering and sometimes doesn\'t turn on.',
                'service_type': 'electrical'
            },
            {
                'title': 'Leaking Faucet',
                'description': 'The bathroom faucet has been dripping constantly for the past week.',
                'service_type': 'plumbing'
            },
            {
                'title': 'Air Conditioning Not Working',
                'description': 'The AC unit is making loud noises and not cooling the room properly.',
                'service_type': 'hvac'
            },
            {
                'title': 'Broken Door Handle',
                'description': 'The door handle is loose and difficult to turn.',
                'service_type': 'carpentry'
            },
            {
                'title': 'Clogged Drain',
                'description': 'The shower drain is completely blocked and water is backing up.',
                'service_type': 'plumbing'
            },
            {
                'title': 'Broken Window Lock',
                'description': 'The window lock mechanism is broken and the window won\'t stay closed.',
                'service_type': 'carpentry'
            },
            {
                'title': 'Electrical Outlet Not Working',
                'description': 'One of the electrical outlets in my room has stopped working completely.',
                'service_type': 'electrical'
            },
            {
                'title': 'Heating System Issue',
                'description': 'The room heating is not working and it\'s getting very cold.',
                'service_type': 'hvac'
            }
        ]

        # Filter approved students only
        approved_students = [s for s in students if s.registration_status == 'approved']

        if not approved_students:
            self.stdout.write('No approved students found, skipping maintenance requests')
            return

        for i in range(request_count):
            student = random.choice(approved_students)
            issue = random.choice(maintenance_issues)

            # Create maintenance request
            created_date = timezone.now() - timedelta(days=random.randint(0, 90))

            request = MaintenanceRequest.objects.create(
                student=student,
                title=issue['title'],
                description=issue['description'],
                service_type=issue['service_type'],
                priority='not_decided',  # Realistic - students don't set priority, admin does
                room=student.room or random.choice(list(Room.objects.all())),
                status='pending',
                created_at=created_date,
                updated_at=created_date
            )

            # Simulate workflow progression
            self._simulate_maintenance_workflow(request, experts)

        self.stdout.write(f'Created {request_count} maintenance requests')

    def _simulate_maintenance_workflow(self, request, experts):
        """Simulate realistic maintenance request workflow"""

        # 80% chance of approval
        if random.random() < 0.8:
            # Set priority before approval (required by system validation)
            if request.priority == 'not_decided':
                request.priority = random.choice(['low', 'medium', 'high'])

            # Approve request
            approval_date = request.created_at + timedelta(hours=random.randint(1, 48))
            request.status = 'approved'
            request.approved_by_name = 'admin'
            request.approved_at = approval_date
            request.updated_at = approval_date

            # Find suitable expert
            suitable_experts = [e for e in experts if e.specialization == request.service_type]
            if suitable_experts:
                expert = random.choice(suitable_experts)

                # 70% chance expert claims the request
                if random.random() < 0.7:
                    assignment_date = approval_date + timedelta(hours=random.randint(1, 24))
                    request.assigned_expert = expert
                    request.assigned_at = assignment_date
                    request.updated_at = assignment_date

                    # 80% chance work starts
                    if random.random() < 0.8:
                        start_date = assignment_date + timedelta(hours=random.randint(1, 48))
                        request.status = 'in_progress'
                        request.work_started_at = start_date
                        request.expert_notes = f"Starting work on {request.title.lower()}"
                        request.updated_at = start_date

                        # 90% chance work gets completed
                        if random.random() < 0.9:
                            completion_date = start_date + timedelta(hours=random.randint(2, 72))
                            request.status = 'completed'
                            request.completed_at = completion_date
                            request.completion_notes = f"Successfully repaired {request.title.lower()}. Issue resolved."
                            request.updated_at = completion_date

                            # 60% chance student provides feedback
                            if random.random() < 0.6:
                                feedback_date = completion_date + timedelta(hours=random.randint(1, 48))
                                request.student_rating = random.randint(3, 5)  # Mostly positive ratings
                                request.student_feedback = random.choice([
                                    "Great work! Fixed quickly and professionally.",
                                    "Very satisfied with the service. Thank you!",
                                    "Expert was courteous and did excellent work.",
                                    "Problem solved efficiently. Highly recommended.",
                                    "Quick response and quality repair work."
                                ])
                                request.feedback_at = feedback_date
                                request.updated_at = feedback_date

                                # Update expert's average rating
                                expert.update_average_rating()
        else:
            # Reject request (20% chance)
            rejection_date = request.created_at + timedelta(hours=random.randint(1, 72))
            request.status = 'rejected'
            request.approved_by_name = 'admin'
            request.approved_at = rejection_date
            request.rejection_reason = random.choice([
                'Duplicate request already exists',
                'Issue should be reported to building management',
                'Not a maintenance issue',
                'Insufficient information provided'
            ])
            request.updated_at = rejection_date

        request.save()

    def create_tickets(self, students, experts):
        """Create sample tickets for communication"""
        approved_students = [s for s in students if s.registration_status == 'approved']
        all_users = [s.user for s in approved_students] + [e.user for e in experts]

        ticket_topics = [
            {
                'title': 'Room Assignment Issue',
                'description': 'I need help with my room assignment. There seems to be a conflict.'
            },
            {
                'title': 'Payment Question',
                'description': 'I have questions about the dormitory fee payment process.'
            },
            {
                'title': 'Key Card Not Working',
                'description': 'My key card stopped working and I cannot access my room.'
            },
            {
                'title': 'Visitor Policy Clarification',
                'description': 'I need clarification on the visitor policy for weekends.'
            },
            {
                'title': 'Laundry Room Schedule',
                'description': 'When are the laundry room operating hours? The posted schedule is unclear.'
            }
        ]

        # Create 20-30 tickets
        for i in range(random.randint(20, 30)):
            user = random.choice(all_users)
            topic = random.choice(ticket_topics)

            created_date = timezone.now() - timedelta(days=random.randint(0, 30))

            ticket = Ticket.objects.create(
                title=topic['title'],
                description=topic['description'],
                created_by=user,
                status=random.choice(['pending', 'answered', 'closed']),
                created_at=created_date
            )

            # Add some messages to tickets
            self._add_ticket_messages(ticket, user)

        self.stdout.write(f'Created tickets with messages')

    def _add_ticket_messages(self, ticket, user):
        """Add realistic messages to tickets"""
        message_count = random.randint(1, 5)

        user_messages = [
            "Could you please help me with this issue?",
            "This is quite urgent, please respond soon.",
            "Thank you for your assistance.",
            "I'm still waiting for a response on this matter.",
            "Has there been any update on my request?"
        ]

        admin_responses = [
            "Thank you for contacting us. We're looking into this issue.",
            "We've escalated your request to the appropriate department.",
            "Your issue has been resolved. Please let us know if you need further assistance.",
            "We apologize for the delay. We'll get back to you within 24 hours.",
            "Thank you for your patience. This matter has been addressed."
        ]

        for i in range(message_count):
            is_admin = i % 2 == 1  # Alternate between user and admin messages

            message_date = ticket.created_at + timedelta(hours=i * random.randint(1, 24))

            if is_admin:
                # Create admin user if needed
                admin_user, _ = User.objects.get_or_create(
                    username='support_admin',
                    defaults={
                        'email': 'support@dormitory.edu',
                        'is_staff': True,
                        'is_superuser': True
                    }
                )

                TicketMessage.objects.create(
                    ticket=ticket,
                    author=admin_user,
                    content=random.choice(admin_responses),
                    created_at=message_date
                )
            else:
                TicketMessage.objects.create(
                    ticket=ticket,
                    author=user,
                    content=random.choice(user_messages),
                    created_at=message_date
                )