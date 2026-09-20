from django.contrib.auth.models import User
from django.db import models


class Notification(models.Model):

    NOTIFICATION_TYPES = (
        ('ORDER', 'Order'),
        ('STATUS', 'Status'),
        ('SYSTEM', 'System'),
    )

    recipient = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='notifications'
    )

    order = models.ForeignKey(
        'orders.Order',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='notifications'
    )

    product = models.ForeignKey(
        'products.Product',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='notifications'
    )

    notification_type = models.CharField(
        max_length=20,
        choices=NOTIFICATION_TYPES,
        default='SYSTEM'
    )

    message = models.TextField()

    is_read = models.BooleanField(
        default=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.recipient.username} - {self.message}"