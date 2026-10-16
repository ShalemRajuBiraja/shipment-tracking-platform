import { useState } from "react";
import { toast } from "react-toastify";
import {
  LockKeyhole,
  Eye,
  EyeOff,
} from "lucide-react";
import { updatePasswordApi } from "../../services/authService";

/* Defined outside Settings so inputs never lose focus while typing */
const PasswordField = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  visible,
  onToggle,
}) => (
  <div className="cd-field">
    <label>{label}</label>

    <div className="cd-field__wrap">
      <input
        type={visible ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
      />

      <button
        type="button"
        onClick={onToggle}
        className="cd-field__eye"
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? <EyeOff size={17} /> : <Eye size={17} />}
      </button>
    </div>
  </div>
);

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
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

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
    <div className="cd-narrow">

      {/* Page Header */}
      <div className="cd-pagetitle">
        <h1>Settings</h1>
        <p>Manage your account security settings.</p>
      </div>

      {/* Password Settings */}
      <section className="cd-card">

        {/* Card Header */}
        <div className="cd-card__head cd-card__head--icon">

          <span className="cd-card__badge cd-card__badge--solid">
            <LockKeyhole size={19} />
          </span>

          <div>
            <h2>Password & Security</h2>
            <p>Update your account password</p>
          </div>

        </div>

        {/* Password Form */}
        <form onSubmit={handlePasswordSubmit} className="cd-form">

          <PasswordField
            label="Current Password"
            name="currentPassword"
            value={passwordData.currentPassword}
            onChange={handlePasswordChange}
            placeholder="Enter current password"
            visible={showCurrentPassword}
            onToggle={() => setShowCurrentPassword(!showCurrentPassword)}
          />

          <PasswordField
            label="New Password"
            name="newPassword"
            value={passwordData.newPassword}
            onChange={handlePasswordChange}
            placeholder="Enter new password"
            visible={showNewPassword}
            onToggle={() => setShowNewPassword(!showNewPassword)}
          />

          <PasswordField
            label="Confirm New Password"
            name="confirmPassword"
            value={passwordData.confirmPassword}
            onChange={handlePasswordChange}
            placeholder="Confirm new password"
            visible={showConfirmPassword}
            onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
          />

          {/* Password Requirement */}
          <p className="cd-hint">
            Password must contain at least 6 characters.
          </p>

          {/* Submit */}
          <button type="submit" className="cd-btn">
            Update Password
          </button>

        </form>

      </section>

      {/* Footer */}
      <footer className="cd-footer">
        © 2026 QuickShip. All rights reserved.
      </footer>

    </div>
  );
};

export default Settings;
