import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  // === Auth ===
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },

  // === Role ===
  role: {
    type: String,
    enum: ['candidate', 'company'],
    default: 'candidate',
  },

  // === Profile (shared) ===
  profile: {
    name: { type: String, default: '' },
    avatarUrl: { type: String, default: '' },
    phone: { type: String, default: '' },
  },

  // === Candidate-specific fields ===
  candidateProfile: {
    bio: { type: String, default: '' },
    skills: [String],
    experience: { type: String, default: '' },
    resumeUrl: { type: String, default: '' },
    linkedinUrl: { type: String, default: '' },
    githubUrl: { type: String, default: '' },
    portfolioUrl: { type: String, default: '' },
    yearsOfExperience: { type: Number, default: 0 },
    currentRole: { type: String, default: '' },
    targetRoles: [String],  // What roles they're looking for
  },

  // === Company-specific fields ===
  companyProfile: {
    companyName: { type: String, default: '' },
    website: { type: String, default: '' },
    industry: { type: String, default: '' },
    size: { 
      type: String, 
      enum: ['', '1-10', '11-50', '51-200', '201-500', '500+'],
      default: '' 
    },
    description: { type: String, default: '' },
    logoUrl: { type: String, default: '' },
    location: { type: String, default: '' },
  },

  // === Timestamps ===
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update timestamp on save
userSchema.pre('save', async function (next) {
  this.updatedAt = new Date();
  
  if (!this.isModified('passwordHash')) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

// Remove sensitive data from JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

// Indexes
userSchema.index({ role: 1 });
userSchema.index({ 'companyProfile.companyName': 1 });

export const User = mongoose.model('User', userSchema);
