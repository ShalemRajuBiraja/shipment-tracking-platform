import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import logo from "../../assets/images/ship-track-logo.png";
import authBackground from "../../assets/images/bg-image.png";
import { toast } from "react-toastify";

const ForgotPassword = () => {
  const navigate = useNavigate();

  // Controls which step is displayed
  const [step, setStep] = useState(1);

  // Form data
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Errors
  const [errors, setErrors] = useState({});

  // Handle input changes
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  // ============================
  // STEP 1 - SEND OTP
  // ============================

  const handleEmailSubmit = (event) => {
    event.preventDefault();

    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
        formData.email
      )
    ) {
      newErrors.email = "Enter a valid email address";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // API CALL WILL COME HERE
    // await sendOtpApi({ email: formData.email });

    toast.success("OTP sent successfully");

    setStep(2);
  };

  // ============================
  // STEP 2 - VERIFY OTP
  // ============================

  const handleOtpSubmit = (event) => {
    event.preventDefault();

    const newErrors = {};

    if (!formData.otp.trim()) {
      newErrors.otp = "OTP is required";
    } else if (formData.otp.length !== 6) {
      newErrors.otp = "OTP must be 6 digits";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // API CALL WILL COME HERE
    // await verifyOtpApi({
    //   email: formData.email,
    //   otp: formData.otp
    // });

    toast.success("OTP verified successfully");

    setStep(3);
  };

  // ============================
  // STEP 3 - RESET PASSWORD
  // ============================

  const handlePasswordSubmit = (event) => {
    event.preventDefault();

    const newErrors = {};

    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword =
        "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword =
        "Please confirm your password";
    } else if (
      formData.newPassword !== formData.confirmPassword
    ) {
      newErrors.confirmPassword =
        "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // API CALL WILL COME HERE
    // await resetPasswordApi({
    //   email: formData.email,
    //   newPassword: formData.newPassword
    // });

    toast.success("Password reset successfully");

    navigate("/home");
  };

  return (
    <div
      className="relative flex min-h-screen items-center justify-center bg-cover bg-center bg-fixed bg-no-repeat px-4 py-8"
      style={{
        backgroundImage: `url(${authBackground})`,
      }}
    >
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-slate-950/20" />

      {/* Forgot Password Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-2xl border border-white/50 bg-white p-6 shadow-2xl sm:p-8">

          {/* Logo + Header */}
          <div className="mb-7 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20">
              <img
                src={logo}
                alt="ShipTrack Pro"
                className="h-full w-full object-cover"
              />
            </div>

            <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
              Forgot Password?
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {step === 1 &&
                "Enter your email to receive a verification code."}

              {step === 2 &&
                "Enter the OTP sent to your email address."}

              {step === 3 &&
                "Create a new secure password."}
            </p>
          </div>

          {/* Step Indicator */}
          <div className="mb-8 flex items-center justify-center gap-3">
            {[1, 2, 3].map((stepNumber) => (
              <div
                key={stepNumber}
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                  step >= stepNumber
                    ? "bg-blue-600 text-white"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {stepNumber}
              </div>
            ))}
          </div>

          {/* ================= STEP 1 ================= */}
          {step === 1 && (
            <form
              onSubmit={handleEmailSubmit}
              className="space-y-5"
            >
              <Input
                id="forgot-email"
                name="email"
                type="email"
                label="Email Address"
                placeholder="Enter your registered email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                autoComplete="email"
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full"
              >
                Send OTP
              </Button>
            </form>
          )}

          {/* ================= STEP 2 ================= */}
          {step === 2 && (
            <form
              onSubmit={handleOtpSubmit}
              className="space-y-5"
            >
              <Input
                id="otp"
                name="otp"
                type="text"
                label="Verification Code"
                placeholder="Enter 6-digit OTP"
                value={formData.otp}
                onChange={handleChange}
                error={errors.otp}
                maxLength="6"
                autoComplete="one-time-code"
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full"
              >
                Verify OTP
              </Button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
              >
                Change Email
              </button>
            </form>
          )}

          {/* ================= STEP 3 ================= */}
          {step === 3 && (
            <form
              onSubmit={handlePasswordSubmit}
              className="space-y-5"
            >
              <Input
                id="new-password"
                name="newPassword"
                type="password"
                label="New Password"
                placeholder="Enter new password"
                value={formData.newPassword}
                onChange={handleChange}
                error={errors.newPassword}
                showPasswordToggle
                autoComplete="new-password"
              />

              <Input
                id="confirm-password"
                name="confirmPassword"
                type="password"
                label="Confirm Password"
                placeholder="Confirm new password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                showPasswordToggle
                autoComplete="new-password"
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full"
              >
                Reset Password
              </Button>
            </form>
          )}

          {/* Back to Login */}
          <div className="mt-6 border-t border-slate-200 pt-5 text-center">
            <button
              type="button"
              onClick={() => navigate("/home")}
              className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-600"
            >
              ← Back to Login
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;