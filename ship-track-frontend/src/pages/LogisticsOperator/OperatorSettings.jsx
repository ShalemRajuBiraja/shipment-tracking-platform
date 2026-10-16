
import { useState } from "react";
import {
  Lock,
  ShieldCheck,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "react-toastify";
import { updatePasswordApi } from "../../services/authService";

/* Defined outside the page so inputs never lose focus while typing */
const PasswordField = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  visible,
  onToggle,
}) => (
  <div className="op-field">
    <label>{label}</label>

    <div className="op-field__wrap op-field__wrap--lead">
      <span className="op-field__lead">
        <Lock size={16} />
      </span>

      <input
        type={visible ? "text" : "password"}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
      />

      <button
        type="button"
        onClick={onToggle}
        className="op-field__eye"
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? <EyeOff size={17} /> : <Eye size={17} />}
      </button>
    </div>
  </div>
);

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
    <div className="op-narrow">

      {/* ================= PAGE HEADER ================= */}
      <div className="op-pagetitle">
        <h1>
          Settings
        </h1>

        <p>
          Manage your account security settings.
        </p>
      </div>

      {/* ================= PASSWORD & SECURITY ================= */}
      <section className="op-card">

        {/* Header */}
        <div className="op-card__head op-card__head--icon">
          <span className="op-card__badge op-card__badge--solid">
            <ShieldCheck size={19} />
          </span>

          <div>
            <h2>
              Password & Security
            </h2>

            <p>
              Keep your account secure.
            </p>
          </div>
        </div>

        {/* ================= PASSWORD FORM ================= */}
        <form
          onSubmit={handlePasswordSubmit}
          className="op-form"
        >

          {/* Current Password */}
          <PasswordField
            label="Current Password"
            name="currentPassword"
            placeholder="Enter current password"
            value={passwordData.currentPassword}
            onChange={handlePasswordChange}
            visible={showPassword.currentPassword}
            onToggle={() => toggleShowPassword("currentPassword")}
          />

          {/* New Password */}
          <PasswordField
            label="New Password"
            name="newPassword"
            placeholder="Enter new password"
            value={passwordData.newPassword}
            onChange={handlePasswordChange}
            visible={showPassword.newPassword}
            onToggle={() => toggleShowPassword("newPassword")}
          />

          {/* Confirm Password */}
          <PasswordField
            label="Confirm New Password"
            name="confirmPassword"
            placeholder="Confirm new password"
            value={passwordData.confirmPassword}
            onChange={handlePasswordChange}
            visible={showPassword.confirmPassword}
            onToggle={() => toggleShowPassword("confirmPassword")}
          />

          {/* Update Password */}
          <button
            type="submit"
            className="op-btn"
          >
            <Lock size={16} />
            Update Password
          </button>

        </form>
      </section>

      {/* Footer */}
      <footer className="op-footer">
        © 2026 QuickShip. All rights reserved.
      </footer>
    </div>
  );
};

export default OperatorSettings;
