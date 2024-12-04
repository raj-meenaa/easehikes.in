import mongoose from "mongoose";
const connectMongoDB=async()=>{
    try {
        const connect=await mongoose.connect(process.env.MONGO_URI, {
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000
          })
        console.log(`MongoDB Connected: ${connect.connection.host}`)
    } catch (error) {
        console.log(`Error while connecting MongoDB: ${error.message}`);
        process.exit(1);
    }
}
export default connectMongoDB;