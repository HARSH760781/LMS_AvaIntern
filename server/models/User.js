import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  college: {
    type: String,
    required: true,
  },
  branch: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  profileImage: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return /^\+?[0-9]{10,15}$/.test(v);
      },
      message: (props) => `${props.value} is not a valid phone number!`,
    },
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },

  // ⭐ Login/Logout tracking
  lastLogin: {
    type: Date,
    default: null,
  },
  lastLogout: {
    type: Date,
    default: null,
  },
  isOnline: {
    type: Boolean,
    default: false,
  },

  // ⭐ Profile timestamps
  joinDate: {
    type: Date,
    default: Date.now,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },

  // ⭐ REQUIRED FOR FORGOT PASSWORD SYSTEM
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpire: {
    type: Date,
  },
});

// =============================
// Custom Schema Methods
// =============================

// Update profile
userSchema.methods.updateProfile = function (updateData) {
  this.fullName = updateData.fullName || this.fullName;
  this.phone = updateData.phone || this.phone;
  this.location = updateData.location || this.location;
  this.profileImage = updateData.profileImage || this.profileImage;
  this.lastUpdated = new Date();
  return this.save();
};

// Update login time
userSchema.methods.updateLoginTime = function () {
  const nowIST = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
  this.lastLogin = nowIST;
  this.isOnline = true;
  return this.save();
};

// Update logout time
userSchema.methods.updateLogoutTime = function () {
  const nowIST = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
  this.lastLogout = nowIST;
  this.isOnline = false;
  return this.save();
};

export default mongoose.model("User", userSchema);
