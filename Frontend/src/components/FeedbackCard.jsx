import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { MdEdit, MdDelete } from "react-icons/md";
import { FaLocationDot, FaRegHeart, FaHeart, FaComment } from "react-icons/fa6";

const FeedbackCard = ({ feedback, section, onDeleted, onUpdated }) => {
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState([]);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [user, setUser] = useState();
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    if (userData) setUser(userData);
  }, []);

  const handleLike = () => setLikes((s) => s + 1);

  const handleEdit = () => navigate(`/civilian-update/${feedback.id}`);

  const handleDelete = async () => {
    console.log("handleDelete invoked for id:", feedback.id);
    const token = user?.access_token;
    if (!token) {
      console.error("No token found in localStorage userData");
      alert("You are not authenticated. Please login again.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this feedback?")) return;

    try {
      setLoadingDelete(true);

      const res = await axios.delete(
        `http://127.0.0.1:8000/api/feedback/delete/${feedback.id}/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Delete response:", res.status, res.data);

      // Defensive: convert id types consistently
      const deletedId = Number(feedback.id);

      // Notify parent to remove from its list
      if (typeof onDeleted === "function") {
        console.log("Calling onDeleted with id:", deletedId);
        onDeleted(deletedId);
      } else {
        console.warn("onDeleted prop is not a function or not provided.");
      }
    } catch (err) {
      console.error("Delete failed:", err.response ?? err);
      alert("Delete failed: " + (err.response?.data?.detail ?? err.message));
    } finally {
      setLoadingDelete(false);
    }
  };

  return (
    <div
      className="p-6 bg-gradient-to-br from-[#2A2B3A] to-[#1E1E2E] 
rounded-lg shadow-lg border border-gray-700 hover:scale-105 
transition-transform duration-300 hover:shadow-blue-500/30"
    >
      {/* Feedback Title & Description */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-blue-400">
          {feedback.title}
        </h3>
        {section !== "home" && (
          <div>
            <MdEdit
              className="cursor-pointer text-lg text-green-400 hover:text-green-500 inline mx-2"
              onClick={handleEdit}
            />
            {/* Wrap the icon in a button so disabled works */}
            <button
              onClick={handleDelete}
              disabled={loadingDelete}
              aria-label="delete feedback"
              className="inline mx-2"
              title="Delete feedback"
            >
              <MdDelete
                className={`cursor-pointer text-lg ${
                  loadingDelete ? "text-gray-400" : "text-red-400 hover:text-red-500"
                }`}
              />
            </button>
          </div>
        )}
      </div>

      <p className="text-gray-300 mt-2">{feedback.description}</p>

      {/* Additional Details */}
      <div className="mt-3 text-sm text-gray-400 flex justify-between items-center gap-4">
        <div className="flex gap-2 items-center">
          <FaLocationDot />
          <span>{feedback.location}</span>
        </div>

        <span>🕒 {new Date(feedback.created_at).toDateString()}</span>
        <span> {feedback.feedback_type}</span>
      </div>

      {/* Status Tag */}
      <span
        className={`inline-block px-3 py-1 mt-3 text-xs font-bold uppercase rounded-full ${
          String(feedback.status).toUpperCase() === "RESOLVED"
            ? "bg-green-600"
            : "bg-yellow-600 text-gray-100"
        }`}
      >
        {feedback.status}
      </span>

      {/* Like & Comment Section */}
      <div className="mt-4 flex items-center gap-4">
        <button
          onClick={handleLike}
          className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition"
        >
          {likes > 0 ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
          <span>{likes}</span>
        </button>

        {section === "home" && (
          <button className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition">
            <FaComment />
            <span>{comments.length}</span>
          </button>
        )}
      </div>

      {section === "home" && (
        <button
          onClick={() => console.log("view more clicked")}
          className="mt-2 w-full bg-blue-600 py-2 rounded-md text-white hover:bg-blue-700 transition"
        >
          View More
        </button>
      )}
    </div>
  );
};

export default FeedbackCard;
