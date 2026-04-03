import config from "../config";
import React, { useEffect, useState } from "react";
import FeedbackCard from "../components/FeedbackCard";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiSearch,
  FiFilter,
  FiX
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import LoadingIndicator from "../components/LoadingIndicator";
import SkeletonLoader from "../components/SkeletonLoader";
import axios from "axios";

const statusIcons = {
  Pending: <FiClock className="text-yellow-400" />,
  Resolved: <FiCheckCircle className="text-green-400" />,
  "In Progress": <FiAlertCircle className="text-blue-400" />,
};

const CivilianHome = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [feedbackType, setFeedbackType] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [urgency, setUrgency] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [feedbacks, setFeedbacks] = useState([]);
  const [user, setUser] = useState();
  const [loading, setLoading] = useState();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userData"));
    if (user) setUser(user);

    const fetchFeedbacks = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${config.API_BASE_URL}/api/feedback/list/?feedback_type=${feedbackType}&category=${category}&status=${status}&urgency=${urgency}&search=${searchQuery.trim().toLowerCase()}`,
          {
            headers: {
              Authorization: `Bearer ${user?.access_token}`,
            },
          }
        );
        setFeedbacks(res.data.results || res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeedbacks();
  }, [feedbackType, urgency, status, category, searchQuery]);

  const handleClearFilter = () => {
    setFeedbackType("");
    setStatus("");
    setCategory("");
    setUrgency("");
  };

  return (
    <div className="p-4 md:p-8 bg-gray-950 text-white min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full lg:w-auto"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-indigo-400 to-blue-500 bg-clip-text text-transparent">
            Community Hub
          </h2>
          <p className="text-gray-300 mt-2 text-sm md:text-base">
            Track and engage with local issues that matter to you.
          </p>
        </motion.div>

        {/* Search Box - Fully Responsive */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative w-full lg:w-80 flex-shrink-0"
        >
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search issues..."
            className="w-full pl-12 pr-4 py-3 bg-gray-900/60 backdrop-blur-md border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white placeholder-gray-400 transition-all shadow-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </motion.div>
      </div>

      {/* Mobile Filter Toggle */}
      <div className="md:hidden mb-4">
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 w-full justify-center bg-gray-900 border border-gray-700 py-3 rounded-xl text-purple-400 font-medium"
        >
          <FiFilter /> {showFilters ? "Hide Filters" : "Show Filters"}
        </button>
      </div>

      {/* Filters Section - Glassmorphism & Responsive Grid */}
      <AnimatePresence>
        {(showFilters || window.innerWidth >= 768) && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8 bg-gray-900/40 backdrop-blur-xl p-4 md:p-5 rounded-2xl border border-gray-800 shadow-xl overflow-hidden"
          >
            <div className="flex flex-col">
              <label className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider">Type</label>
              <select
                className="bg-gray-800 border border-gray-700 text-sm text-white px-3 py-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 appearance-none"
                onChange={(e) => setFeedbackType(e.target.value)}
                value={feedbackType}
              >
                <option value="">All Types</option>
                <option value="COMPLAINT">Complaint</option>
                <option value="SUGGESTION">Suggestion</option>
                <option value="GENERAL COMMENT">General Comment</option>
                <option value="POLICY IDEA">Policy Idea</option>
              </select>
            </div>
            
            <div className="flex flex-col">
              <label className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider">Status</label>
              <select
                className="bg-gray-800 border border-gray-700 text-sm text-white px-3 py-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 appearance-none"
                onChange={(e) => setStatus(e.target.value)}
                value={status}
              >
                <option value="">All Statuses</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="PENDING">Pending</option>
                <option value="RESOLVED">Resolved</option>
                <option value="UNDER REVIEW">Under Review</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider">Category</label>
              <select
                className="bg-gray-800 border border-gray-700 text-sm text-white px-3 py-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 appearance-none"
                onChange={(e) => setCategory(e.target.value)}
                value={category}
              >
                <option value="">All Categories</option>
                {[
                  "INFRASTRUCTURE", "TRANSPORTATION", "EDUCATION", "HEALTHCARE",
                  "SANITATION", "WATER", "ELECTRICITY", "PUBLIC_SAFETY",
                  "ENVIRONMENT", "HOUSING", "TAXATION", "WELFARE",
                  "EMPLOYMENT", "AGRICULTURE", "TOURISM", "CULTURE", "OTHER"
                ].map((cat) => (
                  <option key={cat} value={cat}>{cat.replace("_", " ")}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider">Urgency</label>
              <select
                className="bg-gray-800 border border-gray-700 text-sm text-white px-3 py-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 appearance-none"
                onChange={(e) => setUrgency(e.target.value)}
                value={urgency}
              >
                <option value="">All Levels</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>

            <div className="flex flex-col justify-end">
              <button
                className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-700 text-white px-4 py-2.5 rounded-lg transition-colors border border-gray-700"
                onClick={handleClearFilter}
              >
                <FiX className="text-red-400" /> Clear Filters
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback Cards - Responsive Grid Layout */}
      {loading ? (
        <SkeletonLoader variant="cards" count={6} />
      ) : feedbacks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {feedbacks.map((feedback) => (
            <motion.div
              key={feedback.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <FeedbackCard
                feedback={feedback}
                statusIcon={statusIcons[feedback.status]}
                section="home"
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center text-gray-400 bg-gray-900/30 rounded-2xl border border-gray-800"
        >
          <FiSearch className="text-5xl mb-4 opacity-50" />
          <p className="text-xl font-semibold text-white">No issues found</p>
          <p className="mt-2 text-gray-300">Try adjusting your filters or search query.</p>
        </motion.div>
      )}
    </div>
  );
};

export default CivilianHome;
