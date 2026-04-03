import config from "../config";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import ButtonSpinner from "./ButtonSpinner";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const registrationSchema = z
  .object({
    first_name: z.string().min(2, "First Name is required"),
    last_name: z.string().min(2, "Last Name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().regex(/^\d{10}$/, "Phone must be 10 digits"),
    address: z.string().min(5, "Address is required"),
    role: z.enum(["Civilian", "Authority"], "Select a valid role"),
    id_proof_type: z.string().min(3, "ID Proof Type is required"),
    id_proof_file: z.any().refine((file) => file.length > 0, "File is required"),

    // Conditional fields for Authority/Admin
    authority_position: z.string().optional(),
    government_id: z.string().optional(),
    department_name: z.string().optional(),
    work_location: z.string().optional(),

    occupation: z.string().optional(),
    password: z.string().min(6, {
      message: "Minimum 6 characters required",
    }),
  })
  .refine(
    (data) => {
      if (data.role === "Authority") {
        return data.government_id && data.department_name && data.work_location;
      }
      return true;
    },
    { message: "Authority fields are required", path: ["government_id"] }
  );

const Registration = () => {
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registrationSchema),
  });

  const onSubmit = async (d) => {
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append("first_name", d.first_name);
    formData.append("last_name", d.last_name);
    formData.append("email", d.email);
    formData.append("phone", d.phone);
    formData.append("address", d.address);
    formData.append("role", d.role);
    formData.append("id_proof_type", d.id_proof_type);
    if (d.id_proof_file && d.id_proof_file.length > 0) {
      formData.append("id_proof_file", d.id_proof_file[0]);
    }

    if (d.government_id) formData.append("government_id", d.government_id);
    if (d.department_name) formData.append("department_name", d.department_name);
    if (d.work_location) formData.append("work_location", d.work_location);
    if (d.occupation) formData.append("occupation", d.occupation);

    formData.append("password", d.password);

    try {
      await axios.post(`${config.API_BASE_URL}/api/auth/register/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Registration Successful");
      navigate("/login");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.detail ||
          "An error occurred"
      );
      toast.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-900 via-purple-800 to-indigo-900 text-white p-6">
      <div className="max-w-5xl w-full bg-gray-900 p-10 rounded-2xl shadow-2xl border border-gray-800">
        <h2 className="text-4xl font-extrabold text-center mb-8">Register</h2>

        <form
          className="w-full grid grid-cols-1 md:grid-cols-2 gap-8"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div>
            <input
              {...register("first_name")}
              type="text"
              placeholder="First Name"
              className="input px-4 py-2 rounded-xl bg-gray-800 focus-within:outline-0 w-full"
            />
            {errors.first_name && (
              <p className="text-red-500">{errors.first_name.message}</p>
            )}
          </div>

          <div>
            <input
              {...register("last_name")}
              type="text"
              placeholder="Last Name"
              className="input px-4 py-2 rounded-xl bg-gray-800 focus-within:outline-0 w-full"
            />
            {errors.last_name && (
              <p className="text-red-500">{errors.last_name.message}</p>
            )}
          </div>

          <div>
            <input
              {...register("email")}
              type="email"
              placeholder="Email"
              className="input px-4 py-2 rounded-xl bg-gray-800 focus-within:outline-0 w-full"
            />
            {errors.email && (
              <p className="text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div>
            <input
              {...register("phone")}
              type="tel"
              placeholder="Phone"
              className="input px-4 py-2 rounded-xl bg-gray-800 focus-within:outline-0 w-full"
            />
            {errors.phone && (
              <p className="text-red-500">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <input
              {...register("address")}
              type="text"
              placeholder="Address"
              className="input px-4 py-2 rounded-xl bg-gray-800 focus-within:outline-0 w-full"
            />
            {errors.address && (
              <p className="text-red-500">{errors.address.message}</p>
            )}
          </div>

          <div>
            <select
              {...register("role")}
              className="input px-2 py-2 rounded-xl bg-gray-800 focus-within:outline-0 w-full"
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="">Select Role</option>
              <option value="Civilian">Civilian</option>
              <option value="Authority">Village Authority Admin</option>
            </select>
            {errors.role && (
              <p className="text-red-500">{errors.role.message}</p>
            )}
          </div>

          <div>
            <select
              {...register("id_proof_type")}
              className="input px-2 py-2 rounded-xl bg-gray-800 focus-within:outline-0 w-full"
            >
              <option value="">Select ID Proof Type</option>
              <option value="PAN">PAN Card</option>
              <option value="VOTER_ID">Voter ID</option>
              <option value="PASSPORT">Passport</option>
              <option value="RATION_CARD">Ration Card</option>
              <option value="DRIVING_LICENSE">Driving License</option>
              <option value="OTHER">Other</option>
            </select>
            {errors.id_proof_type && (
              <p className="text-red-500">{errors.id_proof_type.message}</p>
            )}
          </div>

          <div>
            <input
              {...register("id_proof_file")}
              type="file"
              className="input file-type px-4 py-2 rounded-xl bg-gray-800 focus-within:outline-0 w-full"
            />
            {errors.id_proof_file && (
              <p className="text-red-500">{errors.id_proof_file.message}</p>
            )}
          </div>

          {role === "Authority" && (
            <>
              <div>
                <input
                  {...register("authority_position")}
                  type="text"
                  placeholder="Authority Position"
                  className="input px-4 py-2 rounded-xl bg-gray-800 focus-within:outline-0 w-full"
                />
              </div>

              <div>
                <input
                  {...register("government_id")}
                  type="text"
                  placeholder="Government ID"
                  className="input px-4 py-2 rounded-xl bg-gray-800 focus-within:outline-0 w-full"
                />
                {errors.government_id && (
                  <p className="text-red-500">{errors.government_id.message}</p>
                )}
              </div>

              <div>
                <input
                  {...register("department_name")}
                  type="text"
                  placeholder="Department Name"
                  className="input px-4 py-2 rounded-xl bg-gray-800 focus-within:outline-0 w-full"
                />
                {errors.department_name && (
                  <p className="text-red-500">{errors.department_name.message}</p>
                )}
              </div>

              <div>
                <input
                  {...register("work_location")}
                  type="text"
                  placeholder="Work Location"
                  className="input px-4 py-2 rounded-xl bg-gray-800 focus-within:outline-0 w-full"
                />
                {errors.work_location && (
                  <p className="text-red-500">{errors.work_location.message}</p>
                )}
              </div>
            </>
          )}

          {role === "Civilian" && (
            <div>
              <input
                {...register("occupation")}
                type="text"
                placeholder="Occupation"
                className="input px-4 py-2 rounded-xl bg-gray-800 focus-within:outline-0 w-full"
              />
            </div>
          )}

          <div>
            <input
              {...register("password")}
              type="password"
              placeholder="Password"
              className="input px-4 py-2 rounded-xl bg-gray-800 focus-within:outline-0 w-full"
            />
            {errors.password && (
              <p className="text-red-500">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            className="col-span-1 md:col-span-2 bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 rounded-xl transition shadow-lg"
            disabled={loading}
          >
            {loading ? <ButtonSpinner text="Creating Account..." /> : "Register"}
          </button>
        </form>

        <p className="text-center text-gray-400 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-500 hover:underline">
            Login
          </Link>
        </p>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Registration;
