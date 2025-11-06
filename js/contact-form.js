// Enhanced Contact Form Handler
class ContactFormHandler {
  constructor() {
    this.apiURL = 
      (window.location.hostname.includes("vercel.app") || window.location.hostname.includes("portfolio"))
      ? "https://portfolio-xj76.onrender.com/api"
      : "http://localhost:3000/api";
    
    this.init();
  }

  init() {
    const form = document.getElementById('contact-form');
    const statusElement = document.getElementById('form-status');

    if (!form) {
      console.error('❌ Contact form not found!');
      return;
    }

    if (!statusElement) {
      console.error('❌ Form status element not found!');
      return;
    }

    console.log('✅ Contact form initialized');
    console.log('📡 API URL:', this.apiURL);

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      console.log('📧 Contact form submitted');
      await this.handleSubmission(form, statusElement);
    });

    // Add visual feedback for form interaction
    this.addFormEnhancements(form);
  }

  addFormEnhancements(form) {
    // Add focus effects
    const inputs = form.querySelectorAll('input, textarea');
    inputs.forEach(input => {
      input.addEventListener('focus', () => {
        input.style.borderColor = '#4CAF50';
      });
      
      input.addEventListener('blur', () => {
        input.style.borderColor = '';
      });
    });
  }

  async handleSubmission(form, statusElement) {
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;

    try {
      // Update UI to show loading state
      submitButton.textContent = 'Sending...';
      submitButton.disabled = true;
      submitButton.style.opacity = '0.7';
      
      this.showStatus(statusElement, 'loading', '🔄 Sending your message...');

      // Get form data
      const formData = new FormData(form);
      const data = {
        name: formData.get('name')?.trim(),
        email: formData.get('email')?.trim(),
        subject: formData.get('subject')?.trim(),
        message: formData.get('message')?.trim()
      };

      console.log('📝 Form data:', { ...data, message: '[MESSAGE_CONTENT]' });

      // Validate required fields
      const missingFields = [];
      if (!data.name) missingFields.push('Name');
      if (!data.email) missingFields.push('Email');
      if (!data.subject) missingFields.push('Subject');
      if (!data.message) missingFields.push('Message');

      if (missingFields.length > 0) {
        throw new Error(`Please fill in: ${missingFields.join(', ')}`);
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        throw new Error('Please enter a valid email address');
      }

      console.log('📧 Sending to backend:', this.apiURL + '/contact');

      // Send to API
      const response = await fetch(`${this.apiURL}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      console.log('📬 Response status:', response.status);

      const result = await response.json();
      console.log('📬 Backend response:', result);

      if (response.ok && result.success) {
        // Success
        this.showStatus(statusElement, 'success', '✅ ' + result.message);
        form.reset();
        
        // Show success animation
        this.showSuccessAnimation(form);
        
        // Auto-hide success message after 8 seconds
        setTimeout(() => {
          this.clearStatus(statusElement);
        }, 8000);
        
      } else {
        // Error from server
        let errorMsg = result.message || 'Failed to send message. Please try again.';
        
        if (result.errors && result.errors.length > 0) {
          const errorMessages = result.errors.map(err => err.msg).join(', ');
          errorMsg = `Validation Error: ${errorMessages}`;
        }
        
        this.showStatus(statusElement, 'error', '❌ ' + errorMsg);
        
        // Show detailed error in console
        if (result.error) {
          console.error('Backend error details:', result.error);
        }
      }
    } catch (error) {
      console.error('❌ Contact form error:', error);
      
      let errorMessage = 'Network error. Please check your connection and try again.';
      
      if (error.message.includes('fill in')) {
        errorMessage = error.message;
      } else if (error.message.includes('valid email')) {
        errorMessage = error.message;
      } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = 'Cannot connect to server. Please try again later.';
      }
      
      this.showStatus(statusElement, 'error', '❌ ' + errorMessage);
    } finally {
      // Reset button
      submitButton.textContent = originalButtonText;
      submitButton.disabled = false;
      submitButton.style.opacity = '1';
    }
  }

  showStatus(element, type, message) {
    element.textContent = message;
    element.className = `muted ${type}`;
    
    // Add visual styling
    element.style.display = 'block';
    element.style.marginTop = '1rem';
    element.style.padding = '0.8rem 1rem';
    element.style.borderRadius = '8px';
    element.style.fontWeight = '500';
    
    switch (type) {
      case 'success':
        element.style.color = '#4caf50';
        element.style.background = 'rgba(76, 175, 80, 0.1)';
        element.style.border = '1px solid rgba(76, 175, 80, 0.3)';
        break;
      case 'error':
        element.style.color = '#f44336';
        element.style.background = 'rgba(244, 67, 54, 0.1)';
        element.style.border = '1px solid rgba(244, 67, 54, 0.3)';
        break;
      case 'loading':
        element.style.color = '#2196f3';
        element.style.background = 'rgba(33, 150, 243, 0.1)';
        element.style.border = '1px solid rgba(33, 150, 243, 0.3)';
        break;
    }
  }

  clearStatus(element) {
    element.textContent = '';
    element.className = 'muted';
    element.style.display = 'none';
  }

  showSuccessAnimation(form) {
    form.style.transform = 'scale(1.02)';
    form.style.transition = 'transform 0.3s ease';
    
    setTimeout(() => {
      form.style.transform = 'scale(1)';
    }, 300);
  }
}

// Initialize contact form when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Initializing contact form handler...');
  window.contactFormHandler = new ContactFormHandler();
});

// Expose for debugging
window.testContactForm = () => {
  if (window.contactFormHandler) {
    console.log('Contact form handler is available');
    console.log('API URL:', window.contactFormHandler.apiURL);
  } else {
    console.error('Contact form handler not initialized');
  }
};