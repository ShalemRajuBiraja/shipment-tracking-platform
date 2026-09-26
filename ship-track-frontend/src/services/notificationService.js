import axiosInstance from "../config/axiosInstance";
import { API_END_POINTS } from "../constants/ApiEndPoints";

export const getMyNotifications = async () => {

    return await axiosInstance.get( API_END_POINTS.GET_MY_NOTIFICATIONS  );
};

export const getUnreadNotifications = async () => {

    return await axiosInstance.get(  API_END_POINTS.GET_UNREAD_NOTIFICATIONS );
};

export const markNotificationAsRead = async (notificationId) => {
      return await axiosInstance.put( `${API_END_POINTS.UPDATE_NOTIFICATION}/${notificationId}/read`);
};