module.exports = {
    apps: [{
        name: 'portfolio',
        script: 'app.js',
        exec_mode: 'cluster',
        instances: 0,
        autorestart: true,
        watch: false,
        max_memory_restart: '5G',
        env: {
            NODE_ENV: 'development',
        },
        env_production: {
            NODE_ENV: 'production',
        },
    }],
};