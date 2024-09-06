# viewer/views.py

from django.shortcuts import render, redirect
from django.http import JsonResponse
from .forms import ObjModelForm
from .models import ObjModel
import os
from django.conf import settings


def upload_obj(request):
    if request.method == 'POST':
        form = ObjModelForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()  # Save the file directly
            return redirect('viewer:view_objs')
    else:
        form = ObjModelForm()
    return render(request, 'viewer/upload_obj.html', {'form': form})


def view_objs(request):
    objs = ObjModel.objects.all()
    return render(request, 'viewer/view_objs.html', {'objs': objs})


def model_data(request):
    objs = ObjModel.objects.all()
    data = [{'id': obj.id, 'name': obj.name, 'file_url': obj.file.url} for obj in objs]
    return JsonResponse(data, safe=False)


def index(request):
    return render(request, 'viewer/index.html')


def animation_preview(request):
    static_dir = settings.STATICFILES_DIRS[0]  # Get the static directory path
    animations_dir = os.path.join(static_dir, 'animations/')

    # Handle the case where the directory might not exist
    if not os.path.exists(animations_dir):
        return render(request, 'viewer/animation_viewer.html', {'animations': []})

    # Get the top-level categories
    animations = [d for d in os.listdir(animations_dir) if os.path.isdir(os.path.join(animations_dir, d))]

    # Create a dictionary with categories as keys and their subdirectories as values
    animation_models = {}
    for animation in animations:
        sub_dir = os.path.join(animations_dir, animation)
        sub_dirs = [d for d in os.listdir(sub_dir) if os.path.isdir(os.path.join(sub_dir, d))]
        animation_models[animation] = sub_dirs

    # # Example data: You can retrieve this from your database or define it statically
    # categories = ['Technology', 'Science', 'Art', 'Music', 'Literature']
    #
    # # Add the categories to the context dictionary
    # context = {
    #     'categories': categories
    # }


    # print(f"animation_models={animation_models}")
    # print(f"animations={animations}")
    return render(request, 'viewer/animation_viewer.html', {'animations': animations, 'animation_models': animation_models})


def model_dropdown(request):
    if not settings.STATICFILES_DIRS:
        return render(request, 'viewer/dropdown.html', {'models': []})

    static_dir = settings.STATICFILES_DIRS[0]  # Get the static directory path
    models_dir = os.path.join(static_dir, 'models/prototype/')

    # Handle the case where the directory might not exist
    if not os.path.exists(models_dir):
        return render(request, 'viewer/dropdown.html', {'models': []})

    models = [d for d in os.listdir(models_dir) if os.path.isdir(os.path.join(models_dir, d))]

    return render(request, 'viewer/dropdown.html', {'models': models})


def model_view(request):
    selected_model = request.GET.get('model', 'prim150-car')  # Default to 'prim150-car' if not provided

    # Render the page with the selected model
    return render(request, 'viewer/model_view.html', {'selected_model': selected_model})


def get_model_names(request):
    # Get the static directory path from STATICFILES_DIRS
    if not settings.STATICFILES_DIRS:
        return JsonResponse({'models': []})

    static_dir = settings.STATICFILES_DIRS[0]  # Get the static directory path
    models_dir = os.path.join(static_dir, 'models/prototype/')

    # Handle the case where the directory might not exist
    if not os.path.exists(models_dir):
        return JsonResponse({'models': []})

    # List all directories in the models/prototype/ directory
    models = [d for d in os.listdir(models_dir) if os.path.isdir(os.path.join(models_dir, d))]

    return JsonResponse({'models': models})


def model_images(request, model_name):
    model_dir = os.path.join(settings.STATICFILES_DIRS[0], 'models', 'prototype', model_name)
    print('yeyeye')
    if os.path.exists(model_dir):
        png_files = [f for f in os.listdir(model_dir) if f.endswith('.png')]
        print(png_files)
        return JsonResponse({'images': png_files})
    return JsonResponse({'images': []})