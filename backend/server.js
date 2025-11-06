const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const { createClient } = require('@supabase/supabase-js');
const jwt = require('express-jwt');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
// Load environment from backend/.env explicitly to avoid cwd issues
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Helper to mask secrets when logging
function maskSecret(value) {
  if (!value) return '(not set)';
  if (value.length <= 10) return value.replace(/.(?=.{2})/g, '*');
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
// Server-side client with service role key (if provided) for secure DB operations
let supabaseAdmin = null;
if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
  supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  console.log('🔒 Supabase admin client initialized');
} else {
  console.log('🔸 No SUPABASE_SERVICE_ROLE_KEY detected - falling back to file-based storage for admin operations');
}

let tempAdminPassword = null; // Store temporary password

// Ensure there's an ADMIN_TOKEN available for protecting admin routes.
// If not provided via environment, generate a temporary one for this process.
if (!process.env.ADMIN_TOKEN) {
  const generated = crypto.randomBytes(24).toString('hex');
  process.env.ADMIN_TOKEN = generated;
  console.log('⚙️ Generated temporary ADMIN_TOKEN (set ADMIN_TOKEN in .env to persist across restarts)');
}

// Log presence of important environment variables (masked)
console.log('🔍 Environment variables:');
console.log(`  SUPABASE_URL=${maskSecret(process.env.SUPABASE_URL)}`);
console.log(`  SUPABASE_ANON_KEY=${maskSecret(process.env.SUPABASE_ANON_KEY)}`);
console.log(`  SUPABASE_SERVICE_ROLE_KEY=${maskSecret(process.env.SUPABASE_SERVICE_ROLE_KEY)}`);

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'https://your-portfolio-url.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  optionsSuccessStatus: 204
};
app.use(cors(corsOptions));

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

// Login limiter: tighter for auth endpoints to slow down brute force
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 login attempts per window
  message: 'Too many login attempts from this IP, please try again later.'
});

app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://portfolio-backend-0mls.onrender.com']  
    : [
        'http://localhost:3001',
        'http://127.0.0.1:3001'
      ],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Handle malformed JSON bodies gracefully (return 400 instead of crashing/500)
app.use((err, req, res, next) => {
  if (err && err.type === 'entity.parse.failed') {
    console.warn('⚠️ Malformed JSON in request body:', err.body || err.message);
    return res.status(400).json({ success: false, message: 'Invalid JSON payload' });
  }
  // Other errors should fall through to the general error handler
  return next(err);
});

// Serve admin static assets from /admin (CSS, JS, images)
app.use('/admin', express.static(path.join(__dirname, 'admin')));

// Serve admin index.html with a per-request nonce and strict CSP allowing only
// the required CDNs and the generated nonce for inline scripts. This keeps
// the admin UI secure while allowing the CDN-hosted libs and inline scripts
// that the admin HTML uses.
app.get(['/admin', '/admin/*'], (req, res) => {
  try {
    const adminPath = path.join(__dirname, 'admin', 'index.html');
    let html = fs.readFileSync(adminPath, 'utf8');

    // Generate a random nonce for this response
    const nonce = crypto.randomBytes(16).toString('base64');

    const supabaseUrl = process.env.SUPABASE_URL || '';

    const cspDirectives = [
      "default-src 'self'",
      // Allow scripts from self, the generated nonce, and the known CDNs we use
      `script-src 'self' 'nonce-${nonce}' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com`,
      // Allow styles from self and the CDNs; inline styles are allowed for convenience
      `style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com`,
      // Allow fetch/XHR to self and Supabase if configured
      (supabaseUrl ? `connect-src 'self' ${supabaseUrl}` : "connect-src 'self'"),
      "img-src 'self' data:",
      // Monaco uses blob: workers
      "worker-src 'self' blob:",
      "object-src 'none'",
      "base-uri 'self'"
    ].join('; ');

    res.setHeader('Content-Security-Policy', cspDirectives);

    // Inject nonce into inline <script> tags that don't already have a src or nonce
    html = html.replace(/<script(?![^>]*\bsrc=)(?![^>]*\bnonce=)([^>]*)>/g, `<script nonce="${nonce}"$1>`);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (err) {
    console.error('Error serving admin UI with CSP nonce', err);
    res.status(500).send('Server error');
  }
});

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
    console.log('📂 Loading projects...');

    // If a Supabase admin client is available, load projects from Supabase
    if (supabaseAdmin) {
      (async () => {
        const { data, error } = await supabaseAdmin.from('projects').select('*').order('id', { ascending: true });
        if (error) {
          console.error('❌ Supabase read error:', error);
          return res.status(500).json({ success: false, message: 'Failed to load projects from database' });
        }
        return res.json({ success: true, data: { projects: data } });
      })();
      return;
    }

    // Fallback: read from local JSON file
    const projectsPath = path.join(__dirname, 'data', 'projects.json');
    const projectsData = fs.readFileSync(projectsPath, 'utf8');
    const projects = JSON.parse(projectsData);

    console.log(`✅ Successfully loaded ${projects.projects.length} projects (file)`);

    res.json({ success: true, data: projects });
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

// Endpoint to get admin status and temp password if available
app.get('/api/admin/status', (req, res) => {
  res.json({
    success: true,
    isInitialized: true,
    username: process.env.ADMIN_USERNAME,
    defaultPassword: 'admin123', // Default password for development
    supabase: process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY ? {
      url: process.env.SUPABASE_URL,
      anonKey: process.env.SUPABASE_ANON_KEY
    } : null
  });
});

// Login endpoint - returns ADMIN_TOKEN on successful authentication
app.post('/api/login', loginLimiter, (req, res) => {
  try {
    const { username, password } = req.body || {};

    const adminUser = process.env.ADMIN_USERNAME || 'admin';
    const adminPass = process.env.ADMIN_PASSWORD || 'admin123';
    const adminToken = process.env.ADMIN_TOKEN; // ensured earlier

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Missing username or password' });
    }

    if (username === adminUser && password === adminPass) {
      // Return the token clients should use for protected admin routes
      return res.json({ success: true, token: adminToken });
    }

    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  } catch (err) {
    console.error('Login error', err);
    return res.status(500).json({ success: false, message: 'Login failed' });
  }
});

