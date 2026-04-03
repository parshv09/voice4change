import React, { useState } from "react";

const Sidebar = ({ activeTab, setActivePage }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Sidebar Toggle Button for Small Screens */}
      <button
        className="md:hidden fixed bottom-6 right-6 z-50 bg-blue-500 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-105"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? "✖" : "☰"}
      </button>

      {/* Sidebar with Glassmorphism Effect */}
      <aside
        className={`fixed top-16 left-0 h-[calc(100vh-64px)] w-64 bg-gray-900/80 backdrop-blur-2xl text-white p-6 shadow-2xl border-r border-gray-700 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300 ease-in-out z-40 flex flex-col`}
      >
        <h2 className="text-xl font-extrabold mb-8 text-blue-500 uppercase tracking-widest text-center mt-2">
          Dashboard
        </h2>
        <nav className="space-y-3 flex-1">
          {["home", "create", "myfeedbacks"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActivePage(tab);
                setIsOpen(false);
              }}
              className={`flex items-center w-full text-left py-3 px-4 rounded-xl text-sm transition-all font-semibold tracking-wide ${
                activeTab === tab
                  ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <span className="text-lg mr-3">
                {tab === "home" && "🏠"}
                {tab === "create" && "➕"}
                {tab === "myfeedbacks" && "📂"}
              </span>
              <span>
                {tab === "home" && "Home"}
                {tab === "create" && "Create Feedback"}
                {tab === "myfeedbacks" && "My Feedbacks"}
              </span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Overlay when Sidebar is Open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
};

export default Sidebar;