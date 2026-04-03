import config from "../config";
import React, { useEffect, useState } from "react";
import FeedbackCard from "../components/FeedbackCard";
import LoadingIndicator from "../components/LoadingIndicator";
import SkeletonLoader from "../components/SkeletonLoader";
import axios from "axios";
import FeedbackModal from "../components/FeedbackModel";
import { motion } from "framer-motion";
import { FiSearch } from "react-icons/fi";

const MyFeedbacks = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lang, setLang] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userData"));

    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${config.API_BASE_URL}/api/feedback/user/`, {
          headers: {
            Authorization: `Bearer ${user?.access_token}`,
          },
        });
        setData(res.data.results || res.data); // ✅ Fix
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
    const handleDeleted = (deletedId) => {
    console.log("handleDeleted called for id:", deletedId);
    setData((prev) => prev.filter((f) => Number(f.id) !== Number(deletedId)));
  };

  const handleUpdateFeedback = (updatedFeedback) => {
    setData((prev) =>
      prev.map((f) => (f.id === updatedFeedback.id ? updatedFeedback : f))
    );
  };

  return (
    <div className="p-4 md:p-8 bg-gray-950 text-white min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">My Feedbacks</h2>
          <p className="text-gray-300 mt-1 text-sm">Track your submitted issues and their progress.</p>
        </div>
      </div>

      {loading ? (
        <SkeletonLoader variant="cards" count={6} />
      ) : data.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {data.map((feedback) => (
            <motion.div
              key={feedback.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <FeedbackCard
                feedback={feedback}
                section="myfeedbacks"
                onDeleted={handleDeleted}
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400 bg-gray-900/30 rounded-2xl border border-gray-800">
          <FiSearch className="text-5xl mb-4 opacity-50" />
          <p className="text-xl font-semibold text-white">No feedbacks submitted yet</p>
          <p className="mt-2 text-gray-300">Submit your first feedback to see it here.</p>
        </div>
      )}
    </div>
  );
};

export default MyFeedbacks;
