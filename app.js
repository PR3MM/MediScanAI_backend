const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('API is running...');
});

// User routes example
const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

// Medication routes
const medicationRoutes = require('./routes/medicationRoutes');
app.use('/api/medications', medicationRoutes);

// Prescription routes
const prescriptionRoutes = require('./routes/prescriptionRoutes');
app.use('/api/prescriptions', prescriptionRoutes);

// Reminder routes
const reminderRoutes = require('./routes/reminderRoutes');
app.use('/api/reminders', reminderRoutes);

// Activity routes
const activityRoutes = require('./routes/activityRoutes');
app.use('/api/activities', activityRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
