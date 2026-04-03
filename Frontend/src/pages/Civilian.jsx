import config from "../config";
import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Home from "../pages/CivilianHome";
import CreateFeedback from "../pages/NewFeedback";
import MyFeedbacks from "../pages/MyFeedbacks";
import Profile from "../pages/Profile";
import { FiLogOut, FiChevronDown } from "react-icons/fi";
import { FaUserCircle } from "react-icons/fa";
import logo from "../assets/logo.png";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import LanguageSelector from "../components/LanguageSelector";

const CivilianDashboard = () => {
  const [activeTab, setActiveTab] = useState("myfeedbacks");
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const userData = JSON.parse(localStorage.getItem("userData"));

  const handleLogout = async () => {
    try {
      const res = await axios.post(
        `${config.API_BASE_URL}/api/auth/logout/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${userData?.access_token}`,
          },
        }
      );

      if (res.data) {
        localStorage.removeItem("userData");
        navigate("/");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-950 text-white overflow-x-hidden">
      {/* Top Navbar */}
      <nav className="flex justify-between items-center px-4 md:px-6 py-3 bg-gray-900/80 backdrop-blur-xl border-b border-gray-700 w-full h-16 z-50 fixed top-0">
        <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="flex items-center">
          <img src={logo} alt="Voice4Change Logo" className="h-8 w-auto mr-3 hidden sm:block" />
          <span className="font-bold text-lg bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent tracking-wide">Community Watch</span>
        </motion.div>

        <div className="flex items-center space-x-3 md:space-x-4">
          <LanguageSelector />
          <div className="relative">
            <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center space-x-2 cursor-pointer bg-gray-800 px-3 py-1.5 rounded-full border border-gray-700"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="flex items-center space-x-3">
              {userData?.user.profilePic ? (
                <img src={userData?.user.profilePic} alt="Profile" className="w-8 h-8 rounded-full object-cover border-2 border-blue-500" />
              ) : (
                <FaUserCircle className="text-blue-500 text-2xl md:text-3xl" />
              )}
              <div className="text-right hidden sm:block">
                <p className="font-semibold text-sm text-white tracking-wide">{userData?.user.first_name} {userData?.user.last_name}</p>
              </div>
              <FiChevronDown className={`text-gray-300 transition-transform ${showDropdown ? "rotate-180" : ""}`} />
            </div>
          </motion.div>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {showDropdown && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute right-0 mt-3 w-56 bg-gray-900/90 backdrop-blur-xl rounded-xl shadow-2xl z-50 border border-gray-700 overflow-hidden">
                <div className="p-2">
                  <div className="px-4 py-3 sm:hidden border-b border-gray-700">
                      <p className="font-medium text-white">{userData?.user.first_name} {userData?.user.last_name}</p>
                      <p className="text-xs text-gray-400 truncate">{userData?.user.email}</p>
                  </div>
                  <button onClick={() => { setShowDropdown(false); setActiveTab("profile"); }} className="block w-full text-left px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors">View Profile</button>
                  <div className="my-1 border-t border-gray-700"></div>
                  <button onClick={handleLogout} className="flex items-center w-full text-left px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-900/20 hover:text-red-200 rounded-lg transition-colors">
                    <FiLogOut className="mr-2" /> Logout
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          </div>
        </div>
      </nav>

      <div className="flex flex-1 pt-16">
        <Sidebar activeTab={activeTab} setActivePage={setActiveTab} />
        <main className="flex-1 p-4 md:p-8 md:ml-64 w-full h-full min-h-[calc(100vh-64px)] overflow-x-hidden">
           <AnimatePresence mode="wait">
             <motion.div 
               key={activeTab} 
               initial={{ opacity: 0, y: 10 }} 
               animate={{ opacity: 1, y: 0 }} 
               exit={{ opacity: 0, y: -10 }} 
               transition={{ duration: 0.3 }}
               className="w-full max-w-7xl mx-auto h-full"
             >
               {activeTab === "home" && <Home />}
               {activeTab === "create" && <CreateFeedback />}
               {activeTab === "myfeedbacks" && <MyFeedbacks />}
               {activeTab === "profile" && <Profile />}
             </motion.div>
           </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default CivilianDashboard;
