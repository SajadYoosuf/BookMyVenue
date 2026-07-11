from django.urls import path
from . import views

urlpatterns = [
    # Auth
    path('api/signup/', views.signup_api,  name='signup_api'),
    path('api/login/',  views.login_api,   name='login_api'),
    path('api/logout/', views.logout_api,  name='logout_api'),

    # Venues — public
    path('api/venues/',                       views.browse_venues_api, name='browse_venues_api'),
    path('api/venues/<int:venue_id>/',         views.venue_detail_api,  name='venue_detail_api'),

    # Venues — owner only
    path('api/venues/my/',                    views.owner_venues_api,  name='owner_venues_api'),
    path('api/venues/add/',                   views.add_venue_api,     name='add_venue_api'),
    path('api/venues/<int:venue_id>/edit/',   views.edit_venue_api,    name='edit_venue_api'),
    path('api/venues/<int:venue_id>/delete/', views.delete_venue_api,  name='delete_venue_api'),

    # Bookings
    path('api/venues/<int:venue_id>/book/',   views.book_venue_api,    name='book_venue_api'),
    path('api/bookings/my/',                  views.my_bookings_api,   name='my_bookings_api'),
]