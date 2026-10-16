
import { useState } from "react";
import { toast } from "react-toastify";

import {
  PackagePlus,
  User,
  MapPin,
  Truck,
  Package,
  Loader2,
} from "lucide-react";

import { createShipmentApi } from "../../services/shipmentService";

const CreateShipment = () => {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    receiverName: "",
    receiverPhone: "",

    pickupAddress: "",
    pickupCity: "",
    pickupState: "",
    pickupPincode: "",

    deliveryAddress: "",
    deliveryCity: "",
    deliveryState: "",
    deliveryPincode: "",

    packageDescription: "",
    weight: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.receiverName ||
      !formData.receiverPhone ||
      !formData.pickupAddress ||
      !formData.pickupCity ||
      !formData.pickupState ||
      !formData.pickupPincode ||
      !formData.deliveryAddress ||
      !formData.deliveryCity ||
      !formData.deliveryState ||
      !formData.deliveryPincode ||
      !formData.weight
    ) {
      toast.error("Please fill all required fields.");
      return;
    }

    try {
      setLoading(true);

      console.log("Sending shipment data:", formData);

      const response = await createShipmentApi(formData);

      console.log("Create shipment response:", response.data);

      if (response.data.success === true) {
        toast.success("Shipment created successfully!");

        setFormData({
          receiverName: "",
          receiverPhone: "",

          pickupAddress: "",
          pickupCity: "",
          pickupState: "",
          pickupPincode: "",

          deliveryAddress: "",
          deliveryCity: "",
          deliveryState: "",
          deliveryPincode: "",

          packageDescription: "",
          weight: "",
        });
      } else {
        toast.error(
          response.data.message || "Failed to create shipment."
        );
      }
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          "Something went wrong while creating shipment."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-3 max-w-4xl">

      {/* PAGE HEADER */}
      <div className="mb-3">
        <div className="flex items-center gap-2.5">

          <div className="p-2 bg-blue-50 rounded-lg">
            <PackagePlus
              size={20}
              className="text-blue-600"
            />
          </div>

          <div>
            <h1 className="text-lg font-bold text-slate-800">
              Create Shipment
            </h1>

            <p className="text-xs text-slate-500">
              Enter shipment details to create a new delivery.
            </p>
          </div>

        </div>
      </div>

      {/* MAIN FORM */}
      <form
        onSubmit={handleSubmit}
        className="space-y-3"
      >

        {/* RECEIVER INFORMATION */}
        <section className="bg-white border border-slate-200 rounded-lg shadow-sm">

          <div className="flex items-center gap-2.5 px-3 py-3 border-b border-slate-100">

            <div className="p-2 bg-blue-50 rounded-lg">
              <User
                size={18}
                className="text-blue-600"
              />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-slate-800">
                Receiver Information
              </h2>

              <p className="text-xs text-slate-500">
                Enter the recipient details.
              </p>
            </div>

          </div>

          <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-3">

            {/* Receiver Name */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Receiver Name
              </label>

              <input
                type="text"
                name="receiverName"
                value={formData.receiverName}
                onChange={handleChange}
                placeholder="Enter receiver name"
                className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                required
              />
            </div>

            {/* Receiver Phone */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Phone Number
              </label>

              <input
                type="tel"
                name="receiverPhone"
                value={formData.receiverPhone}
                onChange={handleChange}
                placeholder="Enter phone number"
                className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                required
              />
            </div>

          </div>
        </section>


        {/* PICKUP + DELIVERY */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">

          {/* PICKUP LOCATION */}
          <section className="bg-white border border-slate-200 rounded-lg shadow-sm">

            <div className="flex items-center gap-2.5 px-3 py-3 border-b border-slate-100">

              <div className="p-2 bg-blue-50 rounded-lg">
                <MapPin
                  size={18}
                  className="text-blue-600"
                />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-slate-800">
                  Pickup Location
                </h2>

                <p className="text-xs text-slate-500">
                  Shipment collection location.
                </p>
              </div>

            </div>

            <div className="p-3 space-y-3">

              {/* Pickup Address */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Pickup Address
                </label>

                <textarea
                  rows="2"
                  name="pickupAddress"
                  value={formData.pickupAddress}
                  onChange={handleChange}
                  placeholder="Enter complete pickup address"
                  className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm outline-none resize-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                  required
                />
              </div>

              {/* City / State / Pincode */}
              <div className="grid grid-cols-3 gap-2">

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    City
                  </label>

                  <input
                    type="text"
                    name="pickupCity"
                    value={formData.pickupCity}
                    onChange={handleChange}
                    placeholder="City"
                    className="w-full border border-slate-200 rounded-md px-2.5 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    State
                  </label>

                  <input
                    type="text"
                    name="pickupState"
                    value={formData.pickupState}
                    onChange={handleChange}
                    placeholder="State"
                    className="w-full border border-slate-200 rounded-md px-2.5 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Pincode
                  </label>

                  <input
                    type="text"
                    name="pickupPincode"
                    value={formData.pickupPincode}
                    onChange={handleChange}
                    placeholder="Pincode"
                    className="w-full border border-slate-200 rounded-md px-2.5 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                    required
                  />
                </div>

              </div>

            </div>
          </section>


          {/* DELIVERY LOCATION */}
          <section className="bg-white border border-slate-200 rounded-lg shadow-sm">

            <div className="flex items-center gap-2.5 px-3 py-3 border-b border-slate-100">

              <div className="p-2 bg-blue-50 rounded-lg">
                <Truck
                  size={18}
                  className="text-blue-600"
                />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-slate-800">
                  Delivery Location
                </h2>

                <p className="text-xs text-slate-500">
                  Shipment delivery location.
                </p>
              </div>

            </div>

            <div className="p-3 space-y-3">

              {/* Delivery Address */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Delivery Address
                </label>

                <textarea
                  rows="2"
                  name="deliveryAddress"
                  value={formData.deliveryAddress}
                  onChange={handleChange}
                  placeholder="Enter complete delivery address"
                  className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm outline-none resize-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                  required
                />
              </div>

              {/* City / State / Pincode */}
              <div className="grid grid-cols-3 gap-2">

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    City
                  </label>

                  <input
                    type="text"
                    name="deliveryCity"
                    value={formData.deliveryCity}
                    onChange={handleChange}
                    placeholder="City"
                    className="w-full border border-slate-200 rounded-md px-2.5 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    State
                  </label>

                  <input
                    type="text"
                    name="deliveryState"
                    value={formData.deliveryState}
                    onChange={handleChange}
                    placeholder="State"
                    className="w-full border border-slate-200 rounded-md px-2.5 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Pincode
                  </label>

                  <input
                    type="text"
                    name="deliveryPincode"
                    value={formData.deliveryPincode}
                    onChange={handleChange}
                    placeholder="Pincode"
                    className="w-full border border-slate-200 rounded-md px-2.5 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                    required
                  />
                </div>

              </div>

            </div>
          </section>

        </div>


        {/* PACKAGE DETAILS */}
        <section className="bg-white border border-slate-200 rounded-lg shadow-sm">

          <div className="flex items-center gap-2.5 px-3 py-3 border-b border-slate-100">

            <div className="p-2 bg-amber-50 rounded-lg">
              <Package
                size={18}
                className="text-amber-600"
              />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-slate-800">
                Package Details
              </h2>

              <p className="text-xs text-slate-500">
                Enter package information.
              </p>
            </div>

          </div>

          <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-3">

            {/* Package Description */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Package Description
              </label>

              <textarea
                rows="2"
                name="packageDescription"
                value={formData.packageDescription}
                onChange={handleChange}
                placeholder="Describe the package contents"
                className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm outline-none resize-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
              />
            </div>

            {/* Weight */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Package Weight (kg)
              </label>

              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                min="0.1"
                step="0.1"
                placeholder="Enter weight in kg"
                className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                required
              />

              <p className="text-xs text-slate-400 mt-1">
                Minimum weight: 0.1 kg
              </p>
            </div>

          </div>
        </section>


        {/* SUBMIT BUTTON */}
        <div className="flex justify-end">

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-5 py-2 rounded-md text-sm font-medium transition"
          >

            {loading ? (
              <>
                <Loader2
                  size={16}
                  className="animate-spin"
                />

                Creating...
              </>
            ) : (
              <>
                <PackagePlus size={16} />

                Create Shipment
              </>
            )}

          </button>

        </div>

      </form>
    </div>
  );
};

export default CreateShipment;