// Bootstrap admin user into Supabase (one-time). Requires ADMIN_BOOTSTRAP_SECRET env var.
// This endpoint lets you create the first admin account and set user_metadata.role='admin'.
app.post('/api/admin/bootstrap', loginLimiter, async (req, res) => {
  try {
    if (!process.env.ADMIN_BOOTSTRAP_SECRET) {
      return res.status(403).json({ success: false, message: 'Bootstrap not enabled on this server' });
    }
    const provided = req.headers['x-bootstrap-secret'] || req.body?.bootstrapSecret;
    if (!provided || provided !== process.env.ADMIN_BOOTSTRAP_SECRET) {
      return res.status(401).json({ success: false, message: 'Invalid bootstrap secret' });
    }

    if (!supabaseAdmin) {
      return res.status(500).json({ success: false, message: 'Supabase service key not configured' });
    }

    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ success: false, message: 'Missing email or password' });

    // Check if an admin already exists
    try {
      const { data: users } = await supabaseAdmin.from('projects').select('id').limit(1);
      // Not relying on this for admin detection; proceed to create user if allowed
    } catch (e) {
      // ignore
    }

    // Create user via Supabase Admin API
    try {
      // Use admin endpoint to create user and set metadata
      const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { role: 'admin' }
      });
      if (createErr) {
        console.error('Bootstrap create user error', createErr);
        return res.status(500).json({ success: false, message: createErr.message || 'Failed to create admin user' });
      }
      return res.json({ success: true, data: created });
    } catch (err) {
      console.error('Bootstrap error', err);
      return res.status(500).json({ success: false, message: 'Bootstrap failed' });
    }
  } catch (err) {
    console.error('Bootstrap endpoint error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
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

// --- Admin API: protected endpoints to manage projects (token-based) ---
// Use ADMIN_TOKEN in environment (.env) to protect these routes.
async function requireAdmin(req, res, next) {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Missing or invalid authorization header' });
    }
    const token = auth.split(' ')[1];

    // If we have a Supabase admin client, validate the JWT with Supabase
    if (supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin.auth.getUser(token);
        if (error || !data || !data.user) {
          console.warn('Admin auth: invalid supabase token', error || 'no user');
          return res.status(401).json({ success: false, message: 'Invalid token' });
        }
        const user = data.user;

        // If ADMIN_EMAIL is configured, require the authenticated user's email to match it
        if (process.env.ADMIN_EMAIL) {
          if (!user.email || user.email.toLowerCase() !== process.env.ADMIN_EMAIL.toLowerCase()) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
          }
        } else {
          // Otherwise, check user metadata for an admin role flag
          const role = user.user_metadata?.role || user.app_metadata?.role;
          if (!role || role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Forbidden' });
          }
        }

        // attach user info to the request
        req.user = user;
        return next();
      } catch (e) {
        console.error('Supabase admin token verification error', e);
        return res.status(500).json({ success: false, message: 'Auth verification failed' });
      }
    }

    // Fallback: legacy ADMIN_TOKEN match
    if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    return next();
  } catch (err) {
    console.error('Admin auth error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

// Replace entire projects.json (accepts { projects: [...] } or an array)
app.put('/api/admin/projects', requireAdmin, (req, res) => {
  try {
    const body = req.body;
    const normalized = Array.isArray(body) ? { projects: body } : body;
    if (!normalized || !Array.isArray(normalized.projects)) {
      return res.status(400).json({ success: false, message: 'Invalid payload: expected { projects: [ ... ] } or an array' });
    }
    // If Supabase admin client exists, replace projects in DB
    if (supabaseAdmin) {
      (async () => {
        try {
          // Strategy: delete all existing rows then insert the provided list
          await supabaseAdmin.from('projects').delete().neq('id', -1);
          const { data, error } = await supabaseAdmin.from('projects').insert(normalized.projects).select();
          if (error) {
            console.error('❌ Supabase replace error:', error);
            return res.status(500).json({ success: false, message: 'Failed to replace projects in database' });
          }
          console.log('🔁 Admin replaced projects in Supabase');
          return res.json({ success: true, message: 'Projects updated', data });
        } catch (e) {
          console.error('❌ Supabase transaction error:', e);
          return res.status(500).json({ success: false, message: 'Failed to replace projects' });
        }
      })();
      return;
    }

    const projectsPath = path.join(__dirname, 'data', 'projects.json');
    fs.writeFileSync(projectsPath, JSON.stringify(normalized, null, 2), 'utf8');
    console.log('🔁 Admin replaced projects.json');
    return res.json({ success: true, message: 'Projects updated' });
  } catch (err) {
    console.error('❌ Failed to replace projects:', err);
    return res.status(500).json({ success: false, message: 'Failed to update projects' });
  }
});

// Add a single project object (server assigns id if missing)
app.post('/api/admin/project', requireAdmin, async (req, res) => {
  try {
    const newProj = req.body;
    if (!newProj || !newProj.title) {
      return res.status(400).json({ success: false, message: 'Invalid project payload' });
    }

    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from('projects').insert(newProj).select().single();
      if (error) {
        console.error('❌ Supabase insert error:', error);
        return res.status(500).json({ success: false, message: 'Failed to add project to database' });
      }
      console.log('➕ Admin added project id=', data.id);
      return res.json({ success: true, data });
    }

    // Fallback to file storage
    const projectsPath = path.join(__dirname, 'data', 'projects.json');
    const raw = fs.readFileSync(projectsPath, 'utf8');
    const data = JSON.parse(raw);
    const ids = data.projects.map(p => Number(p.id) || 0);
    const nextId = ids.length ? Math.max(...ids) + 1 : 1;
    newProj.id = newProj.id || nextId;
    data.projects.push(newProj);
    fs.writeFileSync(projectsPath, JSON.stringify(data, null, 2), 'utf8');
    console.log('➕ Admin added project id=', newProj.id);
    return res.json({ success: true, data: newProj });
  } catch (err) {
    console.error('❌ Failed to add project:', err);
    return res.status(500).json({ success: false, message: 'Failed to add project' });
  }
});

// Update a project by id
app.put('/api/admin/project/:id', requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const updated = req.body;

    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from('projects').update(updated).eq('id', id).select().single();
      if (error) {
        console.error('❌ Supabase update error:', error);
        return res.status(500).json({ success: false, message: 'Failed to update project in database' });
      }
      console.log('✏️ Admin updated project id=', id);
      return res.json({ success: true, data });
    }

    const projectsPath = path.join(__dirname, 'data', 'projects.json');
    const raw = fs.readFileSync(projectsPath, 'utf8');
    const data = JSON.parse(raw);
    const idx = data.projects.findIndex(p => Number(p.id) === id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Project not found' });
    data.projects[idx] = { ...data.projects[idx], ...updated, id };
    fs.writeFileSync(projectsPath, JSON.stringify(data, null, 2), 'utf8');
    console.log('✏️ Admin updated project id=', id);
    return res.json({ success: true, data: data.projects[idx] });
  } catch (err) {
    console.error('❌ Failed to update project:', err);
    return res.status(500).json({ success: false, message: 'Failed to update project' });
  }
});

