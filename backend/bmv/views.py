from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .supabase_client import supabase
from .models import Venues, Bookings
from .serializers import VenueSerializer, BookingSerializer


# ─────────────────────────────────────────
# AUTH VIEWS
# ─────────────────────────────────────────

@api_view(['POST'])
def signup_api(request):
    email    = request.data.get('email')
    password = request.data.get('password')
    phNo     = request.data.get('phNo')
    role     = request.data.get('role')   # 'user' or 'owner', sent from React

    try:
        response = supabase.auth.sign_up({
            "email": email,
            "password": password,
            "options": {
                "data": {
                    "role": role,
                    "phNo": phNo
                }
            }
        })
        return Response(
            {'message': 'Signup successful'},
            status=status.HTTP_201_CREATED
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
def login_api(request):
    email    = request.data.get('email')
    password = request.data.get('password')

    try:
        response = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })

        # store in Django session
        request.session['access_token'] = response.session.access_token
        request.session['user_id']      = response.user.id
        request.session['role']         = response.user.user_metadata.get('role')

        return Response({
            'role'   : request.session['role'],
            'user_id': request.session['user_id'],
            'message': 'Login successful'
        })
    except Exception as e:
        return Response(
            {'error': 'Invalid email or password'},
            status=status.HTTP_401_UNAUTHORIZED
        )


@api_view(['POST'])
def logout_api(request):
    try:
        supabase.auth.sign_out()
        request.session.flush()
        return Response({'message': 'Logged out successfully'})
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


# ─────────────────────────────────────────
# VENUE VIEWS
# ─────────────────────────────────────────

@api_view(['GET'])
def browse_venues_api(request):
    venues    = Venues.objects.all()
    location  = request.GET.get('location')
    category  = request.GET.get('category')
    max_price = request.GET.get('max_price')

    if location:
        venues = venues.filter(location__icontains=location)
    if category:
        venues = venues.filter(category__icontains=category)
    if max_price:
        try:
            venues = venues.filter(price__lte=float(max_price))  
        except ValueError:
            pass
    serializer = VenueSerializer(venues, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def venue_detail_api(request, venue_id):
    venue      = get_object_or_404(Venues, venueID=venue_id)
    serializer = VenueSerializer(venue)
    return Response(serializer.data)


@api_view(['GET'])
def owner_venues_api(request):
    if not request.session.get('access_token'):
        return Response(
            {'error': 'Login required'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    owner_id   = request.session.get('user_id')
    venues     = Venues.objects.filter(owner_uid=owner_id)
    serializer = VenueSerializer(venues, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def add_venue_api(request):
    if not request.session.get('access_token'):
        return Response(
            {'error': 'Login required'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    serializer = VenueSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(owner_uid=request.session.get('user_id'))
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
def edit_venue_api(request, venue_id):
    if not request.session.get('access_token'):
        return Response(
            {'error': 'Login required'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    owner_id   = request.session.get('user_id')
    venue      = get_object_or_404(Venues, venueID=venue_id, owner_uid=owner_id)
    serializer = VenueSerializer(venue, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
def delete_venue_api(request, venue_id):
    if not request.session.get('access_token'):
        return Response(
            {'error': 'Login required'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    owner_id = request.session.get('user_id')
    venue    = get_object_or_404(Venues, venueID=venue_id, owner_uid=owner_id)
    venue.delete()
    return Response({'message': 'Venue deleted'}, status=status.HTTP_204_NO_CONTENT)


# ─────────────────────────────────────────
# BOOKING VIEWS
# ─────────────────────────────────────────

@api_view(['POST'])
def book_venue_api(request, venue_id):
    if not request.session.get('access_token'):
        return Response(
            {'error': 'Login required'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    venue = get_object_or_404(Venues, venueID=venue_id)

    booking = Bookings.objects.create(
        date        = request.data.get('date'),
        amount      = venue.price,
        bookingTime = timezone.now(),
        user_uid    = request.session.get('user_id'),
        owner_uid   = venue.owner_uid,
        venue       = venue
    )

    serializer = BookingSerializer(booking)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def my_bookings_api(request):
    if not request.session.get('access_token'):
        return Response(
            {'error': 'Login required'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    user_id    = request.session.get('user_id')
    bookings   = Bookings.objects.filter(user_uid=user_id).select_related('venue')
    serializer = BookingSerializer(bookings, many=True)
    return Response(serializer.data)