import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Encoded Password Integration for MongoDB Atlas
const password = encodeURIComponent("BpuO7lKQX5vXm7Yg");
const MONGO_URI = process.env.MONGO_URI || `mongodb+srv://abhaypatle2904_db_user:${password}@avanilibrarydb.s36wikw.mongodb.net/?appName=AvaniLibraryDB`;

mongoose.connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB Atlas (AvaniLibraryDB) Successfully!"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

app.use('/api', apiRoutes);

app.listen(PORT, () => {
    console.log(`Avani Library Backend running on port ${PORT}`);
});
