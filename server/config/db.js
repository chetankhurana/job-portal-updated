import mongoose from "mongoose";

//function to connect with MongoDB
const connectDB = async () => {
    mongoose.connection.on('connected' , () => console.log('Database Connected'))
    mongoose.connection.on('error' , (error) => console.error('Database connection error:', error.message))

    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/job-portal`, {
            serverSelectionTimeoutMS: 5000,
        })
        return true
    } catch (error) {
        console.error('Database connection failed:', error.message)
        return false
    }
}

export default connectDB
