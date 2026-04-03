import config from "../config";
import React, { useState, useEffect } from "react";
import { FiBarChart2, FiPieChart, FiTrendingUp, FiCpu } from "react-icons/fi";
import { motion } from "framer-motion";
import LoadingIndicator from "../components/LoadingIndicator";
import SkeletonLoader from "../components/SkeletonLoader";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from "recharts";

const AiInsights = () => {
  const [loading, setLoading] = useState(false);
  const [geoHotspots, setGeoHotspots] = useState([]);
  const [emergingIssues, setEmergingIssues] = useState([]);
  const [sentimentTrends, setSentimentTrends] = useState([]);
  const [aiAnalysis, setAiAnalysis] = useState();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userData"));
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${config.API_BASE_URL}/api/ai/ai-insights/`, {
          headers: { Authorization: `Bearer ${user?.access_token}` },
        });

        const normalizedHotspots = res.data.geographic_hotspots.map((item) => ({
          location: item.location.charAt(0).toUpperCase() + item.location.slice(1).toLowerCase(),
          total: item.total,
        }));

        const issueMap = {};
        res.data.emerging_issues.forEach((item) => {
          const category = item.category.toUpperCase();
          issueMap[category] = (issueMap[category] || 0) + item.total;
        });
        const normalizedIssues = Object.entries(issueMap).map(([category, total]) => ({
          category, total,
        }));

        const processedSentiments = res.data.sentiment_trends.map((item) => ({
          sentiment_score: item.sentiment_score ?? 0.0,
        }));

        setGeoHotspots(normalizedHotspots || []);
        setEmergingIssues(normalizedIssues || []);
        setSentimentTrends(processedSentiments || []);
        setAiAnalysis(res.data.ai_analysis);
      } catch (error) {
        console.error("Error fetching insights:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const COLORS = ["#3b82f6", "#a855f7", "#6366f1", "#93c5fd", "#4b5563", "#2563eb"];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800/90 backdrop-blur-md p-3 border border-gray-700 rounded-xl shadow-xl">
          <p className="text-white font-semibold text-sm">{label || payload[0].name}</p>
          <p className="text-blue-500 font-bold text-lg">{payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4 md:p-8 bg-gray-950 text-white min-h-screen">
      <div className="flex flex-col mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
          Platform AI Intelligence
        </h1>
        <p className="text-gray-300 mt-2">
          Real-time pattern analysis and sentiment tracking powered by neural networks.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Geo Hotspots */}
        <motion.div whileHover={{ y: -4 }} className="bg-gray-900/40 backdrop-blur-xl rounded-2xl border border-gray-800 p-5 md:p-6 shadow-lg">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-bold text-white">Geographic Hotspots</h3>
              <p className="text-sm text-gray-400">Top locations with high activity</p>
            </div>
            <div className="p-2 bg-gray-800 rounded-lg border border-gray-700"><FiBarChart2 className="text-indigo-400 text-xl" /></div>
          </div>
          <div className="h-72 w-full pt-4">
            {loading ? (
              <LoadingIndicator variant="bars" message="Analyzing patterns..." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={geoHotspots}>
                  <XAxis dataKey="location" stroke="#374151" tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#374151" tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "#1f2937" }} />
                  <Bar dataKey="total" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* Emerging Issues */}
        <motion.div whileHover={{ y: -4 }} className="bg-gray-900/40 backdrop-blur-xl rounded-2xl border border-gray-800 p-5 md:p-6 shadow-lg">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-bold text-white">Emerging Issues</h3>
              <p className="text-sm text-gray-400">Trending category priorities</p>
            </div>
            <div className="p-2 bg-gray-800 rounded-lg border border-gray-700"><FiPieChart className="text-purple-400 text-xl" /></div>
          </div>
          <div className="h-72 w-full">
            {loading ? (
              <LoadingIndicator variant="dots" message="Compiling vectors..." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={emergingIssues} dataKey="total" nameKey="category" cx="50%" cy="50%" innerRadius={60} outerRadius={90} stroke="none" label={{ fill: '#e2e2e6', fontSize: 10 }}>
                    {emergingIssues.map((_, i) => <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#a8b4da' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* Sentiment Trends */}
        <motion.div whileHover={{ y: -4 }} className="bg-gray-900/40 backdrop-blur-xl rounded-2xl border border-gray-800 p-5 md:p-6 shadow-lg xl:col-span-2">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-bold text-white">Sentiment Velocity</h3>
              <p className="text-sm text-gray-400">Predictive sentiment modeling over time</p>
            </div>
            <div className="p-2 bg-gray-800 rounded-lg border border-gray-700"><FiTrendingUp className="text-indigo-400 text-xl" /></div>
          </div>
          <div className="h-72 w-full pt-4">
             {loading ? (
              <LoadingIndicator variant="bars" message="Loading timelines..." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sentimentTrends}>
                  <XAxis stroke="#374151" tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#374151" tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="smooth" dataKey="sentiment_score" stroke="#3b82f6" strokeWidth={3} dot={{ fill: "#030712", stroke: "#6366f1", strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: "#a855f7" }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>
      </div>

      <div className="mt-8 bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl border border-gray-700 p-6 md:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute -top-10 -right-10 opacity-10"><FiCpu className="text-[150px] text-blue-500" /></div>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FiCpu className="text-purple-400" /> AI Strategic Recommendations
        </h2>
        <div className="p-5 bg-gray-900/80 backdrop-blur-md rounded-xl border-l-[6px] border-l-blue-500 border border-y-gray-700 border-r-gray-700">
          <h3 className="text-sm uppercase tracking-widest font-bold text-gray-300 mb-3">Executive Summary</h3>
          <p className="text-white leading-relaxed text-sm md:text-base">{aiAnalysis || "Pending data synthesis. Please wait or check your backend connection to the LLM service."}</p>
        </div>
      </div>
    </div>
  );
};

export default AiInsights;
