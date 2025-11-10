// index.js
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const dotenv = require('dotenv');
const aiRoutes = require('./routes/AiRoutes');
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in your .env file');
  process.exit(1);
}

// Middleware
app.use(cors());
app.use(morgan('tiny'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Basic route
app.get('/', (req, res) => {
  res.send('API is working 🚀');
});

// Routes
app.use('/api/ai', aiRoutes);
app.use('/api/auth', authRoutes);

// Error Handler
app.use(errorHandler);

// Database Connection
mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ DB Connected Successfully');

    const db = mongoose.connection.db;

    // Ensure 'Test' collection exists
    const collections = await db.listCollections({ name: 'Test' }).toArray();
    if (collections.length === 0) {
      await db.createCollection('Test');
      console.log('✅ Test collection created!');
    }

    // Insert a test document if not already present
    const testSchema = new mongoose.Schema({ name: String });
    const Test = mongoose.model('Test', testSchema);

    const doc = await Test.findOne({ name: 'DB test' });
    if (!doc) {
      await new Test({ name: 'DB test' }).save();
      console.log('✅ Test document saved, Trend database created!');
    }

    app.listen(PORT, () => {
      console.log(`✅ Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ Error connecting to database');
    console.error(error);
  });



//   OPENAI_API_KEY=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
// SITE_URL=http://localhost:3000
// SITE_NAME=MyApp

// GEMINI_API_KEY=your_gemini_api_key_here
// PORT=4000
// MONGODB_URI=mongodb+srv://pixlyte2:PixlyteE2@cluster0.0wg67bc.mongodb.net/Trend

// JWT_SECRET=super_secret_trendsmart_key
// TOKEN_EXPIRE=30d
