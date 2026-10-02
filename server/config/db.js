const mongoose = require('mongoose');

/**
 * Global cache across serverless function invocations.
 * This prevents creating multiple connections when functions are invoked repeatedly.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const FALLBACK_ATLAS_URI =
  'mongodb+srv://msabeehulhasaan2024_db_user:3KmvTYUq1khzEyAz@cluster0.2tsjx3u.mongodb.net/?appName=Cluster0';

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  const isLocalHost = primaryUri && (primaryUri.includes('127.0.0.1') || primaryUri.includes('localhost'));
  const targetUri = primaryUri || FALLBACK_ATLAS_URI;

  // If already connected, return cached connection immediately
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // If connection is in progress, await the existing promise
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: isLocalHost ? 2000 : 8000,
    };

    cached.promise = mongoose
      .connect(targetUri, opts)
      .then((mongooseInstance) => {
        console.log('MongoDB Connected successfully');
        return mongooseInstance;
      })
      .catch(async (error) => {
        // If primary URI (like localhost) fails, fallback to Atlas cloud database
        if (targetUri !== FALLBACK_ATLAS_URI) {
          console.warn(`Could not connect to ${isLocalHost ? 'local MongoDB' : targetUri} (${error.message}). Connecting to Atlas Cloud fallback...`);
          try {
            const fallbackInstance = await mongoose.connect(FALLBACK_ATLAS_URI, {
              bufferCommands: false,
              maxPoolSize: 10,
              serverSelectionTimeoutMS: 8000,
            });
            console.log('MongoDB Connected successfully');
            return fallbackInstance;
          } catch (fallbackError) {
            console.error('MongoDB Atlas connection error:', fallbackError);
            cached.promise = null;
            throw fallbackError;
          }
        }
        console.error('MongoDB connection error:', error);
        cached.promise = null;
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached.conn;
};

module.exports = { connectDB };
