from django import forms
from .models import Venues,Bookings

class VenueForm(forms.ModelForm):
    class Meta:
        model = Venues
        fields = ['name','category','location','capacity','price']

class BookingForm(forms.ModelForm):
    class Meta:
        model = Bookings
        fields = ['date']