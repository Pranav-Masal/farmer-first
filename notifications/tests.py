
from decimal import Decimal

from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase

from products.models import Category, Product
from orders.models import Order
from .models import Notification


class NotificationTests(APITestCase):

    def setUp(self):

        # =========================
        # FARMER
        # =========================

        self.farmer = User.objects.create_user(
            username="farmer",
            email="farmer@example.com",
            password="Test12345",
        )

        self.farmer.userprofile.role = "Farmer"
        self.farmer.userprofile.save()

        # =========================
        # BUYER
        # =========================

        self.buyer = User.objects.create_user(
            username="buyer",
            email="buyer@example.com",
            password="Test12345",
        )

        self.buyer.userprofile.role = "Buyer"
        self.buyer.userprofile.save()

        # =========================
        # CATEGORY
        # =========================

        self.category = Category.objects.create(
            name="Vegetables"
        )

        # =========================
        # PRODUCT
        # =========================

        self.product = Product.objects.create(
            farmer=self.farmer,
            category=self.category,
            name="Tomato",
            description="Fresh Tomato",
            price=Decimal("40.00"),
            quantity=Decimal("50.00"),
            is_available=True,
        )


    # =========================
    # CREATE ORDER HELPER
    # =========================

    def create_order(self):

        self.client.force_authenticate(
            user=self.buyer
        )

        self.client.post(
            "/api/orders/cart/add/",
            {
                "product": self.product.id,
                "quantity": 2,
            },
            format="json",
        )

        response = self.client.post(
            "/api/orders/checkout/",
            {
                "shipping_address": "Pune, Maharashtra"
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED
        )

        return Order.objects.first()


    # =========================
    # FARMER NOTIFICATION
    # =========================

    def test_farmer_receives_order_notification(self):

        order = self.create_order()

        notification = Notification.objects.filter(
            recipient=self.farmer,
            order=order
        ).first()

        self.assertIsNotNone(
            notification
        )

        self.assertEqual(
            notification.notification_type,
            "ORDER"
        )

        self.assertFalse(
            notification.is_read
        )


    # =========================
    # BUYER DOES NOT RECEIVE
    # ORDER NOTIFICATION
    # =========================

    def test_order_notification_goes_to_farmer(self):

        order = self.create_order()

        farmer_notifications = Notification.objects.filter(
            recipient=self.farmer,
            order=order
        )

        buyer_notifications = Notification.objects.filter(
            recipient=self.buyer,
            order=order,
            notification_type="ORDER"
        )

        self.assertEqual(
            farmer_notifications.count(),
            1
        )

        self.assertEqual(
            buyer_notifications.count(),
            0
        )


    # =========================
    # NOTIFICATION LIST
    # =========================

    def test_user_can_view_own_notifications(self):

        order = self.create_order()

        self.client.force_authenticate(
            user=self.farmer
        )

        response = self.client.get(
            "/api/notifications/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.assertEqual(
            response.data["unread_count"],
            1
        )

        self.assertEqual(
            len(response.data["notifications"]),
            1
        )


    # =========================
    # UNREAD COUNT
    # =========================


def test_unread_notification_count(self):

    order = self.create_order()

    self.client.force_authenticate(
        user=self.farmer
    )

    response = self.client.get(
        "/api/notifications/unread-count/"
    )

    self.assertEqual(
        response.status_code,
        status.HTTP_200_OK
    )

    self.assertEqual(
        response.data["unread_count"],
        1
    )





    def test_unauthenticated_notification_access(self): 
        response = self.client.get(
            "/api/notifications/" 
            ) 

        self.assertEqual( 
            response.status_code, 
            status.HTTP_401_UNAUTHORIZED 
        )