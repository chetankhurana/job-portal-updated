import mongoose from "mongoose";

const certificationSchema = new mongoose.Schema({
    userId: { type: String, ref: "User", required: true, index: true },
    assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Assessment", required: true },
    title: { type: String, required: true },
    skill: { type: String, required: true },
    score: { type: Number, required: true },
    issuedAt: { type: Number, default: Date.now },
}, { timestamps: true })

certificationSchema.index({ userId: 1, assessmentId: 1 }, { unique: true })

const Certification = mongoose.model("Certification", certificationSchema)

export default Certification
