import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema({
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    userId: { type: String, ref: "User", required: true, index: true },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: "JobApplication" },
    scheduledAt: { type: Number, required: true },
    durationMinutes: { type: Number, default: 30 },
    videoLink: { type: String, required: true },
    status: { type: String, enum: ["Scheduled", "Completed", "Cancelled"], default: "Scheduled" },
    notes: { type: String, default: "" },
}, { timestamps: true })

const Interview = mongoose.model("Interview", interviewSchema)

export default Interview
