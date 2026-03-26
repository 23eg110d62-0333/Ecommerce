import mongoose from "mongoose";

/**
 * MongoDB Connection Configuration
 * Establishes connection to MongoDB database
 */

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/ecommerce";

export async function connectDB(): Promise<void> {
  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      // Mongoose connection options
      retryWrites: true,
      w: "majority",
    });

    console.log(`✓ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("✗ MongoDB connection error:", error);
    process.exit(1);
  }
}

/**
 * Disconnect from MongoDB
 * Used for graceful shutdown
 */
export async function disconnectDB(): Promise<void> {
  try {
    await mongoose.disconnect();
    console.log("✓ MongoDB disconnected");
  } catch (error) {
    console.error("✗ MongoDB disconnection error:", error);
    process.exit(1);
  }
}
