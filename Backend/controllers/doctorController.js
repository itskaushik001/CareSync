import doctorModel from "../models/doctorModel.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import appointmentModel from "../models/appointmentModel.js"



const changeAvailabilty = async (req, res) => {
    try {

        const { docId } = req.body

        const docdata = await doctorModel.findById(docId)
        await doctorModel.findByIdAndUpdate(docId, { available: !docdata.available })
        res.json({ success: true, message: 'Availability Changed' })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

const doctorList = async (req, res) => {
    try {
        const doctors = await doctorModel.find({}).select(['-password', '-email'])
        res.json({ success: true, doctors })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });

    }
}

// API Doctor Login

const loginDoctor = async (req, res) => {
    try {
        const { email, password } = req.body
        const doctor = await doctorModel.findOne({ email })
        if (!doctor) {
            return res.status(200).json({ success: false, message: 'Doctor not found' })
        }

        const isMatch = await bcrypt.compare(password, doctor.password)

        if (isMatch) {

            const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET_KEY)
            res.json({ success: true, token })

        } else {

            res.status(200).json({ success: false, message: 'Invalid credentials' })
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

// Api to get doctor appointment for doctor panel

const appointmentsDoctor = async (req, res) => {
    try {

        const { docId } = req.body
        const appointments = await appointmentModel.find({ docId })

        res.json({ success: true, appointments })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}


// API to mark appointment completed for doctor pannel

const appointmetComplete = async (req, res) => {
    try {
        const { docId, appointmentId } = req.body

        const appointmentData = await appointmentModel.findById(appointmentId)
        if (appointmentData && appointmentData.docId === docId) {
            await appointmentModel.findByIdAndUpdate(appointmentId, { isCompleted: true })
            res.json({ success: true, message: 'Appointment marked as completed' })

        } else {
            res.status(200).json({ success: false, message: 'Invalid appointment or doctor' })
        }

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}
//api cancel appointment for doctor pannel
const Cancelappointment = async (req, res) => {
    try {
        const { docId, appointmentId } = req.body

        const appointmentData = await appointmentModel.findById(appointmentId)
        if (appointmentData && appointmentData.docId === docId) {
            await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })
            res.json({ success: true, message: 'Appointment marked as cancelled' })

        } else {
            res.status(200).json({ success: false, message: 'cancellation failed' })
        }

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

//API to get dashboard data for doctor pannel

const doctorDashboardData = async (req, res) => {
    try {
        const { docId } = req.body

        const appointments = await appointmentModel.find({ docId })

        let earnings = 0

        appointments.map((item) => {
            if (item.isCompleted || item.payment) {
                earnings += item.amount
            }
        })

        let patients = []

        appointments.map((item) => {
            if (!patients.includes(item.UserId)) {
                patients.push(item.UserId)
            }
        })
        const dashData = {
            earnings,
            appointments: appointments.length,
            patients: patients.length,
            latestAppointments: appointments.slice(0, 5).reverse()
        }
        res.json({ success: true, dashData })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });

    }
}

// Api to get doctor profile  for doctor pannel
const doctorProfile = async (req, res) => {
    try {
        const { docId } = req.body
        const profileData = await doctorModel.findById(docId).select('-password')
        res.json({ success: true, profileData })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}


// Api to update doctor profile  for doctor pannel
const updateDoctorProfile = async (req, res) => {
    try {
        const { docId, fees, address, available } = req.body
        await doctorModel.findByIdAndUpdate(docId, { fees, address, available })
        res.json({ success: true, message: 'Profile updated successfully' })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}


export {
    changeAvailabilty,
    doctorList,
    loginDoctor,
    appointmentsDoctor,
    appointmetComplete,
    Cancelappointment,
    doctorDashboardData,
    doctorProfile,
    updateDoctorProfile
}