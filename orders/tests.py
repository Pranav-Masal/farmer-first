
from decimal import Decimal

from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase

from products.models import Category, Product
from .models import Cart, CartItem, Order, OrderItem


class OrderTests(APITestCase):

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
    # CART TEST
    # =========================

    def test_buyer_can_add_product_to_cart(self):

        self.client.force_authenticate(
            user=self.buyer
        )

        response = self.client.post(
            "/api/orders/cart/add/",
            {
                "product": self.product.id,
                "quantity": 2,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED
        )

        cart = Cart.objects.get(
            buyer=self.buyer
        )

        self.assertTrue(
            CartItem.objects.filter(
                cart=cart,
                product=self.product
            ).exists()
        )


    # =========================
    # CHECKOUT TEST
    # =========================

    def test_buyer_can_checkout(self):

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

        self.assertEqual(
            Order.objects.count(),
            1
        )

        order = Order.objects.first()

        self.assertEqual(
            order.buyer,
            self.buyer
        )

        self.assertEqual(
            order.status,
            "Pending"
        )

        self.assertEqual(
            order.total_amount,
            Decimal("80.00")
        )

        self.assertEqual(
            OrderItem.objects.count(),
            1
        )


    # =========================
    # STOCK UPDATE TEST
    # =========================

    def test_checkout_updates_stock(self):

        self.client.force_authenticate(
            user=self.buyer
        )

        self.client.post(
            "/api/orders/cart/add/",
            {
                "product": self.product.id,
                "quantity": 5,
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

        self.product.refresh_from_db()

        self.assertEqual(
            self.product.quantity,
            Decimal("45.00")
        )


    # =========================
    # CART CLEAR TEST
    # =========================

    def test_checkout_clears_cart(self):

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

        self.client.post(
            "/api/orders/checkout/",
            {
                "shipping_address": "Pune, Maharashtra"
            },
            format="json",
        )

        cart = Cart.objects.get(
            buyer=self.buyer
        )

        self.assertEqual(
            cart.items.count(),
            0
        )


    # =========================
    # INSUFFICIENT STOCK TEST
    # =========================

    def test_checkout_insufficient_stock(self):

        self.client.force_authenticate(
            user=self.buyer
        )

        self.client.post(
            "/api/orders/cart/add/",
            {
                "product": self.product.id,
                "quantity": 100,
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
            status.HTTP_400_BAD_REQUEST
        )

        self.assertEqual(
            Order.objects.count(),
            0
        )


    # =========================
    # UNAUTHENTICATED CHECKOUT
    # =========================

    def test_unauthenticated_checkout(self):

        response = self.client.post(
            "/api/orders/checkout/",
            {
                "shipping_address": "Pune, Maharashtra"
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED
        )


    # =========================
    # BUYER ORDER LIST
    # =========================

    def test_buyer_can_view_orders(self):

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

        self.client.post(
            "/api/orders/checkout/",
            {
                "shipping_address": "Pune, Maharashtra"
            },
            format="json",
        )

        response = self.client.get(
            "/api/orders/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.assertEqual(
            len(response.data),
            1
        )

