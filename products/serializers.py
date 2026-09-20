
from rest_framework import serializers

from .models import Category, Product


class CategorySerializer(serializers.ModelSerializer):

    class Meta:
        model = Category
        fields = [
            'id',
            'name',
        ]


class ProductSerializer(serializers.ModelSerializer):

    farmer_name = serializers.CharField(
        source='farmer.username',
        read_only=True
    )

    category_name = serializers.CharField(
        source='category.name',
        read_only=True
    )

    image = serializers.ImageField(
        required=False,
        allow_null=True
    )

    class Meta:
        model = Product

        fields = [
            'id',
            'farmer',
            'farmer_name',
            'category',
            'category_name',
            'name',
            'description',
            'price',
            'quantity',
            'image',
            'is_available',
            'created_at',
            'updated_at',
        ]

        read_only_fields = [
            'farmer',
            'farmer_name',
            'category_name',
            'created_at',
            'updated_at',
        ]

    def validate_name(self, value):

        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Product name cannot be blank."
            )

        if len(value) < 2:
            raise serializers.ValidationError(
                "Product name must contain at least 2 characters."
            )

        return value

    def validate_price(self, value):

        if value <= 0:
            raise serializers.ValidationError(
                "Price must be greater than 0."
            )

        return value

    def validate_quantity(self, value):

        if value <= 0:
            raise serializers.ValidationError(
                "Quantity must be greater than 0."
            )

        return value

