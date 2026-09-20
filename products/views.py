from django.db.models import Q

from rest_framework import status
from rest_framework.decorators import (
    api_view,
    permission_classes
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts.permissions import IsFarmer

from .models import Category, Product
from .serializers import (
    CategorySerializer,
    ProductSerializer
)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def category_list(request):

    categories = Category.objects.all().order_by('name')

    serializer = CategorySerializer(
        categories,
        many=True
    )

    return Response(
        serializer.data
    )


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsFarmer])
def category_create(request):

    serializer = CategorySerializer(
        data=request.data
    )

    if serializer.is_valid():

        serializer.save()

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )




@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def product_list(request):

    # =========================
    # GET PRODUCTS
    # =========================

    if request.method == 'GET':

        products = Product.objects.select_related(
            'farmer',
            'category'
        ).filter(
            is_available=True
        )

        search = request.GET.get('search')
        category = request.GET.get('category')
        min_price = request.GET.get('min_price')
        max_price = request.GET.get('max_price')
        farmer = request.GET.get('farmer')

        if search:
            products = products.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search)
            )

        if category:
            products = products.filter(
                category_id=category
            )

        if min_price:
            products = products.filter(
                price__gte=min_price
            )

        if max_price:
            products = products.filter(
                price__lte=max_price
            )

        if farmer:
            products = products.filter(
                farmer_id=farmer
            )

        # =========================
        # PAGINATION
        # =========================

        products = products.order_by('-created_at')

        page = request.GET.get('page', 1)

        try:
            page = int(page)
        except (TypeError, ValueError):
            page = 1

        if page < 1:
            page = 1

        page_size = 6

        start = (page - 1) * page_size
        end = start + page_size

        total_products = products.count()

        paginated_products = products[start:end]

        serializer = ProductSerializer(
            paginated_products,
            many=True
        )

        total_pages = (
            (total_products + page_size - 1)
            // page_size
        )

        return Response({
            'count': total_products,
            'page': page,
            'page_size': page_size,
            'total_pages': total_pages,
            'next': (
                page + 1
                if page < total_pages
                else None
            ),
            'previous': (
                page - 1
                if page > 1
                else None
            ),
            'results': serializer.data
        })

    # =========================
    # POST PRODUCT
    # ONLY FARMER
    # =========================

    if request.method == 'POST':

        if not hasattr(request.user, 'userprofile'):

            return Response(
                {
                    'detail': 'User profile not found.'
                },
                status=status.HTTP_403_FORBIDDEN
            )

        if request.user.userprofile.role != 'Farmer':

            return Response(
                {
                    'detail': 'Only farmers can create products.'
                },
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = ProductSerializer(
            data=request.data
        )

        if serializer.is_valid():

            product = serializer.save(
                farmer=request.user
            )

            return Response(
                ProductSerializer(product).data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )





@api_view([
    'GET',
    'PUT',
    'PATCH',
    'DELETE'
])
@permission_classes([IsAuthenticated])
def product_detail(
    request,
    pk
):

    try:

        product = Product.objects.select_related(
            'farmer',
            'category'
        ).get(
            pk=pk
        )

    except Product.DoesNotExist:

        return Response(
            {
                'detail': 'Product not found.'
            },
            status=status.HTTP_404_NOT_FOUND
        )

    if request.method == 'GET':

        serializer = ProductSerializer(
            product
        )

        return Response(
            serializer.data
        )

    if request.user != product.farmer:

        return Response(
            {
                'detail': (
                    'You can only modify '
                    'your own products.'
                )
            },
            status=status.HTTP_403_FORBIDDEN
        )

    if request.method in ['PUT', 'PATCH']:

        serializer = ProductSerializer(
            product,
            data=request.data,
            partial=request.method == 'PATCH'
        )

        if serializer.is_valid():

            serializer.save(
                farmer=product.farmer
            )

            return Response(
                serializer.data
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    if request.method == 'DELETE':

        product.delete()

        return Response(
            {
                'message': 'Product deleted successfully.'
            },
            status=status.HTTP_204_NO_CONTENT
        )