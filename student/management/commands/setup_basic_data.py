# management/commands/setup_basic_data.py
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from student.models import Student, Building, Room
from service.models import ServiceExpert

User = get_user_model()


class Command(BaseCommand):
    help = 'Setup basic data structure for dormitory management system'

    def handle(self, *args, **options):
        self.stdout.write('Setting up basic data structure...')

        # Skip admin user creation (already exists)
        # Skip building creation (already exists)

        # Create essential service experts
        self.create_basic_experts()

        # Create test users
        self.create_test_users()

        self.stdout.write(
            self.style.SUCCESS('Basic data structure created successfully!')
        )
        self.stdout.write('Login credentials:')
        self.stdout.write('  Student: john.doe / student123')
        self.stdout.write('  Expert: mike.tech / expert123')

    def create_admin(self):
        """Create admin user"""
        if not User.objects.filter(username='admin').exists():
            User.objects.create_user(
                username='admin',
                email='admin@dormitory.edu',
                password='admin123',
                is_staff=True,
                is_superuser=True
            )
            self.stdout.write('✓ Admin user created')

    def create_basic_infrastructure(self):
        """Create basic buildings and rooms"""
        if not Building.objects.exists():
            # Create main building
            building = Building.objects.create(
                name="Main Building",
                total_floors=4
            )

            # Create rooms
            room_count = 0
            for floor in range(1, 5):  # 4 floors
                for room_num in range(1, 11):  # 10 rooms per floor
                    Room.objects.create(
                        number=floor * 100 + room_num,
                        building=building,
                        floor=floor,
                        capacity=4  # 4-person rooms
                    )
                    room_count += 1

            self.stdout.write(f'✓ Created building with {room_count} rooms')

    def create_basic_experts(self):
        """Create essential service experts"""
        expert_data = [
            {
                'username': 'mike.tech',
                'email': 'mike@maintenance.edu',
                'employee_id': 'EMP001',
                'specialization': 'electrical'
            },
            {
                'username': 'bob.plumber',
                'email': 'bob@maintenance.edu',
                'employee_id': 'EMP002',
                'specialization': 'plumbing'
            },
            {
                'username': 'dave.hvac',
                'email': 'dave@maintenance.edu',
                'employee_id': 'EMP003',
                'specialization': 'hvac'
            },
            {
                'username': 'steve.carpenter',
                'email': 'steve@maintenance.edu',
                'employee_id': 'EMP004',
                'specialization': 'carpentry'
            },
            {
                'username': 'frank.general',
                'email': 'frank@maintenance.edu',
                'employee_id': 'EMP005',
                'specialization': 'general'
            }
        ]

        for expert_info in expert_data:
            if not User.objects.filter(username=expert_info['username']).exists():
                user = User.objects.create_user(
                    username=expert_info['username'],
                    email=expert_info['email'],
                    password='expert123',
                    user_type='expert',
                    is_active=True
                )

                ServiceExpert.objects.create(
                    user=user,
                    employee_id=expert_info['employee_id'],
                    specialization=expert_info['specialization'],
                    is_active=True
                )

        self.stdout.write('✓ Created 5 service experts')

    def create_test_users(self):
        """Create test student users"""
        # Create approved student
        if not User.objects.filter(username='john.doe').exists():
            user = User.objects.create_user(
                username='john.doe',
                email='john@student.edu',
                password='student123',
                phone='09123456789',
                user_type='student',
                is_active=True
            )

            room = Room.objects.first()
            Student.objects.create(
                user=user,
                student_number=140100001,
                room=room,
                registration_status='approved',
                processed_by_name='admin'
            )

            self.stdout.write('✓ Created approved student: john.doe')

        # Create pending student
        if not User.objects.filter(username='jane.smith').exists():
            user = User.objects.create_user(
                username='jane.smith',
                email='jane@student.edu',
                password='student123',
                phone='09123456788',
                user_type='student',
                is_active=True
            )

            Student.objects.create(
                user=user,
                student_number=140100002,
                registration_status='pending'
            )

            self.stdout.write('✓ Created pending student: jane.smith')