import config from "../config";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { MdEdit, MdDelete } from "react-icons/md";
import { FaLocationDot, FaRegHeart, FaHeart, FaComment } from "react-icons/fa6";
import { FaRegThumbsUp, FaThumbsUp } from "react-icons/fa"; // add this
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
 // Upvote related
const [upvotes, setUpvotes] = useState(Number(feedback.upvotes) || 0);
const [userUpvoted, setUserUpvoted] = useState(Boolean(feedback.user_upvoted));
const [loadingUpvote, setLoadingUpvote] = useState(false);


useEffect(() => {
  setUpvotes(Number(feedback.upvotes) || 0);
  setUserUpvoted(Boolean(feedback.user_upvoted));
}, [feedback.upvotes, feedback.user_upvoted]);

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
        `${config.API_BASE_URL}/api/feedback/delete/${feedback.id}/`,
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

    // keep parent list in sync
    if (typeof onUpdated === "function") {
      onUpdated({
        ...feedback,
        upvotes: Number(serverUpvotes),
        user_upvoted: action === "upvoted",
      });
    }
  } catch (err) {
    console.error("Upvote toggle failed:", err.response ?? err);
    // rollback optimistic change on error
    setUserUpvoted((prev) => !prev);
    setUpvotes((prev) => (userUpvoted ? prev + 1 : Math.max(0, prev - 1)));
    alert(err.response?.data?.detail ?? "Upvote failed");
  } finally {
    setLoadingUpvote(false);
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
           {/* Like, Upvote & Comment Section */}
      <div className="mt-4 flex items-center gap-4">
        {/* local like */}
        {/* <button
          onClick={handleLike}
          className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition"
        >
          {likes > 0 ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
          <span>{likes}</span>
        </button> */}

        {/* Upvote button (integrated with backend) */}
       <button onClick={handleUpvote} disabled={loadingUpvote} title="Upvote">
  { userUpvoted ? <FaThumbsUp className="text-green-400" /> : <FaRegThumbsUp /> }  <div><span>{upvotes}</span></div>

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
