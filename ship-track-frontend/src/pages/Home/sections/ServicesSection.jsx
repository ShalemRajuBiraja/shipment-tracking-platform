import { useNavigate } from "react-router-dom";
import Icon from "./Icon";

const services = [
  {
    title: "Shipment Management",
    description:
      "Create, organize, and manage shipment details from a centralized platform.",
    icon: "grid",
  },
  {
    title: "Shipment Tracking",
    description:
      "Track shipments using a unique tracking number and view their current status.",
    icon: "trend",
  },
  {
    title: "Delivery Management",
    description:
      "Monitor delivery progress and keep important shipment information organized.",
    icon: "check",
  },
  {
    title: "Shipment Insights",
    description:
      "Get a clear overview of shipment activity and delivery progress.",
    icon: "chart",
  },
];

const ServicesSection = () => {
  const navigate = useNavigate();

  return (
    <section id="services" className="hm-section">
      <div className="hm-container">
        <div className="hm-services">
          <div className="hm-services__intro hm-reveal">
            <p className="hm-eyebrow">Our Services</p>
            <h2>Everything in one shipment platform</h2>
            <p>
              Manage the essential parts of your shipment journey through one
              simple and organized platform.
            </p>
          </div>

          <div className="hm-services__grid">
            {services.map((service, index) => (
              <article
                key={service.title}
                className="hm-service hm-reveal"
                style={{ "--d": `${index * 80}ms` }}
              >
                <span className="hm-service__num">0{index + 1}</span>
                <span className="hm-card__icon">
                  <Icon name={service.icon} />
                </span>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </article>
            ))}
          </div>
        </div>

        {/* Call to action */}
        <div className="hm-cta hm-reveal">
          <div>
            <h3>Ready to track your first shipment?</h3>
            <p>Create your free account and see every delivery in one place.</p>
          </div>
          <button
            type="button"
            className="hm-btn hm-btn--light hm-btn--lg"
            onClick={() => navigate("/auth/register")}
          >
            Get Started
            <Icon name="arrow" size={18} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;