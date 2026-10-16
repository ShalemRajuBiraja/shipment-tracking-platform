import { useState } from "react";
import {
  Lock,
  Send,
  MessageSquare,
} from "lucide-react";
import { toast } from "react-toastify";

const SupportSettings = () => {
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [adminMessage, setAdminMessage] = useState({
    subject: "",
    message: "",
  });

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleAdminMessageChange = (event) => {
    const { name, value } = event.target;

    setAdminMessage((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handlePasswordSubmit = (event) => {
    event.preventDefault();

    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      toast.error("Please fill all password fields!");
      return;
    }

    if (
      passwordData.newPassword !==
      passwordData.confirmPassword
    ) {
      toast.error("New passwords do not match!");
      return;
    }

    toast.success("Password updated successfully!");

    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleAdminMessageSubmit = (event) => {
    event.preventDefault();

    if (!adminMessage.subject || !adminMessage.message) {
      toast.error("Please fill all fields!");
      return;
    }

    toast.success("Message sent to administrator!");

    setAdminMessage({
      subject: "",
      message: "",
    });
  };

  return (
    <div className="space-y-5">

      {/* ================= PAGE HEADER ================= */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-800">
          Settings
        </h1>

        <p className="text-sm text-slate-500 mt-1">
          Manage your account security and administrator communication.
        </p>
      </div>


      {/* ================= SETTINGS CARDS ================= */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        {/* ================= PASSWORD CARD ================= */}
        <section className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">

          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-200">

            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Lock
                size={20}
                className="text-blue-600"
              />
            </div>

            <div>
              <h2 className="font-bold text-slate-800">
                Password & Security
              </h2>

              <p className="text-sm text-slate-500">
                Keep your account secure.
              </p>
            </div>

          </div>


          <form
            onSubmit={handlePasswordSubmit}
            className="space-y-4"
          >

            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Current Password
              </label>

              <input
                type="password"
                name="currentPassword"
                placeholder="Enter current password"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>


            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                New Password
              </label>

              <input
                type="password"
                name="newPassword"
                placeholder="Enter new password"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>


            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Confirm New Password
              </label>

              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm new password"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>


            <button
              type="submit"
              className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition"
            >
              <Lock size={17} />
              Update Password
            </button>

          </form>

        </section>


        {/* ================= CONTACT ADMIN CARD ================= */}
        <section className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">

          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-200">

            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <MessageSquare
                size={20}
                className="text-blue-600"
              />
            </div>

            <div>
              <h2 className="font-bold text-slate-800">
                Contact Administrator
              </h2>

              <p className="text-sm text-slate-500">
                Send a message to the administrator.
              </p>
            </div>

          </div>


          <form
            onSubmit={handleAdminMessageSubmit}
            className="space-y-4"
          >

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Subject
              </label>

              <input
                type="text"
                name="subject"
                placeholder="Enter message subject"
                value={adminMessage.subject}
                onChange={handleAdminMessageChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>


            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Message
              </label>

              <textarea
                name="message"
                rows="4"
                placeholder="Describe your issue or request..."
                value={adminMessage.message}
                onChange={handleAdminMessageChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>


            <button
              type="submit"
              className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition"
            >
              <Send size={17} />
              Send Message
            </button>

          </form>

        </section>

      </div>


      {/* Footer */}
      <footer className="text-center text-xs text-slate-500 py-2">
        © 2026 QuickShip. All rights reserved.
      </footer>

    </div>
  );
};

export default SupportSettings;