import { useNavigate } from "react-router-dom";
import heroImage from "../../../assets/images/ship-logo.png";
import Icon from "./Icon";

const trustPoints = ["Role-based access", "Live status updates", "One tracking number"];

const stages = ["Placed", "Picked up", "In transit", "Delivered"];

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="hm-hero">
      {/* Background decoration */}
      <div aria-hidden="true" className="hm-hero__glow hm-hero__glow--a" />
      <div aria-hidden="true" className="hm-hero__glow hm-hero__glow--b" />
      <svg
        aria-hidden="true"
        className="hm-hero__route"
        viewBox="0 0 1200 600"
        preserveAspectRatio="none"
      >
        <path d="M-20 520 C 220 380, 380 560, 620 380 S 980 120, 1220 220" />
      </svg>

      <div className="hm-container hm-hero__grid">
        {/* Left content */}
        <div className="hm-hero__copy">
          <div className="hm-pill">
            <span className="hm-pill__dot" />
            One platform for every role in delivery
          </div>

          <h1 className="hm-hero__title">
            Every parcel. Every mile.
            <span>One clear view.</span>
          </h1>

          <p className="hm-hero__text">
            ShipTrack Pro connects customers, business clients, logistics
            operators and support agents, so everyone knows where a shipment
            is and what happens next.
          </p>

          <div className="hm-hero__actions">
            <button
              type="button"
              className="hm-btn hm-btn--primary hm-btn--lg"
              onClick={() => navigate("/auth/register")}
            >
              Create your account
              <Icon name="arrow" size={18} />
            </button>

            <a href="#how-it-works" className="hm-btn hm-btn--ghost hm-btn--lg">
              Explore the journey
            </a>
          </div>

          <ul className="hm-trust">
            {trustPoints.map((point) => (
              <li key={point}>
                <span className="hm-trust__tick">
                  <Icon name="check" size={14} />
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>

        {/* Right visual */}
        <div className="hm-visual">
          <div className="hm-visual__frame">
            <img
              src={heroImage}
              alt="Delivery truck transporting shipments"
            />
            <div className="hm-visual__shade" />
          </div>

          {/* Floating location badge */}
          <div className="hm-badge">
            <span className="hm-badge__icon">
              <Icon name="pin" size={18} />
            </span>
            <div>
              <p>Status</p>
              <strong>Always up to date</strong>
            </div>
          </div>

          {/* Sample tracking card (visual only) */}
          <div id="tracking" className="hm-track">
            <div className="hm-track__head">
              <div>
                <p className="hm-track__label">Sample shipment</p>
                <p className="hm-track__id">STP-48210-IN</p>
              </div>
              <span className="hm-track__status">In Transit</span>
            </div>

            <div className="hm-track__bar" aria-hidden="true">
              <span className="hm-track__fill" />
              {stages.map((stage, i) => (
                <span
                  key={stage}
                  className={`hm-track__node ${i <= 2 ? "is-done" : ""}`}
                />
              ))}
            </div>

            <div className="hm-track__stages">
              {stages.map((stage) => (
                <span key={stage}>{stage}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;