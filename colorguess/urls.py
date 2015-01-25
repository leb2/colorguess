from django.conf.urls import patterns, include, url
from django.contrib import admin
import colorguess

admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^blog/', include('blog.urls')),

    url(r'^$', 'colorguess.views.home', name='home'),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^scores/', 'colorguess.views.scores', name='scores'),
)
