import config from "../config";
import React, { useState, useEffect, useMemo } from "react";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiSearch,
  FiMessageSquare,
  FiChevronDown,
  FiLogOut,
} from "react-icons/fi";
import { FaUserCircle } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import FeedbackCard from "../components/AdminFeedbackCard";
import AdminSidebar from "../components/AdminSidebar";
import axios from "axios";
import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";

const statusIcons = {
  PENDING: <FiClock className="text-yellow-400" />,
  "IN PROGRESS": <FiAlertCircle className="text-blue-400" />,
  RESOLVED: <FiCheckCircle className="text-green-400" />,
  // add others if needed
};

const statusColors = {
  PENDING: "bg-yellow-500/10 text-yellow-400",
  "IN PROGRESS": "bg-blue-500/10 text-blue-400",
  RESOLVED: "bg-green-500/10 text-green-400",
};

const filters = ["All", "PENDING", "IN PROGRESS", "RESOLVED"];

const normalizeStatus = (s) => {
  if (!s && s !== "") return s;
  // Accept many forms: 'pending','PENDING','Pending','IN_PROGRESS','IN PROGRESS'
  const raw = String(s).trim();
  if (raw.toUpperCase() === "IN_PROGRESS" || raw.toUpperCase() === "IN PROGRESS")
    return "IN PROGRESS";
  if (raw.toUpperCase() === "PENDING") return "PENDING";
  if (raw.toUpperCase() === "RESOLVED") return "RESOLVED";
  return raw.toUpperCase();
};

const AdminDashboard = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [stats, setStats] = useState();
  const [user, setUser] = useState();
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const navigate = useNavigate();

  // Fetch user & feedbacks once on mount
  useEffect(() => {
    const stored = localStorage.getItem("userData");
    const parsedUser = stored ? JSON.parse(stored) : null;
    if (parsedUser) setUser(parsedUser);

    const fetchFeedbacks = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${config.API_BASE_URL}/api/feedback/admin/`, {
          headers: {
            Authorization: `Bearer ${parsedUser?.access_token}`,
            "Content-Type": "application/json",
          },
        });

        // If API returns {results: [...]} adjust accordingly
        const dataList = Array.isArray(res.data)
          ? res.data
          : res.data?.results ?? res.data?.feedbacks ?? []; // fallback guesses

        // Normalize statuses on load so UI mapping works
        const normalized = dataList.map((f) => ({
          ...f,
          status: normalizeStatus(f.status),
        }));

        console.log("feedbacks fetched", normalized);
        setFeedbacks(normalized);
      } catch (error) {
        console.error("fetchFeedbacks error:", error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, []); // run once

  // Fetch stats (once)
  useEffect(() => {
    const stored = localStorage.getItem("userData");
    const parsedUser = stored ? JSON.parse(stored) : null;
    if (parsedUser) setUser(parsedUser);

    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${config.API_BASE_URL}/api/admin-dashboard/dashboard`,
          {
            headers: {
              Authorization: `Bearer ${parsedUser?.access_token}`,
            },
          }
        );
        console.log("stats:", res.data);
        setStats(res.data);
      } catch (error) {
        console.error("fetchStats error:", error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = async () => {
    try {
      const res = await axios.post(
        `${config.API_BASE_URL}/api/auth/logout/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${user?.access_token}`,
          },
        }
      );

      if (res.data) {
        localStorage.removeItem("userData");
        navigate("/");
      }
    } catch (error) {
      console.error("logout error:", error.response?.data || error.message);
    }
  };

