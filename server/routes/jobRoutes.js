import  express  from "express";
import { getJobById, getJobs } from "../controllers/jobController.js";

const router = express.Router()

//to get all jobs data
router.get('/',getJobs)


//to get single job by id
router.get('/:id',getJobById)

export default router