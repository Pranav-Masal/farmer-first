from django.urls import path

from .views import (
    cart_add,
    cart_detail,
    cart_remove,
    cart_update,
    checkout,
    order_detail,
    order_list,
    update_order_status
)


urlpatterns = [

    path(
        'cart/',
        cart_detail,
        name='cart-detail'
    ),

    path(
        'cart/add/',
        cart_add,
        name='cart-add'
    ),

    path(
        'cart/<int:item_id>/update/',
        cart_update,
        name='cart-update'
    ),

    path(
        'cart/<int:item_id>/remove/',
        cart_remove,
        name='cart-remove'
    ),

    path(
        'checkout/',
        checkout,
        name='checkout'
    ),

    path(
        '',
        order_list,
        name='order-list'
    ),

    path(
        '<int:pk>/',
        order_detail,
        name='order-detail'
    ),

    path(
    '<int:pk>/status/',
    update_order_status,
    name='order-status'
),

]