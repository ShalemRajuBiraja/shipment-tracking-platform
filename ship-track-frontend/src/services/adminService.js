import axiosInstance from "../config/axiosInstance";

import { API_END_POINTS } from "../constants/ApiEndPoints";


export const getAdminDashboardStatsApi = async () => {

  return await axiosInstance.get( API_END_POINTS.ADMIN_DASHBOARD_STATS);

}

export const getAdminShipmentsApi = async () => {

  return await axiosInstance.get( API_END_POINTS.GET_ADMIN_SHIPMENTS );  

}

export const deleteShipmentApi = async (id) => {

  return await axiosInstance.delete( `${API_END_POINTS.DELETE_SHIPMENT}/${id}` );

}

export const adminDeleteUserApi = async (id) => {

  return await axiosInstance.delete( `${API_END_POINTS.ADMIN_USER_DELETE}/${id}` );

}
export const getUsersApi = async () => {
  return await axiosInstance.get( API_END_POINTS.GET_USERS );
};

export const adminUpdateProfileApi = async (profileData) => {
  return await axiosInstance.put( API_END_POINTS.UPDATE_ADMIN_PROFILE, profileData );
};

export const updateAdminPasswordApi = async (currentPassword, newPassword) => {
  return await axiosInstance.put( API_END_POINTS.UPDATE_ADMIN_PASSWORD, { currentPassword, newPassword } );
};

export const downloadAdminAnalyticsReportApi = async () => {
  return await axiosInstance.get(
    API_END_POINTS.ADMIN_ANALYTICS_REPORT,
    {
      responseType: "blob",
    }
  );
};