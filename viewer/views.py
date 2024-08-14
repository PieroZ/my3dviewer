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

