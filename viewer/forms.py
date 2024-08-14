# viewer/forms.py

from django import forms
from .models import ObjModel


class ObjModelForm(forms.ModelForm):
    class Meta:
        model = ObjModel
        fields = ['name', 'file']  # Use 'file' instead of 'data'
        widgets = {
            'file': forms.ClearableFileInput(attrs={'accept': '.obj'})
        }
