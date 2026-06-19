import mongoose from "mongoose";

const resumeSectionSchema = new mongoose.Schema({
    title: { type: String, default: "" },
    subtitle: { type: String, default: "" },
    startDate: { type: String, default: "" },
    endDate: { type: String, default: "" },
    description: { type: String, default: "" },
}, { _id: false })

const resumeSchema = new mongoose.Schema({
    userId: { type: String, ref: "User", required: true, index: true },
    template: { type: String, default: "classic" },
    headline: { type: String, default: "" },
    phone: { type: String, default: "" },
    location: { type: String, default: "" },
    links: [{ type: String }],
    summary: { type: String, default: "" },
    skills: [{ type: String }],
    education: [resumeSectionSchema],
    projects: [resumeSectionSchema],
    experience: [resumeSectionSchema],
    certifications: [resumeSectionSchema],
    atsScore: { type: Number, default: 0 },
    matchedKeywords: [{ type: String }],
    missingKeywords: [{ type: String }],
}, { timestamps: true })

const Resume = mongoose.model("Resume", resumeSchema)

export default Resume
