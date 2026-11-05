import express  from 'express'
import { doctorList, loginDoctor,appointmentsDoctor,appointmetComplete,Cancelappointment, doctorDashboardData,doctorProfile, updateDoctorProfile} from '../controllers/doctorController.js'
import authDoctor from '../middlewares/authDoctor.js'


const doctorRouter =express.Router()

doctorRouter.get('/list',doctorList)
doctorRouter.post('/login',loginDoctor)
doctorRouter.get('/appointments',authDoctor,appointmentsDoctor)
doctorRouter.post('/complete-appointment',authDoctor,appointmetComplete)
doctorRouter.post('/cancel-appointment',authDoctor,Cancelappointment)
doctorRouter.get('/dashboard',authDoctor,doctorDashboardData)
doctorRouter.get('/profile',authDoctor,doctorProfile)
doctorRouter.post('/update-profile',authDoctor,updateDoctorProfile)

export default doctorRouter