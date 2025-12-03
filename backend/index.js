// // index.js
// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const bodyParser = require('body-parser');
// const connectDB = require('./config/db');

// const authRoutes = require('./routes/auth');
// const workflowRoutes = require('./routes/workflows');
// const executorRoutes = require('./routes/executor');
// const webhookRoutes = require('./routes/webhook');
// const executionHistoryRoutes = require('./routes/executionHistory');
// const aiRoutes = require('./routes/ai');


// const app = express();
// const PORT = process.env.PORT || 5000;

// // ✅ UPDATED: Proper CORS configuration for frontend
// const corsOptions = {
//   origin: process.env.FRONTEND_URL || 'http://localhost:5173',
//   credentials: true,
//   optionsSuccessStatus: 200
// };

// app.use(cors(corsOptions));
// app.use(bodyParser.json({ limit: '5mb' }));
// app.use(bodyParser.urlencoded({ extended: true }));

// // connect DB
// connectDB();

// // routes
// app.use('/api/auth', authRoutes);
// app.use('/api/workflows', workflowRoutes);
// app.use('/api/execute', executorRoutes);
// app.use('/api/webhooks', webhookRoutes);
// app.use('/api/ai', aiRoutes);
// app.use(executionHistoryRoutes);
// // health
// app.get('/health', (req, res) => res.json({ ok: true, time: new Date() }));

// // error handler
// app.use((err, req, res, next) => {
//   console.error(err.stack || err);
//   res.status(err.status || 500).json({ error: err.message || 'Server error' });
// });

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
//   console.log(`CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
// });



require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const workflowRoutes = require('./routes/workflows');
const executorRoutes = require('./routes/executor');
const webhookRoutes = require('./routes/webhook');
const executionHistoryRoutes = require('./routes/executionHistory');
const aiRoutes = require('./routes/ai');

// ✨ NEW: Scheduler imports
const scheduler = require('./services/scheduler');
const scheduleRoutes = require('./routes/schedule');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to DB and THEN initialize scheduler
connectDB()
  .then(() => {
    console.log('Database connected successfully');
    
    // THIS IS CRITICAL: Start scheduler only after DB is ready
    scheduler.initialize();
  })
  .catch(err => {
    console.error('Database connection failed:', err);
    process.exit(1);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/execute', executorRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/schedule', scheduleRoutes);        // NEW: Schedule API
app.use(executionHistoryRoutes);

// Health check
app.get('/health', (req, res) => res.json({ ok: true, time: new Date() }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack || err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

// Graceful shutdown (Ctrl+C)
process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...');
  scheduler.shutdown();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nSIGTERM received. Shutting down...');
  scheduler.shutdown();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});