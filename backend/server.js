const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Define routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/crops', require('./routes/crop.routes'));
app.use('/api/orders', require('./routes/order.routes'));
app.use('/api/reviews', require('./routes/review.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));

// Default route for API
app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to FarmSync API'
  });
});

// Set up port for the server
const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  }); 