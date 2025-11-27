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
  Edit3,
  Save,
  X,
  Camera,
  Upload,
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
          location: data.location || "",
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
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }
      setSelectedImage(file);
      setPreviewImage(URL.createObjectURL(file));
      setImageError(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updateData = new FormData();
      updateData.append("fullName", formData.fullName);
      updateData.append("phone", formData.phone);
      updateData.append("location", formData.location);
      if (selectedImage) updateData.append("profileImage", selectedImage);

      const res = await fetch(`${serverURL}/api/users/me`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: updateData,
      });

      if (!res.ok) throw new Error("Failed to update profile");
      const updatedUser = await res.json();
      setUserData(updatedUser);
      setEditing(false);
      setSelectedImage(null);
      setPreviewImage(null);
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setSelectedImage(null);
    setPreviewImage(null);
    setFormData({
      fullName: userData.fullName || "",
      email: userData.email || "",
      phone: userData.phone || "",
      location: userData.location || "",
      college: userData.college || "",
      branch: userData.branch || "",
    });
  };

  // Helper function to format dates safely
  const formatDate = (dateString, fallback = "Not available") => {
    if (!dateString) return fallback;

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return fallback;

      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return fallback;
    }
  };

  // Helper function to format datetime safely
  const formatDateTime = (dateString, fallback = "Not available") => {
    if (!dateString) return fallback;

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return fallback;

      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Error formatting datetime:", error);
      return fallback;
    }
  };

  // Get the correct last updated field - check multiple possible field names
  const getLastUpdated = () => {
    // Check multiple possible field names for last updated timestamp
    const possibleFields = [
      "lastUpdated",
      "updatedAt",
      "updated_date",
      "modifiedAt",
      "last_updated",
      "updated",
    ];

    for (const field of possibleFields) {
      if (userData[field]) {
        return userData[field];
      }
    }

    // If no specific last updated field, use current time as fallback
    return new Date().toISOString();
  };

  // Get the correct join date field
  const getJoinDate = () => {
    const possibleFields = [
      "joinDate",
      "createdAt",
      "created_date",
      "joinedAt",
      "join_date",
      "created",
    ];

    for (const field of possibleFields) {
      if (userData[field]) {
        return userData[field];
      }
    }

    return null;
  };

  // Enhanced Info Card Component
  const InfoCard = ({ icon, label, value, editable, name, type = "text" }) => (
    <div className="flex items-start gap-3 sm:gap-4 p-4 sm:p-5 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300 group">
      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
        {React.cloneElement(icon, {
          className: "w-5 h-5 sm:w-6 sm:h-6 text-blue-600",
        })}
      </div>
      <div className="flex-1 min-w-0">
        <label className="text-gray-500 text-xs sm:text-sm font-medium mb-1 block">
          {label}
        </label>
        {editable ? (
          <input
            type={type}
            name={name}
            value={formData[name]}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            placeholder={`Enter ${label.toLowerCase()}`}
          />
        ) : (
          <p className="text-gray-900 font-semibold text-sm sm:text-base break-words">
            {value || (
              <span className="text-gray-400 italic">Not provided</span>
            )}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-6 sm:py-8 lg:py-10 px-3 sm:px-4 lg:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden mb-6 sm:mb-8 border border-gray-200">
          {/* Gradient Header */}
          <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              {/* Profile Image and Basic Info */}
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 lg:gap-8 text-center sm:text-left">
                {/* Profile Image with Professional Edit Overlay */}
                <div className="relative group">
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32">
                    {userData.profileImage && !imageError ? (
                      <img
                        src={
                          previewImage ||
                          `${serverURL}/uploads/${userData.profileImage}`
                        }
                        alt={userData.fullName}
                        onError={() => setImageError(true)}
                        className="w-full h-full rounded-full object-cover border-4 border-white shadow-2xl transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl sm:text-3xl shadow-2xl transition-transform duration-300 group-hover:scale-105">
                        {userData.fullName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                    )}

                    {/* Professional Camera Icon Overlay */}
                    {editing && (
                      <>
                        {/* Semi-transparent overlay */}
                        <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        {/* Camera Icon */}
                        <label className="absolute inset-0 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <div className="bg-white bg-opacity-90 rounded-full p-2 sm:p-3 shadow-2xl transform scale-90 group-hover:scale-100 transition-transform duration-300">
                            <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </label>
                      </>
                    )}

                    {/* Always visible small camera icon in corner for editing mode */}
                    {editing && (
                      <label className="absolute -bottom-1 -right-1 w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer border-2 border-white shadow-lg hover:bg-blue-700 transition-all duration-300 hover:scale-110">
                        <Camera className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {/* Edit badge for non-editing mode */}
                  {!editing && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-7 sm:h-7 bg-gray-600 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                      <Camera className="w-3 h-3 text-white opacity-60" />
                    </div>
                  )}
                </div>

                {/* User Info */}
                <div className="flex flex-col text-white space-y-2">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                    {userData.fullName}
                  </h1>
                  <p className="text-blue-200 text-sm sm:text-base lg:text-lg">
                    {userData.email}
                  </p>
                  <div className="flex items-center justify-center sm:justify-start gap-4 text-xs sm:text-sm text-blue-200">
                    <span className="flex items-center gap-1">
                      <School className="w-4 h-4" />
                      {userData.college || "College not set"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Section className="w-4 h-4" />
                      {userData.branch || "Branch not set"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                {editing ? (
                  <>
                    <button
                      onClick={handleCancel}
                      disabled={isSaving}
                      className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-white text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 shadow-md hover:shadow-lg"
                    >
                      <X className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="text-sm sm:text-base">Cancel</span>
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                    >
                      <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="text-sm sm:text-base">
                        {isSaving ? "Saving..." : "Save Changes"}
                      </span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-md hover:shadow-lg"
                  >
                    <Edit3 className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-sm sm:text-base">Edit Profile</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Image Upload Section */}
          {editing && selectedImage && (
            <div className="bg-blue-50 border-t border-blue-200 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shadow-sm">
                    <Upload className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-blue-800 font-medium text-sm sm:text-base">
                      New profile image selected
                    </p>
                    <p className="text-blue-600 text-xs sm:text-sm">
                      {selectedImage.name} (
                      {(selectedImage.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedImage(null);
                    setPreviewImage(null);
                  }}
                  className="px-3 py-2 text-red-600 hover:text-red-700 text-sm font-medium bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Account Details */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 lg:p-8 border border-gray-200">
          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center shadow-sm">
              <UserIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
              Account Details
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            <InfoCard
              icon={<UserIcon />}
              label="Full Name"
              value={userData.fullName}
              editable={editing}
              name="fullName"
            />
            <InfoCard
              icon={<Mail />}
              label="Email Address"
              value={userData.email}
            />
            <InfoCard
              icon={<Phone />}
              label="Phone Number"
              value={userData.phone}
              editable={editing}
              name="phone"
              type="tel"
            />
            <InfoCard
              icon={<MapPin />}
              label="Location"
              value={userData.location}
              editable={editing}
              name="location"
            />
            <InfoCard
              icon={<School />}
              label="College"
              value={userData.college}
            />
            <InfoCard
              icon={<Section />}
              label="Branch"
              value={userData.branch}
            />
            <InfoCard
              icon={<Calendar />}
              label="Member Since"
              value={formatDate(getJoinDate())}
            />
            <InfoCard
              icon={<Clock />}
              label="Last Updated"
              value={formatDateTime(getLastUpdated())}
            />
          </div>

          {/* Debug info - remove in production */}
          <div className="mt-4 p-3 bg-gray-100 rounded-lg hidden">
            <p className="text-xs text-gray-600">Debug Info:</p>
            <p className="text-xs text-gray-600">
              Available fields: {Object.keys(userData).join(", ")}
            </p>
            <p className="text-xs text-gray-600">
              Last Updated raw: {getLastUpdated()}
            </p>
            <p className="text-xs text-gray-600">
              Join Date raw: {getJoinDate()}
            </p>
          </div>

          {/* Edit Mode Action Buttons (Bottom) */}
          {editing && (
            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50 order-2 sm:order-1 shadow-sm hover:shadow-md"
              >
                <X className="w-5 h-5" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2 shadow-sm hover:shadow-md"
              >
                <Save className="w-5 h-5" />
                {isSaving ? "Saving Changes..." : "Save Changes"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileDetails;
