// Backend and Database Connectivity Checker
class ConnectivityChecker {
  constructor() {
    this.apiURL = 
      (window.location.hostname.includes("vercel.app") || 
       window.location.hostname.includes("netlify.app") ||
       window.location.hostname.includes("portfolio"))
      ? "https://portfolio-xj76.onrender.com/api"
      : "http://localhost:3000/api";
    
    this.init();
  }

  init() {
    this.createStatusIndicator();
    this.checkConnectivity();
    
    // Check connectivity every 30 seconds
    setInterval(() => this.checkConnectivity(), 30000);
  }

  createStatusIndicator() {
    // Create a floating status indicator
    const statusDiv = document.createElement('div');
    statusDiv.id = 'connectivity-status';
    statusDiv.innerHTML = `
      <div class="status-indicator">
        <div class="status-dot" id="backend-status"></div>
        <span id="status-text">Checking...</span>
      </div>
    `;
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      #connectivity-status {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 999;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 10px 15px;
        border-radius: 25px;
        font-size: 12px;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        transition: all 0.3s ease;
        pointer-events: auto;
      }
      
      .status-indicator {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        transition: all 0.3s ease;
      }
      
      .status-dot.online {
        background: #4CAF50;
        box-shadow: 0 0 10px rgba(76, 175, 80, 0.5);
      }
      
      .status-dot.offline {
        background: #f44336;
        box-shadow: 0 0 10px rgba(244, 67, 54, 0.5);
      }
      
