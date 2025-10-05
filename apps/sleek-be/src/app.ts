import express from 'express';

const app: import('express').Express = express();

// Middleware
app.use(express.json());

export default app;


