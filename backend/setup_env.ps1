# This script helps set up environment variables for Neon PostgreSQL connection

# Instructions:
# 1. Replace the placeholder values with your actual Neon PostgreSQL credentials
# 2. Run this script before starting your Flask server: .\setup_env.ps1

# Main connection URL (preferred method)
$env:DATABASE_URL = "postgresql://Test1_owner:npg_KmGu7QdgREs8@ep-bitter-surf-a81tk9eg-pooler.eastus2.azure.neon.tech/Test1?sslmode=require"

# Alternative individual connection parameters
$env:DB_USER = "Test1_owner"
$env:DB_PASSWORD = "npg_KmGu7QdgREs8@ep"
$env:DB_HOST = "ep-bitter-surf-a81tk9eg-pooler.eastus2.azure.neon.tech"
$env:DB_PORT = "5432"
$env:DB_NAME = "mmm_database"

# For Flask development
$env:FLASK_APP = "app.py"
$env:FLASK_ENV = "development"

Write-Output "Environment variables for Neon PostgreSQL connection have been set."
