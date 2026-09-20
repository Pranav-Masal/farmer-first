from django.urls import path

from .views import (
    category_create,
    category_list,
    product_detail,
    product_list
)


urlpatterns = [

    path(
        'categories/',
        category_list,
        name='category-list'
    ),

    path(
        'categories/create/',
        category_create,
        name='category-create'
    ),

    path(
        '',
        product_list,
        name='product-list'
    ),

    path(
        '<int:pk>/',
        product_detail,
        name='product-detail'
    ),

]