import mongoose from "mongoose";

export const connectToDB = async () => {
    console.log("\x1b[32mConnecting to MongoDB\x1b[0m");

    // Check if MONGODB_URI exists
    if (!process.env.MONGODB_URI) {
        const errorMsg = "MONGODB_URI environment variable is not defined";
        console.log("\x1b[31m" + errorMsg + "\x1b[0m");
        throw new Error(errorMsg);
    }

    try {
        // If already connected, return early
        if (mongoose.connection.readyState === 1) {
            console.log("\x1b[32mAlready connected to MongoDB\x1b[0m");
            return true;
        }

        await mongoose.connect(process.env.MONGODB_URI);
        await mongoose.connection.db.admin().command({ ping: 1 });
        console.log("\x1b[32mConnected to MongoDB\x1b[0m");
        return true;
    } catch (error) {
        const errorMsg = `Error connecting to MongoDB: ${error instanceof Error ? error.message : String(error)}`;
        console.log("\x1b[31m" + errorMsg + "\x1b[0m");
        throw new Error(errorMsg);
    }
}