import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import Company from "./models/Company.js";
import Job from "./models/Job.js";

// Load env
dotenv.config();

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("Connected to DB");

    // Clean existing collections for fresh seed
    await Company.deleteMany();
    await Job.deleteMany();

    // 1. Create multiple prominent companies (recruiters) with actual logos
    const hashPassword = await bcrypt.hash("Recruiter@123", 10);
    const companies = await Company.insertMany([
      {
        name: "Microsoft",
        email: "recruiter@microsoft.com",
        image: "http://localhost:3000/logos/microsoft_logo.svg",
        password: hashPassword
      },
      {
        name: "Google",
        email: "recruiter@google.com",
        image: "http://localhost:3000/logos/google.png",
        password: hashPassword
      },
      {
        name: "Amazon",
        email: "recruiter@amazon.com",
        image: "http://localhost:3000/logos/amazon_logo.png",
        password: hashPassword
      },
      {
        name: "Walmart",
        email: "recruiter@walmart.com",
        image: "http://localhost:3000/logos/walmart_logo.svg",
        password: hashPassword,
      },
      {
        name: "Samsung",
        email: "recruiter@samsung.com",
        image: "http://localhost:3000/logos/samsung_logo.png",
        password: hashPassword,
      },
      {
        name: "Adobe",
        email: "recruiter@adobe.com",
        image: "http://localhost:3000/logos/adobe_logo.png",
        password: hashPassword,
      },
      {
        name: "Accenture",
        email: "recruiter@accenture.com",
        image: "http://localhost:3000/logos/accenture_logo.png",
        password: hashPassword,
      },
    ]);
    console.log("Created recruiter companies: Microsoft, Google, Amazon, Walmart, Samsung, Adobe, Accenture");
    
    // Map for easy reference
    const companyMap = Object.fromEntries(companies.map(c => [c.name, c]));

    // 2. Create jobs for each company
    const jobs = [
      // Microsoft jobs
      {
        title: "Software Engineer",
        description: "Work on cutting-edge Microsoft cloud solutions.",
        location: "Redmond, WA, USA",
        category: "Cloud/Fullstack",
        level: "Mid",
        salary: 120000,
        date: Date.now(),
        visible: true,
        companyId: companyMap["Microsoft"]._id,
      },
      {
        title: "Product Manager",
        description: "Drive product vision and execution for Microsoft Azure.",
        location: "Remote",
        category: "Management",
        level: "Senior",
        salary: 150000,
        date: Date.now(),
        visible: true,
        companyId: companyMap["Microsoft"]._id,
      },
      // Google jobs
      {
        title: "Machine Learning Engineer",
        description: "Build the next generation of AI models for Search.",
        location: "Mountain View, CA, USA",
        category: "AI/ML",
        level: "Mid",
        salary: 135000,
        date: Date.now(),
        visible: true,
        companyId: companyMap["Google"]._id
      },
      {
        title: "Site Reliability Engineer",
        description: "Maintain and scale Google Cloud infrastructure.",
        location: "Zurich, Switzerland",
        category: "Infrastructure",
        level: "Senior",
        salary: 140000,
        date: Date.now(),
        visible: true,
        companyId: companyMap["Google"]._id
      },
      // Amazon jobs
      {
        title: "DevOps Engineer",
        description: "Automate AWS deployments, CI/CD.",
        location: "Bangalore, India",
        category: "DevOps",
        level: "Mid",
        salary: 90000,
        date: Date.now(),
        visible: true,
        companyId: companyMap["Amazon"]._id
      },
      {
        title: "Logistics Analyst",
        description: "Optimize and analyze Amazon supply chain logistics.",
        location: "Hyderabad, India",
        category: "Logistics",
        level: "Entry",
        salary: 50000,
        date: Date.now(),
        visible: true,
        companyId: companyMap["Amazon"]._id
      },
      // Apple jobs
      {
        title: "iOS Developer",
        description: "Design and build applications for Walmart mobile platform.",
        location: "Bentonville, AR, USA",
        category: "Mobile",
        level: "Junior",
        salary: 100000,
        date: Date.now(),
        visible: true,
        companyId: companyMap["Walmart"]._id,
      },
      {
        title: "Data Analyst",
        description: "Analyze retail and e-commerce data for Walmart.",
        location: "Remote",
        category: "Data Science",
        level: "Mid",
        salary: 95000,
        date: Date.now(),
        visible: true,
        companyId: companyMap["Walmart"]._id,
      },
      // Meta jobs
      {
        title: "Electronics Engineer",
        description: "Design cutting-edge Samsung consumer electronics.",
        location: "Seoul, South Korea",
        category: "Hardware",
        level: "Senior",
        salary: 125000,
        date: Date.now(),
        visible: true,
        companyId: companyMap["Samsung"]._id,
      },
      {
        title: "Software Developer",
        description: "Develop firmware for Samsung IoT devices.",
        location: "Bangalore, India",
        category: "Embedded Systems",
        level: "Mid",
        salary: 85000,
        date: Date.now(),
        visible: true,
        companyId: companyMap["Samsung"]._id,
      },
      // Adobe jobs
      {
        title: "UX/UI Designer",
        description: "Design beautiful interfaces for Adobe Creative Suite.",
        location: "San Jose, CA, USA",
        category: "Design",
        level: "Mid",
        salary: 110000,
        date: Date.now(),
        visible: true,
        companyId: companyMap["Adobe"]._id,
      },
      {
        title: "Frontend Developer",
        description: "Build responsive web apps for Adobe products.",
        location: "Remote",
        category: "Frontend",
        level: "Junior",
        salary: 90000,
        date: Date.now(),
        visible: true,
        companyId: companyMap["Adobe"]._id,
      },
      // Accenture jobs
      {
        title: "IT Consultant",
        description: "Provide IT consulting solutions to enterprise clients.",
        location: "New York, NY, USA",
        category: "Consulting",
        level: "Senior",
        salary: 130000,
        date: Date.now(),
        visible: true,
        companyId: companyMap["Accenture"]._id,
      },
      {
        title: "Business Analyst",
        description: "Analyze business requirements and develop solutions.",
        location: "Bangalore, India",
        category: "Management",
        level: "Mid",
        salary: 75000,
        date: Date.now(),
        visible: true,
        companyId: companyMap["Accenture"]._id,
      },
      // Extra Diverse Jobs
      {
        title: "Cloud Architect",
        description: "Design robust and scalable enterprise cloud structures on AWS and Azure.",
        location: "Seattle, WA, USA",
        category: "Cloud/Fullstack",
        level: "Senior",
        salary: 175000,
        date: Date.now(),
        visible: true,
        companyId: companyMap["Microsoft"]._id,
      },
      {
        title: "Cyber Security Specialist",
        description: "Implement security standards and perform vulnerability testing.",
        location: "Remote",
        category: "Infrastructure",
        level: "Mid",
        salary: 115000,
        date: Date.now(),
        visible: true,
        companyId: companyMap["Microsoft"]._id,
      },
      {
        title: "Deep Learning Research Scientist",
        description: "Train state-of-the-art vision and language models for production applications.",
        location: "San Francisco, CA, USA",
        category: "AI/ML",
        level: "Senior",
        salary: 195000,
        date: Date.now(),
        visible: true,
        companyId: companyMap["Google"]._id,
      },
      {
        title: "Data Scientist",
        description: "Utilize advanced analytics and machine learning to build candidate scoring algorithms.",
        location: "Remote",
        category: "Data Science",
        level: "Mid",
        salary: 125000,
        date: Date.now(),
        visible: true,
        companyId: companyMap["Google"]._id,
      },
      {
        title: "Fullstack Engineer (React & Node)",
        description: "Build premium web layouts and high-performance APIs for e-commerce dashboards.",
        location: "London, UK",
        category: "Cloud/Fullstack",
        level: "Junior",
        salary: 85000,
        date: Date.now(),
        visible: true,
        companyId: companyMap["Amazon"]._id,
      },
      {
        title: "Warehouse Systems Developer",
        description: "Maintain low-latency logistics control microservices.",
        location: "Tokyo, Japan",
        category: "Embedded Systems",
        level: "Mid",
        salary: 95000,
        date: Date.now(),
        visible: true,
        companyId: companyMap["Amazon"]._id,
      },
      {
        title: "React Native Developer",
        description: "Help build the retail catalog mobile app experiences.",
        location: "Bangalore, India",
        category: "Mobile",
        level: "Mid",
        salary: 80000,
        date: Date.now(),
        visible: true,
        companyId: companyMap["Walmart"]._id,
      },
      {
        title: "HR Analytics Lead",
        description: "Analyze recruitment pipelines and build retention models.",
        location: "Remote",
        category: "Management",
        level: "Senior",
        salary: 110000,
        date: Date.now(),
        visible: true,
        companyId: companyMap["Walmart"]._id,
      },
      {
        title: "Mobile Security Engineer",
        description: "Assess application vulnerabilities and secure customer credentials.",
        location: "Seoul, South Korea",
        category: "Mobile",
        level: "Mid",
        salary: 110000,
        date: Date.now(),
        visible: true,
        companyId: companyMap["Samsung"]._id,
      },
      {
        title: "IoT Systems Firmware Developer",
        description: "Develop device drivers and connectivity layer software for smart appliances.",
        location: "Sydney, Australia",
        category: "Embedded Systems",
        level: "Senior",
        salary: 140000,
        date: Date.now(),
        visible: true,
        companyId: companyMap["Samsung"]._id,
      },
      {
        title: "Lead Creative Designer",
        description: "Oversee styling libraries and design systems for Next-Gen creative products.",
        location: "San Jose, CA, USA",
        category: "Design",
        level: "Senior",
        salary: 165000,
        date: Date.now(),
        visible: true,
        companyId: companyMap["Adobe"]._id,
      },
      {
        title: "UI Developer (Tailwind & CSS)",
        description: "Build reusable React layout elements with smooth micro-animations.",
        location: "Noida, India",
        category: "Frontend",
        level: "Entry",
        salary: 45000,
        date: Date.now(),
        visible: true,
        companyId: companyMap["Adobe"]._id,
      },
      {
        title: "Management Consultant",
        description: "Provide strategic digital transformation blueprints for financial enterprises.",
        location: "London, UK",
        category: "Consulting",
        level: "Senior",
        salary: 155000,
        date: Date.now(),
        visible: true,
        companyId: companyMap["Accenture"]._id,
      },
      {
        title: "Solutions Architect",
        description: "Map software engineering blueprints and coordinate development workflows.",
        location: "Remote",
        category: "Cloud/Fullstack",
        level: "Senior",
        salary: 160000,
        date: Date.now(),
        visible: true,
        companyId: companyMap["Accenture"]._id,
      },
      {
        title: "Machine Learning Ops (MLOps) Lead",
        description: "Automate model retraining and pipeline validation pipelines in production.",
        location: "Bangalore, India",
        category: "AI/ML",
        level: "Senior",
        salary: 180000,
        date: Date.now(),
        visible: true,
        companyId: companyMap["Accenture"]._id,
      },
    ];

    await Job.insertMany(jobs);
    console.log("Inserted sample jobs for all 7 companies: Microsoft, Google, Amazon, Walmart, Samsung, Adobe, Accenture!");

    mongoose.connection.close();
    console.log("Done. DB connection closed.");
    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
}

seed();
