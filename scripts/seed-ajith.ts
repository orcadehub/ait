import mongoose from "mongoose";
import { Trainer } from "../src/models/Trainer";
import { TrainerProfile } from "../src/models/TrainerProfile";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI!);
    console.log("Connected to MongoDB.");

    const email = "gurramajithkumar70930@gmail.com";
    
    // 1. Find or Create Trainer
    let trainer = await Trainer.findOne({ email });
    if (!trainer) {
      trainer = await Trainer.create({
        fullName: "GURRAM AJITH KUMAR",
        email: email,
        phone: "+91 7093012101",
        isVerified: true,
        profileComplete: true,
      });
      console.log("Created new Trainer record.");
    } else {
      trainer.fullName = "GURRAM AJITH KUMAR";
      trainer.phone = "+91 7093012101";
      trainer.isVerified = true;
      trainer.profileComplete = true;
      await trainer.save();
      console.log("Updated existing Trainer record to complete profile.");
    }

    // 2. Create Profile Data
    const profileData = {
      userId: trainer._id,
      roleTitle: "TECHNICAL TRAINER",
      summary: "Trainer & Mentor With a passion for education and career development, I have mentored over 20,000 students across various engineering colleges and online workshops at OrcadeHub. I specialize in guiding students through industry-relevant technologies, career growth strategies, and technical skills, empowering them to successfully transition into IT roles.",
      firstName: "GURRAM",
      middleName: "AJITH",
      lastName: "KUMAR",
      phone: "+91 7093012101",
      whatsapp: "+91 7093012101",
      email: email,
      altEmail: "ajithkumargurram@gmail.com",
      country: "India",
      state: "Andhra Pradesh",
      city: "Anantapur",
      dob: "", 
      careerStart: "", 
      maritalStatus: "Single",
      gender: "Male",
      btech: {
        college: "SVEC, Tirupati",
        branch: "",
        cgpa: "",
        year: "2021"
      },
      colleges: [
        { name: "Vignan University", place: "Guntur", start: "2024-01-10", end: "2024-03-15" },
        { name: "Mohan Babu University", place: "Tirupati", start: "2024-04-05", end: "2024-05-20" },
        { name: "MallaReddy University", place: "Hyderabad", start: "2024-07-12", end: "2024-09-18" },
        { name: "CV Raman Global University", place: "Odisha", start: "2024-10-01", end: "2024-11-15" },
        { name: "NIET", place: "Greater Noida", start: "2025-01-15", end: "2025-03-20" },
      ],
      skills: [
        "C", "C++", "Java", "Python", "Django", "Data Structures & Algorithms (DSA)", "MERN Stack (MongoDB, Express.js, React.js, Node.js)", "HTML", "CSS", "JavaScript", "Redux", "Git & GitHub"
      ],
      experiences: [],
      completionPercentage: 100
    };

    // Upsert the profile
    const profile = await TrainerProfile.findOneAndUpdate(
      { userId: trainer._id },
      { $set: profileData },
      { upsert: true, new: true }
    );

    console.log("Successfully seeded TrainerProfile:", profile._id);

    process.exit(0);
  } catch (error) {
    console.error("Error seeding:", error);
    process.exit(1);
  }
}

seed();
