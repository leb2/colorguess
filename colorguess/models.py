from django.db import models


class Score(models.Model):
    value = models.IntegerField()
    name = models.CharField(max_length=30)


