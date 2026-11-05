import jwt from "jsonwebtoken";

//user authentication middleware
const authUser= async (req, res, next) => {
    try {

        const { token } = req.headers
        if (!token) {
            return res.status(401).json({ message: "Invalid user token" })
        }
        const token_decode = jwt.verify(token, process.env.JWT_SECRET_KEY)
      req.body = req.body || {}; req.body.userId = token_decode.id

        next()

    } catch (error) {
         return res.status(500).json({
             success: false,
             message: error.message
         })
}
}


export default authUser