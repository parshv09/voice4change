import config from "../config";
import React, { useState, useEffect, useMemo } from "react";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiSearch,
  FiMapPin,
  FiMessageSquare,
  FiUser,
  FiDownload,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import SkeletonLoader from "../components/SkeletonLoader";
import LoadingIndicator from "../components/LoadingIndicator";
import axios from "axios";

const statusIcons = {
  PENDING: <FiClock className="text-yellow-400" />,
  "IN PROGRESS": <FiAlertCircle className="text-blue-500" />,
  RESOLVED: <FiCheckCircle className="text-green-400" />,
  "UNDER REVIEW": <FiClock className="text-orange-400" />,
};

const statusColors = {
  PENDING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  "IN PROGRESS": "bg-blue-500/10 text-purple-400 border-blue-500/30",
  RESOLVED: "bg-green-500/10 text-green-400 border-green-500/30",
  "UNDER REVIEW": "bg-orange-500/10 text-orange-400 border-orange-500/30",
};

const categories = [
  "INFRASTRUCTURE", "TRANSPORTATION", "EDUCATION", "HEALTHCARE", "SANITATION",
  "WATER", "ELECTRICITY", "PUBLIC_SAFETY", "ENVIRONMENT", "HOUSING",
  "TAXATION", "WELFARE", "EMPLOYMENT", "AGRICULTURE", "TOURISM", "CULTURE", "OTHER",
];

const normalizeStatus = (s) => {
  if (!s && s !== "") return s;
  const raw = String(s).trim().toUpperCase();
  if (raw === "") return "";
  if (raw === "UNDER REVIEW" || raw === "UNDER_REVIEW") return "UNDER REVIEW";
  if (raw === "IN PROGRESS" || raw === "IN_PROGRESS") return "IN PROGRESS";
  if (raw === "PENDING") return "PENDING";
  if (raw === "RESOLVED") return "RESOLVED";
  return raw;
};

