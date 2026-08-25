import React, { useEffect, useState } from "react";
import client from "../api/client";

export default function Consultation() {
  const [dermatologists, setDermatologists] = useState([]);
  const [consultants, setConsultants] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const [search, setSearch] = useState("");

  const [selectedProvider, setSelectedProvider] = useState(null);

  const [form, setForm] = useState({
    appointment_date: "",
    consultation_type: "video",
    reason: "",
  });

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================================================
  // LOAD DATA
  // =========================================================

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        dermatologistsRes,
        consultantsRes,
        appointmentsRes,
      ] = await Promise.all([
        client.get("/consultant/dermatologists"),
        client.get("/consultant/consultants"),
        client.get("/consultant/appointments/my"),
      ]);

      setDermatologists(dermatologistsRes.data || []);
      setConsultants(consultantsRes.data || []);
      setAppointments(appointmentsRes.data || []);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
        "Failed to load consultation data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // =========================================================
  // SEARCH
  // =========================================================

  const filteredDermatologists = dermatologists.filter((doctor) =>
    doctor.name
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const filteredConsultants = consultants.filter((consultant) =>
    consultant.name
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // =========================================================
  // OPEN BOOKING
  // =========================================================

  const openBooking = (provider) => {
    setSelectedProvider(provider);

    setForm({
      appointment_date: "",
      consultation_type: "video",
      reason: "",
    });

    setError("");
    setSuccess("");
  };

  // =========================================================
  // BOOK APPOINTMENT
  // =========================================================

  const handleBooking = async (e) => {
    e.preventDefault();

    if (!selectedProvider) {
      setError("Please select a provider.");
      return;
    }

    if (!form.appointment_date) {
      setError("Please select an appointment date and time.");
      return;
    }

    try {
      setBooking(true);
      setError("");
      setSuccess("");

      const payload = {
        appointment_date: form.appointment_date,
        consultation_type: form.consultation_type,
        reason: form.reason || null,
      };

      if (selectedProvider.role === "dermatologist") {
        payload.dermatologist_id = selectedProvider.id;
      }

      if (selectedProvider.role === "consultant") {
        payload.consultant_id = selectedProvider.id;
      }

      await client.post(
        "/consultant/appointments",
        payload
      );

      setSuccess(
        `Appointment request sent to ${selectedProvider.name}.`
      );

      setSelectedProvider(null);

      await loadData();

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
        "Failed to book appointment."
      );
    } finally {
      setBooking(false);
    }
  };

  // =========================================================
  // CANCEL APPOINTMENT
  // =========================================================

  const cancelAppointment = async (appointmentId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this appointment?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await client.put(
        `/consultant/appointments/${appointmentId}/status`,
        {
          status: "cancelled",
        }
      );

      setSuccess("Appointment cancelled successfully.");

      await loadData();

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
        "Failed to cancel appointment."
      );
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-gray-500">
          Loading consultation services...
        </div>
      </div>
    );
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="max-w-7xl mx-auto p-6">

      {/* HEADER */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Consultation
        </h1>

        <p className="text-gray-500 mt-2">
          Connect with a skincare professional for
          personalized guidance.
        </p>
      </div>

      {/* ALERTS */}

      {error && (
        <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-5 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm">
          {success}
        </div>
      )}

      {/* SEARCH */}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-8">

        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Find a Skincare Professional
        </h2>

        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-200"
        />

      </div>

      {/* =====================================================
          DERMATOLOGISTS
      ====================================================== */}

      <ProviderSection
        title="Available Dermatologists"
        providers={filteredDermatologists}
        role="dermatologist"
        onBook={openBooking}
      />

      {/* =====================================================
          CONSULTANTS
      ====================================================== */}

      <ProviderSection
        title="Available Skincare Consultants"
        providers={filteredConsultants}
        role="consultant"
        onBook={openBooking}
      />

      {/* =====================================================
          MY APPOINTMENTS
      ====================================================== */}

      <div className="mt-10">

        <h2 className="text-xl font-semibold text-gray-800">
          My Appointments
        </h2>

        <p className="text-sm text-gray-500 mt-1 mb-5">
          View your upcoming and previous consultations.
        </p>

        {appointments.length === 0 ? (

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">

            <p className="text-gray-500">
              You don't have any appointments yet.
            </p>

          </div>

        ) : (

          <div className="space-y-4">

            {appointments.map((appointment) => (

              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onCancel={cancelAppointment}
              />

            ))}

          </div>

        )}

      </div>

      {/* =====================================================
          BOOKING MODAL
      ====================================================== */}

      {selectedProvider && (

        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">

          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">

            {/* MODAL HEADER */}

            <div className="p-6 border-b border-gray-100">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm text-violet-600 font-medium">
                    Book Appointment
                  </p>

                  <h2 className="text-xl font-bold text-gray-800 mt-1">
                    {selectedProvider.name}
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    {selectedProvider.role === "dermatologist"
                      ? "Dermatologist"
                      : "Skincare Consultant"}
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() => setSelectedProvider(null)}
                  className="text-gray-400 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>

              </div>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleBooking}
              className="p-6 space-y-5"
            >

              {/* DATE */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Appointment Date & Time
                </label>

                <input
                  type="datetime-local"
                  value={form.appointment_date}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      appointment_date: e.target.value,
                    })
                  }
                  min={new Date()
                    .toISOString()
                    .slice(0, 16)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3"
                  required
                />

              </div>

              {/* TYPE */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Consultation Type
                </label>

                <div className="grid grid-cols-2 gap-3">

                  <button
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        consultation_type: "video",
                      })
                    }
                    className={`py-3 rounded-xl border ${
                      form.consultation_type === "video"
                        ? "border-violet-500 bg-violet-50 text-violet-700"
                        : "border-gray-200 text-gray-600"
                    }`}
                  >
                    Video
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        consultation_type: "in-person",
                      })
                    }
                    className={`py-3 rounded-xl border ${
                      form.consultation_type === "in-person"
                        ? "border-violet-500 bg-violet-50 text-violet-700"
                        : "border-gray-200 text-gray-600"
                    }`}
                  >
                    In-person
                  </button>

                </div>

              </div>

              {/* REASON */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Consultation
                </label>

                <textarea
                  rows={4}
                  value={form.reason}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      reason: e.target.value,
                    })
                  }
                  placeholder="Describe your skin concern..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 resize-none"
                />

              </div>

              {/* BUTTONS */}

              <div className="flex gap-3">

                <button
                  type="button"
                  onClick={() => setSelectedProvider(null)}
                  className="flex-1 border border-gray-200 py-3 rounded-xl font-semibold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={booking}
                  className="flex-1 bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-xl font-semibold disabled:opacity-60"
                >
                  {booking
                    ? "Booking..."
                    : "Confirm Appointment"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}


