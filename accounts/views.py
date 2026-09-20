from rest_framework.decorators import api_view, permission_classes
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import (
    RegisterSerializer,
    UserProfileSerializer
)


class RegisterView(APIView):

    permission_classes = [
        AllowAny
    ]

    def post(self, request):

        serializer = RegisterSerializer(
            data=request.data
        )

        if serializer.is_valid():

            user = serializer.save()

            return Response(
                {
                    "message": "Registration successful.",
                    "user": {
                        "id": user.id,
                        "username": user.username,
                        "email": user.email,
                        "role": user.userprofile.role
                    }
                },
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def profile_view(request):

    profile = request.user.userprofile

    if request.method == "GET":

        serializer = UserProfileSerializer(
            profile
        )

        return Response(
            serializer.data
        )

    if request.method == "PATCH":

        serializer = UserProfileSerializer(
            profile,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():

            serializer.save()

            return Response(
                {
                    "message": "Profile updated successfully.",
                    "profile": serializer.data
                },
                status=status.HTTP_200_OK
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )