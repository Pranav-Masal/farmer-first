from decimal import Decimal

from django.db import transaction

from rest_framework import status
from rest_framework.decorators import (
    api_view,
    permission_classes
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts.permissions import IsBuyer

from notifications.models import Notification

from products.models import Product

from .models import (
    Cart,
    CartItem,
    Order,
    OrderItem
)

from .serializers import (
    CartSerializer,
    OrderSerializer
)


@api_view(['GET'])
@permission_classes([
    IsAuthenticated,
    IsBuyer
])
def cart_detail(request):

    cart, created = Cart.objects.get_or_create(
        buyer=request.user
    )

    cart = Cart.objects.prefetch_related(
        'items__product__farmer'
    ).get(
        pk=cart.pk
    )

    serializer = CartSerializer(cart)

    return Response(
        serializer.data
    )


@api_view(['POST'])
@permission_classes([
    IsAuthenticated,
    IsBuyer
])
def cart_add(request):

    product_id = request.data.get(
        'product'
    )

    quantity = request.data.get(
        'quantity'
    )

    if not product_id:

        return Response(
            {
                'detail': 'Product is required.'
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    if not quantity:

        return Response(
            {
                'detail': 'Quantity is required.'
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    try:

        quantity = Decimal(
            str(quantity)
        )

    except Exception:

        return Response(
            {
                'detail': 'Invalid quantity.'
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    if quantity <= 0:

        return Response(
            {
                'detail': 'Quantity must be greater than zero.'
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    try:

        product = Product.objects.get(
            pk=product_id,
            is_available=True
        )

    except Product.DoesNotExist:

        return Response(
            {
                'detail': 'Product not found.'
            },
            status=status.HTTP_404_NOT_FOUND
        )

    if quantity > product.quantity:

        return Response(
            {
                'detail': (
                    f'Only {product.quantity} '
                    f'quantity is available.'
                )
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    cart, created = Cart.objects.get_or_create(
        buyer=request.user
    )

    cart_item, item_created = CartItem.objects.get_or_create(
        cart=cart,
        product=product,
        defaults={
            'quantity': quantity
        }
    )

    if not item_created:

        new_quantity = (
            cart_item.quantity
            + quantity
        )

        if new_quantity > product.quantity:

            return Response(
                {
                    'detail': (
                        f'Only {product.quantity} '
                        f'quantity is available.'
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        cart_item.quantity = new_quantity
        cart_item.save()

    return Response(
        {
            'message': 'Product added to cart.',
            'product': product.name,
            'quantity': cart_item.quantity
        },
        status=status.HTTP_201_CREATED
    )


@api_view(['PATCH'])
@permission_classes([
    IsAuthenticated,
    IsBuyer
])
def cart_update(request, item_id):

    try:

        cart_item = CartItem.objects.select_related(
            'cart',
            'product'
        ).get(
            id=item_id,
            cart__buyer=request.user
        )

    except CartItem.DoesNotExist:

        return Response(
            {
                'detail': 'Cart item not found.'
            },
            status=status.HTTP_404_NOT_FOUND
        )

    quantity = request.data.get(
        'quantity'
    )

    if quantity is None:

        return Response(
            {
                'detail': 'Quantity is required.'
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    try:

        quantity = Decimal(
            str(quantity)
        )

    except Exception:

        return Response(
            {
                'detail': 'Invalid quantity.'
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    if quantity <= 0:

        return Response(
            {
                'detail': 'Quantity must be greater than zero.'
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    if quantity > cart_item.product.quantity:

        return Response(
            {
                'detail': (
                    f'Only {cart_item.product.quantity} '
                    f'quantity is available.'
                )
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    cart_item.quantity = quantity

    cart_item.save()

    return Response(
        {
            'message': 'Cart updated successfully.',
            'quantity': cart_item.quantity
        }
    )


@api_view(['DELETE'])
@permission_classes([
    IsAuthenticated,
    IsBuyer
])
def cart_remove(request, item_id):

    try:

        cart_item = CartItem.objects.get(
            id=item_id,
            cart__buyer=request.user
        )

    except CartItem.DoesNotExist:

        return Response(
            {
                'detail': 'Cart item not found.'
            },
            status=status.HTTP_404_NOT_FOUND
        )

    cart_item.delete()

    return Response(
        {
            'message': 'Item removed from cart.'
        },
        status=status.HTTP_204_NO_CONTENT
    )


@api_view(['POST'])
@permission_classes([
    IsAuthenticated,
    IsBuyer
])
def checkout(request):

    shipping_address = request.data.get(
        'shipping_address'
    )

    if not shipping_address:

        return Response(
            {
                'detail': 'Shipping address is required.'
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    with transaction.atomic():

        cart = Cart.objects.select_for_update().filter(
            buyer=request.user
        ).first()

        if not cart:

            return Response(
                {
                    'detail': 'Cart is empty.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        cart_items = list(
            CartItem.objects.select_related(
                'product',
                'product__farmer'
            ).filter(
                cart=cart
            )
        )

        if not cart_items:

            return Response(
                {
                    'detail': 'Cart is empty.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        total_amount = Decimal('0.00')

        for item in cart_items:

            product = Product.objects.select_for_update().get(
                pk=item.product.pk
            )

            if not product.is_available:

                return Response(
                    {
                        'detail': (
                            f'{product.name} '
                            f'is no longer available.'
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            if item.quantity > product.quantity:

                return Response(
                    {
                        'detail': (
                            f'Not enough stock for '
                            f'{product.name}. '
                            f'Available: {product.quantity}'
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

        order = Order.objects.create(
            buyer=request.user,
            total_amount=Decimal('0.00'),
            shipping_address=shipping_address,
            status='Pending'
        )

        for item in cart_items:

            product = Product.objects.select_for_update().get(
                pk=item.product.pk
            )

            price = product.price

            subtotal = (
                price * item.quantity
            )

            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=item.quantity,
                price=price,
                subtotal=subtotal
            )

            product.quantity -= item.quantity

            if product.quantity <= 0:

                product.quantity = 0
                product.is_available = False

            product.save(
                update_fields=[
                    'quantity',
                    'is_available',
                    'updated_at'
                ]
            )

            total_amount += subtotal

            farmer = product.farmer

            Notification.objects.create(
                recipient=farmer,
                order=order,
                product=product,
                notification_type='ORDER',
                message=(
                    f'{request.user.username} wants to buy '
                    f'{item.quantity} quantity of '
                    f'{product.name} from you.'
                )
            )

        order.total_amount = total_amount

        order.save(
            update_fields=[
                'total_amount',
                'updated_at'
            ]
        )

        cart_items = CartItem.objects.filter(
            cart=cart
        )

        cart_items.delete()

    serializer = OrderSerializer(
        order
    )

    return Response(
        {
            'message': 'Order placed successfully.',
            'order': serializer.data
        },
        status=status.HTTP_201_CREATED
    )


@api_view(['GET'])
@permission_classes([
    IsAuthenticated
])
def order_list(request):

    if request.user.userprofile.role == 'Buyer':

        orders = Order.objects.filter(
            buyer=request.user
        ).prefetch_related(
            'items__product__farmer'
        ).order_by(
            '-created_at'
        )

    else:

        orders = Order.objects.filter(
            items__product__farmer=request.user
        ).distinct().prefetch_related(
            'items__product__farmer'
        ).order_by(
            '-created_at'
        )

    serializer = OrderSerializer(
        orders,
        many=True
    )

    return Response(
        serializer.data
    )


@api_view(['GET'])
@permission_classes([
    IsAuthenticated
])
def order_detail(request, pk):

    try:

        order = Order.objects.prefetch_related(
            'items__product__farmer'
        ).get(
            pk=pk
        )

    except Order.DoesNotExist:

        return Response(
            {
                'detail': 'Order not found.'
            },
            status=status.HTTP_404_NOT_FOUND
        )

    is_buyer = (
        order.buyer == request.user
    )

    is_farmer = order.items.filter(
        product__farmer=request.user
    ).exists()

    if not is_buyer and not is_farmer:

        return Response(
            {
                'detail': (
                    'You do not have permission '
                    'to view this order.'
                )
            },
            status=status.HTTP_403_FORBIDDEN
        )

    serializer = OrderSerializer(
        order
    )

    return Response(
        serializer.data
    )



@api_view(['PATCH'])
@permission_classes([
    IsAuthenticated
])
def update_order_status(request, pk):

    new_status = request.data.get(
        'status'
    )

    allowed_statuses = [
        'Accepted',
        'Rejected',
        'Processing',
        'Shipped',
        'Delivered',
        'Cancelled',
    ]

    if new_status not in allowed_statuses:

        return Response(
            {
                'detail': (
                    'Invalid status. '
                    f'Allowed values: {allowed_statuses}'
                )
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    try:

        order = Order.objects.prefetch_related(
            'items__product__farmer'
        ).get(
            pk=pk
        )

    except Order.DoesNotExist:

        return Response(
            {
                'detail': 'Order not found.'
            },
            status=status.HTTP_404_NOT_FOUND
        )

    is_buyer = (
        order.buyer == request.user
    )

    is_farmer = order.items.filter(
        product__farmer=request.user
    ).exists()

    if not is_buyer and not is_farmer:

        return Response(
            {
                'detail': (
                    'You do not have permission '
                    'to update this order.'
                )
            },
            status=status.HTTP_403_FORBIDDEN
        )

    # Farmer controls acceptance/rejection
    if is_farmer:

        if new_status not in [
            'Accepted',
            'Rejected'
        ]:

            return Response(
                {
                    'detail': (
                        'Farmer can only '
                        'Accept or Reject a pending order.'
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if order.status != 'Pending':

            return Response(
                {
                    'detail': (
                        'Only pending orders '
                        'can be accepted or rejected.'
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

    # Buyer can only cancel
    if is_buyer:

        if new_status != 'Cancelled':

            return Response(
                {
                    'detail': (
                        'Buyer can only cancel '
                        'an order.'
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if order.status not in [
            'Pending',
            'Accepted'
        ]:

            return Response(
                {
                    'detail': (
                        'This order cannot be cancelled '
                        'at its current stage.'
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

    old_status = order.status

    with transaction.atomic():

        order.status = new_status

        order.save(
            update_fields=[
                'status',
                'updated_at'
            ]
        )

        if is_farmer:

            Notification.objects.create(
                recipient=order.buyer,
                order=order,
                notification_type='STATUS',
                message=(
                    f'Your order #{order.id} '
                    f'has been {new_status.lower()}.'
                )
            )

        elif is_buyer:

            farmer_ids = order.items.values_list(
                'product__farmer_id',
                flat=True
            ).distinct()

            Notification.objects.bulk_create([
                Notification(
                    recipient_id=farmer_id,
                    order=order,
                    notification_type='STATUS',
                    message=(
                        f'Buyer cancelled order '
                        f'#{order.id}.'
                    )
                )
                for farmer_id in farmer_ids
            ])

    return Response({
        'message': 'Order status updated successfully.',
        'order_id': order.id,
        'old_status': old_status,
        'new_status': order.status
    })