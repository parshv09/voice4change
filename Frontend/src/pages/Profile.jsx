import React, { useEffect, useState } from "react";
import { FaUserCircle, FaEnvelope, FaIdBadge, FaMapMarkerAlt, FaPhone, FaBriefcase, FaBuilding, FaEdit, FaCheck, FaTimes } from "react-icons/fa";
import LoadingIndicator from "../components/LoadingIndicator";
import ButtonSpinner from "../components/ButtonSpinner";
import config from "../config";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("userData"));
        if (!userData || !userData.access_token) {
          setError("No authentication token found. Please log in again.");
          setLoading(false);
          return;
        }

        const res = await axios.get(`${config.API_BASE_URL}/api/auth/profile/`, {
          headers: { Authorization: `Bearer ${userData.access_token}` },
        });

        setUser(res.data);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setError("Unable to load profile data from server.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleEditToggle = () => {
    if (!isEditing) {
      // populate form data when entering edit mode
      setFormData({
        first_name: user?.first_name || "",
        last_name: user?.last_name || "",
        phone: user?.phone || "",
        address: user?.address || "",
        occupation: user?.occupation || "",
      });
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const userData = JSON.parse(localStorage.getItem("userData"));
      const res = await axios.patch(
        `${config.API_BASE_URL}/api/auth/profile/`,
        formData,
        {
          headers: { Authorization: `Bearer ${userData.access_token}` },
        }
      );
      setUser(res.data);
      
      // Sync local storage display name if needed immediately
      if (userData && userData.user) {
        userData.user.first_name = res.data.first_name;
        userData.user.last_name = res.data.last_name;
        localStorage.setItem("userData", JSON.stringify(userData));
      }

      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update profile:", err);
      toast.error(err.response?.data?.detail || "Failed to save profile changes.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[50vh]">
         <LoadingIndicator message="Fetching profile securely..." />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex items-center justify-center h-full min-h-[50vh] text-red-400">
        <p className="bg-red-900/20 px-6 py-3 rounded-xl border border-red-500/30 font-medium">
            {error || "Profile data not found"}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="p-4 md:p-8 text-white min-h-full w-full">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-extrabold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
                User Profile
              </h2>
              <p className="text-gray-300 mt-1 text-sm">
                Your active community directory details.
              </p>
            </div>
            
            <button
              onClick={handleEditToggle}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white border border-gray-600 rounded-xl transition-colors shadow-lg max-w-[150px] justify-center"
            >
              {isEditing ? <><FaTimes className="text-red-400" /> Cancel</> : <><FaEdit className="text-blue-400" /> Edit Profile</>}
            </button>
          </div>

          <form onSubmit={handleSave} className="backdrop-blur-xl bg-gray-900/50 p-8 rounded-2xl shadow-xl w-full border border-gray-800">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              
              {/* Avatar Section */}
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 rounded-full bg-gray-800 border-4 border-blue-500/50 flex items-center justify-center overflow-hidden shadow-2xl relative group">
                  {user.profilePic ? (
                    <img src={user.profilePic} alt="Avatar" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <FaUserCircle className="text-blue-500/50 text-8xl" />
                  )}
                </div>
                <span className="mt-4 px-4 py-1 text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-full">
                  {user.role || "Civilian"}
                </span>
              </div>

              {/* Details Section */}
              <div className="flex-1 w-full mt-4 md:mt-0">
              
              {isEditing ? (
                <div className="flex gap-4 mb-6">
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    placeholder="First Name"
                    className="w-full p-3 bg-gray-900/60 border border-gray-700/50 rounded-xl outline-none text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-bold text-lg"
                    required
                  />
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    placeholder="Last Name"
                    className="w-full p-3 bg-gray-900/60 border border-gray-700/50 rounded-xl outline-none text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-bold text-lg"
                    required
                  />
                </div>
              ) : (
                <h3 className="text-2xl font-bold text-white mb-6 text-center md:text-left">
                  {user.first_name} {user.last_name}
                </h3>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                <div className="bg-gray-800/40 p-4 rounded-xl border border-gray-700/50 hover:bg-gray-800/60 transition-colors flex items-start gap-4">
                  <div className="mt-1 bg-gray-700/50 p-2 rounded-lg text-blue-400">
                    <FaEnvelope />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Email Address</p>
                    <p className="text-white mt-0.5 truncate">{user.email}</p>
                    <p className="text-[10px] text-gray-500 mt-1 italic">Email cannot be changed natively.</p>
                  </div>
                </div>

                <div className="bg-gray-800/40 p-4 rounded-xl border border-gray-700/50 hover:bg-gray-800/60 transition-colors flex items-start gap-4">
                  <div className="mt-1 bg-gray-700/50 p-2 rounded-lg text-blue-400">
                    <FaPhone />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Phone Number</p>
                    {isEditing ? (
                      <input 
                        type="text" 
                        name="phone"
                        value={formData.phone} 
                        onChange={handleInputChange}
                        className="w-full mt-2 p-2 bg-gray-900/60 border border-gray-700/50 rounded-lg outline-none text-white focus:border-blue-500 text-sm"
                        placeholder="Enter phone..."
                      />
                    ) : (
                      <p className="text-white mt-0.5">{user.phone || "Not provided"}</p>
                    )}
                  </div>
                </div>

                <div className="bg-gray-800/40 p-4 rounded-xl border border-gray-700/50 hover:bg-gray-800/60 transition-colors flex items-start gap-4">
                  <div className="mt-1 bg-gray-700/50 p-2 rounded-lg text-blue-400">
                    <FaMapMarkerAlt />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Address</p>
                    {isEditing ? (
                      <textarea 
                        name="address"
                        value={formData.address} 
                        onChange={handleInputChange}
                        className="w-full mt-2 p-2 bg-gray-900/60 border border-gray-700/50 rounded-lg outline-none text-white focus:border-blue-500 text-sm min-h-[40px]"
                        placeholder="Enter location..."
                      />
                    ) : (
                      <p className="text-white mt-0.5">{user.address || "Not provided"}</p>
                    )}
                  </div>
                </div>

                <div className="bg-gray-800/40 p-4 rounded-xl border border-gray-700/50 hover:bg-gray-800/60 transition-colors flex items-start gap-4">
                  <div className="mt-1 bg-gray-700/50 p-2 rounded-lg text-blue-400">
                    <FaBriefcase />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Occupation</p>
                    {isEditing ? (
                      <input 
                        type="text" 
                        name="occupation"
                        value={formData.occupation} 
                        onChange={handleInputChange}
                        className="w-full mt-2 p-2 bg-gray-900/60 border border-gray-700/50 rounded-lg outline-none text-white focus:border-blue-500 text-sm"
                        placeholder="Enter occupation..."
                      />
                    ) : (
                      <p className="text-white mt-0.5">{user.occupation || "Not provided"}</p>
                    )}
                  </div>
                </div>

                {user.department_name && !isEditing && (
                  <div className="bg-gray-800/40 p-4 rounded-xl border border-gray-700/50 hover:bg-gray-800/60 transition-colors flex items-start gap-4 sm:col-span-2">
                    <div className="mt-1 bg-gray-700/50 p-2 rounded-lg text-blue-400">
                      <FaBuilding />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Department Details</p>
                      <p className="text-white mt-0.5">{user.authority_position} @ {user.department_name}</p>
                      {user.work_location && <p className="text-gray-400 text-sm mt-0.5">{user.work_location}</p>}
                    </div>
                  </div>
                )}
                
              </div>

              {isEditing && (
                <div className="mt-8 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white font-bold rounded-xl shadow-lg transition-all"
                  >
                    {isSaving ? <ButtonSpinner text="Saving..." /> : <><FaCheck /> Save Profile Data</>}
                  </button>
                </div>
              )}

            </div>
          </div>
        </form>
      </div>
    </div>
    <ToastContainer />
  </>
);
};

export default Profile;
