import Swal from "sweetalert2";

const { communication } = require("./communication");


export async function getLocations(setLoader, router, setLocations = []) {
    try {
        setLoader(true);
        const serverResponse = await communication.getLocations();
        if (serverResponse?.data?.status === "SUCCESS") {
            setLocations(serverResponse?.data?.result)
        } else if (serverResponse?.data?.status === "JWT_INVALID") {
            Swal.fire({ text: serverResponse.data.message, icon: "warning" });
            router.push("/");
            setLoader(false);
        } else {
            setLocations([])
        }
        setLoader(false);
    } catch (error) {
        Swal.fire({
            text: error?.response?.data?.message || error.message,
            icon: "warning",
        });
        setLoader(false);
    }
};


export async function getCategory(setLoader, router, setCategory = []) {
    try {
        setLoader(true);
        const serverResponse = await communication.getActiveCategory();
        if (serverResponse?.data?.status === "SUCCESS") {
            setCategory(serverResponse?.data?.category)
        } else if (serverResponse?.data?.status === "JWT_INVALID") {
            Swal.fire({ text: serverResponse.data.message, icon: "warning" });
            router.push("/");
            setLoader(false);
        } else {
            setCategory([])
        }
        setLoader(false);
    } catch (error) {
        Swal.fire({
            text: error?.response?.data?.message || error.message,
            icon: "warning",
        });
        setLoader(false);
    }
};



export async function getBrands(setLoader, router, setBrands = []) {
    try {
        setLoader(true);
        const serverResponse = await communication.getActiveBrand();
        if (serverResponse?.data?.status === "SUCCESS") {
            setBrands(serverResponse?.data?.brand)
        } else if (serverResponse?.data?.status === "JWT_INVALID") {
            Swal.fire({ text: serverResponse.data.message, icon: "warning" });
            router.push("/");
            setLoader(false);
        } else {
            setBrands([])
        }
        setLoader(false);
    } catch (error) {
        Swal.fire({
            text: error?.response?.data?.message || error.message,
            icon: "warning",
        });
        setLoader(false);
    }
};



export async function getLocationWiseBlock(locationId, setLoader, router, setBlocks = []) {
    try {
        // setLoader(true);
        const serverResponse = await communication.getLocationWiseBlock(locationId);
        if (serverResponse?.data?.status === "SUCCESS") {
            setBlocks(serverResponse?.data?.block)
        } else if (serverResponse?.data?.status === "JWT_INVALID") {
            Swal.fire({ text: serverResponse.data.message, icon: "warning" });
            router.push("/");
            setLoader(false);
        } else {
            setBlocks([])
        }
        setLoader(false);
    } catch (error) {
        Swal.fire({
            text: error?.response?.data?.message || error.message,
            icon: "warning",
        });
        setLoader(false);
    }
};





export async function getCategoryWiseParameter(categoryId, setLoader, router, setParameter = []) {
    try {
        setLoader(true);
        const serverResponse = await communication.getCategoryWiseParameter(categoryId);
        if (serverResponse?.data?.status === "SUCCESS") {
            setParameter(serverResponse?.data?.parameter)
        } else if (serverResponse?.data?.status === "JWT_INVALID") {
            Swal.fire({ text: serverResponse.data.message, icon: "warning" });
            router.push("/");
            setLoader(false);
        } else {
            setParameter([])
        }
        setLoader(false);
    } catch (error) {
        Swal.fire({
            text: error?.response?.data?.message || error.message,
            icon: "warning",
        });
        setLoader(false);
    }
};



export async function getParameter(setLoader, router, setParameter = []) {
    try {
        setLoader(true);
        const serverResponse = await communication.getParameters();
        if (serverResponse?.data?.status === "SUCCESS") {
            setParameter(serverResponse?.data?.parameter)
        } else if (serverResponse?.data?.status === "JWT_INVALID") {
            Swal.fire({ text: serverResponse.data.message, icon: "warning" });
            router.push("/");
            setLoader(false);
        } else {
            setParameter([])
        }
        setLoader(false);
    } catch (error) {
        Swal.fire({
            text: error?.response?.data?.message || error.message,
            icon: "warning",
        });
        setLoader(false);
    }
};
export async function getRackPartation(id, setLoader, router, setRackPartation = []) {
    try {
      setLoader(true);
      const serverResponse = await communication.getRackPartation({
        rackId: id,
      });
      if (serverResponse?.data?.status === "SUCCESS") {
        setRackPartation(serverResponse?.data?.filteredPartitions);
      } else if (serverResponse?.data?.status === "JWT_INVALID") {
        Swal.fire({ text: serverResponse.data.message, icon: "warning" });
        router.push("/");
        setLoader(false);
      } else {
        setRackPartation([]);
      }
      setLoader(false);
    } catch (error) {
      Swal.fire({
        text: error?.response?.data?.message || error.message,
        icon: "warning",
      });
      setLoader(false);
    }
  }