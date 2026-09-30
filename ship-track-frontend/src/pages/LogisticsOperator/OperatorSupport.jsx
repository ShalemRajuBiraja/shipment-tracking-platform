
import { useState } from "react";
import { Headphones, Send } from "lucide-react";
import { toast } from "react-toastify";
import { supportRequestApi } from "../../services/shipmentService";

const OperatorSupport = () => {
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
        toast.error(
          "Failed to submit support request. Please try again."
        );
      }
    } catch (error) {
      console.error("Error submitting support request:", error);

      toast.error(
        "Failed to submit support request. Please try again."
      );
    }
  };

  return (
    <div className="p-3 max-w-md">

      {/* Header */}
      <div className="mb-3">

        <div className="flex items-center gap-2.5">

          <div className="p-2 bg-emerald-50 rounded-lg">
            <Headphones
              size={20}
              className="text-emerald-600"
            />
          </div>

          <div>
            <h1 className="text-lg font-bold text-slate-800">
              Contact Support
            </h1>

            <p className="text-xs text-slate-500">
              Send your issue to our support team.
            </p>
          </div>

        </div>

      </div>

      {/* Support Form */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm">

        {/* Form Header */}
        <div className="px-3 py-3 border-b border-slate-100">

          <h2 className="text-sm font-semibold text-slate-800">
            Submit Support Request
          </h2>

          <p className="text-xs text-slate-500 mt-0.5">
            Describe your issue clearly and our support agent will assist you.
          </p>

        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-3 space-y-3"
        >

          {/* Name */}
          <div>

            <label className="block text-xs font-medium text-slate-700 mb-1">
              Full Name
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-100"
              required
            />

          </div>

          {/* Phone Number */}
          <div>

            <label className="block text-xs font-medium text-slate-700 mb-1">
              Phone Number
            </label>

            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Enter your phone number"
              className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-100"
              required
            />

          </div>

          {/* Issue */}
          <div>

            <label className="block text-xs font-medium text-slate-700 mb-1">
              Issue
            </label>

            <input
              type="text"
              name="issue"
              value={formData.issue}
              onChange={handleChange}
              placeholder="Enter issue"
              className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-100"
              required
            />

          </div>

          {/* Description */}
          <div>

            <label className="block text-xs font-medium text-slate-700 mb-1">
              Describe Your Issue
            </label>

            <textarea
              rows="3"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Explain your issue..."
              className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm outline-none resize-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-100"
              required
            />

          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-md text-sm font-medium transition"
          >
            <Send size={16} />
            Send Support Request
          </button>

        </form>

      </div>

    </div>
  );
};

export default OperatorSupport;

