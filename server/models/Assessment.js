import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
    prompt: { type: String, required: true },
    options: [{ type: String, required: true }],
    answerIndex: { type: Number, required: true },
}, { _id: false })

const assessmentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    skill: { type: String, required: true, index: true },
    level: { type: String, default: "Beginner" },
    passingScore: { type: Number, default: 70 },
    durationMinutes: { type: Number, default: 15 },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
    questions: [questionSchema],
}, { timestamps: true })

const Assessment = mongoose.model("Assessment", assessmentSchema)

export default Assessment
