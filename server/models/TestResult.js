import mongoose from "mongoose";

const testResultSchema = new mongoose.Schema({
    userId: { type: String, ref: "User", required: true, index: true },
    assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Assessment", required: true },
    answers: [{ type: Number }],
    score: { type: Number, required: true },
    passed: { type: Boolean, required: true },
}, { timestamps: true })

testResultSchema.index({ userId: 1, assessmentId: 1 })

const TestResult = mongoose.model("TestResult", testResultSchema)

export default TestResult
