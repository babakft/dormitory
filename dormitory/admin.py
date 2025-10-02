from django.contrib import admin
from django.contrib.auth.models import Group
from django.contrib.sites.models import Site

# تغییر عنوان‌های پنل ادمین
admin.site.site_header = "پنل مدیریت خوابگاه دانشگاه شهید باهنر"
admin.site.site_title = "مدیریت خوابگاه"
admin.site.index_title = "خوش آمدید به پنل مدیریت"

# ایجاد Proxy Models برای فارسی کردن
class PersianGroup(Group):
    class Meta:
        proxy = True
        verbose_name = 'گروه کاربری'
        verbose_name_plural = 'گروه‌های کاربری'

class PersianSite(Site):
    class Meta:
        proxy = True
        verbose_name = 'سایت'
        verbose_name_plural = 'سایت‌ها'

# حذف models اصلی
try:
    admin.site.unregister(Group)
except admin.sites.NotRegistered:
    pass

try:
    admin.site.unregister(Site)
except admin.sites.NotRegistered:
    pass

# ثبت Proxy Models با نام فارسی
@admin.register(PersianGroup)
class PersianGroupAdmin(admin.ModelAdmin):
    list_display = ['name']
    search_fields = ['name']
    filter_horizontal = ['permissions']

@admin.register(PersianSite)
class PersianSiteAdmin(admin.ModelAdmin):
    list_display = ['domain', 'name']
    search_fields = ['domain', 'name']