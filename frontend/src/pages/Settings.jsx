import React, { useEffect, useState } from "react";
import {
  Settings as SettingsIcon,
  User,
  Mail,
  Shield,
  Lock,
  Save,
  LogOut,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

import client from "../api/client";
import { useAuth } from "../context/AuthContext";


export default function Settings() {

  const { user, logout } = useAuth();

  // =========================================================
  // ACCOUNT INFORMATION
  // =========================================================

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  // =========================================================
  // PASSWORD
  // =========================================================

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // =========================================================
  // MESSAGES
  // =========================================================

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [savingAccount, setSavingAccount] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);


  // =========================================================
  // LOAD USER
  // =========================================================

  useEffect(() => {

    if (user) {
      setFullName(user.full_name || "");
      setEmail(user.email || "");
    }

  }, [user]);


  // =========================================================
  // UPDATE ACCOUNT
  // =========================================================

  const handleSaveAccount = async (e) => {

    e.preventDefault();

    setSuccess("");
    setError("");

    if (!fullName.trim()) {
      setError("Full name cannot be empty.");
      return;
    }

    if (!email.trim()) {
      setError("Email address cannot be empty.");
      return;
    }

    try {

      setSavingAccount(true);

      await client.put("/users/me", {
        full_name: fullName.trim(),
        email: email.trim(),
      });

      setSuccess("Account information updated successfully.");

    } catch (err) {

      setError(
        err.response?.data?.detail ||
        "Failed to update account information."
      );

    } finally {

      setSavingAccount(false);

    }
  };


  // =========================================================
  // CHANGE PASSWORD
  // =========================================================

  const handleChangePassword = async (e) => {

    e.preventDefault();

    setSuccess("");
    setError("");

    if (!currentPassword) {
      setError("Please enter your current password.");
      return;
    }

    if (!newPassword) {
      setError("Please enter a new password.");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    try {

      setChangingPassword(true);

      const response = await client.put(
        "/users/me/password",
        {
          current_password: currentPassword,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }
      );

      setSuccess(
        response.data?.message ||
        "Password changed successfully."
      );

      // Clear password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

    } catch (err) {

      setError(
        err.response?.data?.detail ||
        "Failed to change password."
      );

    } finally {

      setChangingPassword(false);

    }
  };


  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {

    logout();

  };


  return (
    <div className="min-h-screen bg-slate-50">

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="flex items-center gap-4 mb-8">

          <div className="w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center">

            <SettingsIcon
              size={30}
              className="text-violet-600"
            />

          </div>

          <div>

            <h1 className="text-4xl font-bold text-gray-900">
              Settings
            </h1>

            <p className="text-gray-500 mt-1">
              Manage your account and preferences.
            </p>

          </div>

        </div>


        {/* =====================================================
            SUCCESS / ERROR
        ====================================================== */}

        {success && (

          <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-4 flex items-center gap-3">

            <CheckCircle
              className="text-green-600"
              size={22}
            />

            <p className="text-green-700 font-medium">
              {success}
            </p>

          </div>

        )}


        {error && (

          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 flex items-center gap-3">

            <AlertCircle
              className="text-red-600"
              size={22}
            />

            <p className="text-red-700 font-medium">
              {error}
            </p>

          </div>

        )}


        {/* =====================================================
            ACCOUNT INFORMATION
        ====================================================== */}

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-7 mb-6">

          <div className="flex items-center gap-4 mb-7">

            <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center">

              <User
                className="text-violet-600"
                size={24}
              />

            </div>

            <div>

              <h2 className="text-2xl font-bold text-gray-900">
                Account Information
              </h2>

              <p className="text-gray-500">
                Update your basic account details.
              </p>

            </div>

          </div>


          <form onSubmit={handleSaveAccount}>

            {/* FULL NAME */}

            <div className="mb-5">

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>

              <div className="relative">

                <User
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />

              </div>

            </div>


            {/* EMAIL */}

            <div className="mb-5">

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>

              <div className="relative">

                <Mail
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />

              </div>

            </div>


            {/* ROLE */}

            <div className="mb-5">

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Account Role
              </label>

              <div className="relative">

                <Shield
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  value={
                    user?.role
                      ? user.role.charAt(0).toUpperCase() +
                        user.role.slice(1)
                      : ""
                  }
                  disabled
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl pl-12 pr-4 py-3 text-gray-500"
                />

              </div>

              <p className="text-sm text-gray-400 mt-2">
                Your account role cannot be changed from Settings.
              </p>

            </div>


            {/* SAVE */}

            <button
              type="submit"
              disabled={savingAccount}
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-300 text-white px-6 py-3 rounded-xl font-semibold transition"
            >

              <Save size={20} />

              {savingAccount
                ? "Saving..."
                : "Save Changes"}

            </button>

          </form>

        </div>


        {/* =====================================================
            SECURITY
        ====================================================== */}

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-7 mb-6">

          <div className="flex items-center gap-4 mb-7">

            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">

              <Lock
                className="text-blue-600"
                size={24}
              />

            </div>

            <div>

              <h2 className="text-2xl font-bold text-gray-900">
                Security
              </h2>

              <p className="text-gray-500">
                Manage your password and account security.
              </p>

            </div>

          </div>


          <form onSubmit={handleChangePassword}>

            {/* CURRENT PASSWORD */}

            <div className="mb-5">

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Current Password
              </label>

              <input
                type="password"
                value={currentPassword}
                onChange={(e) =>
                  setCurrentPassword(e.target.value)
                }
                placeholder="Enter current password"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

            </div>


            {/* NEW PASSWORD */}

            <div className="mb-5">

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                New Password
              </label>

              <input
                type="password"
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(e.target.value)
                }
                placeholder="Minimum 8 characters"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

            </div>


            {/* CONFIRM PASSWORD */}

            <div className="mb-6">

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm New Password
              </label>

              <input
                type="password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                placeholder="Re-enter new password"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

            </div>


            <button
              type="submit"
              disabled={changingPassword}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-3 rounded-xl font-semibold transition"
            >

              <Lock size={20} />

              {changingPassword
                ? "Changing..."
                : "Change Password"}

            </button>

          </form>

        </div>


        {/* =====================================================
            ACCOUNT STATUS
        ====================================================== */}

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-7 mb-6">

          <div className="flex items-center gap-4 mb-5">

            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">

              <Shield
                className="text-green-600"
                size={24}
              />

            </div>

            <div>

              <h2 className="text-2xl font-bold text-gray-900">
                Account Status
              </h2>

              <p className="text-gray-500">
                Current status of your SkinIQ account.
              </p>

            </div>

          </div>


          <div className="flex items-center gap-3">

            <span
              className={`w-3 h-3 rounded-full ${
                user?.is_active
                  ? "bg-green-500"
                  : "bg-red-500"
              }`}
            />

            <span className="text-lg font-semibold text-gray-700">

              {user?.is_active
                ? "Active"
                : "Inactive"}

            </span>

          </div>

        </div>


        {/* =====================================================
            SIGN OUT
        ====================================================== */}

        <div className="bg-white rounded-3xl border border-red-100 shadow-sm p-7">

          <div className="flex items-center justify-between gap-6">

            <div>

              <h2 className="text-2xl font-bold text-gray-900">
                Sign Out
              </h2>

              <p className="text-gray-500 mt-1">
                Sign out of your SkinIQ account on this device.
              </p>

            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-semibold transition"
            >

              <LogOut size={20} />

              Logout

            </button>

          </div>

        </div>

      </div>

    </div>
  );
}