import config from "../config";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import React, { useEffect, useState, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import ButtonSpinner from "../components/ButtonSpinner";
import axios from "axios";

const feedbackSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  feedback_type: z.enum([
    "COMPLAINT",
    "SUGGESTION",
    "GENERAL COMMENT",
    "POLICY IDEA",
  ]),
  category: z.enum([
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
  ]),
  location: z.string().min(3, "Location must be at least 3 characters"),
  isAnonymous: z.boolean(),
  urgency: z.enum(["LOW", "MEDIUM", "HIGH"]),
  photo: z.any().refine((file) => file.length > 0, "File is required"),
});

export default function CreateFeedback() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [user, setUser] = useState();

  // file ref (safer to read file)
  const fileRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      isAnonymous: false,
      feedback_type: "COMPLAINT",
      category: "INFRASTRUCTURE",
      urgency: "LOW",
    },
  });

  useEffect(() => {
    const stored = localStorage.getItem("userData");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
      } catch {
        // ignore
      }
    }
  }, []);

  const onSubmit = async (d) => {
    console.log("Submitted Feedback (form values):", d);
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();

      // Append fields (match backend names)
      formData.append("title", d.title);
      formData.append("description", d.description);
      formData.append("feedback_type", d.feedback_type);
      formData.append("category", d.category);
      formData.append("location", d.location);
      formData.append("urgency", d.urgency);

      // Backend expects is_anonymous (snake_case) based on previous messages
      formData.append("is_anonymous", d.isAnonymous ? "true" : "false");

      // Read file from ref and append using backend field name "photo"
      if (d.photo && d.photo.length > 0) {
        formData.append("photo", d.photo[0]);
      }

      // Debug: log FormData entries so you can inspect in console
      for (const pair of formData.entries()) {
        // File objects will show as File {...}
        console.log("formData entry:", pair[0], pair[1]);
      }

      const token = user?.access_token;

      const response = await axios.post(
        `${config.API_BASE_URL}/api/feedback/create/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            // Do NOT set Content-Type manually; browser will set boundary
          },
        }
      );

      console.log("New feedback created successfully:", response.data);
      toast.success("New feedback created");

      // clear form + file input
      reset();
      if (fileRef.current) fileRef.current.value = null;
    } catch (err) {
      console.error("Feedback creation failed:", err.response?.data ?? err.message ?? err);
      setError(err.response?.data?.detail ?? err.response?.data ?? "An error occurred");
      toast.error("Creation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="p-4 md:p-8 text-white min-h-full w-full">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
              Submit Feedback
            </h2>
            <p className="text-gray-300 mt-1 text-sm">
              Report a community issue or submit a civic suggestion.
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="backdrop-blur-xl bg-gray-900/50 p-6 md:p-8 rounded-2xl shadow-xl w-full border border-gray-800"
          >

            {/* Title */}
            <div className="mb-4">
              <label className="block text-white">Title</label>
              <input
                {...register("title")}
                className="w-full p-3 bg-gray-900/60 border border-gray-700/50 rounded-xl outline-none text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-300"
                placeholder="Enter title"
              />
              {errors.title && (
                <p className="text-red-500 text-sm">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="block text-white">Description</label>
              <textarea
                {...register("description")}
                className="w-full p-3 bg-gray-900/60 border border-gray-700/50 rounded-xl outline-none text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-300"
                placeholder="Enter detailed feedback"
              />
              {errors.description && (
                <p className="text-red-500 text-sm">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Feedback Type */}
            <div className="mb-4">
              <label className="block text-white">Feedback Type</label>
              <select
                {...register("feedback_type")}
                className="w-full p-3 bg-gray-900/60 border border-gray-700/50 rounded-xl outline-none text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-300"
              >
                {["COMPLAINT", "SUGGESTION", "GENERAL COMMENT", "POLICY IDEA"].map(
                  (type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* Category */}
            <div className="mb-4">
              <label className="block text-white">Category</label>
              <select
                {...register("category")}
                className="w-full p-3 bg-gray-900/60 border border-gray-700/50 rounded-xl outline-none text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-300"
              >
                {[
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
                ].map((category) => (
                  <option key={category} value={category}>
                    {category.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div className="mb-4">
              <label className="block text-white">Location</label>
              <input
                {...register("location")}
                className="w-full p-3 bg-gray-900/60 border border-gray-700/50 rounded-xl outline-none text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-300"
                placeholder="Enter location"
              />
              {errors.location && (
                <p className="text-red-500 text-sm">{errors.location.message}</p>
              )}
            </div>

            {/* Is Anonymous */}
            <div className="mb-4 flex items-center">
              <input
                type="checkbox"
                {...register("isAnonymous")}
                className="mr-2 accent-blue-500"
              />
              <label className="text-white">Submit as Anonymous</label>
            </div>

            {/* Urgency */}
            <div className="mb-4">
              <label className="block text-white">Urgency</label>
              <select
                {...register("urgency")}
                className="w-full p-3 bg-gray-900/60 border border-gray-700/50 rounded-xl outline-none text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-300"
              >
                {["LOW", "MEDIUM", "HIGH"].map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>

            {/* Feedback Image Upload */}
            <div className="mb-4">
              <label className="block text-white">Upload Image</label>
              <input
                id="photo"
                type="file"
                accept="image/*"
                ref={fileRef}
                {...register("photo")}
                className="w-full p-3 bg-gray-900/60 border border-gray-700/50 rounded-xl outline-none text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-300"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg text-white text-lg font-semibold shadow-md hover:opacity-90 transition-all duration-300"
            >
              {loading ? <ButtonSpinner text="Submitting..." /> : "Submit Feedback 🚀"}
            </button>

            {/* Optional error display */}
            {error && <p className="mt-3 text-sm text-red-400">{String(error)}</p>}
          </form>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}
