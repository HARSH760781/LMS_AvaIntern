import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
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
          // Basic phone number validation (10-15 digits, optional + at start)
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
    // ⭐ NEW FIELDS
    lastLogin: {
      type: Date,
      default: null,
    },
    lastLogout: {
      type: Date,
      default: null,
    },

    // Optional but helpful for showing "Active now"
    isOnline: {
      type: Boolean,
      default: false,
    },
    // ✅ Remove timestamps from schema and handle manually
    joinDate: {
      type: Date,
      default: Date.now,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  }
  // {
  //   timestamps: {
  //     createdAt: "joinDate",
  //     updatedAt: "lastUpdated",
  //   },
  // }
);

// ✅ Add method to update profile with custom lastUpdated
userSchema.methods.updateProfile = function (updateData) {
  this.fullName = updateData.fullName || this.fullName;
  this.phone = updateData.phone || this.phone;
  this.location = updateData.location || this.location;
  this.profileImage = updateData.profileImage || this.profileImage;
  this.lastUpdated = new Date(); // ✅ Only update when explicitly called
  return this.save();
};

// ✅ Add this method to update login timestamp
userSchema.methods.updateLoginTime = function () {
  const nowIST = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
  this.lastLogin = nowIST;
  this.isOnline = true;
  return this.save();
};

// ✅ Add this method to update logout timestamp
userSchema.methods.updateLogoutTime = function () {
  const nowIST = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
  this.lastLogout = nowIST;
  this.isOnline = false;
  return this.save();
};

export default mongoose.model("User", userSchema);
