# management/commands/create_review_data.py
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
    help = 'Create maintenance requests with comprehensive review data'

    def add_arguments(self, parser):
        parser.add_argument(
            '--count',
            type=int,
            default=25,
            help='Number of completed requests with reviews to create'
        )

    def handle(self, *args, **options):
        count = options['count']

        self.stdout.write(f'Creating {count} completed maintenance requests with reviews...')

        # Get students and experts
        students = list(Student.objects.filter(registration_status='approved'))
        experts = list(ServiceExpert.objects.filter(is_active=True))

        if not students:
            self.stdout.write(self.style.ERROR('No approved students found!'))
            return

        if not experts:
            self.stdout.write(self.style.ERROR('No active experts found!'))
            return

        # Review data templates
        review_scenarios = self.get_review_scenarios()

        created_count = 0
        for i in range(count):
            scenario = random.choice(review_scenarios)
            student = random.choice(students)

            # Find expert with matching specialization or random expert
            suitable_experts = [e for e in experts if e.specialization == scenario['service_type']]
            expert = random.choice(suitable_experts) if suitable_experts else random.choice(experts)

            # Create request with full workflow
            request = self.create_completed_request_with_review(student, expert, scenario, i)

            if request:
                created_count += 1

        # Update all expert ratings
        for expert in experts:
            expert.update_average_rating()

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {created_count} reviewed maintenance requests!')
        )

    def get_review_scenarios(self):
        """Get realistic review scenarios with ratings and feedback"""
        return [
            # Excellent reviews (5 stars)
            {
                'title': 'Fixed Broken Air Conditioner',
                'description': 'Air conditioning unit stopped working completely. Room is too hot.',
                'service_type': 'hvac',
                'completion_notes': 'Replaced faulty compressor, cleaned filters, tested all functions. AC working perfectly.',
                'rating': 5,
                'feedback': 'Outstanding work! The expert was professional, explained everything clearly, and worked efficiently. AC is working better than ever!'
            },
            {
                'title': 'Repaired Electrical Outlet',
                'description': 'Wall outlet sparked and stopped working. Safety concern.',
                'service_type': 'electrical',
                'completion_notes': 'Replaced damaged outlet, checked wiring, installed GFCI protection for safety.',
                'rating': 5,
                'feedback': 'Excellent service! Expert prioritized safety and did thorough work. Very professional and clean work area.'
            },
            {
                'title': 'Fixed Persistent Water Leak',
                'description': 'Bathroom pipe has been leaking for days, causing water damage.',
                'service_type': 'plumbing',
                'completion_notes': 'Located leak source, replaced damaged pipe section, tested water pressure.',
                'rating': 5,
                'feedback': 'Perfect job! Expert found the problem quickly and fixed it permanently. No more leaks!'
            },

            # Very good reviews (4 stars)
            {
                'title': 'Door Lock Mechanism Repair',
                'description': 'Room door lock is extremely difficult to turn and sometimes gets stuck.',
                'service_type': 'carpentry',
                'completion_notes': 'Lubricated lock mechanism, adjusted door alignment, replaced worn key.',
                'rating': 4,
                'feedback': 'Great work! Door opens and closes smoothly now. Expert was punctual and professional.'
            },
            {
                'title': 'Ceiling Light Installation',
                'description': 'Need new ceiling light installed in study area.',
                'service_type': 'electrical',
                'completion_notes': 'Installed new LED ceiling fixture, tested wiring, provided dimmer switch.',
                'rating': 4,
                'feedback': 'Very satisfied with the work. Light looks great and works perfectly. Thank you!'
            },
            {
                'title': 'Window Screen Replacement',
                'description': 'Torn window screen needs replacement for insect protection.',
                'service_type': 'general',
                'completion_notes': 'Measured and installed new screen mesh, checked frame integrity.',
                'rating': 4,
                'feedback': 'Good quality work. Screen fits perfectly and looks neat.'
            },

            # Good reviews (3 stars)
            {
                'title': 'Sink Faucet Replacement',
                'description': 'Kitchen faucet is old and leaking from multiple points.',
                'service_type': 'plumbing',
                'completion_notes': 'Replaced old faucet with new model, tested water flow and temperature.',
                'rating': 3,
                'feedback': 'Work was completed correctly but took longer than expected. Faucet works fine now.'
            },
            {
                'title': 'Broken Shelf Repair',
                'description': 'Wall-mounted shelf broke and fell, need it securely reinstalled.',
                'service_type': 'carpentry',
                'completion_notes': 'Reinforced wall anchors, remounted shelf with stronger brackets.',
                'rating': 3,
                'feedback': 'Shelf is secure now but the work area was left a bit messy.'
            },
            {
                'title': 'Light Switch Replacement',
                'description': 'Bathroom light switch is loose and sometimes doesn\'t work.',
                'service_type': 'electrical',
                'completion_notes': 'Replaced switch and tightened electrical connections.',
                'rating': 3,
                'feedback': 'Switch works but expert seemed to rush the job. Would have preferred more thorough explanation.'
            },

            # Fair reviews (2 stars)
            {
                'title': 'Toilet Repair Attempt',
                'description': 'Toilet keeps running and won\'t stop filling with water.',
                'service_type': 'plumbing',
                'completion_notes': 'Adjusted flush mechanism and replaced flapper valve.',
                'rating': 2,
                'feedback': 'Problem came back within a week. Had to call for another repair. Not a permanent solution.'
            },
            {
                'title': 'Radiator Cleaning',
                'description': 'Room radiator not heating properly, might need cleaning.',
                'service_type': 'hvac',
                'completion_notes': 'Cleaned radiator vents and bled air from system.',
                'rating': 2,
                'feedback': 'Work was done but heating improved only slightly. Expected better results.'
            },

            # Poor reviews (1 star) - rare but realistic
            {
                'title': 'Attempted Closet Door Fix',
                'description': 'Closet door is completely off track and won\'t slide properly.',
                'service_type': 'carpentry',
                'completion_notes': 'Attempted to realign door tracks.',
                'rating': 1,
                'feedback': 'Door is still broken and now makes more noise. Work was incomplete and unsatisfactory.'
            }
        ]

    def create_completed_request_with_review(self, student, expert, scenario, index):
        """Create a complete maintenance request with realistic timeline and review"""

        # Check if student has a room, use first available room if not
        from student.models import Room
        room = student.room
        if not room:
            room = Room.objects.first()
            if not room:
                self.stdout.write(self.style.ERROR('No rooms found! Please create buildings and rooms first.'))
                return None

        # Generate realistic timeline
        created_date = timezone.now() - timedelta(days=random.randint(10, 60))
        approved_date = created_date + timedelta(hours=random.randint(2, 48))
        assigned_date = approved_date + timedelta(hours=random.randint(1, 24))
        started_date = assigned_date + timedelta(hours=random.randint(2, 48))

        # Work duration varies by complexity and rating
        if scenario['rating'] >= 4:
            work_hours = random.randint(2, 12)  # Good work takes reasonable time
        else:
            work_hours = random.randint(1, 8)  # Poor work might be rushed

        completed_date = started_date + timedelta(hours=work_hours)
        feedback_date = completed_date + timedelta(hours=random.randint(6, 72))

        try:
            request = MaintenanceRequest.objects.create(
                student=student,
                title=f"{scenario['title']} #{index + 1}",
                description=scenario['description'],
                service_type=scenario['service_type'],
                priority=random.choice(['low', 'medium', 'high']),
                room=room,
                status='completed',

                # Timeline
                created_at=created_date,
                approved_by_name='admin',
                approved_at=approved_date,
                assigned_expert=expert,
                assigned_at=assigned_date,
                work_started_at=started_date,
                expert_notes=f"Working on {scenario['title'].lower()} - {scenario['service_type']} repair",
                completed_at=completed_date,
                completion_notes=scenario['completion_notes'],

                # Review data
                student_rating=scenario['rating'],
                student_feedback=scenario['feedback'],
                feedback_at=feedback_date,

                updated_at=feedback_date
            )

            return request

        except Exception as e:
            self.stdout.write(f'Error creating request {index + 1}: {str(e)}')
            return None