// =========================================================
// PROVIDER SECTION
// =========================================================

function ProviderSection({
  title,
  providers,
  role,
  onBook,
}) {
  return (
    <div className="mb-10">

      <div className="flex items-center justify-between mb-4">

        <h2 className="text-xl font-semibold text-gray-800">
          {title}
        </h2>

        <span className="text-sm text-gray-500">
          {providers.length} available
        </span>

      </div>

      {providers.length === 0 ? (

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-gray-500">
          No {role === "consultant"
            ? "consultants"
            : "dermatologists"} available.
        </div>

      ) : (

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {providers.map((provider) => (

            <div
              key={provider.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
            >

              <div className="flex items-start gap-4">

                <div className="w-14 h-14 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 text-xl font-bold">
                  {provider.name?.charAt(0)?.toUpperCase() || "P"}
                </div>

                <div>

                  <h3 className="text-lg font-semibold text-gray-800">
                    {provider.name}
                  </h3>

                  <p className="text-sm text-violet-600 mt-1">
                    {role === "dermatologist"
                      ? "Dermatologist"
                      : "Skincare Consultant"}
                  </p>

                  <p className="text-xs text-gray-500 mt-2">
                    Available for personalized skincare guidance
                  </p>

                </div>

              </div>

              <div className="mt-5 pt-4 border-t border-gray-100">

                <div className="flex items-center justify-between text-sm mb-4">

                  <span className="text-gray-500">
                    Consultation
                  </span>

                  <span className="font-medium text-gray-800">
                    Video / In-person
                  </span>

                </div>

                <button
                  type="button"
                  onClick={() => onBook(provider)}
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-xl font-semibold"
                >
                  Book Appointment
                </button>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}


// =========================================================
// APPOINTMENT CARD
// =========================================================

function AppointmentCard({
  appointment,
  onCancel,
}) {
  const date = new Date(
    appointment.appointment_date
  );

  const providerName =
    appointment.dermatologist_name ||
    appointment.consultant_name ||
    "Provider";

  const providerRole =
    appointment.dermatologist_id
      ? "Dermatologist"
      : "Skincare Consultant";

  const statusStyles = {
    pending: "bg-amber-100 text-amber-700",
    accepted: "bg-green-100 text-green-700",
    cancelled: "bg-gray-100 text-gray-600",
    completed: "bg-blue-100 text-blue-700",
  };

  const canCancel =
    appointment.status === "pending" ||
    appointment.status === "accepted";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div>

          <h3 className="font-semibold text-gray-800">
            {providerName}
          </h3>

          <p className="text-sm text-violet-600 mt-1">
            {providerRole}
          </p>

          <p className="text-sm text-gray-500 mt-1">
            {date.toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
            {" • "}
            {date.toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>

          <p className="text-xs text-gray-400 mt-1">
            {appointment.consultation_type === "video"
              ? "Video consultation"
              : "In-person consultation"}
          </p>

          {appointment.reason && (
            <p className="text-sm text-gray-500 mt-3">
              {appointment.reason}
            </p>
          )}

        </div>

        <div className="flex items-center gap-3">

          <span
            className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
              statusStyles[appointment.status] ||
              "bg-gray-100 text-gray-600"
            }`}
          >
            {appointment.status
              .charAt(0)
              .toUpperCase() +
              appointment.status.slice(1)}
          </span>

          {canCancel && (
            <button
              type="button"
              onClick={() =>
                onCancel(appointment.id)
              }
              className="text-xs text-red-600 font-medium"
            >
              Cancel
            </button>
          )}

        </div>

      </div>

    </div>
  );
}