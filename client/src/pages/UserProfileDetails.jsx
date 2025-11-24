import React, { useState, useEffect } from "react";
import {
  Phone,
  Mail,
  MapPin,
  User as UserIcon,
  Calendar,
  Clock,
  School,
  Section,
} from "lucide-react";
import Loader from "../components/Loader";

const UserProfileDetails = () => {
  const token = localStorage.getItem("token");
  const serverURL = import.meta.env.VITE_BACKEND_URL;

  const [userData, setUserData] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [imageError, setImageError] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${serverURL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch user details");
        const data = await res.json();
        setUserData(data);

        setFormData({
          fullName: data.fullName || "",
          email: data.email || "",
          phone: data.phone || "",
          location: data.location || "", // ✅ Changed from 'zone' to 'location'
          college: data.college || "",
          branch: data.branch || "",
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchUser();
  }, [token]);

  if (!userData) return <Loader />;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
      setPreviewImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updateData = new FormData();
      updateData.append("fullName", formData.fullName);
      updateData.append("phone", formData.phone);
      updateData.append("location", formData.location); // ✅ Changed from 'zone' to 'location'

      if (selectedImage) {
        updateData.append("profileImage", selectedImage);
      }

      const res = await fetch(`${serverURL}/api/users/me`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: updateData,
      });

      if (!res.ok) throw new Error("Failed to update profile");

      const updatedUser = await res.json();

      // ✅ Update the UI with the new data including updated lastUpdated
      setUserData(updatedUser);
      setSelectedImage(null);
      setPreviewImage(null);
      setEditing(false);

      console.log("Profile updated successfully at:", updatedUser.lastUpdated);
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setSelectedImage(null);
    setPreviewImage(null);
    // Reset form data to original user data
    setFormData({
      fullName: userData.fullName || "",
      email: userData.email || "",
      phone: userData.phone || "",
      location: userData.location || "",
      college: userData.college || "",
      branch: userData.branch || "",
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 flex flex-col items-center px-4">
      {/* Profile Card */}
      <div className="rounded-2xl shadow-lg w-4/5 mb-6 p-6">
        {/* Top Row */}
        <div className="bg-blue-600 text-white rounded-2xl p-6 flex flex-row items-center justify-between mb-6">
          <div className="flex flex-row items-center space-x-4">
            <div className="relative w-24 h-24">
              {userData.profileImage && !imageError ? (
                <img
                  src={
                    previewImage ||
                    `${serverURL}/uploads/${userData.profileImage}`
                  }
                  alt={userData.fullName}
                  onError={() => setImageError(true)}
                  className="w-full h-full rounded-full object-cover border-4 border-white shadow-md"
                />
              ) : (
                <div className="w-full h-full bg-blue-300 rounded-full flex items-center justify-center text-3xl font-bold shadow-md">
                  {userData.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
              )}
            </div>

            <div className="flex flex-col">
              <h2 className="text-2xl font-bold">{userData.fullName}</h2>
              <p className="text-gray-200">{userData.email}</p>
            </div>
          </div>

          <button
            onClick={() => setEditing(!editing)}
            className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
            disabled={isSaving}
          >
            {editing ? "Cancel" : "Edit Profile"}
          </button>
        </div>

        {/* Bottom Row: Name and Email Cards */}
        <div className="flex flex-row space-x-4 mb-4">
          {/* Name Card (Editable) */}
          <div className="flex items-center space-x-4 p-4 rounded-xl shadow hover:shadow-2xl transition flex-1">
            <div className="w-12 h-12 flex items-center justify-center">
              <UserIcon className="w-6 h-6 text-gray-700" />
            </div>
            <div className="flex-1">
              <label className="text-gray-500 text-sm">Full Name</label>
              {editing ? (
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              ) : (
                <p className="text-gray-900 font-medium">{userData.fullName}</p>
              )}
            </div>
          </div>

          {/* Email Card (Read-only) */}
          <div className="flex items-center space-x-4 p-4 rounded-xl shadow hover:shadow-2xl transition flex-1">
            <div className="w-12 h-12 flex items-center justify-center">
              <Mail className="w-6 h-6 text-gray-700" />
            </div>
            <div>
              <label className="text-gray-500 text-sm">Email</label>
              <p className="text-gray-900 font-medium">{userData.email}</p>
            </div>
          </div>
        </div>

        {/* Account Settings: Change Profile Image */}
        {editing && (
          <div className="mb-4 rounded-2xl shadow-lg p-6">
            <label className="block mb-2 text-gray-700 font-medium">
              Profile Image
            </label>
            <div className="flex items-center gap-4">
              <label className="px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-xl cursor-pointer transition-colors duration-200 font-medium text-gray-700">
                Choose File
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              <span className="text-gray-600">
                {selectedImage ? selectedImage.name : "No file chosen"}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Account Details Grid */}
      <div className="bg-white rounded-2xl shadow-lg p-6 w-4/5">
        <h3 className="text-xl font-bold mb-6">Account Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Joining Date */}
          <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-xl shadow hover:shadow-2xl transition">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <label className="text-gray-500 text-sm">Joining Date</label>
              <p className="text-gray-900 font-medium">
                {new Date(userData.joinDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Last Updated */}
          <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-xl shadow hover:shadow-2xl transition">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <label className="text-gray-500 text-sm">Last Updated</label>
              <p className="text-gray-900 font-medium">
                {new Date(userData.lastUpdated).toLocaleDateString()} at{" "}
                {new Date(userData.lastUpdated).toLocaleTimeString()}
              </p>
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-xl shadow hover:shadow-2xl transition">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Phone className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="flex-1">
              <label className="text-gray-500 text-sm">Phone</label>
              {editing ? (
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              ) : (
                <p className="text-gray-900 font-medium">{userData.phone}</p>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-xl shadow hover:shadow-2xl transition">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <label className="text-gray-500 text-sm">Location</label>
              {editing ? (
                <input
                  type="text"
                  name="location" // ✅ Changed from 'zone' to 'location'
                  value={formData.location}
                  onChange={handleChange}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              ) : (
                <p className="text-gray-900 font-medium">{userData.location}</p>
              )}
            </div>
          </div>

          {/* College */}
          <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-xl shadow hover:shadow-2xl transition">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <School className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="flex-1">
              <label className="text-gray-500 text-sm">College</label>
              <p className="text-gray-900 font-medium">{userData.college}</p>
            </div>
          </div>

          {/* Branch */}
          <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-xl shadow hover:shadow-2xl transition">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Section className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="flex-1">
              <label className="text-gray-500 text-sm">Branch</label>
              <p className="text-gray-900 font-medium">{userData.branch}</p>
            </div>
          </div>
        </div>

        {/* Save Changes */}
        {editing && (
          <div className="flex justify-end mt-4 space-x-3">
            <button
              onClick={handleCancel}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-blue-400 disabled:cursor-not-allowed"
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfileDetails;
