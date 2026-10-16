import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginModal from "../../Auth/LoginModal";
import logo from "../../../assets/images/ship-track-logo.png";
import Icon from "./Icon";

const navItems = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "Services", href: "#services" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Admin Login", href: "/auth/admin/login" },
];

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleNavClick = (event, href) => {
    setIsMenuOpen(false);

    if (href.startsWith("/")) {
      event.preventDefault();
      navigate(href);
    }
  };

  return (
    <header className="hm-nav">
      <nav className="hm-nav__bar hm-container">
        <a
          href="#home"
          onClick={(e) => handleNavClick(e, "#home")}
          className="hm-brand"
        >
          <span className="hm-brand__logo">
            <img src={logo} alt="" />
          </span>
          <span className="hm-brand__name">
            ShipTrack <span>Pro</span>
          </span>
        </a>

        <div className="hm-nav__links">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={(e) => handleNavClick(e, item.href)}
              className="hm-nav__link"
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="hm-nav__actions">
          <button
            type="button"
            className="hm-btn hm-btn--text"
            onClick={() => setIsLoginModalOpen(true)}
          >
            Login
          </button>

          <button
            type="button"
            className="hm-btn hm-btn--primary hm-btn--sm"
            onClick={() => navigate("/auth/register")}
          >
            Register
          </button>
        </div>

        <button
          type="button"
          aria-label="Toggle navigation menu"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className="hm-nav__burger"
        >
          <Icon name={isMenuOpen ? "close" : "menu"} size={24} />
        </button>
      </nav>

      {isMenuOpen && (
        <div className="hm-nav__panel">
          <div className="hm-container">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className="hm-nav__panel-link"
              >
                {item.label}
              </a>
            ))}

            <div className="hm-nav__panel-actions">
              <button
                type="button"
                className="hm-btn hm-btn--ghost"
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsLoginModalOpen(true);
                }}
              >
                Login
              </button>

              <button
                type="button"
                className="hm-btn hm-btn--primary"
                onClick={() => {
                  setIsMenuOpen(false);
                  navigate("/auth/register");
                }}
              >
                Register
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LOGIN MODAL CONNECTED HERE */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </header>
  );
};

export default Navbar;