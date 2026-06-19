import mongoose from "mongoose";

const JobApplicationSchema = new mongoose.Schema({
    userId: {type:String , ref:'User' , required:true},
    companyId: {type:mongoose.Schema.Types.ObjectId , ref:'Company' , required:true},
    jobId: {type:mongoose.Schema.Types.ObjectId , ref:'Job' , required:true},
    status: {type:String , default:'Pending'},
    date: {type:Number , required:true},
    updatedAt: {type:Number , default:Date.now}
})

JobApplicationSchema.index({ userId: 1, jobId: 1 }, { unique: true })
JobApplicationSchema.index({ companyId: 1, status: 1 })

const JobApplication = mongoose.model('JobApplication' , JobApplicationSchema)

export default JobApplication
