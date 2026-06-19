import mongoose from "mongoose";

const campusDriveSchema = new mongoose.Schema({
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    title: { type: String, required: true },
    institution: { type: String, required: true, index: true },
    stream: { type: String, default: "" },
    semester: { type: String, default: "" },
    location: { type: String, default: "Virtual" },
    driveDate: { type: Number, required: true },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
    eligibility: { type: String, default: "" },
    description: { type: String, default: "" },
    rsvps: [{ type: String, ref: "User" }],
}, { timestamps: true })

const CampusDrive = mongoose.model("CampusDrive", campusDriveSchema)

export default CampusDrive
