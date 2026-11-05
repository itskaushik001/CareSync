import jwt from "jsonwebtoken";

//Doctor authentication middleware
const authDoctor= async (req, res, next) => {
    try {

        const { dtoken } = req.headers
        if (!dtoken) {
            return res.status(401).json({ message: "Invalid user token" })
        }
        const token_decode = jwt.verify(dtoken, process.env.JWT_SECRET_KEY)
      req.body = req.body || {}; req.body.docId = token_decode.id

        next()

    } catch (error) {
         return res.status(500).json({
             success: false,
             message: error.message
         })
}
}

export default authDoctor