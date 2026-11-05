import jwt from "jsonwebtoken";

//admin authentication middleware
const authAdmin = async (req, res, next) => {
    try {

        const { atoken } = req.headers
        if (!atoken) {
            return res.status(401).json({ message: "Invalid admin token" })
        }
        const token_decoded = jwt.verify(atoken, process.env.JWT_SECRET_KEY)
        if (
            token_decoded.email !== process.env.ADMIN_EMAIL ||
            token_decoded.role !== "admin"
        ) {
            return res.status(401).json({ message: "Invalid admin token" });
        }

        next()

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}


export default authAdmin