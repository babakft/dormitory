JAZZMIN_SETTINGS = {
    # برندینگ
    "site_title": "سیستم مدیریت خوابگاه",
    "site_header": "مدیریت خوابگاه",
    "site_brand": "دانشگاه باهنر",
    "site_logo": None,
    "site_icon": "fas fa-building",
    "welcome_sign": "به سیستم مدیریت خوابگاه خوش آمدید",

    # کپی رایت
    "copyright": "سیستم مدیریت خوابگاه © ۱۴۰۴",

    # جستجو
    "search_model": ["student.Student", "maintenance.MaintenanceRequest"],

    # منوی بالا
    "topmenu_links": [
        {"name": "خانه", "url": "admin:index", "permissions": ["auth.view_user"]},
        {"name": "داشبورد", "url": "admin:index", "icon": "fas fa-home"},
    ],

    # منوی کاربر
    "usermenu_links": [
        {"name": "پروفایل", "url": "admin:password_change", "icon": "fas fa-user"},
        {"model": "auth.user"}
    ],

    # منوی کناری
    "show_sidebar": True,
    "navigation_expanded": True,
    "hide_apps": [],
    "hide_models": [],

    # ترتیب نمایش
    "order_with_respect_to": ["student", "maintenance", "service", "ticket", "notification", "auth"],

    # آیکون‌ها برای مدل‌ها
    "icons": {
        # دانشجو
        "student.Student": "fas fa-user-graduate",
        "student.Building": "fas fa-building",
        "student.Room": "fas fa-door-open",
        "student.User": "fas fa-user",

        # تعمیرات
        "maintenance.MaintenanceRequest": "fas fa-tools",
        "maintenance.MaintenanceImage": "fas fa-images",

        # خدمات
        "service.ServiceExpert": "fas fa-user-hard-hat",

        # تیکت
        "ticket.Ticket": "fas fa-ticket-alt",
        "ticket.TicketMessage": "fas fa-comments",

        # اعلان‌ها
        "notification.AdminActivityTracker": "fas fa-bell",

        # احراز هویت
        "auth.User": "fas fa-user",
        "auth.Group": "fas fa-users",

        # سایت‌ها
        "sites.Site": "fas fa-globe",
    },

    # مودال مرتبط
    "related_modal_active": True,

    # سازنده رابط کاربری
    "show_ui_builder": False,

    # سفارشی‌سازی نمای تغییر
    "changeform_format": "horizontal_tabs",
    "changeform_format_overrides": {
        "auth.user": "collapsible",
        "auth.group": "vertical_tabs"
    },

    # زبان
    "language_chooser": False,

    # تنظیمات اضافی برای فارسی‌سازی
    "show_ui_builder": False,
    "default_icon_parents": "fas fa-chevron-circle-left",
    "default_icon_children": "fas fa-circle",
}

# تنظیمات ظاهری
JAZZMIN_UI_TWEAKS = {
    "navbar_small_text": False,
    "footer_small_text": False,
    "body_small_text": False,
    "brand_small_text": False,
    "brand_colour": "navbar-navy",
    "accent": "accent-info",
    "navbar": "navbar-navy navbar-dark",
    "no_navbar_border": False,
    "navbar_fixed": True,
    "layout_boxed": False,
    "footer_fixed": False,
    "sidebar_fixed": True,
    "sidebar": "sidebar-dark-navy",
    "sidebar_nav_small_text": False,
    "sidebar_disable_expand": False,
    "sidebar_nav_child_indent": True,
    "sidebar_nav_compact_style": False,
    "sidebar_nav_legacy_style": False,
    "sidebar_nav_flat_style": False,
    "theme": "flatly",
    "dark_mode_theme": None,
    "button_classes": {
        "primary": "btn-primary",
        "secondary": "btn-secondary",
        "info": "btn-info",
        "warning": "btn-warning",
        "danger": "btn-danger",
        "success": "btn-success"
    },
    "actions_sticky_top": True,
}