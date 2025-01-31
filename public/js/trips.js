document.getElementById('tripForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const tripData = {
        name: document.getElementById('tripName').value.trim(),
        start_date: document.getElementById('startDate').value,
        end_date: document.getElementById('endDate').value
    };

    // Client-side validation
    if (!tripData.name || !tripData.start_date || !tripData.end_date) {
        alert('Please fill all required fields');
        return;
    }

    try {
        const response = await fetch('/trips', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tripData)
        });

        if (response.ok) {
            window.location.reload();
            closeTripModal();
        } else {
            const error = await response.json();
            alert(error.error || 'Failed to create trip');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Network error');
    }
});

document.getElementById('bookingForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
        const response = await fetch(`/trips/<%= trip.id %>/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(Object.fromEntries(formData))
        });
        
        if (response.ok) {
            window.location.reload();
        }
    } catch (error) {
        console.error('Error:', error);
    }
});

// Delete 
let currentTripId = null;

function openEditTripModal(tripId) {
    fetch(`/trips/${tripId}`)
        .then(response => response.json())
        .then(trip => {
            document.getElementById('editTripId').value = trip.id;
            document.getElementById('editTripName').value = trip.name;
            document.getElementById('editStartDate').value = trip.start_date;
            document.getElementById('editEndDate').value = trip.end_date;
            document.getElementById('editTripModal').style.display = 'block';
        });
}

document.getElementById('editTripForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const tripData = {
        name: document.getElementById('editTripName').value,
        start_date: document.getElementById('editStartDate').value,
        end_date: document.getElementById('editEndDate').value
    };

    try {
        const response = await fetch(`/trips/${document.getElementById('editTripId').value}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tripData)
        });

        if (response.ok) {
            window.location.reload();
        }
    } catch (error) {
        console.error('Error:', error);
    }
});

function openDeleteTripModal(tripId) {
    currentTripId = tripId;
    document.getElementById('deleteTripModal').style.display = 'block';
}

function confirmDeleteTrip() {
    fetch(`/trips/${currentTripId}`, { method: 'DELETE' })
        .then(response => {
            if (response.ok) {
                window.location.reload();
            }
        });
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}