
import validator from "validator";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentModel.js";
import userModel from "../models/userModel.js";

// API for adding doctors
const addDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      speciality,
      degree,
      experience,
      about,
      fees,
      address,
    } = req.body;

    const imageFile = req.file;

    // Check required fields
    if (
      !name ||
      !email ||
      !password ||
      !speciality ||
      !degree ||
      !experience ||
      !about ||
      fees === undefined ||
      fees === "" ||
      !address ||
      !imageFile
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields, including the doctor image, are required",
      });
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Validate email
    if (!validator.isEmail(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    // Check duplicate email in database
    const existingDoctor = await doctorModel.findOne({
      email: normalizedEmail,
    });

    if (existingDoctor) {
      return res.status(409).json({
        success: false,
        message: "Doctor with this email already exists",
      });
    }

    // Validate password
    if (
      password.length < 8 ||
      !validator.isStrongPassword(password)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Password must contain at least 8 characters, including uppercase, lowercase, a number, and a symbol",
      });
    }

    // Validate address
    let parsedAddress;

    try {
      parsedAddress =
        typeof address === "string"
          ? JSON.parse(address)
          : address;
    } catch {
      return res.status(400).json({
        success: false,
        message: "Invalid address format",
      });
    }

    if (
      !parsedAddress ||
      typeof parsedAddress !== "object" ||
      Array.isArray(parsedAddress)
    ) {
      return res.status(400).json({
        success: false,
        message: "Address must be a valid JSON object",
      });
    }

    // Validate fees
    const doctorFees = Number(fees);

    if (!Number.isFinite(doctorFees) || doctorFees < 0) {
      return res.status(400).json({
        success: false,
        message: "Fees must be a valid non-negative number",
      });
    }

    // Check image path
    if (!imageFile.path) {
      return res.status(400).json({
        success: false,
        message: "Uploaded image file path is missing",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Upload image to Cloudinary
    const imageUpload = await cloudinary.uploader.upload(
      imageFile.path,
      {
        resource_type: "image",
      }
    );

    const imageUrl = imageUpload.secure_url;

    if (!imageUrl) {
      throw new Error("Cloudinary did not return an image URL");
    }

    // Prepare doctor data
    const doctorData = {
      name: name.trim(),
      email: normalizedEmail,
      image: imageUrl,
      password: hashedPassword,
      speciality,
      degree,
      experience,
      about,
      fees: doctorFees,
      address: parsedAddress,
      available: true,
      date: Date.now(),
      slots_booked: {},
    };

    // Save doctor
    const newDoctor = new doctorModel(doctorData);

    await newDoctor.save();

    return res.status(201).json({
      success: true,
      message: "Doctor added successfully",
    });

  } catch (error) {
    console.error("Add Doctor Error:", error);

    // MongoDB duplicate email protection
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Doctor with this email already exists",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// API for admin login
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      if (!process.env.JWT_SECRET_KEY) {
        throw new Error("JWT_SECRET_KEY is missing from environment variables");
      }

      const token = jwt.sign(
        {
          email,
          role: "admin",
        },
        process.env.JWT_SECRET_KEY,
        {
          expiresIn: "1d",
        }
      );

      return res.status(200).json({
        success: true,
        message: "Admin login successful",
        token,
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });

  } catch (error) {
    console.error("Admin Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const allDoctors =async (req,res) =>{
  try {
     const doctors= await doctorModel.find({}).select('-password')
     res.json({success:true,doctors})

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}
//Api to get all appointment list
 const  appointmentsAdmin =async (req,res)=>{

  try {
    
    const appointments= await appointmentModel.find({})
    res.json({success:true,appointments})
  } catch (error) {
    return res.status(500).json({
      success: false,
     message: error.message
    });
  }
 }

 //Api for cancel appointment from admin
 
 const appointmentCancel = async (req, res) => {
     try {
 
         const { appointmentId } = req.body
         const appointmentData = await appointmentModel.findById(appointmentId)
 
       
 
         await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })
         // relasing doctor slot 
 
         const { docId, slotDate, slotTime } = appointmentData
 
         const doctorData = await doctorModel.findById(docId)
 
         let slots_booked = doctorData.slots_booked
 
         slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime)
 
         await doctorModel.findByIdAndUpdate(docId, { slots_booked })
 
         res.json({ success: true, message: 'Appointment cancelled' })
     } catch (error) {
         return res.status(500).json({
             success: false,
             message: error.message
         })
     }
 }

 //API to get dashboard data for admin panel

 const adminDashboard  =async (req,res)=>{
  try {
      const doctors =await doctorModel.find({})
      const users =await userModel.find({})
      const appointments =await appointmentModel.find({})

      const dashData={
        doctors:doctors.length,
        appointments:appointments.length,
        patients:users.length,
        latestAppointments: appointments.reverse().slice(0,5)

      } 
      res.json({success:true,dashData})
    
  } catch (error) {
    return res.status(500).json({
             success: false,
             message: error.message
         })
    
  }
 }

export { addDoctor, loginAdmin,allDoctors, appointmentsAdmin,appointmentCancel ,adminDashboard};
