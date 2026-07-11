from rest_framework import serializers
from .models import Venues, Bookings, Payment


class VenueSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Venues
        fields = ['venueID', 'name', 'category', 'location', 'capacity', 'price', 'owner_uid']


class BookingSerializer(serializers.ModelSerializer):
    venue = VenueSerializer(read_only=True)

    class Meta:
        model  = Bookings
        fields = ['bookingID', 'date', 'amount', 'bookingTime', 'user_uid', 'owner_uid', 'venue']


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Payment
        fields = ['paymentID', 'amount', 'method', 'status', 'booking']