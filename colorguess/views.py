from django.http import HttpResponse
from django.shortcuts import render
from django.core import serializers
from models import *
import json


def home(request):
    return render(request, 'colorguess/index.html')

def scores(request):
    if request.method == 'POST':
        Score(name=request.POST['name'], value=request.POST['value']).save()

    return render(request, 'colorguess/highscores.html', {'highscores': Score.objects.all().order_by('-value')[:11]})

    return HttpResponse(data, content_type='application/json')