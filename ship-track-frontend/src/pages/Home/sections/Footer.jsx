import logo from "../../../assets/images/ship-track-logo.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="hm-footer">
      <div className="hm-container">
        <div className="hm-footer__grid">
          <div className="hm-footer__brand">
            <a href="#home" className="hm-brand">
              <span className="hm-brand__logo">
                <img src={logo} alt="" />
              </span>
              <span className="hm-brand__name">
                ShipTrack <span>Pro</span>
              </span>
            </a>

            <p>
              A reliable platform for managing, tracking, and monitoring
              shipments from one centralized place.
            </p>

            <button
              type="button"
              className="hm-btn hm-btn--primary hm-btn--sm"
              onClick={() =>
                document
                  .getElementById("tracking")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Track Shipment
            </button>
          </div>

          <div>
            <h4>Product</h4>
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#services">Services</a></li>
              <li><a href="/auth/register">Track Shipment</a></li>
            </ul>
          </div>

          <div>
            <h4>Company</h4>
            <ul>
              <li><a href="#home">About Us</a></li>
              <li><a href="#how-it-works">How It Works</a></li>
              <li><a href="#home">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4>Support</h4>
            <ul>
              <li><a href="#home">Help Center</a></li>
              <li><a href="#home">FAQ</a></li>
              <li><a href="#home">Contact Support</a></li>
            </ul>
          </div>
        </div>

        <div className="hm-footer__bottom">
          <p>© {currentYear} ShipTrack Pro. All rights reserved.</p>

          <div>
            <a href="#home">Privacy Policy</a>
            <a href="#home">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;