# Australia Travel Blog - Deployment Guide

This document outlines the steps needed to deploy the Australia Travel Blog application to a production environment.

## Prerequisites

- Node.js 18.x or later
- PostgreSQL 14.x or later
- A server or cloud provider (such as Vercel, AWS, Digital Ocean, etc.)
- SSL certificate for secure HTTPS connections
- Domain name for your travel blog

## Environment Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/australia-travel-blog.git
   cd australia-travel-blog
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env.production` file in the root directory with the following variables:

   ```
   # Base URL
   NEXT_PUBLIC_BASE_URL=https://yourdomain.com
   
   # Database
   DATABASE_URL=postgresql://username:password@localhost:5432/australia_travel_blog
   
   # Authentication
   NEXTAUTH_URL=https://yourdomain.com
   NEXTAUTH_SECRET=your-auth-secret-key
   
   # Admin credentials
   ADMIN_EMAIL=admin@yourdomain.com
   ADMIN_PASSWORD=your-secure-admin-password
   
   # Google Maps API
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
   
   # Google Analytics
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

4. **Configure Next.js for production**

   Update `next.config.js` to ensure proper production settings:

   ```js
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     reactStrictMode: true,
     images: {
       domains: ['yourdomain.com', 'images.yourdomain.com'],
     },
     // Add any other production-specific settings
   };
   
   module.exports = nextConfig;
   ```

## Database Setup

1. **Create production database**

   ```sql
   CREATE DATABASE australia_travel_blog;
   CREATE USER ausadmin WITH ENCRYPTED PASSWORD 'your-secure-password';
   GRANT ALL PRIVILEGES ON DATABASE australia_travel_blog TO ausadmin;
   ```

2. **Run database migrations**

   ```bash
   # Connect to your production database
   psql -h your-db-host -U ausadmin -d australia_travel_blog -f scripts/db-schema.sql
   psql -h your-db-host -U ausadmin -d australia_travel_blog -f scripts/db-migration.sql
   ```

3. **Set up database backups**

   Configure automated backups using cron jobs:

   ```bash
   # Add to crontab
   # Daily backup at 2 AM
   0 2 * * * pg_dump -Fc -h your-db-host -U ausadmin australia_travel_blog > /path/to/backups/australia_travel_blog_$(date +\%Y\%m\%d).dump
   
   # Keep only last 7 days of backups
   0 3 * * * find /path/to/backups/ -name "australia_travel_blog_*.dump" -mtime +7 -delete
   ```

## Building and Deploying

### Option 1: Vercel Deployment (Recommended)

1. **Install Vercel CLI**

   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**

   ```bash
   vercel login
   ```

3. **Deploy the application**

   ```bash
   vercel --prod
   ```

4. **Configure environment variables in Vercel dashboard**

   Add all the variables from your `.env.production` file to the Vercel project settings.

### Option 2: Traditional Server Deployment

1. **Build the application**

   ```bash
   npm run build
   ```

2. **Set up a process manager (PM2)**

   ```bash
   npm install -g pm2
   
   # Create ecosystem file
   cat > ecosystem.config.js << EOL
   module.exports = {
     apps: [{
       name: 'australia-travel-blog',
       script: 'node_modules/next/dist/bin/next',
       args: 'start',
       instances: 'max',
       autorestart: true,
       watch: false,
       max_memory_restart: '1G',
       env: {
         NODE_ENV: 'production',
       }
     }]
   };
   EOL
   
   # Start the application
   pm2 start ecosystem.config.js
   ```

3. **Set up Nginx as a reverse proxy**

   ```nginx
   server {
     listen 80;
     server_name yourdomain.com www.yourdomain.com;
     
     # Redirect HTTP to HTTPS
     return 301 https://$host$request_uri;
   }
   
   server {
     listen 443 ssl;
     server_name yourdomain.com www.yourdomain.com;
     
     ssl_certificate /path/to/ssl/certificate.crt;
     ssl_certificate_key /path/to/ssl/private.key;
     
     # SSL configuration
     ssl_protocols TLSv1.2 TLSv1.3;
     ssl_prefer_server_ciphers on;
     ssl_ciphers 'ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
     ssl_session_cache shared:SSL:10m;
     
     # Security headers
     add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
     add_header X-Frame-Options SAMEORIGIN;
     add_header X-Content-Type-Options nosniff;
     add_header X-XSS-Protection "1; mode=block";
     
     # Proxy to Next.js app
     location / {
       proxy_pass http://localhost:3000;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
     }
     
     # Serve sitemap.xml directly
     location = /sitemap.xml {
       proxy_pass http://localhost:3000/sitemap.xml;
       proxy_http_version 1.1;
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
     }
     
     # Serve robots.txt directly
     location = /robots.txt {
       proxy_pass http://localhost:3000/robots.txt;
       proxy_http_version 1.1;
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
     }
   }
   ```

## Setting up a CDN

For improved performance, consider setting up a CDN like Cloudflare or AWS CloudFront.

### Cloudflare Setup

1. Sign up for a Cloudflare account
2. Add your domain to Cloudflare
3. Update your domain's nameservers to Cloudflare's nameservers
4. Configure Page Rules for caching static assets

### CDN Configuration

Configure your CDN to cache the following paths:

- `/images/*`
- `/_next/static/*`
- `/static/*`

## Post-Deployment Checklist

1. **Test website functionality**
   - Test navigation and page loading
   - Test user interactions (comments, reviews, favorites)
   - Test admin functionality
   - Test form submissions

2. **Set up monitoring**
   - Configure error logging with a service like Sentry
   - Set up performance monitoring
   - Configure uptime monitoring

3. **SEO verification**
   - Submit sitemap.xml to Google Search Console
   - Verify website ownership in Google Search Console
   - Check for any crawl errors

4. **Performance optimization**
   - Verify that images are properly sized and compressed
   - Check page load speeds using Google PageSpeed Insights
   - Optimize any slow-loading pages

## Backup and Recovery Strategy

### Database Backups

- Daily automated backups as described in the Database Setup section
- Weekly full database dumps stored off-site
- Monthly backups archived to long-term storage

### Recovery Procedure

1. **Database restoration**

   ```bash
   pg_restore -h your-db-host -U ausadmin -d australia_travel_blog backup_file.dump
   ```

2. **Application recovery**

   - Redeploy from the latest stable Git tag
   - Verify environment variables and configurations
   - Test functionality after recovery

## Security Measures

1. **Regular updates**
   - Keep Node.js and npm packages updated
   - Apply security patches promptly

2. **Access controls**
   - Use strong passwords for all accounts
   - Implement IP restrictions for admin access where possible
   - Use environment variables for sensitive information

3. **Data protection**
   - Ensure all user data is properly secured
   - Implement rate limiting for API endpoints
   - Use HTTPS for all connections

## Maintenance

1. **Regular tasks**
   - Review error logs weekly
   - Check database performance monthly
   - Update dependencies quarterly

2. **Content updates**
   - Ensure content is regularly updated
   - Archive outdated content
   - Update SEO metadata as needed

## Troubleshooting

### Common Issues

1. **Database connection errors**
   - Check database credentials
   - Verify network connectivity
   - Check firewall rules

2. **Performance issues**
   - Monitor server resources (CPU, memory)
   - Check database query performance
   - Review external API dependencies

3. **Image loading issues**
   - Verify CDN configuration
   - Check storage permissions
   - Validate image processing pipeline

## Support

For technical support, contact:
- Email: admin@yourdomain.com
- Documentation: /docs/ 