// Delete a project by id
app.delete('/api/admin/project/:id', requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from('projects').delete().eq('id', id).select();
      if (error) {
        console.error('❌ Supabase delete error:', error);
        return res.status(500).json({ success: false, message: 'Failed to delete project from database' });
      }
      console.log('🗑️ Admin deleted project id=', id);
      return res.json({ success: true, data });
    }

    const projectsPath = path.join(__dirname, 'data', 'projects.json');
    const raw = fs.readFileSync(projectsPath, 'utf8');
    const data = JSON.parse(raw);
    const idx = data.projects.findIndex(p => Number(p.id) === id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Project not found' });
    const removed = data.projects.splice(idx, 1)[0];
    fs.writeFileSync(projectsPath, JSON.stringify(data, null, 2), 'utf8');
    console.log('🗑️ Admin deleted project id=', id);
    return res.json({ success: true, data: removed });
  } catch (err) {
    console.error('❌ Failed to delete project:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete project' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Start server with explicit error handling to catch EADDRINUSE
const server = app.listen(PORT, () => {
  console.log(`🚀 Portfolio backend running on port ${PORT}`);
  console.log(`📧 Email enabled: ${!!process.env.EMAIL_USER}`);
});

server.on('error', (err) => {
  if (err && err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Another process is listening on this port.`);
    console.error('Tip: run the following in PowerShell to find and stop the process:');
    console.error(`  netstat -ano | findstr ":${PORT}"`);
    console.error(`  taskkill /PID <pid> /F`);
    process.exit(1);
  }
  console.error('Server error:', err);
  process.exit(1);
});

module.exports = app;
