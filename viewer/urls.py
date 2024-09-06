from django.urls import path
from . import views

app_name = 'viewer'  # This allows namespacing of URLs, recommended for clarity

urlpatterns = [
    path('upload_obj/', views.upload_obj, name='upload_obj'),
    path('view_objs/', views.view_objs, name='view_objs'),
    path('', views.index, name='index'),
    path('anim/', views.animation_preview, name='animation_preview'),
    path('model-data/<int:obj_id>/', views.model_data, name='model_data'),
    path('model-names/', views.get_model_names, name='model_names'),  # Ensure this line exists
    path('model-images/<str:model_name>/', views.model_images, name='model-images'),
]
