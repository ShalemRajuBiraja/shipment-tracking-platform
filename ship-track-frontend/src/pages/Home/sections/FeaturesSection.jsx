import Icon from "./Icon";

const features = [
  {
    title: "Real-Time Tracking",
    description:
      "Monitor shipment progress and stay updated throughout the delivery journey.",
    icon: "trend",
  },
  {
    title: "Easy Shipment Management",
    description:
      "Manage shipment information from one centralized and organized platform.",
    icon: "grid",
  },
  {
    title: "Delivery Updates",
    description:
      "Keep track of important shipment status changes and delivery progress.",
    icon: "check",
  },
  {
    title: "Secure Platform",
    description:
      "Keep your shipment information protected with a secure platform.",
    icon: "shield",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="hm-section">
      <div className="hm-container">
        <div className="hm-head hm-reveal">
          <p className="hm-eyebrow">Features</p>
          <h2>Everything you need to manage shipments</h2>
          <p>
            ShipTrack Pro brings essential shipment management and tracking
            capabilities together in one platform.
          </p>
        </div>

        <div className="hm-bento">
          {features.map((feature, index) => (
            <article
              key={feature.title}
              className={`hm-card hm-card--${index + 1} hm-reveal`}
              style={{ "--d": `${index * 80}ms` }}
            >
              <span className="hm-card__icon">
                <Icon name={feature.icon} />
              </span>

              <h3>{feature.title}</h3>
              <p>{feature.description}</p>

              {/* Decorative visuals on the two wide cards */}
              {index === 0 && (
                <div className="hm-viz" aria-hidden="true">
                  <span className="hm-viz__track">
                    <span className="hm-viz__fill" />
                  </span>
                  <span className="hm-viz__pin" />
                </div>
              )}
              {index === 3 && (
                <div className="hm-viz hm-viz--dots" aria-hidden="true">
                  <span /><span /><span /><span /><span /><span />
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;