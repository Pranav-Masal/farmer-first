from django.contrib.auth.models import User
from rest_framework import serializers

from .models import UserProfile


class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(
        write_only=True,
        min_length=6
    )

    role = serializers.ChoiceField(
        choices=['Farmer', 'Buyer']
    )

    phone = serializers.CharField(
        required=False,
        allow_blank=True
    )

    address = serializers.CharField(
        required=False,
        allow_blank=True
    )

    city = serializers.CharField(
        required=False,
        allow_blank=True
    )

    class Meta:
        model = User

        fields = [
            'username',
            'email',
            'password',
            'first_name',
            'last_name',
            'role',
            'phone',
            'address',
            'city',
        ]

    def validate_username(self, value):

        if User.objects.filter(
            username=value
        ).exists():

            raise serializers.ValidationError(
                "Username already exists."
            )

        return value

    def validate_email(self, value):

        if User.objects.filter(
            email=value
        ).exists():

            raise serializers.ValidationError(
                "Email already exists."
            )

        return value

    def create(self, validated_data):

        role = validated_data.pop('role')

        phone = validated_data.pop(
            'phone',
            ''
        )

        address = validated_data.pop(
            'address',
            ''
        )

        city = validated_data.pop(
            'city',
            ''
        )

        password = validated_data.pop(
            'password'
        )

        user = User.objects.create_user(
            password=password,
            **validated_data
        )

        profile = user.userprofile

        profile.role = role
        profile.phone = phone
        profile.address = address
        profile.city = city

        profile.save()

        return user


class UserProfileSerializer(serializers.ModelSerializer):

    username = serializers.CharField(
        source="user.username",
        read_only=True
    )

    email = serializers.EmailField(
        source="user.email",
        required=False
    )

    first_name = serializers.CharField(
        source="user.first_name",
        required=False,
        allow_blank=True
    )

    last_name = serializers.CharField(
        source="user.last_name",
        required=False,
        allow_blank=True
    )

    class Meta:
        model = UserProfile

        fields = [
            "username",
            "email",
            "first_name",
            "last_name",
            "role",
            "phone",
            "address",
            "city",
            "created_at",
        ]

        read_only_fields = [
            "username",
            "role",
            "created_at",
        ]

    def update(self, instance, validated_data):

        user_data = validated_data.pop(
            "user",
            {}
        )

        user = instance.user

        if "email" in user_data:
            user.email = user_data["email"]

        if "first_name" in user_data:
            user.first_name = user_data["first_name"]

        if "last_name" in user_data:
            user.last_name = user_data["last_name"]

        user.save()

        instance = super().update(
            instance,
            validated_data
        )

        return instance