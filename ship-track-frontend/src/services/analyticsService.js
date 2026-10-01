import axiosInstance from "../config/axiosInstance";
import { API_END_POINTS } from "../constants/ApiEndPoints";

// ================= GET ADMIN ANALYTICS =================
export const getAdminAnalyticsApi = async () => {
  return await axiosInstance.get( API_END_POINTS.ADMIN_ANALYTICS );
};