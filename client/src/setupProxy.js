
// This file sets up a proxy for development server
module.exports = function(app) {
  app.use('/api', 
    require('http-proxy-middleware').createProxyMiddleware({
      target: 'http://127.0.0.1:5001',
      changeOrigin: true,
    })
  );
};
