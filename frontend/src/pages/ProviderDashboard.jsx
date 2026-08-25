import React from "react";
import { Link } from "react-router-dom";
import {
  Users,
  CalendarCheck,
  Clock,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function ProviderDashboard() {
  const { user } = useAuth();

  const isDermatologist = user?.role === "dermatologist";

  const providerType = isDermatologist
    ? "Dermatologist"
    : "Skincare Consultant";

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">

        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {user?.full_name}
          </h1>

          <p className="text-gray-500 mt-2">
            {providerType} Dashboard
          </p>
        </div>

        <div className="mt-4 md:mt-0">
          <span className="inline-flex items-center px-4 py-2 rounded-full bg-violet-100 text-violet-700 font-medium">
            {providerType}
          </span>
        </div>

      </div>


      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

        {/* CLIENTS */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500">
                My Clients
              </p>

              <h2 className="text-3xl font-bold text-gray-900 mt-2">
                —
              </h2>
            </div>

            <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center">
              <Users
                size={24}
                className="text-violet-600"
              />
            </div>

          </div>

          <Link
            to="/clients"
            className="flex items-center gap-2 text-sm text-violet-600 font-medium mt-5 hover:text-violet-800"
          >
            View clients
            <ArrowRight size={16} />
          </Link>

        </div>


        {/* APPOINTMENTS */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Appointments
              </p>

              <h2 className="text-3xl font-bold text-gray-900 mt-2">
                —
              </h2>
            </div>

            <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center">
              <CalendarCheck
                size={24}
                className="text-violet-600"
              />
            </div>

          </div>

          <Link
            to="/consultant"
            className="flex items-center gap-2 text-sm text-violet-600 font-medium mt-5 hover:text-violet-800"
          >
            Manage appointments
            <ArrowRight size={16} />
          </Link>

        </div>


        {/* PENDING */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Pending Requests
              </p>

              <h2 className="text-3xl font-bold text-gray-900 mt-2">
                —
              </h2>
            </div>

            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <Clock
                size={24}
                className="text-amber-600"
              />
            </div>

          </div>

          <Link
            to="/consultant"
            className="flex items-center gap-2 text-sm text-violet-600 font-medium mt-5 hover:text-violet-800"
          >
            Review requests
            <ArrowRight size={16} />
          </Link>

        </div>

      </div>


      {/* QUICK ACTIONS */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

        <h2 className="text-xl font-semibold text-gray-900 mb-5">
          Quick Actions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <Link
            to="/clients"
            className="flex items-center justify-between p-5 rounded-xl border border-gray-200 hover:border-violet-300 hover:bg-violet-50 transition"
          >

            <div className="flex items-center gap-4">

              <div className="w-11 h-11 rounded-xl bg-violet-100 flex items-center justify-center">
                <Users
                  size={22}
                  className="text-violet-600"
                />
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">
                  View Clients
                </h3>

                <p className="text-sm text-gray-500">
                  View patient information and skin progress
                </p>
              </div>

            </div>

            <ArrowRight
              size={20}
              className="text-gray-400"
            />

          </Link>


          <Link
            to="/consultant"
            className="flex items-center justify-between p-5 rounded-xl border border-gray-200 hover:border-violet-300 hover:bg-violet-50 transition"
          >

            <div className="flex items-center gap-4">

              <div className="w-11 h-11 rounded-xl bg-violet-100 flex items-center justify-center">
                <CalendarCheck
                  size={22}
                  className="text-violet-600"
                />
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">
                  Manage Appointments
                </h3>

                <p className="text-sm text-gray-500">
                  Accept, reject and complete appointments
                </p>
              </div>

            </div>

            <ArrowRight
              size={20}
              className="text-gray-400"
            />

          </Link>

        </div>

      </div>


      {/* ROLE INFORMATION */}
      <div className="mt-6 bg-violet-50 border border-violet-100 rounded-2xl p-6">

        <div className="flex items-start gap-4">

          <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center">
            <CheckCircle
              size={20}
              className="text-white"
            />
          </div>

          <div>

            <h3 className="font-semibold text-gray-900">
              {providerType} Portal
            </h3>

            <p className="text-sm text-gray-600 mt-1">
              You can manage your assigned clients and appointments
              from this portal. Appointment requests are visible only
              to the corresponding healthcare professional.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}