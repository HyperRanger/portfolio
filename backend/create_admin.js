// create_admin.js
// Usage: node create_admin.js
// This script creates an admin user in Supabase using the SUPABASE_SERVICE_ROLE_KEY
// It reads backend/.env for configuration. It will create user with username 'koji'
// and password 'admin4life2' unless overridden via env or args.

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function run() {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in backend/.env');
    process.exit(1);
  }

  const username = process.env.CREATE_ADMIN_USERNAME || 'koji';
  const password = process.env.CREATE_ADMIN_PASSWORD || 'admin4life2';
  // Build an email from username if it isn't an email
  const email = username.includes('@') ? username : `${username}@example.com`;

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    console.log(`Creating admin user ${email} ...`);
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: 'admin', username }
    });
    if (error) {
      // If user already exists, supabase returns error; try to report helpful message
      console.error('Create user error:', error.message || error);
      process.exit(1);
    }
    console.log('Admin user created:', data);
    console.log('You can now sign in at /admin using email:', email);
  } catch (err) {
    console.error('Unexpected error creating admin user:', err.message || err);
    process.exit(1);
  }
}

run();