      .status-dot.checking {
        background: #FF9800;
        animation: pulse 1.5s infinite;
      }
      
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      
      #connectivity-status:hover {
        background: rgba(0, 0, 0, 0.9);
        cursor: pointer;
      }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(statusDiv);
    
    // Add click handler to show detailed status
    statusDiv.addEventListener('click', () => this.showDetailedStatus());
  }

  async checkConnectivity() {
    const statusDot = document.getElementById('backend-status');
    const statusText = document.getElementById('status-text');
    
    statusDot.className = 'status-dot checking';
    statusText.textContent = 'Checking...';
    
    try {
      // Check backend health
      const healthCheck = await this.checkBackendHealth();
      
      // Check database connectivity (via projects endpoint)
      const dbCheck = await this.checkDatabaseConnectivity();
      
      // Check email service (via a test call)
      const emailCheck = await this.checkEmailService();
      
      // Update status based on results
      if (healthCheck.success && dbCheck.success) {
        statusDot.className = 'status-dot online';
        statusText.textContent = 'All Systems Online';
      } else {
        statusDot.className = 'status-dot offline';
        statusText.textContent = 'Service Issues';
      }
      
      // Store results for detailed view
      this.lastCheck = {
        timestamp: new Date(),
        backend: healthCheck,
        database: dbCheck,
        email: emailCheck
      };
      
    } catch (error) {
      console.error('Connectivity check failed:', error);
      statusDot.className = 'status-dot offline';
      statusText.textContent = 'Connection Failed';
      
      this.lastCheck = {
        timestamp: new Date(),
        backend: { success: false, error: error.message },
        database: { success: false, error: 'Not checked due to backend failure' },
        email: { success: false, error: 'Not checked due to backend failure' }
      };
    }
  }

  async checkBackendHealth() {
    try {
      const response = await fetch(`${this.apiURL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      return {
        success: true,
        status: response.status,
        message: data.message,
        timestamp: data.timestamp,
        responseTime: Date.now() - performance.now()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        details: 'Backend server is not responding'
      };
    }
  }

  async checkDatabaseConnectivity() {
    try {
      const response = await fetch(`${this.apiURL}/projects`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      return {
        success: data.success,
        projectCount: data.data?.projects?.length || 0,
        message: data.success ? 'Database connected' : 'Database connection failed',
        storageType: data.data?.projects?.length > 0 ? 'Supabase or File' : 'Unknown'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        details: 'Cannot fetch projects from database'
      };
    }
  }

  async checkEmailService() {
    // We can't directly test email without sending one, so we check if the endpoint exists
    try {
      const response = await fetch(`${this.apiURL}/admin/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          message: 'Email service endpoint available',
          configured: data.supabase ? 'Supabase configured' : 'File-based fallback'
        };
      } else {
        return {
          success: false,
          error: 'Admin status endpoint not available'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        details: 'Cannot check email service status'
      };
    }
  }

  showDetailedStatus() {
    if (!this.lastCheck) {
      alert('No connectivity data available yet. Please wait for the first check to complete.');
      return;
    }
    
    const { backend, database, email, timestamp } = this.lastCheck;
    
    const details = `
🔍 CONNECTIVITY STATUS REPORT
Last checked: ${timestamp.toLocaleString()}

🖥️ BACKEND SERVER
Status: ${backend.success ? '✅ Online' : '❌ Offline'}
${backend.success ? 
  `Response Time: ${backend.responseTime?.toFixed(0)}ms
Message: ${backend.message}
Server Time: ${backend.timestamp}` :
  `Error: ${backend.error}
Details: ${backend.details || 'N/A'}`
}

🗄️ DATABASE CONNECTION
Status: ${database.success ? '✅ Connected' : '❌ Disconnected'}
${database.success ?
  `Projects Found: ${database.projectCount}
Storage: ${database.storageType}
Message: ${database.message}` :
  `Error: ${database.error}
Details: ${database.details || 'N/A'}`
}

📧 EMAIL SERVICE
Status: ${email.success ? '✅ Available' : '❌ Unavailable'}
${email.success ?
  `Message: ${email.message}
Configuration: ${email.configured}` :
  `Error: ${email.error}
Details: ${email.details || 'N/A'}`
}

🌐 API ENDPOINT
${this.apiURL}
    `.trim();
    
    // Create a modal for better display
    this.showModal('System Status', details);
  }

  showModal(title, content) {
    // Remove existing modal if any
    const existingModal = document.getElementById('status-modal');
    if (existingModal) {
      existingModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.id = 'status-modal';
    modal.innerHTML = `
      <div class="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <h3>${title}</h3>
            <button class="modal-close">&times;</button>
          </div>
          <div class="modal-body">
            <pre>${content}</pre>
          </div>
          <div class="modal-footer">
            <button class="btn-refresh" onclick="window.connectivityChecker.checkConnectivity()">Refresh Status</button>
          </div>
        </div>
      </div>
    `;
    
    // Add modal styles
    const modalStyle = document.createElement('style');
    modalStyle.textContent = `
      #status-modal .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
      }
      
      #status-modal .modal-content {
        background: #1a1a1a;
        color: #fff;
        border-radius: 10px;
        max-width: 600px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        border: 1px solid #333;
      }
      
      #status-modal .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        border-bottom: 1px solid #333;
      }
      
      #status-modal .modal-header h3 {
        margin: 0;
        color: #4CAF50;
      }
      
      #status-modal .modal-close {
        background: none;
        border: none;
        color: #fff;
        font-size: 24px;
        cursor: pointer;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      #status-modal .modal-body {
        padding: 20px;
      }
      
      #status-modal .modal-body pre {
        background: #2a2a2a;
        padding: 15px;
        border-radius: 5px;
        overflow-x: auto;
        font-family: 'Courier New', monospace;
        font-size: 12px;
        line-height: 1.4;
        margin: 0;
        white-space: pre-wrap;
      }
      
      #status-modal .modal-footer {
        padding: 20px;
        border-top: 1px solid #333;
        text-align: right;
      }
      
      #status-modal .btn-refresh {
        background: #4CAF50;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 14px;
      }
      
      #status-modal .btn-refresh:hover {
        background: #45a049;
      }
    `;
    
    document.head.appendChild(modalStyle);
    document.body.appendChild(modal);
    
    // Add event listeners
    modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
    modal.querySelector('.modal-overlay').addEventListener('click', (e) => {
      if (e.target === modal.querySelector('.modal-overlay')) {
        modal.remove();
      }
    });
  }
}

// Initialize connectivity checker when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.connectivityChecker = new ConnectivityChecker();
});

// Also expose a global function for manual checks
window.checkConnectivity = () => {
  if (window.connectivityChecker) {
    window.connectivityChecker.checkConnectivity();
  }
};

// Additional CSS to fix button interactions
const buttonFixStyle = document.createElement('style');
buttonFixStyle.textContent = `
  /* Ensure buttons and interactive elements are clickable */
  .btn, .link-pill, .social-link, button, input, textarea, select {
    position: relative;
    z-index: 1000 !important;
    pointer-events: auto !important;
  }

  /* Fix form styling */
  #contact-form {
    position: relative;
    z-index: 1001 !important;
  }

  #contact-form input, #contact-form textarea, #contact-form button {
    position: relative;
    z-index: 1002 !important;
    pointer-events: auto !important;
  }
  
  /* Disable problematic animations */
  .btn:hover, button:hover {
    transform: none !important;
  }
  
  /* Ensure contact form button works */
  .contact-form button {
    z-index: 1003 !important;
    pointer-events: auto !important;
  }
`;

document.head.appendChild(buttonFixStyle);