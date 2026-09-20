from django.contrib.auth.models import User
from django.db import models


class UserProfile(models.Model):

    ROLE_CHOICES = (
        ('Farmer', 'Farmer'),
        ('Buyer', 'Buyer'),
    )

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='userprofile'
    )

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES
    )

    phone = models.CharField(
        max_length=15,
        blank=True
    )

    address = models.TextField(
        blank=True
    )

    city = models.CharField(
        max_length=100,
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.user.username} - {self.role}"