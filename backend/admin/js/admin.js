// admin.js - Main admin interface JavaScript

let supabaseClient = null;
let adminToken = null;

async function initializeAdmin() {
    try {
        const response = await fetch('/api/admin/status');
        const data = await response.json();
        
        if (data.supabase) {
            supabaseClient = createClient(data.supabase.url, data.supabase.anonKey);
        }
        
        // Check if we have a stored session
        const session = JSON.parse(localStorage.getItem('adminSession') || 'null');
        if (session && session.expiresAt && new Date(session.expiresAt) > new Date()) {
            adminToken = localStorage.getItem('adminToken');
            await validateSession();
        } else {
            await signOut();
        }
    } catch (err) {
        console.error('Admin initialization error:', err);
        await signOut();
    }
}

async function signIn(email, password) {
    try {
        let token;
        if (supabaseClient) {
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email,
                password
            });
            if (error) throw error;
            token = data.session.access_token;
            
            // Store session metadata
            localStorage.setItem('adminSession', JSON.stringify({
                expiresAt: new Date(Date.now() + 3600000).toISOString(),
                refreshToken: data.session.refresh_token
            }));
        } else {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: email, password })
            });
            const data = await response.json();
            if (!data.success) throw new Error(data.message);
            token = data.token;
            
            // Store session metadata
            localStorage.setItem('adminSession', JSON.stringify({
                expiresAt: new Date(Date.now() + 3600000).toISOString()
            }));
        }
        
        localStorage.setItem('adminToken', token);
        adminToken = token;
        
        // Schedule auto sign out
        const session = JSON.parse(localStorage.getItem('adminSession'));
        const timeToExpiry = new Date(session.expiresAt) - new Date();
        setTimeout(() => signOut(), Math.max(0, timeToExpiry - 60000)); // Sign out 1 minute before expiry
        
        window.location.href = '/admin/dashboard.html';
    } catch (err) {
        console.error('Sign in error:', err);
        alert('Sign in failed: ' + (err.message || 'Unknown error'));
    }
}

async function signOut() {
    if (supabaseClient) {
        await supabaseClient.auth.signOut();
    }
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminSession');
    adminToken = null;
    window.location.href = '/admin/login.html';
}

async function validateSession() {
    try {
        const response = await fetch('/api/projects', {
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                await signOut();
                return false;
            }
            throw new Error('Session validation failed');
        }
        return true;
    } catch (err) {
        console.error('Session validation error:', err);
        await signOut();
        return false;
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initializeAdmin);