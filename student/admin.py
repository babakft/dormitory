from django.contrib import admin
from student.models import Building, Room


@admin.register(Building)
class BuildingAdmin(admin.ModelAdmin):
    list_display = ['name', 'total_floors', 'created_at']
    search_fields = ['name']
    list_filter = ['total_floors', 'created_at']
    ordering = ['name']


@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ['building', 'number', 'floor', 'capacity', 'student_count']
    list_filter = ['building', 'floor', 'capacity']
    search_fields = ['number', 'building__name']
    ordering = ['building', 'floor', 'number']

    def student_count(self, obj):
        return obj.students.count()

    student_count.short_description = 'Students'
