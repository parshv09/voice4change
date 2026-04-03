import config from "../config";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { MdEdit, MdDelete } from "react-icons/md";
import { FaLocationDot, FaRegHeart, FaHeart, FaComment } from "react-icons/fa6";
import { FaRegThumbsUp, FaThumbsUp } from "react-icons/fa";

import { createPortal } from "react-dom";

const FeedbackCard = ({ feedback, section, onDeleted, onUpdated }) => {
  const [showModal, setShowModal] = useState(false);
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState([]);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [user, setUser] = useState();
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    if (userData) setUser(userData);

    // Prevent body scroll when modal is open
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showModal]);

  const [upvotes, setUpvotes] = useState(Number(feedback.upvotes) || 0);
  const [userUpvoted, setUserUpvoted] = useState(Boolean(feedback.user_upvoted));
  const [loadingUpvote, setLoadingUpvote] = useState(false);

  useEffect(() => {
    setUpvotes(Number(feedback.upvotes) || 0);
    setUserUpvoted(Boolean(feedback.user_upvoted));
  }, [feedback.upvotes, feedback.user_upvoted]);

  const handleEdit = () => navigate(`/civilian-update/${feedback.id}`);

  const handleDelete = async () => {
    const token = user?.access_token;
    if (!token) {
      alert("You are not authenticated. Please login again.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this feedback?")) return;

    try {
      setLoadingDelete(true);

      await axios.delete(
        `${config.API_BASE_URL}/api/feedback/delete/${feedback.id}/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const deletedId = Number(feedback.id);
      if (typeof onDeleted === "function") {
        onDeleted(deletedId);
      }
    } catch (err) {
      console.error("Delete failed:", err.response ?? err);
      alert("Delete failed: " + (err.response?.data?.detail ?? err.message));
    } finally {
      setLoadingDelete(false);
    }
  };

  const handleUpvote = async () => {
    const token = user?.access_token;
    if (!token) {
      alert("Please login to upvote.");
      return;
    }
    if (loadingUpvote) return;

    setLoadingUpvote(true);

    // optimistic UI
    setUserUpvoted((prev) => !prev);
    setUpvotes((prev) => (userUpvoted ? Math.max(0, prev - 1) : prev + 1));

    try {
      const res = await axios.post(
        `${config.API_BASE_URL}/api/vote/feedback/upvote/${feedback.id}/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { action, upvotes: serverUpvotes } = res.data;
      setUpvotes(Number(serverUpvotes));
      setUserUpvoted(action === "upvoted");

      if (typeof onUpdated === "function") {
        onUpdated({
          ...feedback,
          upvotes: Number(serverUpvotes),
          user_upvoted: action === "upvoted",
        });
      }
    } catch (err) {
      console.error("Upvote toggle failed:", err.response ?? err);
      setUserUpvoted((prev) => !prev);
      setUpvotes((prev) => (userUpvoted ? prev + 1 : Math.max(0, prev - 1)));
      alert(err.response?.data?.detail ?? "Upvote failed");
    } finally {
      setLoadingUpvote(false);
    }
  };

  return (
    <>
      <div className="flex flex-col h-full p-6 bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-gray-700 hover:bg-gray-800/80 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300">
        
        {/* Dynamic Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 mr-4">
              <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent line-clamp-2">
                {feedback.title}
              </h3>
              {feedback.photo && (
                <div className="mt-3 relative w-full h-36 rounded-xl overflow-hidden border border-gray-700/50 group">
                  <div className="absolute inset-0 bg-gray-900/20 group-hover:bg-transparent transition-colors z-10" />
                  <img 
                    src={feedback.photo.startsWith('http') ? feedback.photo : `${config.API_BASE_URL.replace(/\/$/, "")}/${feedback.photo.replace(/^\//, "")}`}
                    alt="Attachment" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              )}
          </div>
          
          {section !== "home" && (
            <div className="flex items-center gap-2 bg-gray-950/50 px-2 py-1 rounded-lg border border-gray-700">
              <button onClick={handleEdit} className="text-gray-300 hover:text-green-400 transition-colors p-1" title="Edit">
                <MdEdit className="text-lg" />
              </button>
              <button
                onClick={handleDelete}
                disabled={loadingDelete}
                className={`p-1 transition-colors ${loadingDelete ? "text-gray-700" : "text-gray-300 hover:text-red-400"}`}
                title="Delete"
              >
                <MdDelete className="text-lg" />
              </button>
            </div>
          )}
        </div>

        <p className="text-gray-300 text-sm mb-6 flex-1 line-clamp-3 leading-relaxed">
          {feedback.description}
        </p>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6 text-xs text-gray-400 font-medium">
          <div className="flex items-center gap-2 bg-gray-950/40 px-3 py-2 rounded-lg border border-gray-800">
            <FaLocationDot className="text-blue-500" />
            <span className="truncate">{feedback.location}</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-950/40 px-3 py-2 rounded-lg border border-gray-800">
            <span className="truncate">🕒 {new Date(feedback.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Status & Actions Footer */}
        <div className="flex items-center justify-between border-t border-gray-700 pt-4 mt-auto">
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${
                String(feedback.status).toUpperCase() === "RESOLVED"
                  ? "bg-green-500/10 text-green-400 border-green-500/20"
                  : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
              }`}
            >
              {feedback.status}
            </span>
            <span className="text-xs text-gray-300 bg-gray-800/30 px-2 py-1 rounded-md">
              {feedback.feedback_type}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={handleUpvote} 
              disabled={loadingUpvote} 
              className="flex items-center gap-1.5 hover:text-indigo-400 transition-colors"
            >
              {userUpvoted ? (
                <FaThumbsUp className="text-indigo-500 text-lg" />
              ) : (
                <FaRegThumbsUp className="text-gray-400 text-lg" />
              )}
              <span className={`text-sm font-semibold ${userUpvoted ? "text-indigo-400" : "text-gray-300"}`}>
                {upvotes}
              </span>
            </button>

            {section === "home" && (
              <button className="flex items-center gap-1.5 text-gray-400 hover:text-gray-300 transition-colors">
                <FaComment className="text-lg" />
                <span className="text-sm font-semibold">{comments.length}</span>
              </button>
            )}
          </div>
        </div>

        {section === "home" && (
          <button
            onClick={() => setShowModal(true)}
            className="mt-5 w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-purple-400 hover:text-blue-900 
                       text-white font-semibold py-2.5 rounded-xl transition-all duration-300 shadow-lg shadow-indigo-500/20"
          >
            View More
          </button>
        )}
      </div>

      {/* View More Modal Portal to break out of all container restrictions (e.g. framer-motion) */}
      {showModal && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/80 backdrop-blur-md">
          <div 
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-950 border border-gray-700 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] p-6 md:p-10 custom-scrollbar"
            style={{ overscrollBehavior: 'contain' }}
          >
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 bg-gray-800 hover:bg-red-500 text-gray-300 hover:text-white rounded-full p-2.5 transition-all z-10"
            >
              ✕
            </button>
            
            <div className="flex flex-wrap items-center gap-3 mb-6 pr-12">
              <span
                className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${
                  String(feedback.status).toUpperCase() === "RESOLVED"
                    ? "bg-green-500/10 text-green-400 border-green-500/20"
                    : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                }`}
              >
                {feedback.status}
              </span>
              <span className="text-xs font-semibold text-gray-300 bg-gray-800/50 border border-gray-700 px-3 py-1 rounded-full">
                {feedback.feedback_type}
              </span>
              <span className="text-xs font-semibold text-gray-300 bg-gray-800/50 border border-gray-700 px-3 py-1 rounded-full">
                {feedback.category}
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6 leading-tight max-w-3xl">
              {feedback.title}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-sm text-gray-400 font-medium">
              <div className="flex items-center gap-2 bg-gray-800/40 p-4 rounded-xl border border-gray-700">
                <FaLocationDot className="text-blue-500 text-xl" />
                <span className="truncate text-base">{feedback.location}</span>
              </div>
              <div className="flex items-center gap-2 bg-gray-800/40 p-4 rounded-xl border border-gray-700">
                <span className="truncate text-base">🕒 Submitted: {new Date(feedback.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            {feedback.photo && (
              <div className="mb-8 rounded-xl overflow-hidden border border-gray-700 bg-gray-900 shadow-xl flex justify-center items-center p-2">
                <img 
                  src={feedback.photo.startsWith('http') ? feedback.photo : `${config.API_BASE_URL.replace(/\/$/, "")}/${feedback.photo.replace(/^\//, "")}`}
                  alt="Attachment" 
                  className="w-full max-h-[60vh] object-contain rounded-lg"
                />
              </div>
            )}

            <div className="mb-8">
              <h4 className="text-xl font-semibold text-white mb-4">Feedback Details</h4>
              <p className="text-gray-300 whitespace-pre-wrap leading-relaxed text-lg bg-gray-800/30 p-6 rounded-xl border border-gray-700/50 shadow-inner">
                {feedback.description}
              </p>
            </div>

            <div className="flex justify-end gap-4 border-t border-gray-700 pt-6">
               <button 
                 onClick={handleUpvote} 
                 disabled={loadingUpvote} 
                 className="flex items-center gap-3 px-8 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl border border-gray-600 transition-colors shadow-lg hover:shadow-indigo-500/20"
               >
                 {userUpvoted ? (
                   <FaThumbsUp className="text-indigo-400 text-2xl" />
                 ) : (
                   <FaRegThumbsUp className="text-gray-400 text-2xl" />
                 )}
                 <span className={`font-bold text-lg ${userUpvoted ? "text-indigo-400" : "text-gray-300"}`}>
                   {upvotes} Support
                 </span>
               </button>
            </div>

          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default FeedbackCard;
