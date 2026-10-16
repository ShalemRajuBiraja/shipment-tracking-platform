
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import Modal from "../../components/ui/Modal";
import { loginApi } from "../../services/authService";
import { redirectBasedOnRole } from "../../utils/roleRedirect";

import authBackground from "../../assets/images/bg-image.png";
import "./LoginModal.css";

/* ---------- Inline Icons ---------- */

const MailIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="5" width="18" height="14" rx="3" />
    <path d="m4 7 8 6 8-6" />
  </svg>
);

const LockIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="4" y="10" width="16" height="10" rx="3" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </svg>
);

const EyeIcon = ({ off }) => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
    {off && <path d="M4 4l16 16" />}
  </svg>
);

const CloseIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="20"
    height="20"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="m18 6-12 12" />
    <path d="m6 6 12 12" />
  </svg>
);

const ShieldIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

/* ---------- Login Modal ---------- */

const LoginModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
      apiError: false,
    }));
  };

  const validateForm = () => {
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

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password =
        "Password must be at least 6 characters";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const loginApiResponse = await loginApi(formData);

      if (loginApiResponse?.data?.success) {
        const userData = loginApiResponse.data.data.userData;
        const token = loginApiResponse.data.data.token;

        localStorage.setItem(
          "userData",
          JSON.stringify(userData)
        );

        localStorage.setItem("token", token);

        toast.success(loginApiResponse.data.message);

        redirectBasedOnRole(userData.role, navigate);
      }
    } catch (error) {
      console.log(
        error.response?.data?.message || "Login failed"
      );

      setErrors((previous) => ({
        ...previous,
        apiError: true,
      }));

      toast.error(
        error.response?.data?.message ||
          "Something went wrong"
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      flush
      showCloseButton={false}
    >
      <div className="lm">
        {/* Close Button */}

        <button
          type="button"
          onClick={onClose}
          className="lm__close"
          aria-label="Close login modal"
        >
          <CloseIcon />
        </button>

        {/* Banner */}

        <div
          className="lm__banner"
          style={{
            backgroundImage: `url(${authBackground})`,
          }}
        >
          <div className="lm__banner-overlay" />

          <div className="lm__badge">
            <LockIcon />
          </div>

          <div className="lm__banner-text">
            <h2 className="lm__title">
              Welcome back
            </h2>

            <p className="lm__subtitle">
              Sign in to pick up where you left off.
            </p>
          </div>
        </div>

        {/* Body */}

        <div className="lm__body">
          {errors.apiError && (
            <div className="lm__alert" role="alert">
              We couldn't sign you in. Check your email and
              password, then try again.
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="lm__form"
            noValidate
          >
            {/* Email */}

            <div className="lm__field">
              <label
                htmlFor="login-email"
                className="lm__label"
              >
                Email address
              </label>

              <div
                className={`lm__control ${
                  errors.email ? "is-error" : ""
                }`}
              >
                <span className="lm__icon">
                  <MailIcon />
                </span>

                <input
                  id="login-email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  aria-invalid={!!errors.email}
                  aria-describedby={
                    errors.email
                      ? "login-email-error"
                      : undefined
                  }
                />
              </div>

              {errors.email && (
                <p
                  id="login-email-error"
                  className="lm__error"
                >
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}

            <div className="lm__field">
              <div className="lm__label-row">
                <label
                  htmlFor="login-password"
                  className="lm__label"
                >
                  Password
                </label>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate("/auth/forgot-password");
                  }}
                  className="lm__link"
                >
                  Forgot password?
                </button>
              </div>

              <div
                className={`lm__control ${
                  errors.password ? "is-error" : ""
                }`}
              >
                <span className="lm__icon">
                  <LockIcon />
                </span>

                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  aria-invalid={!!errors.password}
                  aria-describedby={
                    errors.password
                      ? "login-password-error"
                      : undefined
                  }
                />

                <button
                  type="button"
                  className="lm__toggle"
                  onClick={() =>
                    setShowPassword((previous) => !previous)
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  <EyeIcon off={showPassword} />
                </button>
              </div>

              {errors.password && (
                <p
                  id="login-password-error"
                  className="lm__error"
                >
                  {errors.password}
                </p>
              )}
            </div>

            {/* Login Button */}

            <button
              type="submit"
              className="lm__submit"
            >
              <span>Log in</span>
              <span className="lm__submit-arrow">→</span>
            </button>
          </form>

          {/* Register */}

          <div className="lm__footer">
            <span>New here?</span>

            <button
              type="button"
              className="lm__link lm__link--strong"
              onClick={() => {
                onClose();
                navigate("/auth/register");
              }}
            >
              Create an account
            </button>
          </div>

          {/* Security */}

          <div className="lm__security">
            <ShieldIcon />

            <span>
              Your account access is protected.
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default LoginModal;

