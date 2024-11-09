const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware')

require('dotenv').config();

const authHost = process.env.AUTH_HOST;
const taskHost = process.env.TASK_HOST;

const app = express();
const PORT = process.env.PORT || 4000;

app.use('/api/auth', createProxyMiddleware({ target: authHost, changeOrigin: true }));
app.use('/api/task', createProxyMiddleware({ target: taskHost, changeOrigin: true }));

app.listen(PORT, () => {
    console.log(`API Gateway running on http://localhost:${PORT}`);
});