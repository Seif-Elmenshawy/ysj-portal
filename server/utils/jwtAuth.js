import jwt, { decode } from "jsonwebtoken"
import dotenv from 'dotenv'

dotenv.config()

function jwtAuth(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    return {
      state: "valid",
      payload: decoded
    }
  } catch (error) {
    return {
      state: "invalid",
    }
  }


}

export default jwtAuth
