import React, { useEffect, useMemo, useState } from "react";
import client from "../api/client";
import {
  CalendarCheck,
  Clock,
  User,
  Video,
  MapPin,
  CheckCircle,
  XCircle,
  CalendarDays,
  RefreshCw,
} from "lucide-react";

export default function ConsultantAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [activeTab, setActiveTab] = useState("pending");

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await client.get(
        "/consultant/appointments/provider"
      );

      setAppointments(response.data || []);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
        "Failed to load appointments."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const updateStatus = async (appointmentId, status) => {
    try {
      setUpdatingId(appointmentId);
      setError("");

      await client.put(
        `/consultant/appointments/${appointmentId}/status`,
        {
          status,
        }
      );

      await loadAppointments();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
        "Failed to update appointment."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const counts = useMemo(() => {
    return {
      pending: appointments.filter(
        (a) => a.status === "pending"
      ).length,

      accepted: appointments.filter(
        (a) => a.status === "accepted"
      ).length,

      completed: appointments.filter(
        (a) => a.status === "completed"
      ).length,

      cancelled: appointments.filter(
        (a) => a.status === "cancelled"
      ).length,
    };
  }, [appointments]);

  const filteredAppointments = useMemo(() => {
    return appointments.filter(
      (appointment) =>
        appointment.status === activeTab
    );
  }, [appointments, activeTab]);

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  const formatTime = (date) => {
    if (!date) return "Time unavailable";

    return new Date(date).toLocaleTimeString(
      "en-IN",
      {
        hour: "numeric",
        minute: "2-digit",
      }
    );
  };

  const isPast = (date) => {
    if (!date) return false;

    return new Date(date) < new Date();
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-3 text-gray-500">
          <RefreshCw
            size={20}
            className="animate-spin"
          />
          Loading appointments...
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">

      {/* HEADER */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Appointments
          </h1>

          <p className="text-gray-500 mt-1">
            Manage patient consultation requests and appointments.
          </p>
        </div>

        <button
          type="button"
          onClick={loadAppointments}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition"
        >
          <RefreshCw size={18} />
          Refresh
        </button>

      </div>


      {/* ERROR */}

      {error && (
        <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}


      {/* STAT CARDS */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

        <StatCard
          label="Pending"
          value={counts.pending}
          icon={Clock}
          color="amber"
        />

        <StatCard
          label="Upcoming"
          value={counts.accepted}
          icon={CalendarCheck}
          color="violet"
        />

        <StatCard
          label="Completed"
          value={counts.completed}
          icon={CheckCircle}
          color="green"
        />

        <StatCard
          label="Cancelled"
          value={counts.cancelled}
          icon={XCircle}
          color="red"
        />

      </div>


      {/* TABS */}

      <div className="bg-white border border-gray-200 rounded-2xl p-2 mb-6 flex flex-wrap gap-2">

        <TabButton
          active={activeTab === "pending"}
          onClick={() => setActiveTab("pending")}
          label="Pending"
          count={counts.pending}
        />

        <TabButton
          active={activeTab === "accepted"}
          onClick={() => setActiveTab("accepted")}
          label="Upcoming"
          count={counts.accepted}
        />

        <TabButton
          active={activeTab === "completed"}
          onClick={() => setActiveTab("completed")}
          label="Completed"
          count={counts.completed}
        />

        <TabButton
          active={activeTab === "cancelled"}
          onClick={() => setActiveTab("cancelled")}
          label="Cancelled"
          count={counts.cancelled}
        />

      </div>


      {/* APPOINTMENTS */}

      <div className="space-y-4">

        {filteredAppointments.length === 0 ? (

          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">

            <CalendarDays
              size={44}
              className="mx-auto text-gray-300 mb-4"
            />

            <h3 className="text-lg font-semibold text-gray-700">
              No {activeTab} appointments
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Appointments will appear here when available.
            </p>

          </div>

        ) : (

          filteredAppointments.map((appointment) => (

            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              updating={
                updatingId === appointment.id
              }
              onUpdateStatus={updateStatus}
              formatDate={formatDate}
              formatTime={formatTime}
              isPast={isPast}
            />

          ))

        )}

      </div>

    </div>
  );
}


/* =========================================================
   APPOINTMENT CARD
========================================================= */

function AppointmentCard({
  appointment,
  updating,
  onUpdateStatus,
  formatDate,
  formatTime,
  isPast,
}) {
  const status = appointment.status;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition">

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

        {/* PATIENT */}

        <div className="flex items-start gap-4">

          <div className="w-12 h-12 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center flex-shrink-0">

            <User size={23} />

          </div>

          <div>

            <div className="flex items-center gap-3 flex-wrap">

              <h3 className="text-lg font-semibold text-gray-800">
                {appointment.patient_name ||
                  "Patient"}
              </h3>

              <StatusBadge status={status} />

            </div>

            <p className="text-sm text-gray-500 mt-1">
              {appointment.patient_email ||
                "Email unavailable"}
            </p>

          </div>

        </div>


        {/* APPOINTMENT DETAILS */}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">

          <div className="flex items-center gap-2 text-gray-600">

            <CalendarDays
              size={18}
              className="text-violet-600"
            />

            <div>
              <p className="text-xs text-gray-400">
                Date
              </p>

              <p className="font-medium">
                {formatDate(
                  appointment.appointment_date
                )}
              </p>
            </div>

          </div>


          <div className="flex items-center gap-2 text-gray-600">

            <Clock
              size={18}
              className="text-violet-600"
            />

            <div>
              <p className="text-xs text-gray-400">
                Time
              </p>

              <p className="font-medium">
                {formatTime(
                  appointment.appointment_date
                )}
              </p>
            </div>

          </div>


          <div className="flex items-center gap-2 text-gray-600">

            {appointment.consultation_type ===
            "video" ? (
              <Video
                size={18}
                className="text-violet-600"
              />
            ) : (
              <MapPin
                size={18}
                className="text-violet-600"
              />
            )}

            <div>
              <p className="text-xs text-gray-400">
                Consultation
              </p>

              <p className="font-medium capitalize">
                {appointment.consultation_type ||
                  "Video"}
              </p>
            </div>

          </div>

        </div>

      </div>


      {/* REASON */}

      {appointment.reason && (

        <div className="mt-5 p-4 rounded-xl bg-gray-50 border border-gray-100">

          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Reason for consultation
          </p>

          <p className="text-sm text-gray-700 mt-1">
            {appointment.reason}
          </p>

        </div>

      )}


      {/* ACTIONS */}

      {status === "pending" && (

        <div className="mt-5 pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-end gap-3">

          <button
            type="button"
            disabled={updating}
            onClick={() =>
              onUpdateStatus(
                appointment.id,
                "cancelled"
              )
            }
            className="px-5 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 transition"
          >
            Reject
          </button>

          <button
            type="button"
            disabled={updating}
            onClick={() =>
              onUpdateStatus(
                appointment.id,
                "accepted"
              )
            }
            className="px-5 py-2.5 rounded-xl bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50 transition font-medium"
          >
            {updating
              ? "Updating..."
              : "Accept Appointment"}
          </button>

        </div>

      )}


      {/* ACCEPTED ACTION */}

      {status === "accepted" && (

        <div className="mt-5 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">

          <div className="text-sm">

            {isPast(
              appointment.appointment_date
            ) ? (
              <span className="text-amber-600">
                Appointment time has passed.
              </span>
            ) : (
              <span className="text-green-600 font-medium">
                Appointment confirmed.
              </span>
            )}

          </div>

          <button
            type="button"
            disabled={updating}
            onClick={() =>
              onUpdateStatus(
                appointment.id,
                "completed"
              )
            }
            className="px-5 py-2.5 rounded-xl bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition font-medium"
          >
            Mark Completed
          </button>

        </div>

      )}

    </div>
  );
}


/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({ status }) {

  const styles = {
    pending:
      "bg-amber-100 text-amber-700",

    accepted:
      "bg-green-100 text-green-700",

    completed:
      "bg-blue-100 text-blue-700",

    cancelled:
      "bg-red-100 text-red-700",
  };

  const labels = {
    pending: "Pending",
    accepted: "Accepted",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  return (
    <span
      className={`text-xs px-3 py-1 rounded-full font-medium ${
        styles[status] ||
        "bg-gray-100 text-gray-600"
      }`}
    >
      {labels[status] || status}
    </span>
  );
}


/* =========================================================
   TAB BUTTON
========================================================= */

function TabButton({
  active,
  onClick,
  label,
  count,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2.5 rounded-xl text-sm font-medium transition ${
        active
          ? "bg-violet-600 text-white"
          : "text-gray-600 hover:bg-violet-50 hover:text-violet-600"
      }`}
    >
      {label}

      <span
        className={`ml-2 text-xs ${
          active
            ? "text-white/80"
            : "text-gray-400"
        }`}
      >
        {count}
      </span>
    </button>
  );
}


/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}) {
  const colorClasses = {
    amber:
      "bg-amber-50 text-amber-600",

    violet:
      "bg-violet-50 text-violet-600",

    green:
      "bg-green-50 text-green-600",

    red:
      "bg-red-50 text-red-600",
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm text-gray-500">
            {label}
          </p>

          <p className="text-2xl font-bold text-gray-800 mt-1">
            {value}
          </p>

        </div>

        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center ${
            colorClasses[color]
          }`}
        >
          <Icon size={22} />
        </div>

      </div>

    </div>
  );
}