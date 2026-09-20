
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import UserProfile
from .models import Category, Product


class ProductTests(APITestCase):

    def setUp(self):

        self.farmer = User.objects.create_user(
            username="farmer",
            email="farmer@example.com",
            password="Test12345",
        )

        self.farmer.userprofile.role = "Farmer"
        self.farmer.userprofile.save()

        self.buyer = User.objects.create_user(
            username="buyer",
            email="buyer@example.com",
            password="Test12345",
        )

        self.buyer.userprofile.role = "Buyer"
        self.buyer.userprofile.save()

        self.category = Category.objects.create(
            name="Vegetables"
        )


    def test_farmer_can_create_product(self):

        self.client.force_authenticate(
            user=self.farmer
        )

        response = self.client.post(
            "/api/products/",
            {
                "category": self.category.id,
                "name": "Tomato",
                "description": "Fresh Tomato",
                "price": "40.00",
                "quantity": "50",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED
        )

        self.assertTrue(
            Product.objects.filter(
                name="Tomato"
            ).exists()
        )


    def test_buyer_cannot_create_product(self):

        self.client.force_authenticate(
            user=self.buyer
        )

        response = self.client.post(
            "/api/products/",
            {
                "category": self.category.id,
                "name": "Potato",
                "description": "Fresh Potato",
                "price": "30.00",
                "quantity": "20",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN
        )


    def test_product_not_found(self):

        self.client.force_authenticate(
            user=self.buyer
        )

        response = self.client.get(
            "/api/products/999999/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND
        )


    def test_unauthenticated_product_access(self):

        response = self.client.get(
            "/api/products/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED
        )

