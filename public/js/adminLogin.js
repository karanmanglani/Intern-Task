document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    const loginFeedback = document.querySelector('#loginFeedback');
  
    // Handle form submission
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
  
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
  
      try {
        const response = await fetch('/api/v1/admin/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
  
        const result = await response.json();
  
        if (result.status === 'success') {
          // Redirect to admin dashboard after successful login
          window.location.href = '/admin/users';
        } else {
          // Display error message if login fails
          loginFeedback.textContent = result.message || 'Invalid username or password!';
          loginFeedback.style.color = 'red';
        }
      } catch (error) {
        console.error('Error during login:', error);
        loginFeedback.textContent = 'An error occurred during login.';
        loginFeedback.style.color = 'red';
      }
    });
  });
  