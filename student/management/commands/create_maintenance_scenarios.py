# management/commands/create_maintenance_scenarios.py
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.contrib.auth import get_user_model
from student.models import Student
from service.models import ServiceExpert
from maintenance.models import MaintenanceRequest
from datetime import timedelta
import random

User = get_user_model()


class Command(BaseCommand):
    help = 'Create specific maintenance request scenarios for testing'

    def add_arguments(self, parser):
        parser.add_argument(
            '--scenario',
            type=str,
            choices=['urgent', 'overdue', 'high_rating', 'problematic', 'all'],
            default='all',
            help='Type of scenario to create'
        )

    def handle(self, *args, **options):
        scenario = options['scenario']

        if scenario == 'all' or scenario == 'urgent':
            self.create_urgent_requests()

        if scenario == 'all' or scenario == 'overdue':
            self.create_overdue_requests()

        if scenario == 'all' or scenario == 'high_rating':
            self.create_high_rating_requests()

        if scenario == 'all' or scenario == 'problematic':
            self.create_problematic_requests()

        self.stdout.write(
            self.style.SUCCESS(f'Created {scenario} maintenance scenarios!')
        )

    def create_urgent_requests(self):
        """Create urgent maintenance requests that need immediate attention"""
        urgent_issues = [
            {
                'title': 'URGENT: No Electricity in Room',
                'description': 'Complete power outage in room. No lights, no outlets working. This is an emergency.',
                'service_type': 'electrical',
                'priority': 'high'
            },
            {
                'title': 'URGENT: Major Water Leak',
                'description': 'Water is flooding from the ceiling into my room. Immediate attention required!',
                'service_type': 'plumbing',
                'priority': 'high'
            },
            {
                'title': 'URGENT: Broken Door Lock',
                'description': 'My room door lock is completely broken. I cannot secure my room.',
                'service_type': 'security',
                'priority': 'high'
            },
            {
                'title': 'URGENT: Gas Smell in Kitchen',
                'description': 'Strong gas smell detected in the common kitchen area. Potential safety hazard.',
                'service_type': 'general',
                'priority': 'high'
            }
        ]

        approved_students = Student.objects.filter(registration_status='approved')
        if not approved_students.exists():
            self.stdout.write('No approved students found for urgent requests')
            return

        # Check if rooms exist
        from student.models import Room
        available_rooms = list(Room.objects.all())
        if not available_rooms:
            self.stdout.write(self.style.ERROR('No rooms found! Please create buildings and rooms first.'))
            return

        for issue in urgent_issues:
            student = random.choice(approved_students)
            room = student.room or random.choice(available_rooms)

            request = MaintenanceRequest.objects.create(
                student=student,
                title=issue['title'],
                description=issue['description'],
                service_type=issue['service_type'],
                priority=issue['priority'],
                room=room,
                status='pending',
                created_at=timezone.now() - timedelta(hours=random.randint(1, 6))
            )
            self.stdout.write(f'Created urgent request: {request.title}')

    def create_overdue_requests(self):
        """Create requests that have been pending for too long"""
        overdue_issues = [
            {
                'title': 'Slow Internet Connection',
                'description': 'Internet speed is extremely slow, making it impossible to attend online classes.',
                'service_type': 'general'
            },
            {
                'title': 'Noisy Heating System',
                'description': 'The heating system makes loud banging noises throughout the night.',
                'service_type': 'hvac'
            },
            {
                'title': 'Damaged Floor Tiles',
                'description': 'Several floor tiles in the bathroom are cracked and coming loose.',
                'service_type': 'carpentry'
            }
        ]

        approved_students = Student.objects.filter(registration_status='approved')
        if not approved_students.exists():
            self.stdout.write('No approved students found for overdue requests')
            return

        # Check if rooms exist
        from student.models import Room
        available_rooms = list(Room.objects.all())
        if not available_rooms:
            self.stdout.write(self.style.ERROR('No rooms found! Please create buildings and rooms first.'))
            return

        for issue in overdue_issues:
            student = random.choice(approved_students)
            room = student.room or random.choice(available_rooms)

            # Create old requests (7-30 days old)
            created_date = timezone.now() - timedelta(days=random.randint(7, 30))

            request = MaintenanceRequest.objects.create(
                student=student,
                title=issue['title'],
                description=issue['description'],
                service_type=issue['service_type'],
                priority='medium',
                room=room,
                status='pending',
                created_at=created_date,
                updated_at=created_date
            )
            self.stdout.write(f'Created overdue request: {request.title}')

    def create_high_rating_requests(self):
        """Create completed requests with excellent reviews"""
        excellent_work_scenarios = [
            {
                'title': 'Fixed Broken Microwave',
                'description': 'The microwave in the common kitchen stopped working completely.',
                'service_type': 'electrical',
                'completion_notes': 'Replaced faulty magnetron and tested all functions. Microwave working perfectly.',
                'rating': 5,
                'feedback': 'Outstanding service! The expert was professional, quick, and explained everything clearly. Highly recommended!'
            },
            {
                'title': 'Repaired Shower Head',
                'description': 'Shower head was clogged and water pressure was very low.',
                'service_type': 'plumbing',
                'completion_notes': 'Cleaned mineral deposits, replaced shower head gaskets, restored full water pressure.',
                'rating': 5,
                'feedback': 'Excellent work! The expert arrived on time and fixed the problem quickly. Water pressure is perfect now.'
            },
            {
                'title': 'AC Maintenance and Repair',
                'description': 'Air conditioning unit was making strange noises and not cooling effectively.',
                'service_type': 'hvac',
                'completion_notes': 'Cleaned filters, checked refrigerant levels, lubricated fan motor. Unit operating quietly and efficiently.',
                'rating': 5,
                'feedback': 'Fantastic service! The expert was knowledgeable and thorough. AC works like new now.'
            }
        ]

        approved_students = Student.objects.filter(registration_status='approved')
        experts = ServiceExpert.objects.filter(is_active=True)

        if not approved_students.exists() or not experts.exists():
            self.stdout.write('Insufficient students or experts for high rating requests')
            return

        # Check if rooms exist
        from student.models import Room
        available_rooms = list(Room.objects.all())
        if not available_rooms:
            self.stdout.write(self.style.ERROR('No rooms found! Please create buildings and rooms first.'))
            return

        for scenario in excellent_work_scenarios:
            student = random.choice(approved_students)
            suitable_experts = experts.filter(specialization=scenario['service_type'])
            expert = random.choice(suitable_experts) if suitable_experts.exists() else random.choice(experts)
            room = student.room or random.choice(available_rooms)

            # Create completed request with timeline
            created_date = timezone.now() - timedelta(days=random.randint(10, 30))
            approved_date = created_date + timedelta(hours=random.randint(2, 24))
            assigned_date = approved_date + timedelta(hours=random.randint(1, 12))
            started_date = assigned_date + timedelta(hours=random.randint(1, 24))
            completed_date = started_date + timedelta(hours=random.randint(2, 48))
            feedback_date = completed_date + timedelta(hours=random.randint(1, 72))

            request = MaintenanceRequest.objects.create(
                student=student,
                title=scenario['title'],
                description=scenario['description'],
                service_type=scenario['service_type'],
                priority='medium',
                room=room,
                status='completed',
                approved_by_name='admin',
                approved_at=approved_date,
                assigned_expert=expert,
                assigned_at=assigned_date,
                work_started_at=started_date,
                expert_notes=f"Starting work on {scenario['title'].lower()}",
                completed_at=completed_date,
                completion_notes=scenario['completion_notes'],
                student_rating=scenario['rating'],
                student_feedback=scenario['feedback'],
                feedback_at=feedback_date,
                created_at=created_date,
                updated_at=feedback_date
            )

            # Update expert rating
            expert.update_average_rating()

            self.stdout.write(f'Created high-rating request: {request.title}')

    def create_problematic_requests(self):
        """Create requests that had issues or poor reviews"""
        problematic_scenarios = [
            {
                'title': 'Toilet Still Clogged',
                'description': 'Toilet has been clogged for days and needs professional attention.',
                'service_type': 'plumbing',
                'completion_notes': 'Attempted to unclog toilet. Problem seems resolved.',
                'rating': 2,
                'feedback': 'The problem came back the next day. Expert did not properly diagnose the root cause.'
            },
            {
                'title': 'Light Switch Replacement',
                'description': 'Light switch is loose and sparking occasionally.',
                'service_type': 'electrical',
                'completion_notes': 'Replaced light switch.',
                'rating': 3,
                'feedback': 'Work was completed but expert left quite a mess. Had to clean up wires and debris myself.'
            },
            {
                'title': 'Window Won\'t Close Properly',
                'description': 'Bedroom window is stuck and won\'t close completely.',
                'service_type': 'carpentry',
                'completion_notes': 'Adjusted window frame and lubricated hinges.',
                'rating': 2,
                'feedback': 'Window still doesn\'t close properly. Expert seemed to rush the job.'
            }
        ]

        approved_students = Student.objects.filter(registration_status='approved')
        experts = ServiceExpert.objects.filter(is_active=True)

        if not approved_students.exists() or not experts.exists():
            self.stdout.write('Insufficient students or experts for problematic requests')
            return

        # Check if rooms exist
        from student.models import Room
        available_rooms = list(Room.objects.all())
        if not available_rooms:
            self.stdout.write(self.style.ERROR('No rooms found! Please create buildings and rooms first.'))
            return

        for scenario in problematic_scenarios:
            student = random.choice(approved_students)
            suitable_experts = experts.filter(specialization=scenario['service_type'])
            expert = random.choice(suitable_experts) if suitable_experts.exists() else random.choice(experts)
            room = student.room or random.choice(available_rooms)

            # Create timeline for problematic request
            created_date = timezone.now() - timedelta(days=random.randint(15, 45))
            approved_date = created_date + timedelta(hours=random.randint(12, 48))
            assigned_date = approved_date + timedelta(days=random.randint(1, 3))
            started_date = assigned_date + timedelta(hours=random.randint(4, 24))
            completed_date = started_date + timedelta(hours=random.randint(1, 8))
            feedback_date = completed_date + timedelta(days=random.randint(1, 5))

            request = MaintenanceRequest.objects.create(
                student=student,
                title=scenario['title'],
                description=scenario['description'],
                service_type=scenario['service_type'],
                priority=random.choice(['low', 'medium']),
                room=room,
                status='completed',
                approved_by_name='admin',
                approved_at=approved_date,
                assigned_expert=expert,
                assigned_at=assigned_date,
                work_started_at=started_date,
                expert_notes=f"Working on {scenario['title'].lower()}",
                completed_at=completed_date,
                completion_notes=scenario['completion_notes'],
                student_rating=scenario['rating'],
                student_feedback=scenario['feedback'],
                feedback_at=feedback_date,
                created_at=created_date,
                updated_at=feedback_date
            )

            # Update expert rating
            expert.update_average_rating()

            self.stdout.write(f'Created problematic request: {request.title}')