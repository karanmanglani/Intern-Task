document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('dataModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalDescription = document.getElementById('modalDescription');
    const dataInput = document.getElementById('dataInput');
    const modalSaveButton = document.getElementById('modalSaveButton');
    const modalCloseButton = document.getElementById('modalCloseButton');
    const modalErrorMessage = document.getElementById('modalErrorMessage');
    let currentField = null;
  
    // Open the modal and set up for the given field
    const openModal = (fieldName) => {
      if (!modal || !modalTitle || !modalDescription) {
        console.error('Modal elements not found in the DOM.');
        return;
      }
  
      currentField = fieldName;
      modalTitle.textContent = `Enter your ${fieldName}`;
      modalDescription.textContent = `Please provide your ${fieldName} information for verification.`;
      dataInput.value = ''; // Clear previous input
      modalErrorMessage.textContent = ''; // Clear previous errors
      modal.style.display = 'block';
    };
  
    // Close the modal
    const closeModal = () => {
      if (modal) modal.style.display = 'none';
    };
  
    // Add click events to permission checkboxes
    document.querySelectorAll('.permission-checkbox').forEach((checkbox) => {
      checkbox.addEventListener('change', (e) => {
        const fieldName = e.target.dataset.field;
  
        if (e.target.checked) {
          openModal(fieldName); // Open modal for data input
        } else {
          // Uncheck action: send a delete request
          fetch(`/delete-${fieldName}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          })
            .then((response) => response.json())
            .then((result) => {
              if (result.status === 'success') {
                alert(`${fieldName} removed successfully!`);
              } else {
                alert(`Failed to remove ${fieldName}.`);
              }
            })
            .catch((error) => console.error(`Error removing ${fieldName}:`, error));
        }
      });
    });
  
    // Save the data when the "Save" button is clicked
    modalSaveButton.addEventListener('click', async () => {
      const value = dataInput.value.trim();
  
      // Validate email format if the current field is 'email'
      if (currentField === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          modalErrorMessage.textContent = 'Please enter a valid email address!';
          modalErrorMessage.style.color = 'red';
          return; // Stop form submission
        }
      }
  
      // Prevent empty values
      if (!value) {
        modalErrorMessage.textContent = `Value for ${currentField} cannot be empty!`;
        modalErrorMessage.style.color = 'red';
        return;
      }
  
      try {
        const response = await fetch(`/update-${currentField}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ value }),
        });
  
        const result = await response.json();
  
        if (result.status === 'success') {
          alert(`${currentField} updated successfully!`);
        } else {
          alert(`Failed to update ${currentField}.`);
        }
      } catch (error) {
        console.error(`Error updating ${currentField}:`, error);
      }
  
      closeModal();
    });
  
    // Close modal on clicking the "Close" button
    modalCloseButton.addEventListener('click', closeModal);
  
    // Close modal on clicking outside of it
    window.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  });
  