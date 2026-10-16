import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { toast } from "react-toastify";
import { adminLoginApi } from "../../services/authService";
import { redirectBasedOnRole } from "../../utils/roleRedirect";
import {
  ShieldCheck,
  LockKeyhole,
  ArrowLeft,
  Eye,
  EyeOff,
  Mail,
  Truck,
  Globe,
  ChartNoAxesCombined,
} from "lucide-react";

import "./AdminLogin.css";

const AdminLogin = () => {
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
    favoriteTeacher: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    favoriteTeacher: "",
  });

  const [showFavoriteTeacher, setShowFavoriteTeacher] =
    useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setLoginData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const newErrors = {};

    if (!loginData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
        loginData.email
      )
    ) {
      newErrors.email = "Enter a valid email address";
    }

    if (!loginData.password) {
      newErrors.password = "Password is required";
    } else if (loginData.password.length < 6) {
      newErrors.password =
        "Password must be at least 6 characters";
    }

    if (!loginData.favoriteTeacher.trim()) {
      newErrors.favoriteTeacher =
        "Favorite teacher name is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await adminLoginApi(loginData);

      const userData = {
        id: response.data.id,
        email: response.data.email,
        role: response.data.role,
      };

      const token = response.data.token;

      localStorage.setItem(
        "userData",
        JSON.stringify(userData)
      );

      localStorage.setItem("token", token);

      toast.success("Admin login successful");

      redirectBasedOnRole(userData.role, navigate);
    } catch (error) {
      console.error("Admin login error:", error);

      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        "Admin login failed";

      toast.error(errorMessage);
    }
  };

  return (
    <main className="admin-login-page">
      <div className="admin-login-shell">

        {/* LEFT: BRANDING AND LOGISTICS VISUAL */}

        <section className="admin-visual-panel">

          <div className="admin-visual-image" aria-hidden="true" />

          <div className="admin-visual-shade" />

          <div className="admin-visual-content">

            {/* Logo */}

            <button
              type="button"
              className="admin-logo"
              onClick={() => navigate("/")}
              aria-label="ShipTrack Pro home"
            >
              <span className="admin-logo-icon">
                <ShieldCheck size={27} />
              </span>

              <span className="admin-logo-text">
                ShipTrack <span>Pro</span>

                <small>TRACK · DELIVER · GROW</small>
              </span>
            </button>

            {/* Main heading */}

            <div className="admin-hero-copy">

              <div className="admin-eyebrow">
                <span className="admin-eyebrow-line" />
                ADMINISTRATOR ACCESS
              </div>

              <h1>
                Command your
                <br />
                <span>logistics.</span>
              </h1>

              <p>
                Your central hub for shipment visibility,
                operational oversight, and smarter delivery
                management.
              </p>

            </div>

            {/* Shipment route illustration */}

            <div className="admin-route-card">

              <div className="admin-route-card-heading">
                <div>
                  <span className="admin-section-label">
                    SHIPMENT OPERATIONS
                  </span>

                  <h2>Everything in control.</h2>
                </div>

                <span className="admin-route-lock">
                  <LockKeyhole size={22} />
                </span>
              </div>

              <div className="admin-route-progress">

                <div className="admin-route-step">
                  <span className="admin-route-number">
                    01
                  </span>

                  <span>Dispatch</span>
                </div>

                <div className="admin-route-connector">
                  <span />
                  <span />
                  <span />
                </div>

                <div className="admin-route-step">
                  <span className="admin-route-number active">
                    02
                  </span>

                  <span>In transit</span>
                </div>

                <div className="admin-route-connector">
                  <span />
                  <span />
                  <span />
                </div>

                <div className="admin-route-step">
                  <span className="admin-route-number">
                    03
                  </span>

                  <span>Delivered</span>
                </div>

              </div>

              <div className="admin-route-caption">
                <span className="admin-live-dot" />
                Connecting shipments across the world
              </div>

            </div>

            {/* Feature highlights */}

            <div className="admin-feature-grid">

              <div className="admin-feature">
                <span className="admin-feature-icon">
                  <ChartNoAxesCombined size={21} />
                </span>

                <span>
                  <strong>Real-time</strong>
                  <small>Insights</small>
                </span>
              </div>

              <div className="admin-feature">
                <span className="admin-feature-icon">
                  <ShieldCheck size={21} />
                </span>

                <span>
                  <strong>Secure</strong>
                  <small>Operations</small>
                </span>
              </div>

              <div className="admin-feature">
                <span className="admin-feature-icon">
                  <Truck size={21} />
                </span>

                <span>
                  <strong>Efficient</strong>
                  <small>Management</small>
                </span>
              </div>

              <div className="admin-feature">
                <span className="admin-feature-icon">
                  <Globe size={21} />
                </span>

                <span>
                  <strong>Global</strong>
                  <small>Visibility</small>
                </span>
              </div>

            </div>

          </div>

        </section>

        {/* RIGHT: LOGIN FORM */}

        <section className="admin-form-panel">

          <div className="admin-form-container">

            {/* Mobile branding */}

            <div className="admin-mobile-logo">
              <span className="admin-logo-icon">
                <ShieldCheck size={25} />
              </span>

              <span className="admin-logo-text">
                ShipTrack <span>Pro</span>
              </span>
            </div>

            {/* Form heading */}

            <div className="admin-form-heading">

              <div className="admin-form-heading-top">

                <span className="admin-form-icon">
                  <LockKeyhole size={25} />
                </span>

                <span className="admin-secure-label">
                  <span />
                  SECURE ADMIN PORTAL
                </span>

              </div>

              <h2>Welcome back</h2>

              <p>
                Sign in with your administrator credentials
                to continue.
              </p>

            </div>

            {/* Security information */}

            <div className="admin-security-box">

              <ShieldCheck size={25} />

              <div>
                <strong>Protected access</strong>

                <p>
                  This area is restricted to authorized
                  administrators only.
                </p>
              </div>

            </div>

            {/* Existing login form */}

            <form
              onSubmit={handleSubmit}
              className="admin-login-form"
            >

              <div className="admin-email-field">
                <Input
                  id="admin-email"
                  name="email"
                  type="email"
                  label="Admin email"
                  placeholder="Enter admin email"
                  value={loginData.email}
                  onChange={handleChange}
                  error={errors.email}
                  autoComplete="email"
                />
              </div>

              <div className="admin-password-field">
                <Input
                  id="admin-password"
                  name="password"
                  type="password"
                  label="Password"
                  placeholder="Enter your password"
                  value={loginData.password}
                  onChange={handleChange}
                  error={errors.password}
                  autoComplete="current-password"
                  showPasswordToggle
                />
              </div>

              {/* Forgot password */}

              <div className="admin-forgot-row">
                <button
                  type="button"
                  onClick={() =>
                    navigate("/auth/forgot-password")
                  }
                  className="admin-link-button"
                >
                  Forgot password?
                </button>
              </div>

              {/* Secret key */}

              <div className="admin-secret-field">

                <label htmlFor="favorite-teacher">
                  Secret key <span>· Verification</span>
                </label>

                <div className="admin-secret-input">

                  <LockKeyhole
                    className="admin-secret-leading-icon"
                    size={19}
                  />

                  <input
                    id="favorite-teacher"
                    name="favoriteTeacher"
                    type={
                      showFavoriteTeacher
                        ? "text"
                        : "password"
                    }
                    placeholder="Enter your secret key"
                    value={loginData.favoriteTeacher}
                    onChange={handleChange}
                    autoComplete="off"
                    aria-invalid={Boolean(
                      errors.favoriteTeacher
                    )}
                    aria-describedby={
                      errors.favoriteTeacher
                        ? "admin-secret-error"
                        : undefined
                    }
                  />

                  <button
                    type="button"
                    className="admin-secret-toggle"
                    onClick={() =>
                      setShowFavoriteTeacher(
                        !showFavoriteTeacher
                      )
                    }
                    aria-label={
                      showFavoriteTeacher
                        ? "Hide secret key"
                        : "Show secret key"
                    }
                  >
                    {showFavoriteTeacher ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>

                </div>

                {errors.favoriteTeacher && (
                  <p
                    id="admin-secret-error"
                    className="admin-field-error"
                  >
                    {errors.favoriteTeacher}
                  </p>
                )}

                <p className="admin-secret-hint">
                  Enter the verification name configured
                  for your account.
                </p>

              </div>

              {/* Submit */}

              <Button
                type="submit"
                variant="primary"
                className="admin-submit-button"
              >
                <span>Login as Admin</span>

                <span className="admin-submit-arrow">
                  →
                </span>
              </Button>

            </form>

            {/* Footer */}

            <div className="admin-form-divider">
              <span />
              <span>OR</span>
              <span />
            </div>

            <button
              type="button"
              onClick={() => navigate("/")}
              className="admin-back-home"
            >
              <ArrowLeft size={19} />
              Back to Home
            </button>

          </div>

          <p className="admin-copyright">
            © {new Date().getFullYear()} ShipTrack Pro.
            All rights reserved.
          </p>

        </section>

      </div>
    </main>
  );
};

export default AdminLogin;