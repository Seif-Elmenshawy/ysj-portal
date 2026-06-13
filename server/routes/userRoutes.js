import { Router } from "express"
import { signUp, logIn, resetPassword, verifyEmail, confirmPasswordReset, submitApplication, getUser, getAdminStats, testEmail, createAdmin } from "../controllers/userControllers.js"
import authMiddleware from "../middleware/authMiddleware.js"

const userRouter = Router()

// Test Route
userRouter.get("/", (req, res) => {
  res.send("User Test Route")
})

// Auth Routes (Public)
userRouter.post("/register", signUp)
userRouter.post("/login", logIn)
userRouter.post("/reset-password", resetPassword)
userRouter.post("/confirm-password-reset", confirmPasswordReset)
userRouter.post("/verify-email", verifyEmail)
userRouter.post("/test-email", testEmail)
userRouter.post("/create-admin", createAdmin)

// Protected Routes (require authentication)
userRouter.post("/submit-application", authMiddleware, submitApplication)
userRouter.get("/profile", authMiddleware, getUser)
userRouter.get("/admin/stats", authMiddleware, getAdminStats)

export default userRouter;
