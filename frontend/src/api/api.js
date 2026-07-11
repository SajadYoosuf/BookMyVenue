const API_BASE = "http://127.0.0.1:8000/api";

function getCookie(name) {
  const match = document.cookie.match(new RegExp(`${name}=([^;]+)`));
  return match ? match[1] : null;
}

export async function signup(email, password, phNo, role) {
  const res = await fetch(`${API_BASE}/signup/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookie('csrftoken')
    },
    credentials: 'include',
    body: JSON.stringify({ email, password, phNo, role })
  });
  return res.json();
}

export async function login(email, password) {
  const res = await fetch(`${API_BASE}/login/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookie('csrftoken')
    },
    credentials: 'include',
    body: JSON.stringify({ email, password })
  });
  return res.json();
}

export async function logout() {
  const res = await fetch(`${API_BASE}/logout/`, {
    method: 'POST',
    headers: { 'X-CSRFToken': getCookie('csrftoken') },
    credentials: 'include'
  });
  return res.json();
}

export async function fetchVenues(filters = {}) {
  const params = new URLSearchParams(filters);
  const res = await fetch(`${API_BASE}/venues/?${params}`, {
    credentials: 'include'
  });
  return res.json();
}

export async function fetchVenueDetail(venueId) {
  const res = await fetch(`${API_BASE}/venues/${venueId}/`, {
    credentials: 'include'
  });
  return res.json();
}

export async function bookVenue(venueId, date) {
  const res = await fetch(`${API_BASE}/venues/${venueId}/book/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookie('csrftoken')
    },
    credentials: 'include',
    body: JSON.stringify({ date })
  });
  return res.json();
}