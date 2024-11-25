function showForm(formId) {
    // Hide all forms
    const forms = document.querySelectorAll('.form');
    forms.forEach(form => form.style.display = 'none');

    // Show the selected form
    const selectedForm = document.getElementById(formId);
    selectedForm.style.display = 'block';
}
