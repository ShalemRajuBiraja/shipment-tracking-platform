
import { useState } from "react";
import {
  Lock,
  ShieldCheck,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "react-toastify";
import { updatePasswordApi } from "../../services/authService";

const OperatorSettings = () => {
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // ================= SHOW/HIDE PASSWORD =================
  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const toggleShowPassword = (field) => {
    setShowPassword((previous) => ({
      ...previous,
      [field]: !previous[field],
    }));
  };

  // ================= PASSWORD CHANGE =================
  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ================= UPDATE PASSWORD =================
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
      const response = await updatePasswordApi(
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

        <p className="mt-0.5 text-xs text-slate-500">
          Manage your account security settings.
        </p>

      </div>

      {/* ================= PASSWORD & SECURITY ================= */}
      <section className="bg-white border border-slate-200 rounded-lg shadow-sm">

        {/* Header */}
        <div className="flex items-center gap-2.5 px-3 py-3 border-b border-slate-100">

          <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
            <ShieldCheck
              size={19}
              className="text-emerald-600"
            />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-800">
              Password & Security
            </h2>

            <p className="text-xs text-slate-500 mt-0.5">
              Keep your account secure.
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

                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type={
                    showPassword.currentPassword
                      ? "text"
                      : "password"
                  }
                  name="currentPassword"
                  placeholder="Enter current password"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full pl-9 pr-10 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-100"
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    toggleShowPassword("currentPassword")
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600"
                >
                  {showPassword.currentPassword ? (
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

                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type={
                    showPassword.newPassword
                      ? "text"
                      : "password"
                  }
                  name="newPassword"
                  placeholder="Enter new password"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full pl-9 pr-10 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-100"
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    toggleShowPassword("newPassword")
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600"
                >
                  {showPassword.newPassword ? (
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

                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type={
                    showPassword.confirmPassword
                      ? "text"
                      : "password"
                  }
                  name="confirmPassword"
                  placeholder="Confirm new password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full pl-9 pr-10 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-100"
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    toggleShowPassword("confirmPassword")
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600"
                >
                  {showPassword.confirmPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>

              </div>

            </div>

          </div>

          {/* Update Password */}
          <div className="mt-4">

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-md text-sm font-medium transition"
            >
              <Lock size={16} />
              Update Password
            </button>

          </div>

        </form>

      </section>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-500 py-4">
        © 2026 QuickShip. All rights reserved.
      </footer>

    </div>
  );
};

export default OperatorSettings;
