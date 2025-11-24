import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const SignupPage = () => {
  const [profilePreview, setProfilePreview] = useState(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    college: "",
    branch: "",
    email: "",
    password: "",
    role: "student", // Default role
    profileImage: null,
    phone: "",
    location: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleProfileImage = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePreview(URL.createObjectURL(file));
      setFormData({ ...formData, profileImage: file });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.college.trim())
      newErrors.college = "College name is required";
    if (!formData.branch.trim()) newErrors.branch = "Branch is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.phone.trim()) newErrors.phone = "Contact Number is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (!formData.password.trim()) newErrors.password = "Password is required";
    if (!formData.profileImage)
      newErrors.profileImage = "Profile image is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const serverURL = import.meta.env.VITE_BACKEND_URL;
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formDataToSend = new FormData();
    formDataToSend.append("fullName", formData.fullName);
    formDataToSend.append("college", formData.college);
    formDataToSend.append("branch", formData.branch);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("password", formData.password);
    formDataToSend.append("role", formData.role);
    formDataToSend.append("profileImage", formData.profileImage);
    formDataToSend.append("location", formData.location);
    formDataToSend.append("phone", formData.phone);

    try {
      const res = await fetch(`${serverURL}/api/auth/register`, {
        method: "POST",
        body: formDataToSend,
      });

      const result = await res.json();

      if (result.success) {
        toast.success("Account created successfully!");

        setFormData({
          fullName: "",
          college: "",
          branch: "",
          email: "",
          password: "",
          role: "student",
          profileImage: null,
          phone: "",
          location: "",
        });

        setProfilePreview(null);

        navigate("/login");
      } else {
        toast.error(result.message || "Registration failed");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong, please try again");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">
          Create Your Account
        </h2>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Profile Preview */}
          <div className="flex justify-center">
            <div className="w-36 h-36 rounded-full overflow-hidden shadow-md border border-gray-300 bg-gray-100 flex items-center justify-center">
              {profilePreview ? (
                <img
                  src={profilePreview}
                  className="w-full h-full object-fill"
                  alt="Profile Preview"
                />
              ) : (
                <span className="text-gray-500 text-sm">No image</span>
              )}
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
            />
            {errors.fullName && (
              <p className="text-red-500 text-sm">{errors.fullName}</p>
            )}
          </div>

          {/* College */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              College Name
            </label>
            <input
              type="text"
              name="college"
              value={formData.college}
              onChange={handleChange}
              placeholder="Enter your college name"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
            />
            {errors.college && (
              <p className="text-red-500 text-sm">{errors.college}</p>
            )}
          </div>

          {/* Branch */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Branch Name
            </label>
            <input
              type="text"
              name="branch"
              value={formData.branch}
              onChange={handleChange}
              placeholder="Enter your branch"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
            />
            {errors.branch && (
              <p className="text-red-500 text-sm">{errors.branch}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
            />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Contact Number
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your contact number"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm">{errors.phone}</p>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">City</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Enter your city"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
            />
            {errors.location && (
              <p className="text-red-500 text-sm">{errors.location}</p>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Select Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="student">Student</option>
              <option value="mentor">Mentor</option>
            </select>
          </div>

          {/* Profile Image Upload */}
          <div>
            <label className="block font-medium text-gray-700 mb-2">
              Upload Profile Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleProfileImage}
              className="mt-3 w-full border border-gray-300 rounded-lg p-2 text-gray-700 cursor-pointer file:bg-blue-600 file:text-white file:px-4 file:py-2 file:border-none file:rounded-md file:mr-4"
            />
            {errors.profileImage && (
              <p className="text-red-500 text-sm">{errors.profileImage}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              * Upload a professional photo (square preferred — e.g., 300×300
              px)
            </p>
          </div>

          <button className="w-full bg-blue-600 text-white mt-5 py-2 rounded-lg shadow hover:bg-blue-700 transition">
            Create Account
          </button>
        </form>

        {/* Redirect to Login */}
        <p className="text-center mt-5 text-gray-700">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-600 hover:underline font-semibold"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
