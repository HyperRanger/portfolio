// Simple API Debug Script
// Add this to browser console to test API connection

console.log('🔍 API Debug Script');
console.log('Current URL:', window.location.href);
console.log('Hostname:', window.location.hostname);

// Determine API URL
const apiURL = 
  (window.location.hostname.includes("vercel.app") || 
   window.location.hostname.includes("netlify.app") ||
   window.location.hostname.includes("portfolio"))
  ? "https://portfolio-xj76.onrender.com/api"
  : "http://localhost:3000/api";

console.log('🌐 API URL:', apiURL);

// Test backend health
async function testBackend() {
  console.log('🔄 Testing backend health...');
  try {
    const response = await fetch(apiURL + '/health');
    const data = await response.json();
    console.log('✅ Backend response:', data);
    return true;
  } catch (error) {
    console.error('❌ Backend error:', error);
    return false;
  }
}

// Test contact form
async function testContactForm() {
  console.log('🔄 Testing contact form...');
  try {
    const response = await fetch(apiURL + '/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test Message',
        message: 'This is a test message from the debug script.'
      })
    });
    const data = await response.json();
    console.log('📧 Contact form response:', data);
    return data.success;
  } catch (error) {
    console.error('❌ Contact form error:', error);
    return false;
  }
}

// Run tests
window.runAPITests = async function() {
  console.log('🚀 Running API tests...');
  
  const backendOK = await testBackend();
  if (backendOK) {
    console.log('✅ Backend is working');
    const contactOK = await testContactForm();
    if (contactOK) {
      console.log('✅ Contact form is working');
    } else {
      console.log('❌ Contact form failed');
    }
  } else {
    console.log('❌ Backend is not responding');
  }
};

// Auto-run
window.runAPITests();