document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('permissionModal');
    const closeModalButton = document.getElementById('closeModal');
    const confirmPreferencesButton = document.getElementById('confirmPreferences');
    const form = document.querySelector('form');
    const usernameInput = document.querySelector('#username');
    const usernameFeedback = document.querySelector('#usernameFeedback');
    const submitButton = document.querySelector('#submitButton');
  
    // Show the modal as soon as the page loads
    modal.style.display = 'block';
  
    // Close the modal when the "Close" button is clicked
    closeModalButton.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  
    // When preferences are confirmed, hide the modal and show the form
    confirmPreferencesButton.addEventListener('click', () => {
      const emailPermission = document.querySelector('#emailToggle').checked;
      const phonePermission = document.querySelector('#phoneToggle').checked;
      const addressPermission = document.querySelector('#addressToggle').checked;
  
      // Add permission data to the form
      const emailField = form.querySelector('#email');
      const phoneField = form.querySelector('#phone');
      const addressField = form.querySelector('#address');
  
      // Disable fields based on permissions
      emailField.disabled = !emailPermission;
      phoneField.disabled = !phonePermission;
      addressField.disabled = !addressPermission;
  
      // Store the selected permissions as hidden fields
      form.insertAdjacentHTML('beforeend', `
        <input type="hidden" name="emailPermission" value="${emailPermission}">
        <input type="hidden" name="phonePermission" value="${phonePermission}">
        <input type="hidden" name="addressPermission" value="${addressPermission}">
      `);
  
      // Hide the modal and scroll to the form
      modal.style.display = 'none';
      window.scrollTo(0, form.offsetTop);
    });
  
    // Check username availability with AJAX request
    usernameInput.addEventListener('input', async () => {
      const username = usernameInput.value;
  
      // Trigger the username check only after 3 characters
      if (username.length >= 3) {
        try {
          console.log('Checking username availability for:', username);  // Log username being checked
  
          const response = await fetch(`/api/v1/users/check-username/${username}`);
          const result = await response.json();
  
          console.log('Username availability response:', result);  // Log response
  
          // Check if the response status is success
          if (result.status === 'success' && result.data.isAvailable === true) {
            usernameFeedback.textContent = 'Username is available!';
            usernameFeedback.style.color = 'green';
            submitButton.disabled = false; // Enable submit button
          } else if (result.data.isAvailable === false) {
            usernameFeedback.textContent = 'Username is already taken!';
            usernameFeedback.style.color = 'red';
            submitButton.disabled = true; // Disable submit button
          } else {
            usernameFeedback.textContent = 'Unexpected error occurred!';
            usernameFeedback.style.color = 'red';
            submitButton.disabled = true; // Disable submit button
          }
        } catch (error) {
          console.error('Error checking username:', error);
          usernameFeedback.textContent = 'Error checking username!';
          usernameFeedback.style.color = 'red';
          submitButton.disabled = true; // Disable submit button on error
  
          // Check for expired token or other errors
          if (error.message.includes('expired')) {
            alert('Your session has expired. Please log in again.');
            window.location.href = '/login';  // Redirect to login page
          }
        }
      } else {
        usernameFeedback.textContent = ''; // Clear feedback if username is too short
        submitButton.disabled = true; // Disable submit button
      }
    });
  
    // Handle form submission
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
  
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
  
      try {
        const response = await fetch('/api/v1/users/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
  
        const result = await response.json();
  
        if (result.status === 'success') {
          // Redirect to overview page after successful signup
          window.location.href = '/overview';  // Redirect to /overview page
        } else {
          // Handle error case (if any)
          alert(result.message || 'Something went wrong!');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('An error occurred during sign-up');
      }
    });
  });
  