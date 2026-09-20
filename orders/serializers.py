from rest_framework import serializers

from .models import (
    Cart,
    CartItem,
    Order,
    OrderItem
)


class CartItemSerializer(serializers.ModelSerializer):

    product_name = serializers.CharField(
        source='product.name',
        read_only=True
    )

    price = serializers.DecimalField(
        source='product.price',
        max_digits=10,
        decimal_places=2,
        read_only=True
    )

    farmer_name = serializers.CharField(
        source='product.farmer.username',
        read_only=True
    )

    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = CartItem

        fields = [
            'id',
            'product',
            'product_name',
            'farmer_name',
            'quantity',
            'price',
            'subtotal',
        ]

    def get_subtotal(self, obj):

        return obj.product.price * obj.quantity


class CartSerializer(serializers.ModelSerializer):

    items = CartItemSerializer(
        many=True,
        read_only=True
    )

    total_amount = serializers.SerializerMethodField()

    class Meta:
        model = Cart

        fields = [
            'id',
            'items',
            'total_amount',
            'created_at',
            'updated_at',
        ]

    def get_total_amount(self, obj):

        total = 0

        for item in obj.items.select_related('product'):

            total += (
                item.product.price
                * item.quantity
            )

        return total


class OrderItemSerializer(serializers.ModelSerializer):

    product_name = serializers.CharField(
        source='product.name',
        read_only=True
    )

    farmer_name = serializers.CharField(
        source='product.farmer.username',
        read_only=True
    )

    class Meta:
        model = OrderItem

        fields = [
            'id',
            'product',
            'product_name',
            'farmer_name',
            'quantity',
            'price',
            'subtotal',
        ]


class OrderSerializer(serializers.ModelSerializer):

    items = OrderItemSerializer(
        many=True,
        read_only=True
    )

    buyer_name = serializers.CharField(
        source='buyer.username',
        read_only=True
    )

    class Meta:
        model = Order

        fields = [
            'id',
            'buyer',
            'buyer_name',
            'items',
            'total_amount',
            'status',
            'shipping_address',
            'created_at',
            'updated_at',
        ]

        read_only_fields = [
            'buyer',
            'total_amount',
            'status',
            'created_at',
            'updated_at',
        ]