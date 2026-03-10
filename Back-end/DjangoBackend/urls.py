from django.urls import path
from .views import current_user, getuserdata, logout_view

urlpatterns = [
    path("me/", current_user, name="current_user"),
    path("logout/", logout_view, name="logout"),
     path("getuserdata/", getuserdata, name="getuserdata"),
]