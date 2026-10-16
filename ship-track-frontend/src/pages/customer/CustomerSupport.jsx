import { useState } from "react";
import { Headphones, Send, Hash, Clock } from "lucide-react";
import { toast } from "react-toastify";
import { supportRequestApi } from "../../services/shipmentService";

const CustomerSupport = () => {
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    issue: "",
    description: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.issue ||
      !formData.description ||
      !formData.name ||
      !formData.phoneNumber
    ) {
      toast.error("Please fill all fields.");
      return;
    }

    try {
      const response = await supportRequestApi(formData);

      if (response.data.success === true) {
        toast.success("Support request sent successfully!");

        setFormData({
          name: "",
          phoneNumber: "",
          issue: "",
          description: "",
        });
      } else {
        toast.error("Failed to submit support request. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting support request:", error);
      toast.error("Failed to submit support request. Please try again.");
    }
  };

  return (
    <div className="cd-split">

      {/* Info panel */}
      <aside className="cd-panel">
        <span className="cd-panel__icon">
          <Headphones size={24} />
        </span>

        <h1>Contact Support</h1>

        <p>Send your issue to our support team.</p>

        <ul>
          <li>
            <Hash size={16} />
            Include your tracking number in the description so we can find your shipment faster.
          </li>
          <li>
            <Clock size={16} />
            Describe what happened and when, so the agent has the full picture.
          </li>
        </ul>
      </aside>

      {/* Support Form */}
      <div className="cd-card cd-card--form">

        {/* Form Header */}
        <div className="cd-card__head">
          <div>
            <h2>Submit Support Request</h2>
            <p>
              Describe your issue clearly and our support agent will assist you.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="cd-form">

          {/* Name */}
          <div className="cd-field">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              required
            />
          </div>

          {/* Phone Number */}
          <div className="cd-field">
            <label>Phone Number</label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Enter your phone number"
              required
            />
          </div>

          {/* Issue */}
          <div className="cd-field">
            <label>Issue</label>
            <input
              type="text"
              name="issue"
              value={formData.issue}
              onChange={handleChange}
              placeholder="Enter issue"
              required
            />
          </div>

          {/* Description */}
          <div className="cd-field">
            <label>Describe Your Issue</label>
            <textarea
              rows="4"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter your tracking number and explain your issue..."
              required
            />
          </div>

          {/* Submit */}
          <button type="submit" className="cd-btn">
            <Send size={16} />
            Send Support Request
          </button>

        </form>

      </div>

    </div>
  );
};

export default CustomerSupport;
