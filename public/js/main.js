// Function to hide all forms and display the selected one by ID
function showForm(formId) {
  // Hide all forms
  const forms = document.querySelectorAll('.form');
  forms.forEach(form => form.style.display = 'none');

  // Show the selected form
  const selectedForm = document.getElementById(formId);
  selectedForm.style.display = 'block';
}

// Function to toggle the visibility of the sidebar (open/close)
const toggleButton = document.getElementById('toggle-btn');
const sidebar = document.getElementById('sidebar');

function toggleSidebar(){
// Toggle the 'close' class to collapse/expand the sidebar
sidebar.classList.toggle('close');
// Rotate the button's icon when sidebar is closed
toggleButton.classList.toggle('rotate');

// Close any open submenus when the sidebar is toggled
closeAllSubMenus();
}

// Function to toggle the visibility of a submenu under Create or Todo-Lists
function toggleSubMenu(button){
// Close any other open submenus before opening the clicked one
if(!button.nextElementSibling.classList.contains('show')){
  closeAllSubMenus();
}

// Toggle the visibility of the clicked submenu
button.nextElementSibling.classList.toggle('show');
// Rotate the dropdown arrow icon
button.classList.toggle('rotate');

// Collapse the sidebar if it's already in the 'close' state
if(sidebar.classList.contains('close')){
  sidebar.classList.toggle('close');
}
}

// Function to close all submenus
function closeAllSubMenus(){
// Loop through each submenu and remove the 'show' class
Array.from(sidebar.getElementsByClassName('show')).forEach(ul => {
  ul.classList.remove('show');
  ul.previousElementSibling.classList.remove('rotate');
});
}

// Function to set active section
function setActiveSection(sectionId) {
    // Remove 'active' class from all nav items and sections
    document.querySelectorAll('.nav-item').forEach(navItem => {
        navItem.classList.remove('active');
    });
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });

    // Add 'active' class to the corresponding nav item and section
    const navItem = document.querySelector(`.nav-item[data-section="${sectionId}"]`);
    if (navItem) {
        navItem.classList.add('active');
    }
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.add('active');
    }

    // Save the active section to localStorage
    localStorage.setItem('activeSection', sectionId);
}

// Event listeners for each navigation item to toggle between sections
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();  // Prevent default anchor behavior
        const sectionId = item.getAttribute('data-section');
        setActiveSection(sectionId);
    });
});

// Load the active section on page load
document.addEventListener('DOMContentLoaded', () => {
    const activeSection = localStorage.getItem('activeSection');
    if (activeSection) {
        setActiveSection(activeSection);
    } else {
        // Set a default section if none is stored
        setActiveSection('dashboard-section'); // or whichever is your default section
    }
});






function editUser(userId) {
  fetch(`/getUser/${userId}`)
    .then(response => response.json())
    .then(user => {
      // Populate modal form with user data
      document.querySelector('#edit-user-id').value = user.id;
      document.querySelector('#edit-fullname').value = user.fullname;
      document.querySelector('#edit-email').value = user.email;
      document.querySelector('#edit-role').value = user.role;

      // Show modal
      document.querySelector('#edit-modal').classList.add('show');
    });
}

// Get the modal and close button
const modal = document.querySelector('#edit-modal');
const closeButton = document.querySelector('.modal-close');

// Close the modal when the close button is clicked
closeButton.addEventListener('click', () => {
  modal.classList.remove('show');
});

// Close the modal when clicking outside of it
window.addEventListener('click', (event) => {
  if (event.target === modal) {
    modal.classList.remove('show');
  }
});

// Handle form submission
document.querySelector('#edit-user-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  const userId = document.querySelector('#edit-user-id').value;
  const fullname = document.querySelector('#edit-fullname').value;
  const email = document.querySelector('#edit-email').value;
  const role = document.querySelector('#edit-role').value;
  const password = document.querySelector('#edit-password').value;

  // Prepare the data object
  const data = { fullname, email, role };
  if (password.trim() !== '') {
    data.password = password; // Include password only if it's provided
  }

  const response = await fetch(`/editUser/${userId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (response.ok) {
    alert('User updated successfully');
    modal.classList.remove('show');

    // Instead of reloading the entire page, we'll fetch and update just the users list
    const usersSection = document.getElementById('users-section');
    const response = await fetch('/users');
    const usersHtml = await response.text();
    usersSection.innerHTML = usersHtml;
  } else {
    alert('Failed to update user');
  }
});



async function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        try {
            const response = await fetch(`/deleteUser/${userId}`, {
                method: 'POST',
            });

            if (response.ok) {
                // Instead of reloading the entire page, we'll fetch and update just the users list
                const usersSection = document.getElementById('users-section');
                const response = await fetch('/users');
                const usersHtml = await response.text();
                usersSection.innerHTML = usersHtml;
            } else {
                alert('Failed to delete user');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to delete user');
        }
    }
}



