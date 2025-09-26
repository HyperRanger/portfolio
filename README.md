# 🚀 Portfolio Website with Dynamic Backend

A modern, interactive portfolio website featuring a Node.js backend for dynamic project management and contact form functionality.

## ✨ Features

### Frontend
- **Responsive Design**: Beautiful, modern UI that works on all devices
- **3D Effects**: Interactive 3D animations and hover effects
- **Dynamic Project Loading**: Projects loaded dynamically from backend API
- **Interactive Skills Constellation**: 3D visualization of skills and technologies
- **Animated Timeline**: Journey through development milestones
- **Contact Form**: Secure contact form with real-time validation

### Backend
- **RESTful API**: Clean API endpoints for projects and contact form
- **Email Integration**: Automated email sending for contact form submissions
- **Security Features**: Rate limiting, input validation, and security headers
- **Dynamic Project Management**: Easy project management through JSON configuration
- **Error Handling**: Comprehensive error handling and logging

## 🛠️ Technology Stack

### Frontend
- HTML5, CSS3, JavaScript (ES6+)
- Three.js for 3D graphics
- Font Awesome for icons
- Google Fonts (Inter & Poppins)

### Backend
- Node.js with Express.js
- Nodemailer for email functionality
- Express Rate Limit for security
- Express Validator for input validation
- Helmet for security headers
- CORS for cross-origin requests

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- A Gmail account (for email functionality)

### Setup Instructions

1. **Clone or navigate to the project directory**
   ```bash
   cd portfolio
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Configure environment variables**
   
   Edit the `.env` file in the `backend` directory:
   ```env
   # Server Configuration
   PORT=3001
   NODE_ENV=development

   # Email Configuration
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

   **Important**: For Gmail, you need to:
   - Enable 2-factor authentication on your Gmail account
   - Generate an "App Password" for this application
   - Use your Gmail address and the app password in the .env file

4. **Customize your projects**
   
   Edit `backend/data/projects.json` to add your own projects:
   ```json
   {
     "projects": [
       {
         "id": 1,
         "title": "Your Project Title",
         "description": "Project description...",
         "image": "assets/project-image.jpg",
         "technologies": ["React", "Node.js", "MongoDB"],
         "category": "Full Stack",
         "featured": true,
         "githubUrl": "https://github.com/yourusername/project",
         "liveUrl": "https://your-project.com",
         "completedDate": "2024-01-15"
       }
     ]
   }
   ```

5. **Start the development server**
   ```bash
   npm run dev
   # or for production
   npm start
   ```

6. **Access your portfolio**
   Open your browser and go to: `http://localhost:3001`

## 🚀 Deployment

### Option 1: Traditional Hosting (VPS, AWS, etc.)

1. **Prepare for production**
   ```bash
   cd backend
   npm install --production
   ```

2. **Set environment variables**
   ```bash
   export NODE_ENV=production
   export PORT=3001
   export EMAIL_USER=your-email@gmail.com
   export EMAIL_PASS=your-app-password
   ```

3. **Start the server**
   ```bash
   npm start
   ```

### Option 2: Platform as a Service (Heroku, Railway, etc.)

1. **Create a `Procfile` in the backend directory**
   ```
   web: node server.js
   ```

2. **Set environment variables** in your platform's dashboard

3. **Deploy** using your platform's deployment process

## 📁 Project Structure

```
portfolio/
├── backend/                 # Backend API server
│   ├── data/
│   │   └── projects.json   # Project data
│   ├── .env                # Environment variables
│   ├── package.json        # Backend dependencies
│   └── server.js           # Main server file
├── assets/                 # Images and static assets
├── css/                    # Stylesheets
├── js/                     # JavaScript files
│   ├── main.js            # Main frontend logic
│   ├── 3d-features.js     # 3D effects
│   ├── enhanced-background.js
│   ├── interactive-effects.js
│   └── api-integration.js  # API integration
├── index.html             # Main HTML file
└── README.md              # This file
```

## 🔧 API Endpoints

### GET /api/projects
Returns all projects in JSON format.

**Response:**
```json
{
  "success": true,
  "data": {
    "projects": [...]
  }
}
```

### POST /api/contact
Handles contact form submissions.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Hello",
  "message": "Your message here"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message sent successfully!"
}
```

### GET /api/health
Health check endpoint.

## 🎨 Customization

### Adding New Projects
1. Edit `backend/data/projects.json`
2. Add your project object with all required fields
3. Restart the server
4. The frontend will automatically load the new project

### Styling
- Main styles: `css/style.css`
- 3D effects: `css/3d-enhancements.css`

### Email Templates
The email template can be customized in `backend/server.js` in the contact form handler.

## 🔒 Security Features

- **Rate Limiting**: Prevents spam and abuse
- **Input Validation**: Validates and sanitizes all inputs
- **Security Headers**: Helmet.js adds security headers
- **CORS Protection**: Configured for specific origins
- **Environment Variables**: Sensitive data stored securely

## 🐛 Troubleshooting

### Common Issues

1. **Email not sending**
   - Check Gmail app password setup
   - Verify .env file configuration
   - Check server logs for errors

2. **Projects not loading**
   - Verify backend server is running
   - Check browser console for errors
   - Ensure projects.json is valid JSON

3. **Port already in use**
   - Change PORT in .env file
   - Kill existing processes on port 3001

### Logs
Check server logs for detailed error information:
```bash
cd backend
npm run dev
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

If you have any questions or need help with setup, please open an issue or contact me at owolabilekan947@gmail.com.

---

**Made with ❤️ and cosmic code** ✨
