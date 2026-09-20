
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
)

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)


urlpatterns = [

    # =========================
    # ADMIN
    # =========================

    path(
        'admin/',
        admin.site.urls
    ),


    # =========================
    # AUTHENTICATION
    # =========================

    path(
        'api/auth/',
        include('accounts.urls')
    ),

    path(
        'api/auth/login/',
        TokenObtainPairView.as_view(),
        name='token_obtain_pair'
    ),

    path(
        'api/auth/token/refresh/',
        TokenRefreshView.as_view(),
        name='token_refresh'
    ),


    # =========================
    # PRODUCTS
    # =========================

    path(
        'api/products/',
        include('products.urls')
    ),


    # =========================
    # ORDERS
    # =========================

    path(
        'api/orders/',
        include('orders.urls')
    ),


    # =========================
    # NOTIFICATIONS
    # =========================

    path(
        'api/notifications/',
        include('notifications.urls')
    ),


    # =========================
    # SWAGGER / OPENAPI
    # =========================

    path(
        'api/schema/',
        SpectacularAPIView.as_view(),
        name='schema'
    ),

    path(
        'api/docs/',
        SpectacularSwaggerView.as_view(
            url_name='schema'
        ),
        name='swagger-ui'
    ),
]


# =========================
# MEDIA FILES
# =========================

if settings.DEBUG:

    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT
    )

