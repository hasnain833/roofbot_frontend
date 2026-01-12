import axios from "axios";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"; 

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/**
 * Generic fetch wrapper
 */
export const apiFetch = async (
  endpoint: string,
  options: any = {},
  token?: string
) => {
  try {
    const response = await api.request({
      url: endpoint,
      method: options.method || "GET",
      data: options.body || {},
      params: options.params || {},
      headers: token
        ? { Authorization: `Bearer ${token}` }
        : {}, 
    });
    return response.data;
  } catch (error: any) {
    console.error("apiFetch Error:", error?.response || error);
    throw error?.response?.data || error;
  }
};

/**
 * GET request
 */
export const getRequest = async (endpoint: string, params = {}, token?: string) => {
  try {
    const response = await api.get(endpoint, {
      params,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  } catch (error: any) {
    console.error("GET Error:", error?.response || error);
    throw error?.response?.data || error;
  }
};

/**
 * POST request
 */
export const postRequest = async (endpoint: string, data = {}, token?: string) => {
  try {
    const response = await api.post(endpoint, data, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  } catch (error: any) {
    console.error("POST Error:", error?.response || error);
    throw error?.response?.data || error;
  }
};

/**
 * PUT request
 */
export const putRequest = async (endpoint: string, data = {}, token?: string) => {
  try {
    const response = await api.put(endpoint, data, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  } catch (error: any) {
    console.error("PUT Error:", error?.response || error);
    throw error?.response?.data || error;
  }
};

/**
 * DELETE request
 */
export const deleteRequest = async (endpoint: string, token?: string) => {
  try {
    const response = await api.delete(endpoint, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  } catch (error: any) {
    console.error("DELETE Error:", error?.response || error);
    throw error?.response?.data || error;
  }
};

export default api;
