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
import axios from "axios";

const statusIcons = {
  PENDING: <FiClock className="text-yellow-500" />,
  "IN PROGRESS": <FiAlertCircle className="text-blue-500" />,
  RESOLVED: <FiCheckCircle className="text-green-500" />,
  "UNDER REVIEW": <FiClock className="text-yellow-500" />,
};

const statusColors = {
  PENDING: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
  "IN PROGRESS": "bg-blue-500/10 text-blue-500 border-blue-500/30",
  RESOLVED: "bg-green-500/10 text-green-500 border-green-500/30",
  "UNDER REVIEW": "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
};

const categories = [
  "INFRASTRUCTURE",
  "TRANSPORTATION",
  "EDUCATION",
  "HEALTHCARE",
  "SANITATION",
  "WATER",
  "ELECTRICITY",
  "PUBLIC_SAFETY",
  "ENVIRONMENT",
  "HOUSING",
  "TAXATION",
  "WELFARE",
  "EMPLOYMENT",
  "AGRICULTURE",
  "TOURISM",
  "CULTURE",
  "OTHER",
];

/** Normalize status values from backend or frontend inputs */
const normalizeStatus = (s) => {
  if (!s && s !== "") return s;
  const raw = String(s).trim();
  if (raw === "") return "";
  const up = raw.toUpperCase();
  if (up === "PENDING") return "PENDING";
  if (up === "UNDER REVIEW" || up === "UNDER_REVIEW") return "UNDER REVIEW";
  if (up === "IN PROGRESS" || up === "IN_PROGRESS") return "IN PROGRESS";
  if (up === "RESOLVED") return "RESOLVED";
  return up;
};