const normalizeStatusForAPI = (s) => {
  if (!s) return s;
  const up = s.toString().trim().toUpperCase().replace(/\s+/g, "_");
  return up; // e.g. "In Progress" -> "IN_PROGRESS"
}
const handleStatusUpdate = async (newStatus, id) => {
  const payload = { status: normalizeStatusForAPI(newStatus) };

  try {
    const res = await axios.patch(
      `${config.API_BASE_URL}/api/feedback/update/${id}/`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${user?.access_token}`,
          "Content-Type": "application/json",
        },
      }
    );

    // If API returns the updated object, update single item in state
    if (res.data && res.data.id) {
      setFeedbacks((prev) => prev.map((f) => (f.id === id ? { ...f, ...res.data } : f)));
    } else {
      // If response is not the full object, just update status locally
      setFeedbacks((prev) => prev.map((f) => (f.id === id ? { ...f, status: payload.status } : f)));
    }
  } catch (error) {
    console.error("updateStatus error status:", error.response?.status);
    console.error("updateStatus error data:", error.response?.data);
    console.error("updateStatus error message:", error.message);
  }
};


  // client-side filtered list (search + filter)
  const filteredFeedbacks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return feedbacks.filter((f) => {
      // Filter by status
      if (activeFilter !== "All" && normalizeStatus(activeFilter) !== normalizeStatus("All")) {
        if (normalizeStatus(activeFilter) !== normalizeStatus(f.status)) return false;
      }
      // Simple search across a few fields
      if (!q) return true;
      const fields = [f.title, f.description, f.feedback_type, f.category, f.location, f.user?.email]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return fields.includes(q);
    });
  }, [feedbacks, searchQuery, activeFilter]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-950 text-white">
      <nav className="flex justify-between items-center p-4 bg-gray-900/80 backdrop-blur-md shadow-md w-full h-16 z-50">
        <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <img src={logo} alt="Voice4Change Logo" className="h-10 w-auto mr-3" />
        </motion.div>

        <div className="relative">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="flex items-center space-x-3">
              {user?.user?.profilePic ? (
                <img src={user.user.profilePic} alt="Profile" className="w-8 h-8 rounded-full object-cover border-2 border-blue-400" />
              ) : (
                <FaUserCircle className="text-blue-400 text-3xl" />
              )}
              <div className="text-right">
                <p className="font-medium text-sm">{user?.user?.first_name} {user?.user?.last_name}</p>
                <p className="text-gray-300 text-xs">{user?.user?.email}</p>
              </div>
              <FiChevronDown className={`transition-transform ${showDropdown ? "rotate-180" : ""}`} />
            </div>
          </motion.div>

          {showDropdown && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg z-50 border border-gray-700">
              <div className="py-1">
                <button onClick={() => setShowDropdown(false)} className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">View Profile</button>
                <div className="border-t border-gray-700"></div>
                <button onClick={handleLogout} className="flex items-center w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors">
                  <FiLogOut className="mr-2" />
                  Logout
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </nav>

      <div className="flex flex-1 pt-16">
        <AdminSidebar />
        <main className="flex-1 p-6 md:ml-64 overflow-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <StatCard icon={<FiMessageSquare className="text-blue-400" />} title="Total Feedback" value={stats?.total_feedback ?? "-"} color="bg-blue-500/10" />
            <StatCard icon={<FiClock className="text-yellow-400" />} title="Pending" value={stats?.pending_feedback ?? "-"} color="bg-yellow-500/10" />
            <StatCard icon={<FiAlertCircle className="text-blue-400" />} title="In Progress" value={stats?.in_progress_feedback ?? "-"} color="bg-blue-500/10" />
            <StatCard icon={<FiCheckCircle className="text-green-400" />} title="Resolved" value={stats?.resolved_feedback ?? "-"} color="bg-green-500/10" />
          </div>

          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search feedback..."
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </motion.div>

            <div className="flex gap-4">
              <div className="flex flex-wrap gap-2">
                {filters.map((filter) => (
                  <motion.button
                    key={filter}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-3 py-1 rounded-full text-xs transition-colors ${activeFilter === filter ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}
                    onClick={() => setActiveFilter(filter)}
                  >
                    {filter === "All" ? "All" : filter}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {loading && <div className="text-lg">Loading...</div>}

          <div className="space-y-4">
            <AnimatePresence>
              {filteredFeedbacks.length > 0 ? (
                filteredFeedbacks.map((feedback) => (
                  <motion.div key={feedback.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                    <FeedbackCard
                      feedback={{ ...feedback }}
                      statusIcon={statusIcons[feedback.status] ?? statusIcons["PENDING"]}
                      statusColor={statusColors[feedback.status] ?? statusColors["PENDING"]}
                      showActions={true}
                      adminView={true}
                      onStatusChange={(newStatus) => updateStatus(feedback.id, newStatus)}
                    />
                  </motion.div>
                ))
              ) : (
                <div className="text-gray-400">No feedbacks found.</div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, color }) => (
  <motion.div whileHover={{ y: -5 }} className={`p-4 rounded-xl border border-gray-800 ${color} backdrop-blur-sm`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-300">{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
      <div className="text-3xl">{icon}</div>
    </div>
  </motion.div>
);

export default AdminDashboard;
