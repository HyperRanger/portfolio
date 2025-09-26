// API Integration for Portfolio Website
// This file handles dynamic project loading and contact form submission

class PortfolioAPI {
  constructor() {
    // Always use Render backend for API calls in production
    this.apiURL = 
      (window.location.hostname.includes("vercel.app") || window.location.hostname.includes("portfolio"))
      ? "https://portfolio-xj76.onrender.com/api"
      : "http://localhost:3001/api";

    this.init();
  }


  init() {
    this.loadProjects();
    this.setupContactForm();
  }

  // Load projects dynamically from the API
  async loadProjects() {
    try {
      const response = await fetch(`${this.apiURL}/projects`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data.projects) {
        this.renderProjects(data.data.projects);
      } else {
        console.warn('No projects data received');
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      // Fallback: keep existing static projects
      this.showProjectsError();
    }
  }

  // Render projects in the DOM
  renderProjects(projects) {
    const projectsGrid = document.querySelector('#projects .grid');
    if (!projectsGrid) return;

    // Clear existing projects except the first one (GENT - keep as featured)
    const existingProjects = projectsGrid.querySelectorAll('.project');
    existingProjects.forEach((project, index) => {
      if (index > 0) { // Keep the first project (GENT)
        project.remove();
      }
    });

    // Add new projects from API
    projects.forEach((project, index) => {
      if (index === 0) return; // Skip first project to avoid duplicating GENT
      
      const projectElement = this.createProjectElement(project, index);
      projectsGrid.appendChild(projectElement);
    });

    // Reinitialize any animations or effects
    this.reinitializeAnimations();
  }

  // Create a project element
  createProjectElement(project, index) {
    const article = document.createElement('article');
    article.className = `project reveal card-3d ${project.featured ? 'featured' : ''}`;
    article.setAttribute('data-delay', (index + 1) * 150);

    const statusClass = this.getStatusClass(project.liveUrl);
    const statusText = project.liveUrl ? 'Live' : 'In Development';

    article.innerHTML = `
      <div class="project-inner">
        <div class="project-header">
          <span class="project-type">${project.category}</span>
          <span class="project-status ${statusClass}">${statusText}</span>
        </div>
        <div class="thumb-container">
          ${project.image ? 
            `<img src="${project.image}" alt="${project.title}" class="thumb" loading="lazy" decoding="async">` :
            `<div class="project-preview default-preview">
              <div class="project-icon">${this.getCategoryIcon(project.category)}</div>
            </div>`
          }
          <div class="overlay gradient-overlay">
            <h3>${project.title}</h3>
            <div class="project-story">
              <p>${project.description}</p>
            </div>
            <div class="tech-constellation">
              ${project.technologies.map(tech => `<span class="tech-pill">${tech}</span>`).join('')}
            </div>
          </div>
        </div>
        <div class="meta">
          <div class="project-metrics">
            <div class="metric">
              <span class="metric-value">${this.formatDate(project.completedDate)}</span>
              <span class="metric-label">Completed</span>
            </div>
            <div class="metric">
              <span class="metric-value">${project.technologies.length}</span>
              <span class="metric-label">Technologies</span>
            </div>
          </div>
          <div class="links">
            ${project.githubUrl ? 
              `<a href="${project.githubUrl}" class="link-pill" target="_blank" rel="noopener noreferrer">
                <i class="fab fa-github"></i> Code
              </a>` : 
              `<a href="#" class="link-pill disabled" aria-disabled="true">
                <span class="link-icon">🔒</span> Private Repo
              </a>`
            }
            ${project.liveUrl ? 
              `<a href="${project.liveUrl}" class="link-pill primary" target="_blank" rel="noopener noreferrer">
                <i class="fas fa-external-link-alt"></i> Live Demo
              </a>` : 
              `<a href="#" class="link-pill disabled" aria-disabled="true">
                <span class="link-icon">⏳</span> Coming Soon
              </a>`
            }
          </div>
        </div>
      </div>
    `;

    return article;
  }

  // Helper methods
  getStatusClass(liveUrl) {
    return liveUrl ? 'live' : 'development';
  }

  getCategoryIcon(category) {
    const icons = {
      'Full Stack': '🌐',
      'Frontend': '🎨',
      'Backend': '⚙️',
      'Mobile': '📱',
      'Machine Learning': '🤖',
      'Data Visualization': '📊',
      'Game Development': '🎮',
      'AI Hardware': '🧠'
    };
    return icons[category] || '💻';
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.getFullYear();
  }

  // Setup contact form
  setupContactForm() {
    const form = document.getElementById('contact-form');
    const statusElement = document.getElementById('form-status');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleContactSubmission(form, statusElement);
    });
  }

  // Handle contact form submission
  async handleContactSubmission(form, statusElement) {
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;

    try {
      // Update UI to show loading state
      submitButton.textContent = 'Sending...';
      submitButton.disabled = true;
      submitButton.style.opacity = '0.7';
      statusElement.textContent = 'Sending your message...';
      statusElement.className = 'muted loading';

      // Get form data
      const formData = new FormData(form);
      const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        subject: formData.get('subject') || 'Portfolio Contact',
        message: formData.get('message')
      };

      // Validate required fields
      if (!data.name || !data.email || !data.subject || !data.message) {
        throw new Error('Please fill in all required fields.');
      }

      console.log('📧 Sending contact form to backend...');

      // Send to API
      const response = await fetch(`${this.apiURL}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      console.log('📬 Backend response:', result);

      if (result.success) {
        // Success
        statusElement.textContent = '✅ ' + result.message;
        statusElement.className = 'muted success';
        form.reset();
        
        // Show success animation
        this.showSuccessAnimation(form);
        
        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          statusElement.textContent = '';
          statusElement.className = 'muted';
        }, 5000);
      } else {
        // Error from server
        let errorMsg = result.message || 'Failed to send message. Please try again.';
        
        if (result.errors && result.errors.length > 0) {
          const errorMessages = result.errors.map(err => err.msg).join(', ');
          errorMsg = `Validation Error: ${errorMessages}`;
        }
        
        statusElement.textContent = '❌ ' + errorMsg;
        statusElement.className = 'muted error';
        
        // Show detailed error in development
        if (result.error) {
          console.error('Backend error details:', result.error);
        }
      }
    } catch (error) {
      console.error('❌ Contact form error:', error);
      
      let errorMessage = 'Network error. Please check your connection and try again.';
      
      if (error.message.includes('fill in all')) {
        errorMessage = error.message;
      } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = 'Cannot connect to server. Make sure the backend is running.';
      }
      
      statusElement.textContent = '❌ ' + errorMessage;
      statusElement.className = 'muted error';
    } finally {
      // Reset button
      submitButton.textContent = originalButtonText;
      submitButton.disabled = false;
      submitButton.style.opacity = '1';
    }
  }

  // Show success animation
  showSuccessAnimation(form) {
    form.style.transform = 'scale(1.02)';
    form.style.transition = 'transform 0.3s ease';
    
    setTimeout(() => {
      form.style.transform = 'scale(1)';
    }, 300);
  }

  // Show error message for projects loading
  showProjectsError() {
    const projectsSection = document.querySelector('#projects');
    if (!projectsSection) return;

    const errorMessage = document.createElement('div');
    errorMessage.className = 'api-error-message';
    errorMessage.innerHTML = `
      <p style="color: #ff6b6b; text-align: center; margin: 20px 0;">
        <i class="fas fa-exclamation-triangle"></i>
        Unable to load dynamic projects. Showing static content.
      </p>
    `;
    
    const card = projectsSection.querySelector('.card');
    if (card) {
      card.insertBefore(errorMessage, card.querySelector('.projects-3d-carousel'));
    }
  }

  // Reinitialize animations after dynamic content is added
  reinitializeAnimations() {
    // Trigger reveal animations for new elements
    const newElements = document.querySelectorAll('.project.reveal:not(.revealed)');
    
    newElements.forEach((element, index) => {
      setTimeout(() => {
        element.classList.add('revealed');
      }, index * 100);
    });

    // Reinitialize any 3D effects if they exist
    if (window.init3DEffects) {
      window.init3DEffects();
    }
  }
}

// Initialize API integration when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PortfolioAPI();
});

// CSS for the new elements
const style = document.createElement('style');
style.textContent = `
  .project-preview.default-preview {
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    height: 200px;
    border-radius: 8px;
  }

  .project-icon {
    font-size: 3rem;
    opacity: 0.8;
  }

  .muted.success {
    color: #4caf50 !important;
    background: rgba(76, 175, 80, 0.1);
    padding: 0.8rem 1rem;
    border-radius: 8px;
    border: 1px solid rgba(76, 175, 80, 0.3);
    margin-top: 1rem;
    font-weight: 500;
  }

  .muted.error {
    color: #f44336 !important;
    background: rgba(244, 67, 54, 0.1);
    padding: 0.8rem 1rem;
    border-radius: 8px;
    border: 1px solid rgba(244, 67, 54, 0.3);
    margin-top: 1rem;
    font-weight: 500;
  }

  .muted.loading {
    color: #2196f3 !important;
    background: rgba(33, 150, 243, 0.1);
    padding: 0.8rem 1rem;
    border-radius: 8px;
    border: 1px solid rgba(33, 150, 243, 0.3);
    margin-top: 1rem;
    font-weight: 500;
  }

  .api-error-message {
    margin: 1rem 0;
    padding: 1rem;
    background: rgba(255, 107, 107, 0.1);
    border: 1px solid rgba(255, 107, 107, 0.3);
    border-radius: 8px;
  }

  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.7; }
    100% { opacity: 1; }
  }

  .loading {
    animation: pulse 1.5s infinite;
  }

  /* Ensure buttons and interactive elements are clickable */
  .btn, .link-pill, .social-link, button, input, textarea, select {
    position: relative;
    z-index: 100;
    pointer-events: auto;
  }

  /* Fix form styling */
  #contact-form {
    position: relative;
    z-index: 50;
  }

  #contact-form input, #contact-form textarea {
    position: relative;
    z-index: 60;
    pointer-events: auto;
  }
`;

document.head.appendChild(style);
