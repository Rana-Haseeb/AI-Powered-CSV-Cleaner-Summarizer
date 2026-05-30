require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const aiRoutes = require('./routes/aiRoutes');

connectDB();

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
].filter(Boolean);

// Matches any *.vercel.app subdomain for this project
const vercelPreviewPattern = /^https:\/\/ai-powered-csv-cleaner-summarizer.*\.vercel\.app$/;

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      // Allow exact matches (localhost + FRONTEND_URL)
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // Allow all Vercel preview & production deployments for this project
      if (vercelPreviewPattern.test(origin)) return callback(null, true);
      callback(new Error(`CORS blocked: origin ${origin} not allowed`));
    },
    credentials: true,
  })
);
app.use(express.json());

// Health check — keeps Render free tier alive via UptimeRobot pings
app.get('/', (req, res) => res.status(200).json({ status: 'ok' }));

app.use('/api', aiRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
