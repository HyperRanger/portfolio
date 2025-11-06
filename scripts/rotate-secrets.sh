#!/bin/bash

# Script to rotate secrets and deploy to Kubernetes
# Usage: ./rotate-secrets.sh <environment>

set -e

ENV=$1
if [ -z "$ENV" ]; then
    echo "Usage: ./rotate-secrets.sh <environment>"
    exit 1
fi

# Load environment variables
source .env.$ENV

# Generate new secrets
NEW_ADMIN_BOOTSTRAP_SECRET=$(openssl rand -base64 32)
NEW_JWT_SECRET=$(openssl rand -base64 64)

# Update Supabase service role key (manual step required in Supabase dashboard)
echo "Please rotate the Supabase service role key in the Supabase dashboard"
echo "Press enter when done..."
read

# Get new Supabase keys
echo "Enter new Supabase service role key:"
read -s NEW_SUPABASE_SERVICE_ROLE_KEY

# Update Kubernetes secrets
kubectl create secret generic portfolio-secrets \
    --from-literal=SUPABASE_URL=$SUPABASE_URL \
    --from-literal=SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY \
    --from-literal=SUPABASE_SERVICE_ROLE_KEY=$NEW_SUPABASE_SERVICE_ROLE_KEY \
    --from-literal=EMAIL_USER=$EMAIL_USER \
    --from-literal=EMAIL_PASS=$EMAIL_PASS \
    --from-literal=ADMIN_BOOTSTRAP_SECRET=$NEW_ADMIN_BOOTSTRAP_SECRET \
    --from-literal=JWT_SECRET=$NEW_JWT_SECRET \
    -n portfolio \
    --dry-run=client -o yaml | kubectl apply -f -

# Update local .env file
sed -i "s/SUPABASE_SERVICE_ROLE_KEY=.*/SUPABASE_SERVICE_ROLE_KEY=$NEW_SUPABASE_SERVICE_ROLE_KEY/" .env.$ENV
sed -i "s/ADMIN_BOOTSTRAP_SECRET=.*/ADMIN_BOOTSTRAP_SECRET=$NEW_ADMIN_BOOTSTRAP_SECRET/" .env.$ENV
sed -i "s/JWT_SECRET=.*/JWT_SECRET=$NEW_JWT_SECRET/" .env.$ENV

# Restart deployment to pick up new secrets
kubectl rollout restart deployment portfolio-backend -n portfolio

echo "Secrets rotated successfully!"
echo "New ADMIN_BOOTSTRAP_SECRET: $NEW_ADMIN_BOOTSTRAP_SECRET"
echo "Please update your secure password manager with the new secrets"