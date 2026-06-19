import mongoose from "mongoose";

const recommendationFeedbackSchema = new mongoose.Schema({
    userId: { type: String, ref: "User", required: true, index: true },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    rating: { type: String, enum: ["up", "down"], required: true },
}, { timestamps: true })

recommendationFeedbackSchema.index({ userId: 1, jobId: 1 }, { unique: true })

const RecommendationFeedback = mongoose.model("RecommendationFeedback", recommendationFeedbackSchema)

export default RecommendationFeedback
