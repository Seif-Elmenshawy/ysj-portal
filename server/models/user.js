import mongoose from "mongoose"
import bcrypt from "bcrypt"

const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
    trim: true,
    minLength: [3, "Username must be at least 3 characters"],
    unique: [true, "Username already exists"]
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    trim: true,
    unique: [true, "Another account with this email exists"],
    match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Please provide a valid email address"],
  },
  password: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['applicant', 'admin', 'reviewer'],
    default: 'applicant'
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: {
    type: String,
    default: null
  },
  verificationExpires: {
    type: Date,
    default: null
  },
  resetPasswordToken: {
    type: String,
    default: null
  },
  resetPasswordExpires: {
    type: Date,
    default: null
  },
  application: {
    fullName: String,
    phone: String,
    country: String,
    gender: String,
    birthDate: String,
    institution: String,
    gradeYear: String,
    gpa: Number,
    preferredFields: [String],
    gradePrevious: String,
    essay1: String,
    essay2: String,
    essay3: String,
    hoursAvailable: String,
    timeBlocks: String,
    hearAbout: String,
    researchFiles: [String],
    commentedFiles: [String],
    additionalFiles: [String],
    submittedAt: Date,
    status: {
      type: String,
      enum: ['draft', 'submitted', 'under-review', 'approved', 'rejected'],
      default: 'draft'
    }
  },
  applicationSubmitted: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
},
  {
    timestamps: true
  }
)

userSchema.pre("save", async function() {
  try {
    // Only hash password if it has been modified
    if (!this.isModified("password")) {
      return
    }
    this.password = await bcrypt.hash(this.password, 10)
  } catch (error) {
    console.log(error)
  }
})

userSchema.methods.comparePasswords = async function(password) {
  return bcrypt.compare(password, this.password)
}

const User = mongoose.model("users", userSchema)

export default User;

