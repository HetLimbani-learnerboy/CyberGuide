from django.urls import path
from .views import current_user, getuserdata, logout_view, get_notes, add_note, delete_note, update_note, get_pdfs,get_labpdfs


urlpatterns = [
    path("me/", current_user, name="current_user"),
    path("logout/", logout_view, name="logout"),
    path("getuserdata/", getuserdata, name="getuserdata"),
    path("getnotes/<str:email>/", get_notes),
    path("addnote/", add_note),
    path("deletenote/<int:note_id>/", delete_note),
    path("updatenote/<int:note_id>/", update_note),
    path("getpdfs/", get_pdfs), 
    path('getlabpdfs/',get_labpdfs)
]