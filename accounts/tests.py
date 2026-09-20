
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase


class RegistrationTests(APITestCase):

    def test_register_buyer(self):
        response = self.client.post(
            "/api/auth/register/",
            {
                "username": "testbuyer",
                "email": "testbuyer@example.com",
                "password": "Test12345",
                "first_name": "Test",
                "last_name": "Buyer",
                "role": "Buyer",
                "phone": "9876543210",
                "address": "Pune",
                "city": "Pune",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED
        )

        self.assertTrue(
            User.objects.filter(
                username="testbuyer"
            ).exists()
        )


    def test_register_farmer(self):
        response = self.client.post(
            "/api/auth/register/",
            {
                "username": "testfarmer",
                "email": "testfarmer@example.com",
                "password": "Test12345",
                "first_name": "Test",
                "last_name": "Farmer",
                "role": "Farmer",
                "phone": "9876543211",
                "address": "Pune",
                "city": "Pune",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED
        )

        user = User.objects.get(
            username="testfarmer"
        )

        self.assertEqual(
            user.userprofile.role,
            "Farmer"
        )


    def test_duplicate_username(self):
        User.objects.create_user(
            username="existinguser",
            email="existing@example.com",
            password="Test12345",
        )

        response = self.client.post(
            "/api/auth/register/",
            {
                "username": "existinguser",
                "email": "new@example.com",
                "password": "Test12345",
                "role": "Buyer",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )


    def test_duplicate_email(self):
        User.objects.create_user(
            username="userone",
            email="same@example.com",
            password="Test12345",
        )

        response = self.client.post(
            "/api/auth/register/",
            {
                "username": "usertwo",
                "email": "same@example.com",
                "password": "Test12345",
                "role": "Buyer",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )

