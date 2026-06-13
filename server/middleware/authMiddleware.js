import jwt from "jsonwebtoken"

export const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header or cookies
    const token = req.headers.authorization?.split(" ")[1] || req.cookies.token

    if (!token) {
      return res.status(401).json({ message: "No token provided, authorization denied" })
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key")
    // Extract user from the decoded payload
    req.user = {
      id: decoded.user._id,
      ...decoded.user
    }
    next()
  } catch (error) {
    console.log(error)
    return res.status(401).json({ message: "Token is not valid" })
  }
}

export default authMiddleware
