import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.join(__dirname, '.env') })

import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser"
import cors from "cors"
import { connectDB } from "./config/db.js"
import userRouter from "./routes/userRoutes.js"

// Initialize the app
const app = express()

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}))
app.use(express.json())
app.use(morgan("dev"))
app.use(cookieParser())
const port = process.env.PORT

//Connect to MongoDB
connectDB()

// Initialize the routes
app.get("/", (req, res) => {
  res.send("Welcome to YSJ Junior Application Portal")
})
app.use("/api/users", userRouter)

app.listen(port, () => {
  console.log(`Server Running at http://localhost:${port}`)
})
