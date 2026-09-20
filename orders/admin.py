from django.contrib import admin

from .models import (
    Cart,
    CartItem,
    Order,
    OrderItem
)


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):

    list_display = (
        'id',
        'buyer',
        'created_at',
        'updated_at',
    )

    search_fields = (
        'buyer__username',
    )


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):

    list_display = (
        'id',
        'cart',
        'product',
        'quantity',
        'created_at',
    )

    search_fields = (
        'cart__buyer__username',
        'product__name',
    )


class OrderItemInline(admin.TabularInline):

    model = OrderItem

    extra = 0

    readonly_fields = (
        'product',
        'quantity',
        'price',
        'subtotal',
    )


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):

    list_display = (
        'id',
        'buyer',
        'total_amount',
        'status',
        'created_at',
    )

    list_filter = (
        'status',
        'created_at',
    )

    search_fields = (
        'buyer__username',
    )

    inlines = [
        OrderItemInline
    ]


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):

    list_display = (
        'id',
        'order',
        'product',
        'quantity',
        'price',
        'subtotal',
    )

    search_fields = (
        'order__buyer__username',
        'product__name',
    )