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
import SkeletonLoader from "../components/SkeletonLoader";
import axios from "axios";
import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";

const statusIcons = {
  PENDING: <FiClock className="text-yellow-400" />,
  "IN PROGRESS": <FiAlertCircle className="text-blue-400" />,
  RESOLVED: <FiCheckCircle className="text-green-400" />,
};

const statusColors = {
  PENDING: "bg-yellow-500/10 text-yellow-400",
  "IN PROGRESS": "bg-blue-500/10 text-blue-400",
  RESOLVED: "bg-green-500/10 text-green-400",
};

const filters = ["All", "PENDING", "IN PROGRESS", "RESOLVED"];

const normalizeStatus = (s) => {
  if (!s && s !== "") return s;
  const raw = String(s).trim();
  if (raw.toUpperCase() === "IN_PROGRESS" || raw.toUpperCase() === "IN PROGRESS")
    return "IN PROGRESS";
  if (raw.toUpperCase() === "PENDING") return "PENDING";
  if (raw.toUpperCase() === "RESOLVED") return "RESOLVED";
  return raw.toUpperCase();
};

const normalizeStatusForAPI = (s) => {
  if (!s) return s;
  return s.toString().trim().toUpperCase().replace(/\s+/g, "_");
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

        const dataList = Array.isArray(res.data)
          ? res.data
          : res.data?.results ?? res.data?.feedbacks ?? [];

        const normalized = dataList.map((f) => ({
          ...f,
          status: normalizeStatus(f.status),
        }));

        setFeedbacks(normalized);
      } catch (error) {
        console.error("fetchFeedbacks error:", error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

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
            headers: { Authorization: `Bearer ${parsedUser?.access_token}` },
          }
        );
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
        { headers: { Authorization: `Bearer ${user?.access_token}` } }
      );

      if (res.data) {
        localStorage.removeItem("userData");
        navigate("/");
      }
    } catch (error) {
      console.error("logout error:", error.response?.data || error.message);
    }
  };

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

      if (res.data && res.data.id) {
        setFeedbacks((prev) => prev.map((f) => (f.id === id ? { ...f, ...res.data, status: normalizeStatus(res.data.status) } : f)));
      } else {
        setFeedbacks((prev) => prev.map((f) => (f.id === id ? { ...f, status: normalizeStatus(payload.status) } : f)));
      }
    } catch (error) {
      console.error("updateStatus error:", error.message);
    }
  };

  const filteredFeedbacks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return feedbacks.filter((f) => {
      if (activeFilter !== "All" && normalizeStatus(activeFilter) !== normalizeStatus("All")) {
        if (normalizeStatus(activeFilter) !== normalizeStatus(f.status)) return false;
      }
      if (!q) return true;
      const fields = [f.title, f.description, f.feedback_type, f.category, f.location, f.user?.email]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return fields.includes(q);
    });
  }, [feedbacks, searchQuery, activeFilter]);

  return (
    <>
      {/* Stats — skeleton when loading, real cards when ready */}
      {!stats ? (
        <div className="mb-8"><SkeletonLoader variant="stats" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <StatCard icon={<FiMessageSquare className="text-purple-400" />} title="Total Feedback" value={stats?.total_feedback ?? "-"} color="bg-blue-600/10 border-blue-600/30" />
          <StatCard icon={<FiClock className="text-yellow-400" />} title="Pending / Submitted" value={stats?.pending_feedback ?? "-"} color="bg-yellow-500/10 border-yellow-500/30" />
          <StatCard icon={<FiAlertCircle className="text-orange-400" />} title="In Progress" value={stats?.in_progress_feedback ?? "-"} color="bg-orange-500/10 border-orange-500/30" />
          <StatCard icon={<FiCheckCircle className="text-green-400" />} title="Resolved" value={stats?.resolved_feedback ?? "-"} color="bg-green-500/10 border-green-500/30" />
        </div>
      )}

      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-8 bg-gray-900/50 p-4 md:p-5 rounded-2xl border border-gray-800">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="relative w-full xl:w-96 flex-shrink-0">
           <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
             <FiSearch className="text-gray-400" />
           </div>
           <input
             type="text"
             placeholder="Search feedback..."
             className="w-full pl-12 pr-4 py-3 bg-gray-950 border border-gray-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-white placeholder-gray-400 transition-colors shadow-lg"
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
           />
        </motion.div>

        <div className="flex overflow-x-auto w-full pb-2 xl:pb-0 hide-scrollbar rounded-xl">
          <div className="flex gap-2 flex-nowrap">
            {filters.map((filter) => (
              <motion.button
                key={filter}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors border ${
                  activeFilter === filter 
                    ? "bg-blue-500 text-white border-purple-400/30 shadow-lg" 
                    : "bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700 hover:text-white"
                }`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter === "All" ? "All" : filter}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {loading && (
        <SkeletonLoader variant="cards" count={6} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredFeedbacks.length > 0 ? (
            filteredFeedbacks.map((feedback) => (
              <motion.div key={feedback.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="h-full">
                <FeedbackCard
                  feedback={{ ...feedback }}
                  statusIcon={statusIcons[feedback.status] ?? statusIcons["PENDING"]}
                  statusColor={statusColors[feedback.status] ?? statusColors["PENDING"]}
                  showActions={true}
                  adminView={true}
                  onStatusChange={(newStatus) => handleStatusUpdate(newStatus, feedback.id)}
                />
              </motion.div>
            ))
          ) : (
            !loading && (
              <div className="col-span-full flex flex-col items-center justify-center py-16 text-center text-gray-400 bg-gray-900/30 rounded-2xl border border-gray-800">
                <FiSearch className="text-4xl mb-3 opacity-40" />
                <p className="text-lg">No feedbacks found.</p>
              </div>
            )
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

const StatCard = ({ icon, title, value, color }) => (
  <motion.div whileHover={{ y: -4, scale: 1.01 }} className={`p-5 rounded-2xl border ${color} bg-gray-900/40 backdrop-blur-xl shadow-lg transition-transform`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">{title}</p>
        <p className="text-3xl font-extrabold text-white">{value}</p>
      </div>
      <div className="text-4xl p-3 bg-gray-950/50 rounded-xl border border-gray-800">{icon}</div>
    </div>
  </motion.div>
);

export default AdminDashboard;
