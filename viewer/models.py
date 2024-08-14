# viewer/models.py

from django.db import models


class ObjModel(models.Model):
    name = models.CharField(max_length=255)
    file = models.FileField(upload_to='models/')  # Use FileField for file uploads