const FeedbackManagement = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [stats, setStats] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Filters
  const [status, setStatus] = useState(""); // API status filter (e.g. 'IN PROGRESS')
  const [category, setCategory] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  // load user once
  useEffect(() => {
    const stored = localStorage.getItem("userData");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  // Debounce search input to avoid too many requests
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 350);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Fetch feedbacks when filters/search change
  useEffect(() => {
    const parsedUser = user || (localStorage.getItem("userData") && JSON.parse(localStorage.getItem("userData")));

    const fetchFeedbacks = async () => {
      try {
        setLoading(true);
        // build query params only if values present
        const params = new URLSearchParams();
        if (status) params.append("status", status);
        if (category) params.append("category", category);
        if (debouncedSearch) params.append("search", debouncedSearch);

        const url = `http://127.0.0.1:8000/api/feedback/admin${params.toString() ? "?" + params.toString() : ""}`;

        const res = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${parsedUser?.access_token}`,
          },
        });

        // backend may return array or { results: [...] } etc.
        const dataList = Array.isArray(res.data) ? res.data : res.data?.results ?? res.data?.feedbacks ?? [];
        // normalize statuses for UI
        const normalized = dataList.map((f) => ({ ...f, status: normalizeStatus(f.status) }));
        setFeedbacks(normalized);
      } catch (err) {
        console.error("fetchFeedbacks error:", err.response?.data ?? err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, category, debouncedSearch, user]);

  // Fetch stats once on mount
  useEffect(() => {
    const parsedUser = user || (localStorage.getItem("userData") && JSON.parse(localStorage.getItem("userData")));

    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://127.0.0.1:8000/api/admin-dashboard/dashboard", {
          headers: { Authorization: `Bearer ${parsedUser?.access_token}` },
        });
        setStats(res.data);
      } catch (err) {
        console.error("fetchStats error:", err.response?.data ?? err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Update status for one feedback item (PATCH)
  const handleStatusUpdate = async (newStatusRaw, id) => {
    const newStatus = normalizeStatus(newStatusRaw);
    const parsedUser = user || (localStorage.getItem("userData") && JSON.parse(localStorage.getItem("userData")));

    // optimistic update: show change immediately while backend updates
    setFeedbacks((prev) => prev.map((f) => (f.id === id ? { ...f, status: newStatus } : f)));

    try {
      const res = await axios.patch(
        `http://127.0.0.1:8000/api/feedback/update/${id}/`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${parsedUser?.access_token}` },
        }
      );

      // If backend returns the updated object (common), merge it
      const updatedObj = res.data && res.data.id ? { ...res.data, status: normalizeStatus(res.data.status) } : null;

      if (updatedObj) {
        setFeedbacks((prev) => prev.map((f) => (f.id === id ? { ...f, ...updatedObj } : f)));
      } else {
        // otherwise we already optimistically set status; optionally re-fetch single item
      }
    } catch (err) {
      console.error("updateStatus error:", err.response?.data ?? err.message);
      // revert optimistic update on error: fetch latest from server or set back
      // Simplest: re-fetch the list (or you can revert based on previous state if you saved it)
      try {
        const re = await axios.get(`http://127.0.0.1:8000/api/feedback/admin`, {
          headers: { Authorization: `Bearer ${parsedUser?.access_token}` },
        });
        const dataList = Array.isArray(re.data) ? re.data : re.data?.results ?? [];
        setFeedbacks(dataList.map((f) => ({ ...f, status: normalizeStatus(f.status) })));
      } catch (err2) {
        console.error("refetch after failed update error:", err2.response?.data ?? err2.message);
      }
    }
  };

  // CSV export — improved escaping: wrap fields in quotes and escape existing quotes
  const exportToCSV = () => {
    if (!feedbacks || feedbacks.length === 0) {
      alert("No feedback data to export.");
      return;
    }

    const headers = ["Title", "Description", "Category", "User Name", "User Email", "Status", "Location", "Date"];
    const escape = (s) => `"${String(s ?? "").replace(/"/g, '""')}"`;

    const csvData = feedbacks.map((f) =>
      [
        escape(f.title),
        escape(f.description),
        escape(f.category),
        escape(`${f.user?.first_name ?? ""} ${f.user?.last_name ?? ""}`.trim()),
        escape(f.user?.email ?? ""),
        escape(f.status),
        escape(f.location ?? ""),
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

  // Clear filters
  const clearAllFilters = () => {
    setSearchQuery("");
    setStatus("");
    setCategory("");
    setActiveFilter("All");
  };

  // Client-side derived list (if you want extra filter 'activeFilter' like PENDING, RESOLVED)
  const filtered = useMemo(() => {
    if (!feedbacks) return [];
    if (activeFilter === "All") return feedbacks;
    const nf = normalizeStatus(activeFilter);
    return feedbacks.filter((f) => normalizeStatus(f.status) === nf);
  }, [feedbacks, activeFilter]);

  return (
    <div className="p-6 bg-gray-950 text-gray-100">
      {/* Header and Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Feedback Management</h1>
          <p className="text-gray-400">Monitor and respond to citizen feedback</p>
        </div>

        <div className="flex space-x-3 mt-4 md:mt-0">
          <button onClick={exportToCSV} className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors">
            <FiDownload className="mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<FiMessageSquare className="text-blue-500" />} title="Total Feedback" value={stats?.total_feedback ?? "-"} />
        <StatCard icon={<FiClock className="text-yellow-500" />} title="Pending" value={stats?.pending_feedback ?? "-"} />
        <StatCard icon={<FiAlertCircle className="text-blue-500" />} title="In Progress" value={stats?.in_progress_feedback ?? "-"} />
        <StatCard icon={<FiCheckCircle className="text-green-500" />} title="Resolved" value={stats?.resolved_feedback ?? "-"} />
      </div>

      {/* Search & filters */}
      <div className="bg-gray-900 rounded-xl p-4 mb-6 border border-gray-800">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search feedback by title, description, location..."
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            <select className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All</option>
              <option value="UNDER REVIEW">Under Review</option>
              <option value="IN PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="REJECTED">Rejected</option>
            </select>

            <select className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <div className="flex items-center">
              <button className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-gray-300 hover:bg-gray-700" onClick={clearAllFilters}>
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden shadow-lg" style={{ minHeight: "50vh" }}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Feedback</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-gray-900 divide-y divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-400">Loading...</td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((feedback) => (
                  <tr key={feedback.id} className="hover:bg-gray-800/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center group-hover:bg-blue-500/10 transition-colors">
                          <FiMessageSquare className="text-blue-400 group-hover:text-blue-300" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">{feedback.title}</div>
                          <div className="text-sm text-gray-400 line-clamp-2">{feedback.description}</div>
                          <div className="text-xs text-gray-500 mt-1 flex items-center">
                            <FiMapPin className="mr-1" size={12} />
                            {feedback.location ?? "Unknown"} • {new Date(feedback?.created_at ?? Date.now()).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm text-white">{feedback.category ?? "-"}</div>
                      <div className="text-xs text-blue-400">{feedback.policy ?? ""}</div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center group-hover:bg-blue-500/10 transition-colors">
                          <FiUser className="text-gray-400 group-hover:text-blue-300" size={14} />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm text-white">{(feedback.user?.first_name ?? "") + (feedback.user?.last_name ? " " + feedback.user.last_name : "")}</div>
                          <div className="text-xs text-gray-400">{feedback.user?.email ?? "-"}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusColors[feedback.status] ?? statusColors["PENDING"]} border`}>
                        {statusIcons[feedback.status] ?? statusIcons["PENDING"]}
                        <span className="ml-1">{feedback.status}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <select
                        className="bg-gray-800 border border-gray-700 rounded px-3 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={feedback.status}
                        onChange={(e) => handleStatusUpdate(e.target.value, feedback.id)}
                      >
                        <option value="UNDER REVIEW">Under Review</option>
                        <option value="IN PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <FiSearch className="text-4xl mb-3" />
                      <p className="text-lg">No feedback found matching your criteria</p>
                      <button className="mt-4 px-4 py-2 text-blue-400 hover:text-blue-300 text-sm bg-blue-500/10 rounded-lg" onClick={clearAllFilters}>
                        Clear all filters
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
  <motion.div whileHover={{ y: -3 }} className="p-4 rounded-xl border bg-gray-800/50 border-gray-700 transition-all">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-300">{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
      <div className="text-2xl">{icon}</div>
    </div>
  </motion.div>
);

export default FeedbackManagement;
