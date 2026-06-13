import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

function jwtGenerator(user) {
  const payload = {
    user: user
  }
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 30 * 24 * 60 * 60 })
}

export default jwtGenerator;
