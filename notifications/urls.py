
from django.urls import path

from .views import (
    notification_list,
    unread_notification_count,
    mark_notification_read,
    mark_all_notifications_read
)


urlpatterns = [

    path(
        "",
        notification_list,
        name="notification-list"
    ),

    path(
        "unread-count/",
        unread_notification_count,
        name="unread-notification-count"
    ),

    path(
        "<int:pk>/read/",
        mark_notification_read,
        name="mark-notification-read"
    ),

    path(
        "mark-all-read/",
        mark_all_notifications_read,
        name="mark-all-notifications-read"
    ),

]

