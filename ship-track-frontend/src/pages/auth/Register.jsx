import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/images/ship-track-logo.png";
import { registerApi } from "../../services/authService";
import { toast } from "react-toastify";
import authBackground from "../../assets/images/bg-image.png";
import "./Register.css";

/* ---------- Inline icons (no extra packages needed) ---------- */
const ICONS = {
  user: (<><circle cx="12" cy="8" r="4" /><path d="M4 20c1.5-4 4.5-6 8-6s6.5 2 8 6" /></>),
  mail: (<><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m4 7 8 6 8-6" /></>),
  lock: (<><rect x="4" y="10" width="16" height="10" rx="3" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>),
  phone: (<><rect x="7" y="2.5" width="10" height="19" rx="3" /><path d="M11 18.5h2" /></>),
  building: (<><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 7.5h2M13 7.5h2M9 11.5h2M13 11.5h2M10 21v-4h4v4" /></>),
  doc: (<><path d="M7 3h7l4 4v14H7z" /><path d="M14 3v4h4M10 12h5M10 16h5" /></>),
  truck: (<><path d="M2.5 6.5h11v10h-11zM13.5 10h4l3 3v3.5h-7" /><circle cx="7" cy="18" r="1.8" /><circle cx="17" cy="18" r="1.8" /></>),
  headset: (<><path d="M4 14v-2a8 8 0 0 1 16 0v2" /><rect x="3" y="13" width="4" height="6" rx="2" /><rect x="17" y="13" width="4" height="6" rx="2" /><path d="M19 19c0 1.5-2 2.5-5 2.5" /></>),
  badge: (<><rect x="3" y="5" width="18" height="14" rx="3" /><circle cx="9" cy="11" r="2" /><path d="M6.5 16c.5-1.6 1.5-2.4 2.5-2.4s2 .8 2.5 2.4M14 10h4M14 14h3" /></>),
  eye: (<><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>),
  eyeOff: (<><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /><path d="M4 4l16 16" /></>),
};

const Icon = ({ name, size = 18 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {ICONS[name]}
  </svg>
);

/* Defined outside Register so inputs never lose focus while typing */
const Field = ({ id, name, type = "text", label, placeholder, icon, value, onChange, error, autoComplete, children }) => (
  <div className="rg__field">
    <label htmlFor={id} className="rg__label">{label}</label>
    <div className={`rg__control ${error ? "is-error" : ""}`}>
      <span className="rg__icon"><Icon name={icon} /></span>
      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {children}
    </div>
    {error && <p id={`${id}-error`} className="rg__error">{error}</p>}
  </div>
);

const ROLES = [
  { value: "CUSTOMER", label: "Customer", hint: "Track my shipments", icon: "user" },
  { value: "BUSINESS_CLIENT", label: "Business Client", hint: "Ship for my company", icon: "building" },
  { value: "LOGISTICS_OPERATOR", label: "Logistics Operator", hint: "Move and deliver goods", icon: "truck" },
  { value: "SUPPORT_AGENT", label: "Support Agent", hint: "Help our customers", icon: "headset" },
];

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    role: "",
    phoneNumber: "",
    email: "",
    password: "",

    // Business Client
    companyName: "",
    gstId: "",

    // Logistics Operator
    logisticsCompanyName: "",
    transportLicenseNumber: "",

    // Support Agent
    employeeId: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false); // UI only

  // 1. Handle input changes
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

  // 2. Validate form
  const validateForm = () => {
    const newErrors = {};

    // Full Name
    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    }

    // Account Type
    if (!formData.role) {
      newErrors.role = "Please select your account type";
    }

    // Phone Number
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^[0-9]{10}$/.test(formData.phoneNumber.trim())) {
      newErrors.phoneNumber = "Enter a valid 10-digit phone number";
    }

    // Role-based validation
    if (formData.role === "BUSINESS_CLIENT") {
      if (!formData.companyName.trim()) {
        newErrors.companyName = "Company name is required";
      }

      if (!formData.gstId.trim()) {
        newErrors.gstId = "GSTIN is required";
      }
    }

    if (formData.role === "LOGISTICS_OPERATOR") {
      if (!formData.logisticsCompanyName.trim()) {
        newErrors.logisticsCompanyName =
          "Logistics company name is required";
      }

      if (!formData.transportLicenseNumber.trim()) {
        newErrors.transportLicenseNumber =
          "Transport license number is required";
      }
    }

    if (formData.role === "SUPPORT_AGENT") {
      if (!formData.employeeId.trim()) {
        newErrors.employeeId = "Employee ID is required";
      }
    }

    // Email
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
        formData.email
      )
    ) {
      newErrors.email = "Enter a valid email address";
    }

    // Password
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password =
        "Password must be at least 6 characters";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // 3. Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const apiresponse = await registerApi(formData);

      if (apiresponse?.data?.success) {
        toast.success(apiresponse?.data?.message);
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "Something went wrong";

      console.log(message);

      setErrors((previous) => ({
        ...previous,
        apiError: true,
      }));

      toast.error(message);
    }
  };

  return (
    <div
      className="rg"
      style={{ backgroundImage: `url(${authBackground})` }}
    >
      <div className="rg__overlay" />

      <div className="rg__stage">
        <div className="rg__card">

          {/* ================= HEADER - FIXED ================= */}
          <header className="rg__header">
            <span className="rg__logo">
              <img src={logo} alt="ShipTrack Pro" />
            </span>
            <h1 className="rg__title">Create your account</h1>
            <p className="rg__subtitle">
              Join ShipTrack Pro and start managing your shipments.
            </p>
          </header>

          {/* ================= SCROLLABLE FORM ================= */}
          <div className="rg__scroll">
            <form onSubmit={handleSubmit} className="rg__form" noValidate>

              {errors.apiError && (
                <div className="rg__alert" role="alert">
                  We couldn't create your account. Review your details and try again.
                </div>
              )}

              {/* Full Name */}
              <Field
                id="signup-name"
                name="name"
                label="Full name"
                placeholder="Enter your full name"
                icon="user"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                autoComplete="name"
              />

              {/* Account Type */}
              <fieldset className="rg__field rg__roles">
                <legend className="rg__label">Account type</legend>

                <div className="rg__role-grid">
                  {ROLES.map((role) => (
                    <label
                      key={role.value}
                      className={`rg__role ${formData.role === role.value ? "is-selected" : ""} ${errors.role ? "is-error" : ""}`}
                    >
                      <input
                        type="radio"
                        id={`signup-role-${role.value}`}
                        name="role"
                        value={role.value}
                        checked={formData.role === role.value}
                        onChange={handleChange}
                      />
                      <span className="rg__role-icon"><Icon name={role.icon} size={20} /></span>
                      <span className="rg__role-text">
                        <strong>{role.label}</strong>
                        <small>{role.hint}</small>
                      </span>
                    </label>
                  ))}
                </div>

                {errors.role && <p className="rg__error">{errors.role}</p>}
              </fieldset>

              {/* ================= BUSINESS CLIENT FIELDS ================= */}
              {formData.role === "BUSINESS_CLIENT" && (
                <div className="rg__extra">
                  <Field
                    id="signup-company-name"
                    name="companyName"
                    label="Company name"
                    placeholder="Enter your company name"
                    icon="building"
                    value={formData.companyName}
                    onChange={handleChange}
                    error={errors.companyName}
                  />

                  <Field
                    id="signup-gst-id"
                    name="gstId"
                    label="GSTIN"
                    placeholder="Enter your GSTIN"
                    icon="doc"
                    value={formData.gstId}
                    onChange={handleChange}
                    error={errors.gstId}
                  />
                </div>
              )}

              {/* ================= LOGISTICS OPERATOR FIELDS ================= */}
              {formData.role === "LOGISTICS_OPERATOR" && (
                <div className="rg__extra">
                  <Field
                    id="signup-logistics-company"
                    name="logisticsCompanyName"
                    label="Logistics company name"
                    placeholder="Enter your logistics company name"
                    icon="truck"
                    value={formData.logisticsCompanyName}
                    onChange={handleChange}
                    error={errors.logisticsCompanyName}
                  />

                  <Field
                    id="signup-transport-license"
                    name="transportLicenseNumber"
                    label="Transport license number"
                    placeholder="Enter your transport license number"
                    icon="doc"
                    value={formData.transportLicenseNumber}
                    onChange={handleChange}
                    error={errors.transportLicenseNumber}
                  />
                </div>
              )}

              {/* ================= SUPPORT AGENT FIELDS ================= */}
              {formData.role === "SUPPORT_AGENT" && (
                <div className="rg__extra">
                  <Field
                    id="signup-employee-id"
                    name="employeeId"
                    label="Employee ID"
                    placeholder="Enter your employee ID"
                    icon="badge"
                    value={formData.employeeId}
                    onChange={handleChange}
                    error={errors.employeeId}
                  />
                </div>
              )}

              {/* ================= FIXED FIELDS ================= */}

              {/* Phone Number */}
              <Field
                id="signup-phone"
                name="phoneNumber"
                type="tel"
                label="Phone number"
                placeholder="Enter your 10-digit phone number"
                icon="phone"
                value={formData.phoneNumber}
                onChange={handleChange}
                error={errors.phoneNumber}
                autoComplete="tel"
              />

              {/* Email */}
              <Field
                id="signup-email"
                name="email"
                type="email"
                label="Email address"
                placeholder="you@example.com"
                icon="mail"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                autoComplete="email"
              />

              {/* Password */}
              <Field
                id="signup-password"
                name="password"
                type={showPassword ? "text" : "password"}
                label="Password"
                placeholder="Create a password"
                icon="lock"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                autoComplete="new-password"
              >
                <button
                  type="button"
                  className="rg__toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <Icon name={showPassword ? "eyeOff" : "eye"} />
                </button>
              </Field>

              <button type="submit" className="rg__submit">
                Create account
              </button>
            </form>
          </div>

          {/* ================= FOOTER - FIXED ================= */}
          <footer className="rg__footer">
            <span>Already have an account?</span>
            <button
              type="button"
              className="rg__link"
              onClick={() => navigate("/")}
            >
              Back to login
            </button>
          </footer>

        </div>
      </div>
    </div>
  );
};

export default Register;
