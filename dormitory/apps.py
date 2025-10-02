from django.apps import AppConfig


class DormitoryConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'dormitory'
    verbose_name = 'مدیریت خوابگاه'

    def ready(self):
        import dormitory.admin