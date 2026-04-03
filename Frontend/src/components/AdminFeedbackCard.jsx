import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiMessageSquare, FiThumbsUp, FiPaperclip, FiSettings, FiCheckCircle, FiClock, FiMapPin, FiChevronDown  } from "react-icons/fi";

const AdminFeedbackCard = ({ feedback, statusIcon, statusColor, adminView = false, onStatusChange }) => {
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const statuses = ["PENDING", "IN PROGRESS", "RESOLVED"];

  const handleStatusSelect = (status) => {
    if (onStatusChange) onStatusChange(status);
    setShowStatusMenu(false);
  };

  return (
    <div className="flex flex-col h-full bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-gray-700 hover:bg-gray-800/80 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300">
      <div className="p-5 flex-1 flex flex-col">
        {/* Header: Title and Status Tag/Menu */}
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-white leading-snug flex-1 pr-4 line-clamp-2">
            {feedback.title}
          </h3>
          
          {/* Status Badge & Actions */}
          <div className="relative">
            <button 
               onClick={() => adminView && setShowStatusMenu(!showStatusMenu)}
               disabled={!adminView}
               className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-wider transition-colors ${statusColor} border-opacity-30 ${adminView ? 'hover:bg-opacity-20 cursor-pointer' : 'cursor-default'}`}
            >
              {statusIcon}
              <span>{feedback.status}</span>
              {adminView && <FiChevronDown className={`ml-1 transition-transform ${showStatusMenu ? "rotate-180" : ""}`} />}
            </button>

            {/* Status Dropdown Menu */}
            <AnimatePresence>
              {showStatusMenu && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: 5 }} 
                  className="absolute right-0 mt-2 w-40 bg-gray-800 border border-gray-700 rounded-xl shadow-xl z-10 overflow-hidden"
                >
                  {statuses.map(s => (
                     <button
                       key={s}
                       onClick={() => handleStatusSelect(s)}
                       className={`w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-gray-700 transition-colors ${s === feedback.status ? "text-purple-400" : "text-gray-300"}`}
                     >
                       {s}
                     </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-400 text-sm mb-5 flex-1 line-clamp-3 leading-relaxed">
          {feedback.description}
        </p>

        {/* Action/Metadata Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5 text-xs font-medium text-gray-300">
          <div className="flex items-center gap-2 bg-gray-950/50 px-3 py-2 rounded-lg border border-gray-800">
            <FiMapPin className="text-blue-500" />
            <span className="truncate">{feedback.location}</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-950/50 px-3 py-2 rounded-lg border border-gray-800">
            <FiClock className="text-blue-500" />
            <span className="truncate">{new Date(feedback.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Interactive Stats */}
        <div className="flex items-center gap-4 text-sm font-semibold text-gray-300">
          <span className="flex items-center gap-1.5">
            <FiThumbsUp className="text-blue-600" />
            {feedback.upvotes || 0}
          </span>
          <span className="flex items-center gap-1.5">
            <FiMessageSquare className="text-blue-600" />
            {feedback.comments || 0}
          </span>
          {feedback.attachments > 0 && (
            <span className="flex items-center gap-1.5">
              <FiPaperclip className="text-blue-600" />
              {feedback.attachments}
            </span>
          )}
        </div>
      </div>

      {/* Admin specific Footer */}
      {adminView && (
        <div className="bg-gray-950/60 border-t border-gray-700 px-5 py-3 rounded-b-2xl">
          <div className="flex items-center justify-between text-xs font-medium">
             <span className="text-gray-400">Author</span>
             <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-gradient-to-tr from-blue-500 to-purple-400 rounded-full flex items-center justify-center text-blue-900 font-bold text-[10px]">
                  {feedback.user?.first_name?.charAt(0) || "U"}
                </div>
                <span className="text-white">{feedback.user?.first_name} {feedback.user?.last_name}</span>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFeedbackCard;