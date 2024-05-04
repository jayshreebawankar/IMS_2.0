import axios from "axios";
import { getCookie } from "cookies-next";
import Swal from "sweetalert2";
const serverUrl = "https://imsbackend.rsinfotechsys.com";

export const communication = {
  login: async (data) => await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/user/login`, data),

  //?---------Role management----------------------
  createRole: async (data) => {
    try {
      return await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/role/create-role`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("inventryToken")}`,
        },
      });
    } catch (error) {
      throw error;
    }
  },
  getRoleList: async (page = 1, searchString) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/role/get-role-list`,
        { page, searchString },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  deleteRole: async (data) => {
    try {
      return await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/role/delete-role`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("inventryToken")}`,
        },
      });
    } catch (error) {
      throw error;
    }
  },
  getExportRole: () => {
    try {
      return axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/role/download-role-template`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("inventryToken")}`,
        },
        responseType: "blob",
      });
    } catch (error) {
      Swal.fire({ text: error.message, icon: "warning" });
    }
  },
  importExcelRoleData: (formData) => {
    try {
      return axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/role/import-role`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${getCookie("inventryToken")}`,
        },
        // responseType: "blob",
      });
    } catch (error) {
      Swal.fire({ text: error.message, icon: "error" });
    }
  },
  getRoleById: async (data) => {
    try {
      return await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/role/get-role-by-id`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("inventryToken")}`,
        },
      });
    } catch (error) {
      throw error;
    }
  },
  updateRole: async (data) => {
    try {
      return await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/role/update-role`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("inventryToken")}`,
        },
      });
    } catch (error) {
      throw error;
    }
  },
  getActiveRole: async () => {
    try {
      return await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/role/get-active-role`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("inventryToken")}`,
        },
      });
    } catch (error) {
      throw error;
    }
  },
  // ------------------------------location------------------------
  createLocation: async (data) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/location/create-location`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  getLocation: async () => {
    try {
      return await axios.get(
        // " https://imsbackend.rsinfotechsys.com/location/get-all-location",
        `${process.env.NEXT_PUBLIC_SERVER_URL}/location/get-all-location`,

        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  getLocationList: async (page = 1, searchString) => {
    try {
      return await axios.post(
        // " https://imsbackend.rsinfotechsys.com/location/get-all-location",
        `${process.env.NEXT_PUBLIC_SERVER_URL}/location/get-location-list`,
        { page, searchString },

        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  getLocationById: async (data) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/location/get-location-by-id`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  updateLocationById: async (data) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/location/update-location`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  changeLocationStatus: async (data) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/location/change-location-status`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  //---------User management----------------------
  createUser: async (data) => {
    try {
      return await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/user/create-user`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("inventryToken")}`,
        },
      });
    } catch (error) {
      throw error;
    }
  },
  getUserList: async (page = 1, searchString) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/user/get-user-list`,
        { page, searchString },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  getExportUser: () => {
    try {
      return axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/user/download-user-template`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("inventryToken")}`,
        },
        responseType: "blob",
      });
    } catch (error) {
      Swal.fire({ text: error.message, icon: "warning" });
    }
  },
  importExcelUserData: (formData) => {
    try {
      return axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/user/import-users`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${getCookie("inventryToken")}`,
        },
        // responseType: "blob",
      });
    } catch (error) {
      Swal.fire({ text: error.message, icon: "error" });
    }
  },
  deleteUser: async (data) => {
    try {
      return await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/user/delete-user`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("inventryToken")}`,
        },
      });
    } catch (error) {
      throw error;
    }
  },
  getUserById: async (userId) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/user/get-user-by-id`,
        { userId },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  updateUser: async (data) => {
    try {
      return await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/user/update-user`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("inventryToken")}`,
        },
      });
    } catch (error) {
      throw error;
    }
  },
  changeUserStatus: async (data) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/user/change-user-change`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  //-----------Category--------------------
  createCategory: async (data) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/category/create-category`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  getAllCategory: async (page = 1, searchString) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/category/get-all-category`,
        { page, searchString },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  getExportCategory: () => {
    try {
      return axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/category/download-category-template`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
          responseType: "blob",
        }
      );
    } catch (error) {
      Swal.fire({ text: error.message, icon: "warning" });
    }
  },
  importExcelCategoryData: (formData) => {
    try {
      return axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/category/import-category`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
          // responseType: "blob",
        }
      );
    } catch (error) {
      Swal.fire({ text: error.message, icon: "error" });
    }
  },
  deleteCategory: async (data) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/category/delete-category`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  getCategoryById: async (data) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/category/get-category-by-id`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  updateCategory: async (data) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/category/update-category`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  // ------------------------Brand-----------------
  createBrand: async (data) => {
    try {
      return await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/brand/create-brand`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("inventryToken")}`,
        },
      });
    } catch (error) {
      throw error;
    }
  },

  getAllBrand: async (page = 1, searchString) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/brand/get-all-brand`,
        { page, searchString },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  getExportBrand: () => {
    try {
      return axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/brand/download-brand-template`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("inventryToken")}`,
        },
        responseType: "blob",
      });
    } catch (error) {
      Swal.fire({ text: error.message, icon: "warning" });
    }
  },
  importExcelBrandData: (formData) => {
    try {
      return axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/brand/import-brand`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${getCookie("inventryToken")}`,
        },
        // responseType: "blob",
      });
    } catch (error) {
      Swal.fire({ text: error.message, icon: "error" });
    }
  },
  deleteBrand: async (data) => {
    try {
      return await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/brand/delete-brand`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("inventryToken")}`,
        },
      });
    } catch (error) {
      throw error;
    }
  },
  getBrandById: async (data) => {
    try {
      return await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/brand/get-brand-by-id`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("inventryToken")}`,
        },
      });
    } catch (error) {
      throw error;
    }
  },
  updateBrand: async (data) => {
    try {
      return await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/brand/update-brand`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("inventryToken")}`,
        },
      });
    } catch (error) {
      throw error;
    }
  },
  //---------------Parameter----------------------
  createParameter: async (data) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/parameter/create-parameter`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  getAllParameter: async (page = 1, searchString) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/parameter/get-all-parameter`,
        { page, searchString },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  getExportParameter: () => {
    try {
      return axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/parameter/download-parameter-template`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
          responseType: "blob",
        }
      );
    } catch (error) {
      Swal.fire({ text: error.message, icon: "warning" });
    }
  },
  importExcelParameterData: (formData) => {
    try {
      return axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/parameter/import-parameter`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
          // responseType: "blob",
        }
      );
    } catch (error) {
      Swal.fire({ text: error.message, icon: "error" });
    }
  },
  deleteParameter: async (data) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/parameter/delete-parameter`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  getParameterById: async (data) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/parameter/get-parameter-by-id`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  updateParameter: async (data) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/parameter/update-parameter`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  //---------------------------Rack------------------------
  createRack: async (data) => {
    try {
      return await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/rack/create-rack`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("inventryToken")}`,
        },
      });
    } catch (error) {
      throw error;
    }
  },
  getRackList: async (page = 1, searchString = "") => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/rack/get-rack-list`,
        { page, searchString },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  getActiveRack: async () => {
    try {
      return await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/rack/get-active-rack`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("inventryToken")}`,
        },
      });
    } catch (error) {
      throw error;
    }
  },
  getExportRack: () => {
    try {
      return axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/rack/download-rack-template`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("inventryToken")}`,
        },
        responseType: "blob",
      });
    } catch (error) {
      Swal.fire({ text: error.message, icon: "warning" });
    }
  },
  importExcelRackData: (formData) => {
    try {
      return axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/rack/import-rack-data`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${getCookie("inventryToken")}`,
        },
        // responseType: "blob",
      });
    } catch (error) {
      Swal.fire({ text: error.message, icon: "error" });
    }
  },
  getRackById: async (data) => {
    try {
      return await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/rack/get-rack-by-id`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("inventryToken")}`,
        },
      });
    } catch (error) {
      throw error;
    }
  },
  changeRackStatus: async (data) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/rack/change-rack-status`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  updateRackDetails: async (data) => {
    try {
      return await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/rack/update-rack`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("inventryToken")}`,
        },
      });
    } catch (error) {
      throw error;
    }
  },
  deleteRack: async (data) => {
    try {
      return await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/rack/delete-rack`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("inventryToken")}`,
        },
      });
    } catch (error) {
      throw error;
    }
  },
  // ------------------Block-------------------
  createBlock: async (data) => {
    try {
      return await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/block/create-block`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("inventryToken")}`,
        },
      });
    } catch (error) {
      throw error;
    }
  },
  getBlockList: async (page = 1, searchString = "") => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/block/get-all-block`,
        { page, searchString },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  getExportBlock: () => {
    try {
      return axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/block/download-block-template`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("inventryToken")}`,
        },
        responseType: "blob",
      });
    } catch (error) {
      Swal.fire({ text: error.message, icon: "warning" });
    }
  },
  importExcelBlockData: (formData) => {
    try {
      return axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/block/import-block`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${getCookie("inventryToken")}`,
        },
        // responseType: "blob",
      });
    } catch (error) {
      Swal.fire({ text: error.message, icon: "error" });
    }
  },
  deleteBlock: async (data) => {
    try {
      return await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/block/delete-block`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("inventryToken")}`,
        },
      });
    } catch (error) {
      throw error;
    }
  },
  getBlockById: async (data) => {
    try {
      return await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/block/get-block-by-id`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("inventryToken")}`,
        },
      });
    } catch (error) {
      throw error;
    }
  },
  updateBlock: async (data) => {
    try {
      return await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/block/update-block`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("inventryToken")}`,
        },
      });
    } catch (error) {
      throw error;
    }
  },
  changeBlockStatus: async (data) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/block/change-block-status`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  //?--------------------------Inventory-----------------------
  getStockList: async (page = 1, searchString) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/inventory/get-stock-list`,
        { page, searchString },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  stockIn: async (dataToSend) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/inventory/stock-in`,
        dataToSend,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  updateStock: async (dataToSend) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/inventory/update-stock`,
        dataToSend,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  getLocations: async () => {
    try {
      return await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/location/get-all-location`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("inventryToken")}`,
        },
      });
    } catch (error) {
      throw error;
    }
  },
  getActiveCategory: async () => {
    try {
      return await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/category/get-active-category`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("inventryToken")}`,
        },
      });
    } catch (error) {
      throw error;
    }
  },
  getActiveBrand: async () => {
    try {
      return await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/brand/get-active-brand`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("inventryToken")}`,
        },
      });
    } catch (error) {
      throw error;
    }
  },
  getLocationWiseBlock: async (locationId) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/block/get-location-wise-block`,
        { locationId },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  getCategoryWiseParameter: async (categoryId) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/parameter/get-category-wise-parameter`,
        { categoryId },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  getParameters: async () => {
    try {
      return await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/parameter/get-parameters`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("inventryToken")}`,
        },
      });
    } catch (error) {
      throw error;
    }
  },
  getStockById: async (stockId) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/inventory/get-stock-by-id`,
        { stockId },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  changeStockStatus: async (data) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/inventory/change-stock-status`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  getExportStock: () => {
    try {
      return axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/inventory/download-stock-template`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("inventryToken")}`,
        },
        responseType: "blob",
      });
    } catch (error) {
      Swal.fire({ text: error.message, icon: "warning" });
    }
  },

  getRackPartation: async (data) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/inventory/get-rack-partition`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  // ------------------material-------------------
  getMaterialList: async (data) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/material/get-material-list`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  getCategoryWiseParameter: async (data) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/material/get-category-wise-parameter-for-material`,
        data,

        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  getTechnicianList: async () => {
    try {
      return await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/material/get-technician`,

        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  AssignMaterial: async (data) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/material/assigned-material`,
        data,

        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  // Daily Task
  fetchAssignMaterial: async (data) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/material/fetched-assigned-material-list`,
        data,

        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },

  getMaterialById: async (data) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/material/get-material-by-id`,
        data,

        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },

  returnMaterial: async (data) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/material/return-material`,
        data,

        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },

  //Stock list
  fetchReturnMaterialList: async (data) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/material/fetched-return-material-list`,
        data,

        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  changeMaterialStatus: async (data) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/material/change-material-status`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  enterPriceForMaterial: async (data) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/material/enter-price-for-material`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },

  fetchGarbageData: async (data) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/material/fetch-garbage-data`,
        data,

        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  //Stock Management
  acceptRejectMaterial: async (data) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/material/accept-or-reject-material`,
        data,

        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  getStatusWiseMaterialList: async (data) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/material/get-status-wise-material-list`,
        data,

        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  //Notification
  getAllNotification: async (data) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/notification/get-all-notification`,
        data,

        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  getNotificationCount: async (data) => {
    try {
      return await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/notification/get-notification-count`,

        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  deleteNotification: async (data) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/notification/delete-notification`,
        data,

        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  deleteSelectedNotification: async (data) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/notification/delete-selected-notification`,
        data,

        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  deleteAllNotification: async (data) => {
    try {
      return await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/notification/delete-all-notification`,
        data,

        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
  monthlySoldOutMaterial: async (data) => {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/material/monthly-sold-out-material`,
        data,

        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("inventryToken")}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  },
};
export function getServerUrl() {
  return serverUrl;
}
