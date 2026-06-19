import './config/instrument.js'
import  express  from "express";
import cors from 'cors'
import 'dotenv/config'
import connectDB from "./config/db.js";
import * as Sentry from "@sentry/node";
import mongoose from "mongoose";
import { clerkWebhooks } from './controllers/webhooks.js';
import companyRoutes from './routes/companyRoutes.js'
import connectCloudinary from './config/cloudinary.js';
import jobRoutes from './routes/jobRoutes.js'
import userRoutes from './routes/userRoutes.js'
import { clerkMiddleware } from '@clerk/express';

//initialize express

const app = express()

//connect to database
connectDB()
await connectCloudinary()

//middlewares
app.use(cors())
app.use(express.json())
app.use(express.static('public'))
app.use(clerkMiddleware())
app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff")
    res.setHeader("X-Frame-Options", "DENY")
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin")
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
    next()
})

const rateLimitStore = new Map()
app.use("/api", (req, res, next) => {
    const key = req.ip || req.headers["x-forwarded-for"] || "anonymous"
    const now = Date.now()
    const windowMs = 60 * 1000
    const maxRequests = 120
    const entry = rateLimitStore.get(key) || { count: 0, resetAt: now + windowMs }

    if (entry.resetAt < now) {
        entry.count = 0
        entry.resetAt = now + windowMs
    }

    entry.count += 1
    rateLimitStore.set(key, entry)

    if (entry.count > maxRequests) {
        return res.status(429).json({ success:false, message:"Too many requests. Please try again shortly." })
    }

    next()
})
app.use("/api", (req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
            success:false,
            message:"Database is not connected. Check MongoDB Atlas access or the MONGODB_URI value.",
        })
    }

    next()
})

//Routes
app.get('/',(req,res)=>res.send("API Working"))
app.get("/debug-sentry", function mainHandler(req, res) {
    throw new Error("My first Sentry error!");
  });
app.post('/webhooks',clerkWebhooks)
app.use('/api/company',companyRoutes)
app.use('/api/jobs',jobRoutes)
app.use('/api/users',userRoutes)

//Port
const PORT = process.env.PORT || 3000
Sentry.setupExpressErrorHandler(app);


app.listen(PORT,()=>{
    console.log(`Server is running on port: ${PORT}`);
})
