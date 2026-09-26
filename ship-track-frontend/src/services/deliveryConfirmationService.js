import axiosInstance from "../config/axiosInstance";
import { API_END_POINTS } from "../constants/ApiEndPoints";

export const confirmDeliveryApi = async (trackingNumber) => {

  return await axiosInstance.post( `${API_END_POINTS.CONFIRM_DELIVERY}/${trackingNumber}` );
};

export const openDeliveryConfirmation = async (trackingNumber) => {

  return await axiosInstance.post( `${API_END_POINTS.OPEN_AND_SAVE_DELIVERY_CONFIRMATION}/${trackingNumber}` );
};

export const saveSignatureApi = async ( trackingNumber,signature) => {

  return await axiosInstance.post( `${API_END_POINTS.SAVE_SIGNATURE_API}/${trackingNumber}`,
    {
      signature
    }
  );
};

export const saveDeliveryImageApi = async (trackingNumber, image) => {
  return await axiosInstance.post( `${API_END_POINTS.SAVE_DELIVERY_IMAGE_API}/${trackingNumber}`,
    {
      image
    }
  );
};