const FeedbackManagement = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [stats, setStats] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const [status, setStatus] = useState(""); 
  const [category, setCategory] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    const stored = localStorage.getItem("userData");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 350);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    const parsedUser = user || (localStorage.getItem("userData") && JSON.parse(localStorage.getItem("userData")));

    const fetchFeedbacks = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (status) params.append("status", status);
        if (category) params.append("category", category);
        if (debouncedSearch) params.append("search", debouncedSearch);

        const url = `${config.API_BASE_URL}/api/feedback/admin/${params.toString() ? "?" + params.toString() : ""}`;

        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${parsedUser?.access_token}` },
        });

        const dataList = Array.isArray(res.data) ? res.data : res.data?.results ?? res.data?.feedbacks ?? [];
        const normalized = dataList.map((f) => ({ ...f, status: normalizeStatus(f.status) }));
        setFeedbacks(normalized);
      } catch (err) {
        console.error("fetchFeedbacks error:", err.response?.data ?? err.message);
      } finally {
        setLoading(false);
      }
    };

    if (parsedUser) fetchFeedbacks();
  }, [status, category, debouncedSearch, user]);

  useEffect(() => {
    const parsedUser = user || (localStorage.getItem("userData") && JSON.parse(localStorage.getItem("userData")));

    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${config.API_BASE_URL}/api/admin-dashboard/dashboard/`, {
          headers: { Authorization: `Bearer ${parsedUser?.access_token}` },
        });
        setStats(res.data);
      } catch (err) {
        console.error("fetchStats error:", err.response?.data ?? err.message);
      } finally {
        setLoading(false);
      }
    };

    if (parsedUser) fetchData();
  }, [user]);

  const handleStatusUpdate = async (newStatusRaw, id) => {
    const newStatus = normalizeStatus(newStatusRaw);
    const parsedUser = user || (localStorage.getItem("userData") && JSON.parse(localStorage.getItem("userData")));

    setFeedbacks((prev) => prev.map((f) => (f.id === id ? { ...f, status: newStatus } : f)));

    try {
      const res = await axios.patch(
        `${config.API_BASE_URL}/api/feedback/update/${id}/`,
        { status: newStatus.replace(" ", "_") },
        { headers: { Authorization: `Bearer ${parsedUser?.access_token}` } }
      );

      const updatedObj = res.data && res.data.id ? { ...res.data, status: normalizeStatus(res.data.status) } : null;

      if (updatedObj) {
        setFeedbacks((prev) => prev.map((f) => (f.id === id ? { ...f, ...updatedObj } : f)));
      }
    } catch (err) {
      console.error("updateStatus error:", err.response?.data ?? err.message);
      try {
        const re = await axios.get(`${config.API_BASE_URL}/api/feedback/admin/`, {
          headers: { Authorization: `Bearer ${parsedUser?.access_token}` },
        });
        const dataList = Array.isArray(re.data) ? re.data : re.data?.results ?? [];
        setFeedbacks(dataList.map((f) => ({ ...f, status: normalizeStatus(f.status) })));
      } catch (err2) {
        console.error("refetch after failed update error:", err2.response?.data ?? err2.message);
      }
    }
  };

  const exportToCSV = () => {
    if (!feedbacks || feedbacks.length === 0) {
      alert("No feedback data to export.");
      return;
    }

    const headers = ["Title", "Description", "Category", "User Name", "User Email", "Status", "Location", "Date"];
    const escape = (s) => `"${String(s ?? "").replace(/"/g, '""')}"`;

    const csvData = feedbacks.map((f) =>
      [
        escape(f.title), escape(f.description), escape(f.category),
        escape(`${f.user?.first_name ?? ""} ${f.user?.last_name ?? ""}`.trim()),
        escape(f.user?.email ?? ""), escape(f.status), escape(f.location ?? ""),
        escape(new Date(f.created_at ?? Date.now()).toLocaleString()),
      ].join(",")
    );

    const csvContent = [headers.join(","), ...csvData].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "feedback_data.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setStatus("");
    setCategory("");
    setActiveFilter("All");
  };

  const filtered = useMemo(() => {
    if (!feedbacks) return [];
    if (activeFilter === "All") return feedbacks;
    const nf = normalizeStatus(activeFilter);
    return feedbacks.filter((f) => normalizeStatus(f.status) === nf);
  }, [feedbacks, activeFilter]);

  return (
    <div className="flex flex-col space-y-6">
      {/* Header and Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-white mb-1 tracking-wide">Feedback Management</h1>
          <p className="text-gray-300">Monitor and respond to citizen feedback</p>
        </div>

        <div className="flex space-x-3 mt-4 md:mt-0">
          <motion.button 
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
             onClick={exportToCSV} 
             className="flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-500/20 rounded-lg text-sm text-white font-semibold transition-all">
            <FiDownload className="mr-2" />
            Export CSV
          </motion.button>
        </div>
      </div>

      {/* Stats - skeleton or real */}
      {!stats ? (
        <SkeletonLoader variant="stats" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<FiMessageSquare className="text-blue-500" />} title="Total Feedback" value={stats?.total_feedback ?? "-"} />
          <StatCard icon={<FiClock className="text-yellow-400" />} title="Pending / Submitted" value={stats?.pending_feedback ?? "-"} />
          <StatCard icon={<FiAlertCircle className="text-purple-400" />} title="In Progress" value={stats?.in_progress_feedback ?? "-"} />
          <StatCard icon={<FiCheckCircle className="text-green-400" />} title="Resolved" value={stats?.resolved_feedback ?? "-"} />
        </div>
      )}

      {/* Search & filters */}
      <div className="bg-gray-900/50 rounded-2xl p-4 md:p-5 border border-gray-700 shadow-lg backdrop-blur-xl">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search feedback by title, description, location..."
              className="w-full pl-12 pr-4 py-2.5 bg-gray-950 border border-gray-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-white placeholder-gray-400 transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <select className="px-4 py-2.5 bg-gray-950 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="UNDER REVIEW">Under Review</option>
              <option value="IN PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="REJECTED">Rejected</option>
            </select>

            <select className="px-4 py-2.5 bg-gray-950 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <button className="px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-300 hover:bg-gray-700 transition-colors" onClick={clearAllFilters}>
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Table Area (Horizontal scrolling for smaller screens) */}
      <div className="bg-gray-900/40 backdrop-blur-xl rounded-2xl border border-gray-700 overflow-hidden shadow-2xl flex-1 flex flex-col min-h-[500px]">
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full divide-y divide-gray-700">
            <thead className="bg-gray-950/80 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-5 text-left w-2/5">Feedback Overview</th>
                <th className="px-6 py-5 text-left w-1/6">Category</th>
                <th className="px-6 py-5 text-left w-1/6">User</th>
                <th className="px-6 py-5 text-left w-1/6">Status</th>
                <th className="px-6 py-5 text-right w-[150px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading ? (
                <>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <tr key={`skel-${i}`} className="border-b border-gray-700">
                      <td className="px-6 py-5">
                        <div className="flex items-start gap-4">
                          <div className="h-10 w-10 rounded-xl bg-gray-800 animate-pulse flex-shrink-0" />
                          <div className="space-y-2 flex-1">
                            <div className="h-4 w-3/4 bg-gray-800 rounded animate-pulse" />
                            <div className="h-3 w-full bg-gray-800 rounded animate-pulse" />
                            <div className="h-2.5 w-1/3 bg-gray-800 rounded animate-pulse" />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5"><div className="h-6 w-24 bg-gray-800 rounded-lg animate-pulse" /></td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-gray-800 animate-pulse" />
                          <div className="space-y-1.5">
                            <div className="h-3.5 w-20 bg-gray-800 rounded animate-pulse" />
                            <div className="h-2.5 w-28 bg-gray-800 rounded animate-pulse" />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5"><div className="h-6 w-20 bg-gray-800 rounded-full animate-pulse" /></td>
                      <td className="px-6 py-5 text-right"><div className="h-7 w-24 bg-gray-800 rounded-lg ml-auto animate-pulse" /></td>
                    </tr>
                  ))}
                </>
              ) : filtered.length > 0 ? (
                filtered.map((feedback) => (
                  <tr key={feedback.id} className="hover:bg-gray-800/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 h-10 w-10 mt-1 rounded-xl bg-gray-950 border border-gray-700 flex items-center justify-center group-hover:border-blue-500/50 transition-colors">
                          <FiMessageSquare className="text-gray-300 group-hover:text-purple-400" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-white line-clamp-1">{feedback.title}</div>
                          <div className="text-xs text-gray-400 line-clamp-2 mt-1 leading-relaxed">{feedback.description}</div>
                          <div className="text-[11px] text-blue-500 mt-2 flex items-center font-medium tracking-wide">
                            <FiMapPin className="mr-1" size={10} />
                            {feedback.location ?? "Unknown"} <span className="mx-2 text-gray-700">•</span> {new Date(feedback?.created_at ?? Date.now()).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-xs font-bold tracking-wider text-purple-400 bg-blue-500/10 inline-flex px-2.5 py-1 rounded-lg border border-blue-500/20">{feedback.category ?? "-"}</div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-tr from-gray-700 to-gray-700 flex items-center justify-center text-xs font-bold text-gray-300">
                           {feedback.user?.first_name?.charAt(0) || "U"}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-semibold text-white">{`${feedback.user?.first_name ?? ""} ${feedback.user?.last_name ?? ""}`.trim() || "Anonymous"}</div>
                          <div className="text-xs text-gray-400 max-w-[150px] truncate">{feedback.user?.email ?? "-"}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-wider border ${statusColors[feedback.status] ?? statusColors["PENDING"]}`}>
                        {statusIcons[feedback.status] ?? statusIcons["PENDING"]}
                        <span className="ml-1.5">{feedback.status}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <select
                        className="bg-gray-950 border border-gray-700 cursor-pointer hover:border-blue-500 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none"
                        value={feedback.status}
                        onChange={(e) => handleStatusUpdate(e.target.value, feedback.id)}
                      >
                        <option value="UNDER REVIEW">Wait: Review</option>
                        <option value="IN PROGRESS">Set: In Progress</option>
                        <option value="RESOLVED">Set: Resolved</option>
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <FiSearch className="text-4xl mb-4 opacity-30" />
                      <p className="text-lg font-medium text-gray-300">No feedback cases match your criteria</p>
                      <button className="mt-4 px-5 py-2 text-purple-400 hover:text-white text-sm bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-xl transition-all" onClick={clearAllFilters}>
                        Clear All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon }) => (
  <motion.div whileHover={{ y: -3, scale: 1.01 }} className="p-5 rounded-2xl bg-gray-900/60 backdrop-blur-xl border border-gray-700 shadow-lg transition-transform">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">{title}</p>
        <p className="text-3xl font-extrabold text-white">{value}</p>
      </div>
      <div className="text-4xl p-3 bg-gray-950/50 rounded-xl border border-gray-800">{icon}</div>
    </div>
  </motion.div>
);

export default FeedbackManagement;
