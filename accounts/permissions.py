from rest_framework.permissions import BasePermission


class IsFarmer(BasePermission):

    message = "Only farmers can perform this action."

    def has_permission(
        self,
        request,
        view
    ):

        return (
            request.user.is_authenticated
            and hasattr(
                request.user,
                'userprofile'
            )
            and request.user.userprofile.role
            == 'Farmer'
        )


class IsBuyer(BasePermission):

    message = "Only buyers can perform this action."

    def has_permission(
        self,
        request,
        view
    ):

        return (
            request.user.is_authenticated
            and hasattr(
                request.user,
                'userprofile'
            )
            and request.user.userprofile.role
            == 'Buyer'
        )