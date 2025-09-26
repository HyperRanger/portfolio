const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 contact form submissions per hour
  message: 'Too many contact form submissions, please try again later.'
});

app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] // Replace with your actual domain
    : ['http://localhost:3001', 'http://127.0.0.1:5500', 'http://localhost:5500', 'http://localhost:3000'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const ip = req.ip || req.connection.remoteAddress;
  
  console.log(`🌐 ${timestamp} | ${method} ${url} | IP: ${ip}`);
  
  // Log request body for API calls (excluding sensitive data)
  if (req.url.startsWith('/api') && req.method === 'POST') {
    const logBody = { ...req.body };
    if (logBody.message) logBody.message = '[MESSAGE_CONTENT]'; // Hide message content
    console.log(`📝 Request Body:`, logBody);
  }
  
  next();
});

// Routes

// Get all projects
app.get('/api/projects', (req, res) => {
  try {
    console.log('📂 Loading projects from database...');
    const projectsPath = path.join(__dirname, 'data', 'projects.json');
    const projectsData = fs.readFileSync(projectsPath, 'utf8');
    const projects = JSON.parse(projectsData);
    
    console.log(`✅ Successfully loaded ${projects.projects.length} projects`);
    
    res.json({
      success: true,
      data: projects
    });
  } catch (error) {
    console.error('❌ Error reading projects:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load projects'
    });
  }
});

// Contact form endpoint
app.post('/api/contact', 
  contactLimiter,
  [
    body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters')
      .escape(),
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    body('subject')
      .trim()
      .isLength({ min: 5, max: 200 })
      .withMessage('Subject must be between 5 and 200 characters')
      .escape(),
    body('message')
      .trim()
      .isLength({ min: 10, max: 2000 })
      .withMessage('Message must be between 10 and 2000 characters')
      .escape()
  ],
  async (req, res) => {
    try {
      console.log('📧 Processing contact form submission...');
      
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('❌ Validation failed:', errors.array());
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { name, email, subject, message } = req.body;
      console.log(`📝 Contact from: ${name} (${email}) - Subject: ${subject}`);

      // Check if email configuration exists
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error('❌ Email configuration missing! Please set EMAIL_USER and EMAIL_PASS in .env file');
        return res.status(500).json({
          success: false,
          message: 'Email service not configured. Please contact the administrator.'
        });
      }

      console.log('🔧 Creating email transporter...');
      // Create transporter with better error handling
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      // Verify transporter configuration
      console.log('🔍 Verifying email configuration...');
      await transporter.verify();
      console.log('✅ Email configuration verified');

      // Email options
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER, // Send to yourself
        subject: `Portfolio Contact: ${subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
              New Contact Form Submission
            </h2>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Subject:</strong> ${subject}</p>
            </div>
            <div style="background-color: #fff; padding: 20px; border: 1px solid #dee2e6; border-radius: 5px;">
              <h3 style="color: #495057; margin-top: 0;">Message:</h3>
              <p style="line-height: 1.6; color: #6c757d;">${message}</p>
            </div>
            <div style="margin-top: 20px; padding: 15px; background-color: #e9ecef; border-radius: 5px;">
              <p style="margin: 0; font-size: 12px; color: #6c757d;">
                This email was sent from your portfolio contact form at ${new Date().toLocaleString()}.
              </p>
            </div>
          </div>
        `,
        replyTo: email
      };

      // Send email
      console.log('📤 Sending email...');
      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully:', info.messageId);

      res.json({
        success: true,
        message: 'Message sent successfully! Thank you for your inquiry.'
      });

    } catch (error) {
      console.error('❌ Contact form error:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to send message. Please try again later.';
      
      if (error.code === 'EAUTH') {
        errorMessage = 'Email authentication failed. Please check your email configuration.';
        console.error('💡 Tip: Make sure you are using an App Password for Gmail, not your regular password.');
      } else if (error.code === 'ENOTFOUND') {
        errorMessage = 'Network error. Please check your internet connection.';
      }
      
      res.status(500).json({
        success: false,
        message: errorMessage,
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Admin interface (development only)
app.get('/admin', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({
      success: false,
      message: 'Admin interface not available in production'
    });
  }
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Portfolio backend running on port ${PORT}`);
  console.log(`📧 Email enabled: ${!!process.env.EMAIL_USER}`);

});

module.exports = app;
