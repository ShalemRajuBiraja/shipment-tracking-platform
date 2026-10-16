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

/* Defined outside the page so inputs never lose focus while typing */
const Field = ({ label, as = "input", hint, ...props }) => {
  const Tag = as;

  return (
    <div className="cd-field">
      <label>{label}</label>
      <Tag {...props} />
      {hint && <p className="cd-hint">{hint}</p>}
    </div>
  );
};

const CreateCustomerShipment = () => {
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

      const response = await createShipmentApi(formData);

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
    <div className="cd-wide">

      {/* PAGE HEADER */}
      <div className="cd-pagetitle cd-pagetitle--icon">
        <span className="cd-card__badge cd-card__badge--solid cd-card__badge--lg">
          <PackagePlus size={24} />
        </span>

        <div>
          <h1>Create Shipment</h1>
          <p>Enter shipment details to create a new delivery.</p>
        </div>
      </div>

      {/* MAIN FORM */}
      <form onSubmit={handleSubmit} className="cd-stack">

        {/* RECEIVER INFORMATION */}
        <section className="cd-card cd-card--flat">

          <div className="cd-card__head cd-card__head--icon">
            <span className="cd-card__badge">
              <User size={18} />
            </span>

            <div>
              <h2>Receiver Information</h2>
              <p>Enter the recipient details.</p>
            </div>
          </div>

          <div className="cd-grid cd-grid--2">

            <Field
              label="Receiver Name"
              type="text"
              name="receiverName"
              value={formData.receiverName}
              onChange={handleChange}
              placeholder="Enter receiver name"
            />

            <Field
              label="Phone Number"
              type="tel"
              name="receiverPhone"
              value={formData.receiverPhone}
              onChange={handleChange}
              placeholder="Enter phone number"
            />

          </div>
        </section>

        {/* PICKUP + DELIVERY */}
        <div className="cd-grid cd-grid--lg2">

          {/* PICKUP LOCATION */}
          <section className="cd-card cd-card--flat">

            <div className="cd-card__head cd-card__head--icon">
              <span className="cd-card__badge">
                <MapPin size={18} />
              </span>

              <div>
                <h2>Pickup Location</h2>
                <p>Enter where the shipment will be collected.</p>
              </div>
            </div>

            <div className="cd-form cd-form--tight">

              <Field
                as="textarea"
                label="Pickup Address"
                rows="2"
                name="pickupAddress"
                value={formData.pickupAddress}
                onChange={handleChange}
                placeholder="Enter complete pickup address"
              />

              <div className="cd-grid cd-grid--3">

                <Field
                  label="City"
                  type="text"
                  name="pickupCity"
                  value={formData.pickupCity}
                  onChange={handleChange}
                  placeholder="City"
                />

                <Field
                  label="State"
                  type="text"
                  name="pickupState"
                  value={formData.pickupState}
                  onChange={handleChange}
                  placeholder="State"
                />

                <Field
                  label="Pincode"
                  type="text"
                  name="pickupPincode"
                  value={formData.pickupPincode}
                  onChange={handleChange}
                  placeholder="Pincode"
                />

              </div>
            </div>
          </section>

          {/* DELIVERY LOCATION */}
          <section className="cd-card cd-card--flat">

            <div className="cd-card__head cd-card__head--icon">
              <span className="cd-card__badge">
                <Truck size={18} />
              </span>

              <div>
                <h2>Delivery Location</h2>
                <p>Enter where the shipment should be delivered.</p>
              </div>
            </div>

            <div className="cd-form cd-form--tight">

              <Field
                as="textarea"
                label="Delivery Address"
                rows="2"
                name="deliveryAddress"
                value={formData.deliveryAddress}
                onChange={handleChange}
                placeholder="Enter complete delivery address"
              />

              <div className="cd-grid cd-grid--3">

                <Field
                  label="City"
                  type="text"
                  name="deliveryCity"
                  value={formData.deliveryCity}
                  onChange={handleChange}
                  placeholder="City"
                />

                <Field
                  label="State"
                  type="text"
                  name="deliveryState"
                  value={formData.deliveryState}
                  onChange={handleChange}
                  placeholder="State"
                />

                <Field
                  label="Pincode"
                  type="text"
                  name="deliveryPincode"
                  value={formData.deliveryPincode}
                  onChange={handleChange}
                  placeholder="Pincode"
                />

              </div>
            </div>
          </section>

        </div>

        {/* PACKAGE DETAILS */}
        <section className="cd-card cd-card--flat">

          <div className="cd-card__head cd-card__head--icon">
            <span className="cd-card__badge cd-card__badge--amber">
              <Package size={18} />
            </span>

            <div>
              <h2>Package Details</h2>
              <p>Enter information about the shipment package.</p>
            </div>
          </div>

          <div className="cd-grid cd-grid--2">

            <Field
              as="textarea"
              label="Package Description"
              rows="2"
              name="packageDescription"
              value={formData.packageDescription}
              onChange={handleChange}
              placeholder="Describe the package contents"
            />

            <Field
              label="Package Weight (kg)"
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              min="0.1"
              step="0.1"
              placeholder="Enter weight in kg"
              hint="Minimum weight: 0.1 kg"
            />

          </div>
        </section>

        {/* SUBMIT BUTTON */}
        <div className="cd-actions">

          <button
            type="submit"
            disabled={loading}
            className="cd-btn cd-btn--auto"
          >
            {loading ? (
              <>
                <Loader2
                  size={17}
                  className="cd-spin"
                />
                Creating...
              </>
            ) : (
              <>
                <PackagePlus size={17} />
                Create Shipment
              </>
            )}
          </button>

        </div>

      </form>
    </div>
  );
};

export default CreateCustomerShipment;
