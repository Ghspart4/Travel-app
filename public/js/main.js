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

// Event listeners for each navigation item to toggle between sections
document.querySelectorAll('.nav-item').forEach(item => {
item.addEventListener('click', (e) => {
    e.preventDefault();  // Prevent default anchor behavior

    // Remove 'active' class from all nav items
    document.querySelectorAll('.nav-item').forEach(navItem => {
        navItem.classList.remove('active');
    });
    
    // Add 'active' class to the clicked nav item
    item.classList.add('active');
    
    // Hide all sections and display the section corresponding to the clicked nav item
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Get the section ID from the nav item's data attribute and display it
    const sectionId = item.getAttribute('data-section');
    document.getElementById(sectionId).classList.add('active');
});
});







function editUser(userId) {
  fetch(`/getUser/${userId}`)
    .then(response => response.json())
    .then(user => {
      // Populate modal form with user data
      document.querySelector('#edit-fullname').value = user.fullname;
      document.querySelector('#edit-email').value = user.email;
      document.querySelector('#edit-role').value = user.role;
      document.querySelector('#edit-user-id').value = user.id;

      // Show modal
      document.querySelector('#edit-modal').classList.add('show');
    });
}


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
      window.location.reload();
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
              // Refresh the page to show updated user list
              window.location.reload();
          } else {
              alert('Failed to delete user');
          }
      } catch (error) {
          console.error('Error:', error);
          alert('Failed to delete user');
      }
  }
}


