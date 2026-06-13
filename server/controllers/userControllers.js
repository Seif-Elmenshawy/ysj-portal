import User from "../models/user.js"
import jwtGenerator from "../utils/generateToken.js"
import { sendPasswordResetEmail, sendVerificationEmail } from "../utils/sendEmail.js"
import crypto from "crypto"

// ============================================================================
// AUTHENTICATION CONTROLLERS
// ============================================================================

/**
 * Register a new user (applicant role)
 * POST /api/users/register
 */
export const signUp = async (req, res) => {
  try {
    const { username, email, password } = req.body

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Username, email, and password are required" })
    }

    // Check for existing email
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: "Email already registered" })
    }

    // Check for existing username
    if (await User.findOne({ username })) {
      return res.status(400).json({ message: "Username already taken" })
    }

    // Create user with applicant role (email unverified)
    const user = await User.create({ 
      username, 
      email, 
      password,
      role: 'applicant',
      emailVerified: false
    })

    // Generate email verification token (raw + hashed)
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const hashedVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex')

    // Save hashed token and expiry (24 hours)
    user.verificationToken = hashedVerificationToken
    user.verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)
    await user.save()

    // Send verification email with the raw token
    try {
      await sendVerificationEmail(user.email, verificationToken, user.username)
      return res.status(201).json({ 
        message: 'User created successfully. Verification email sent.',
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        },
        emailSent: true
      })
    } catch (mailError) {
      console.error('Failed to send verification email:', mailError)
      // If email sending fails, delete the created user to avoid orphan accounts
      try {
        await user.deleteOne()
      } catch (delErr) {
        console.error('Failed to delete user after email send failure:', delErr)
      }
      return res.status(500).json({ 
        message: 'Registration failed: unable to send verification email',
        error: mailError.message
      })
    }

  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Registration failed" })
  }
}

/**
 * Login user with email and password
 * POST /api/users/login
 */
export const logIn = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: "Invalid Credentials" })
    }

    const isValidPassword = await user.comparePasswords(password)
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid Credentials" })
    }

    const token = jwtGenerator(user)
    
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000
    })

    // Determine whether the user has started an application
    const application = user.application || {}
    const hasApplicationStarted = !!user.applicationSubmitted || Object.values(application).some((v) => {
      if (v === undefined || v === null) return false
      if (Array.isArray(v)) return v.length > 0
      if (typeof v === 'string') return v.trim() !== ''
      return true
    })

    return res.status(200).json({ 
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        applicationSubmitted: !!user.applicationSubmitted,
        applicationStatus: application.status || null,
        hasApplicationStarted
      },
      token
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Login failed" })
  }
}

// ============================================================================
// PASSWORD RESET CONTROLLERS
// ============================================================================

/**
 * Request password reset (sends email with reset link)
 * POST /api/users/reset-password
 */
export const resetPassword = async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ message: "Email is required" })
    }

    // Find user by email
    const user = await User.findOne({ email: email })
    if (!user) {
      // For security, don't reveal if email exists
      return res.status(200).json({ message: "If an account with this email exists, a password reset link has been sent" })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex')

    // Save token and expiry to user
    user.resetPasswordToken = hashedToken
    user.resetPasswordExpires = new Date(Date.now() + 1 * 60 * 60 * 1000) // 1 hour expiry
    await user.save()

    // Send email
    await sendPasswordResetEmail(user.email, resetToken, user.username)

    return res.status(200).json({ 
      message: "Password reset link has been sent to your email",
      success: true
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Failed to send reset email: " + error.message })
  }
}

/**
 * Verify email address
 * POST /api/users/verify-email
 */
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body

    if (!token) {
      return res.status(400).json({ message: "Verification token is required" })
    }

    // Hash the token to compare with stored token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    // Find user with matching token
    const user = await User.findOne({ 
      verificationToken: hashedToken,
      verificationExpires: { $gt: Date.now() }
    })

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired verification token" })
    }

    // Mark email as verified
    user.emailVerified = true
    user.verificationToken = null
    user.verificationExpires = null
    await user.save()

    return res.status(200).json({ 
      message: "Email verified successfully",
      success: true
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Internal Server Error" })
  }
}

/**
 * Confirm password reset with new password
 * POST /api/users/confirm-password-reset
 */
export const confirmPasswordReset = async (req, res) => {
  try {
    const { token, newPassword } = req.body

    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token and new password are required" })
    }

    // Hash the token to find user
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    // Find user with valid reset token and not expired
    const user = await User.findOne({ 
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    })

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" })
    }

    // Validate new password
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" })
    }

    // Update password
    user.password = newPassword
    user.resetPasswordToken = null
    user.resetPasswordExpires = null
    await user.save()

    return res.status(200).json({ 
      message: "Password reset successfully",
      success: true
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Internal Server Error" })
  }
}

// ============================================================================
// APPLICATION CONTROLLERS
// ============================================================================

/**
 * Submit application form (requires authentication)
 * POST /api/users/submit-application
 */
