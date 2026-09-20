
from rest_framework import serializers

from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):

    order_id = serializers.IntegerField(
        source="order.id",
        read_only=True,
        allow_null=True
    )

    product_name = serializers.CharField(
        source="product.name",
        read_only=True,
        allow_null=True
    )

    class Meta:
        model = Notification

        fields = [
            "id",
            "notification_type",
            "message",
            "is_read",
            "order_id",
            "product_name",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "notification_type",
            "message",
            "order_id",
            "product_name",
            "created_at",
        ]

