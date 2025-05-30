import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`mongodb connection: ${conn.connection.host}`);
  } catch (error) {
    console.error(`mongodb connection error: ${error}`);
  }
};
