
import { useState } from "react";

import {
  LockKeyhole,
  Eye,
  EyeOff,
} from "lucide-react";

import { updateAdminPasswordApi } from "../../services/adminService";
import { toast } from "react-toastify";

const Settings = () => {

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;

    setPasswordData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // ================= PASSWORD CHANGE =================

  const handlePasswordSubmit = async (e) => {

    e.preventDefault();

    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      toast.error("Please fill all password fields.");
      return;
    }

    if (
      passwordData.newPassword !==
      passwordData.confirmPassword
    ) {
      toast.error("New passwords do not match.");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error(
        "Password must contain at least 6 characters."
      );
      return;
    }

    try {

      const response = await updateAdminPasswordApi(
        passwordData.currentPassword,
        passwordData.newPassword
      );

      if (response.data.success === true) {

        toast.success("Password updated successfully!");

        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });

      } else {

        toast.error(
          "Failed to update password. Please try again."
        );

      }

    } catch (error) {

      console.error("Error updating password:", error);

      toast.error(
        "Failed to update password. Please try again."
      );

    }
  };

  return (

    <div className="p-3 max-w-md">

      {/* ================= PAGE HEADER ================= */}

      <div className="mb-3">

        <h1 className="text-lg font-bold text-slate-800">
          Settings
        </h1>

        <p className="text-xs text-slate-500 mt-0.5">
          Manage your account security settings.
        </p>

      </div>


      {/* ================= PASSWORD SETTINGS ================= */}

      <section className="bg-white border border-slate-200 rounded-lg shadow-sm">

        {/* Section Header */}

        <div className="flex items-center gap-2.5 px-3 py-3 border-b border-slate-100">

          <div className="p-2 bg-emerald-50 rounded-lg">

            <LockKeyhole
              size={19}
              className="text-emerald-600"
            />

          </div>


          <div>

            <h2 className="text-sm font-semibold text-slate-800">
              Update Password
            </h2>

            <p className="text-xs text-slate-500 mt-0.5">
              Change your password to keep your account secure.
            </p>

          </div>

        </div>


        {/* ================= PASSWORD FORM ================= */}

        <form
          onSubmit={handlePasswordSubmit}
          className="p-3"
        >

          <div className="space-y-3">


            {/* Current Password */}

            <div>

              <label className="block text-xs font-medium text-slate-700 mb-1">
                Current Password
              </label>

              <div className="relative">

                <input
                  type={
                    showCurrentPassword
                      ? "text"
                      : "password"
                  }
                  name="currentPassword"
                  placeholder="Enter current password"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 pr-10 text-sm border border-slate-200 rounded-md outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-100"
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowCurrentPassword(
                      !showCurrentPassword
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition"
                >

                  {showCurrentPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}

                </button>

              </div>

            </div>


            {/* New Password */}

            <div>

              <label className="block text-xs font-medium text-slate-700 mb-1">
                New Password
              </label>

              <div className="relative">

                <input
                  type={
                    showNewPassword
                      ? "text"
                      : "password"
                  }
                  name="newPassword"
                  placeholder="Enter new password"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 pr-10 text-sm border border-slate-200 rounded-md outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-100"
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowNewPassword(
                      !showNewPassword
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition"
                >

                  {showNewPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}

                </button>

              </div>

            </div>


            {/* Confirm Password */}

            <div>

              <label className="block text-xs font-medium text-slate-700 mb-1">
                Confirm New Password
              </label>

              <div className="relative">

                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  name="confirmPassword"
                  placeholder="Confirm new password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 pr-10 text-sm border border-slate-200 rounded-md outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-100"
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition"
                >

                  {showConfirmPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}

                </button>

              </div>

            </div>


            {/* Password Requirement */}

            <p className="text-xs text-slate-400">
              Password must contain at least 6 characters.
            </p>

          </div>


          {/* Update Button */}

          <div className="mt-4">

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-md text-sm font-medium transition"
            >

              <LockKeyhole size={16} />

              Update Password

            </button>

          </div>

        </form>

      </section>
      </div>
)}
