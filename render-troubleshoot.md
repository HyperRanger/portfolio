# Render Backend Troubleshooting Guide

## Current Status

- **Backend URL**: https://portfolio-xj76.onrender.com
- **Service ID**: srv-d45vrrf5r7bs73ars6h0
- **Status**: OFFLINE ❌

## Immediate Actions Needed

### 1. Check Render Dashboard

1. Go to https://render.com/dashboard
2. Find your `portfolio-backend` service
3. Check the status:
   - 🟢 **Live** = Service is running
   - 🟡 **Building** = Service is deploying
   - 🔴 **Build Failed** = Deployment failed
   - ⚫ **Suspended** = Service stopped due to error

### 2. Check Service Logs

1. Click on your service in Render dashboard
2. Go to "Logs" tab
3. Look for error messages like:
   - Port binding errors
   - Environment variable issues
   - Docker build failures
   - Application crashes

### 3. Common Issues & Solutions

#### Issue: Service Won't Start

**Symptoms**: Service shows as "Build Failed" or keeps restarting
**Solutions**:

- Check if `PORT` environment variable is set correctly
- Verify Dockerfile is working
- Check if all dependencies are installed

#### Issue: Environment Variables Missing

**Symptoms**: Service starts but APIs fail
**Solutions**:

- Add these environment variables in Render dashboard:
  ```
  NODE_ENV=production
  EMAIL_USER=owolabilekan947@gmail.com
  EMAIL_PASS=qbykmlxetwbbbssy
  SUPABASE_URL=https://oyoawspizwgqmomtcnkf.supabase.co
  SUPABASE_ANON_KEY=[your-key]
  SUPABASE_SERVICE_ROLE_KEY=[your-key]
  ```

#### Issue: Free Tier Limitations

**Symptoms**: Service sleeps after 15 minutes
**Solutions**:

- This is normal for free tier
- Service will wake up when accessed (takes 30-60 seconds)
- Consider upgrading to paid plan for always-on service

### 4. Manual Deployment Steps

1. Go to your service in Render dashboard
2. Click "Manual Deploy"
3. Select "Deploy latest commit"
4. Wait for deployment to complete (5-10 minutes)

### 5. Test After Deployment

Once service is running, test these URLs:

- Health check: https://portfolio-xj76.onrender.com/api/health
- Admin status: https://portfolio-xj76.onrender.com/api/admin/status
- Admin interface: https://portfolio-xj76.onrender.com/admin

## Environment Variables Checklist

Make sure these are set in Render dashboard:

- [ ] `NODE_ENV=production`
- [ ] `EMAIL_USER=owolabilekan947@gmail.com`
- [ ] `EMAIL_PASS=qbykmlxetwbbbssy`
- [ ] `SUPABASE_URL=https://oyoawspizwgqmomtcnkf.supabase.co`
- [ ] `SUPABASE_ANON_KEY=[from your .env file]`
- [ ] `SUPABASE_SERVICE_ROLE_KEY=[from your .env file]`

## Next Steps

1. ✅ Fix CORS (already done)
2. 🔄 Check Render service status
3. 🔄 Add environment variables if missing
4. 🔄 Trigger manual deployment
5. 🔄 Test backend endpoints
6. 🔄 Test contact form and admin panel
