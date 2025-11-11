/**
 * PM2 Ecosystem Configuration
 * Production deployment configuration
 */

module.exports = {
  apps: [
    {
      name: 'arrival-backend',
      script: './packages/backend/dist/index.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Restart configuration
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      
      // Memory management
      max_memory_restart: '1G',
      
      // Monitoring
      watch: false,
      ignore_watch: ['node_modules', 'logs'],
      
      // Advanced features
      listen_timeout: 10000,
      kill_timeout: 5000,
    },
  ],

  deploy: {
    production: {
      user: 'deploy',
      host: 'your-server.com',
      ref: 'origin/main',
      repo: 'git@github.com:yourusername/arrival-system.git',
      path: '/var/www/arrival-system',
      'post-deploy': 
        'npm install && ' +
        'npm run build && ' +
        'pm2 reload ecosystem.config.js --env production',
      env: {
        NODE_ENV: 'production'
      }
    },
    
    staging: {
      user: 'deploy',
      host: 'staging-server.com',
      ref: 'origin/develop',
      repo: 'git@github.com:yourusername/arrival-system.git',
      path: '/var/www/arrival-system-staging',
      'post-deploy':
        'npm install && ' +
        'npm run build && ' +
        'pm2 reload ecosystem.config.js --env staging',
      env: {
        NODE_ENV: 'staging',
        PORT: 5001
      }
    }
  }
};

