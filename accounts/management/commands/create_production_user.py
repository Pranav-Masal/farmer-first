import os

from django.core.management.base import BaseCommand
from django.contrib.auth.models import User


class Command(BaseCommand):

    help = "Create or update production Farmer user"

    def handle(self, *args, **kwargs):

        username = os.getenv("PRODUCTION_USERNAME")
        password = os.getenv("PRODUCTION_PASSWORD")
        email = os.getenv("PRODUCTION_EMAIL", "")

        if not username or not password:
            self.stdout.write(
                self.style.ERROR(
                    "PRODUCTION_USERNAME and PRODUCTION_PASSWORD are required."
                )
            )
            return

        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                "email": email,
                "is_active": True,
            }
        )

        user.email = email
        user.is_active = True
        user.set_password(password)
        user.save()

        profile = user.userprofile
        profile.role = "Farmer"
        profile.save()

        if created:
            self.stdout.write(
                self.style.SUCCESS(
                    f"Farmer user '{username}' created successfully."
                )
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(
                    f"Farmer user '{username}' updated successfully."
                )
            )