export const submitApplication = async (req, res) => {
  try {
    const userId = req.user.id // From authentication middleware
    const applicationData = req.body

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Update user's application data. Accept multiple possible field names from frontend and be defensive.
    const safeParseFloat = (v) => {
      const n = parseFloat(v);
      return Number.isFinite(n) ? n : null;
    }

    // Map incoming field names (frontend may use different keys)
    const institution = applicationData.institution || applicationData.schoolName || null;
    const gradePrevious = applicationData.gradePrevious || applicationData.previousGrades || applicationData.previous_grade || null;
    // Normalize preferred fields: frontend may send preferredPlaces (array of {field}), or areasOfInterest (array of strings)
    let preferredFields = null;
    if (Array.isArray(applicationData.preferredPlaces)) {
      preferredFields = applicationData.preferredPlaces.map(p => (p && p.field) ? p.field : (typeof p === 'string' ? p : null)).filter(Boolean);
    } else if (Array.isArray(applicationData.areasOfInterest)) {
      preferredFields = applicationData.areasOfInterest.filter(Boolean);
    } else if (Array.isArray(applicationData.preferredFields)) {
      preferredFields = applicationData.preferredFields.filter(Boolean);
    }

    const gpa = safeParseFloat(applicationData.gpa ?? applicationData.gpa_value ?? null);

    user.application = {
      fullName: applicationData.fullName || applicationData.full_name || user.fullName || '',
      phone: applicationData.phone || applicationData.phoneNumber || '',
      country: applicationData.country || '',
      gender: applicationData.gender || '',
      birthDate: applicationData.birthDate || applicationData.birth_date || '',
      institution: institution,
      gradeYear: applicationData.gradeYear || applicationData.grade_year || '',
      gpa: gpa,
      preferredFields: preferredFields,
      gradePrevious: gradePrevious,
      essay1: applicationData.essay1 || '',
      essay2: applicationData.essay2 || '',
      essay3: applicationData.essay3 || '',
      hoursAvailable: applicationData.hoursAvailable || applicationData.hours_available || null,
      timeBlocks: applicationData.timeBlocks || applicationData.time_blocks || null,
      hearAbout: applicationData.hearAbout || applicationData.hear_about || '',
      researchFiles: applicationData.researchFiles || [],
      commentedFiles: applicationData.commentedFiles || [],
      additionalFiles: applicationData.additionalFiles || [],
      submittedAt: new Date(),
      status: 'submitted'
    }

    user.applicationSubmitted = true
    await user.save()

    return res.status(200).json({ 
      message: "Application submitted successfully",
      application: user.application
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Internal Server Error" })
  }
}

// ============================================================================
// ADMIN CONTROLLERS
// ============================================================================

/**
 * Get admin dashboard statistics (admin only)
 * GET /api/users/admin/stats
 */
export const getAdminStats = async (req, res) => {
  try {
    // Strict admin-only check
    const userId = req.user.id
    const user = await User.findById(userId)
    
    // Verify user exists and is admin
    if (!user) {
      return res.status(401).json({ message: "Unauthorized: User not found" })
    }
    
    if (user.role !== 'admin') {
      return res.status(403).json({ message: "Forbidden: Admin access required" })
    }

    // Return ONLY the submitted applications count
    const submittedApplications = await User.countDocuments({ applicationSubmitted: true })

    return res.status(200).json({
      submittedApplications: submittedApplications
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Internal Server Error" })
  }
}

// ============================================================================
// UTILITY CONTROLLERS
// ============================================================================

/**
 * Get current user profile (requires authentication)
 * GET /api/users/profile
 */
export const getUser = async (req, res) => {
  try {
    const userId = req.user.id

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    return res.status(200).json({ 
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        application: user.application,
        applicationSubmitted: user.applicationSubmitted
      }
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Internal Server Error" })
  }
}

/**
 * Send test email (for debugging email configuration)
 * POST /api/users/test-email
 */
export const testEmail = async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ message: "Email is required" })
    }

    // Send test password reset email
    await sendPasswordResetEmail(email, "test-token-12345", "Test User")

    return res.status(200).json({ 
      message: "Test email sent successfully to " + email,
      success: true
    })
  } catch (error) {
    console.log("Test email error:", error)
    return res.status(500).json({ 
      message: "Failed to send test email: " + error.message,
      error: error.message
    })
  }
}

/**
 * Create admin account (requires admin key)
 * POST /api/users/create-admin
 */
export const createAdmin = async (req, res) => {
  try {
    const { username, email, password, adminKey } = req.body

    // Security check - require admin key
    const ADMIN_KEY = "ysj-admin-key-2024"
    if (adminKey !== ADMIN_KEY) {
      return res.status(403).json({ message: "Invalid admin key" })
    }

    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Username, email, and password are required" })
    }

    // Check if user exists by email
    const userByEmail = await User.findOne({ email: email })
    if (userByEmail) {
      return res.status(400).json({ message: "Email already registered" })
    }

    // Check if username exists
    const userByUsername = await User.findOne({ username: username })
    if (userByUsername) {
      return res.status(400).json({ message: "Username already taken" })
    }

    // Create new admin user
    const admin = await User.create({ 
      username, 
      email, 
      password,
      role: 'admin',
      emailVerified: true
    })

    const token = jwtGenerator(admin)

    return res.status(201).json({ 
      message: "Admin account created successfully",
      user: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      },
      token: token
    })

  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Internal Server Error: " + error.message })
  }
}

