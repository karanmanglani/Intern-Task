document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('#loginForm');
    const usernameInput = document.querySelector('#username');
    const passwordInput = document.querySelector('#password');
  
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
  
      const username = usernameInput.value.trim();
      const password = passwordInput.value.trim();
  
      if (!username || !password) {
        alert('Username and password are required!');
        return;
      }
  
      try {
        const response = await fetch('/api/v1/users/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username,
            password
          })
        });
  
        const result = await response.json();
  
        if (result.status === 'success') {
          window.location.href = '/overview'; // Redirect to overview page on success
        } else {
          alert(result.message || 'Login failed! Please try again.');
        }
      } catch (error) {
        console.error('Error during login:', error);
        alert('An error occurred during login. Please try again later.');
      }
    });
  });
  