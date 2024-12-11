document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  const usernameInput = document.querySelector('#username');
  const usernameFeedback = document.querySelector('#usernameFeedback');
  const submitButton = document.querySelector('button[type="submit"]');

  // Check username availability with AJAX request
  usernameInput.addEventListener('input', async () => {
    const username = usernameInput.value;

    // Trigger the username check only after 3 characters
    if (username.length >= 1) {
      try {
        const response = await fetch(`/api/v1/admin/check-username/${username}`);
        const result = await response.json();

        if (result.status === 'success' && result.data.isAvailable) {
          usernameFeedback.textContent = 'Username is available!';
          usernameFeedback.style.color = 'green';
          submitButton.disabled = false; // Enable submit button
        } else {
          usernameFeedback.textContent = 'Username is already taken!';
          usernameFeedback.style.color = 'red';
          submitButton.disabled = true; // Disable submit button
        }
      } catch (error) {
        console.error('Error checking username:', error);
        usernameFeedback.textContent = 'Error checking username!';
        usernameFeedback.style.color = 'red';
        submitButton.disabled = true; // Disable submit button on error
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
      const response = await fetch('/api/v1/admin/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.status === 'success') {
        // Redirect to admin dashboard after successful signup
        window.location.href = '/admin/users';
      } else {
        // Handle error case (e.g., username already exists)
        alert(result.message || 'Something went wrong!');
      }
    } catch (error) {
      console.error('Error during signup:', error);
      alert('An error occurred during sign-up');
    }
  });
});
