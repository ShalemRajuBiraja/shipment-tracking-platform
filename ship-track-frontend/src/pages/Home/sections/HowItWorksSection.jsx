import Icon from "./Icon";

const steps = [
  {
    number: "01",
    title: "Order Placed",
    description: "Your shipment order is created and ready for pickup.",
    icon: "box",
  },
  {
    number: "02",
    title: "Picked Up",
    description: "The shipment is collected and begins its delivery journey.",
    icon: "truck",
  },
  {
    number: "03",
    title: "In Transit",
    description: "Your shipment is moving toward its destination and can be tracked.",
    icon: "pin",
  },
  {
    number: "04",
    title: "Delivered",
    description: "The shipment reaches its destination successfully.",
    icon: "delivered",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="hm-section hm-section--tint">
      <div className="hm-container">
        <div className="hm-head hm-reveal">
          <p className="hm-eyebrow">How It Works</p>
          <h2>Follow your shipment from order to delivery</h2>
          <p>
            See how your shipment moves through every major stage until it
            reaches its destination.
          </p>
        </div>

        <div className="hm-journey">
          {/* Connecting route with a moving truck */}
          <div className="hm-journey__line" aria-hidden="true">
            <span className="hm-journey__fill" />
            <span className="hm-journey__truck">
              <Icon name="truck" size={16} />
            </span>
          </div>

          {steps.map((step, index) => (
            <div
              key={step.number}
              className="hm-step hm-reveal"
              style={{ "--d": `${index * 100}ms` }}
            >
              <div
                className={`hm-step__node ${
                  index <= 1 ? "is-done" : index === 2 ? "is-current" : ""
                }`}
              >
                <Icon name={step.icon} size={30} />
              </div>

              <span className="hm-step__num">Step {step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;