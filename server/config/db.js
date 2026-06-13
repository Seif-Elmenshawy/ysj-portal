import mongoose from "mongoose"
import dotenv from "dotenv"

dotenv.config()

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log("DB Connected Successfully")
  } catch (error) {
    console.log(error)
  }
}

mongoose.connection.on("error", (err) => {
  console.log(`Error: ${err}`)
})

mongoose.connection.on("disconnected", () => {
  console.log("DB disconnected")
})
