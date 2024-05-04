"use client";
import Image from "next/image";
import { useForm } from "react-hook-form";
import saveIcon from "../../../../../public/images/rolecreate/saveicon.png";
import search from "../../../../../public/images/rolecreate/search.png";
import importicon from "../../../../../public/images/rolecreate/import.png";
import exporticon from "../../../../../public/images/rolecreate/export.png";
import deleteicon from "../../../../../public/images/rolecreate/delete.png";
import edit from "../../../../../public/images/rolecreate/edit.png";
import React, { useEffect, useRef, useState } from "react";
import Loader from "@/reusable/Loader";
import Pagination from "@/reusable/Pagination";
import Swal from "sweetalert2";
import { communication } from "@/apis/communication";
import { useRouter } from "next/navigation";
import {
  getBrands,
  getCategory,
  getCategoryWiseParameter,
  getLocationWiseBlock,
  getLocations,
  getParameter,
  getRackPartation,
} from "@/apis/comman-apis";
import { stockStatus } from "@/utils/helper/stock-status-array";
import FileSaver from "file-saver";
const pageLimit = process.env.NEXT_PUBLIC_LIMIT ?? 20;

export default function StockIn() {
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [timeoutId, setTimeoutId] = useState();

  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [selectedCheckboxes, setSelectedCheckboxes] = useState([]);

  const [searchString, setSearchString] = useState("");
  const [stock, setStock] = useState([]);
  const [rackPartation, setRackPartation] = useState([]);
  const [loader, setLoader] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [isPageUpdated, setIsPageUpdated] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [page, setPage] = useState(1);

  const [locations, setLocations] = useState([]);
  const [category, setCategory] = useState([]);
  const [brands, setBrands] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [parameter, setParameter] = useState([]);
  const [racks, setRacks] = useState([]);

  const [checkedStatus, setCheckedStatus] = useState({});

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
    getValues,
    setValue,
  } = useForm({
    defaultValues: {
      quantity: 1,
      parameterId: "",
      parameter: {},
    },
  });
  const location = watch("locationId");
  const categoryId = watch("categoryId");
  const rack = watch("blockId");
  const _rackIdForPrtn = watch("rackId");

  const handleCheckboxChange = (e) => {
    const checkboxId = e.target.id;

    setSelectedCheckboxes((prevSelected) => {
      if (prevSelected.includes(checkboxId)) {
        return prevSelected.filter((id) => id !== checkboxId);
      } else {
        return [...prevSelected, checkboxId];
      }
    });
  };

  const handleSelectAllChange = (e) => {
    setSelectAllChecked(e.target.checked);

    setSelectedCheckboxes((prevSelected) =>
      e.target.checked ? stock.map((stockDetails) => stockDetails._id) : []
    );
  };

  const onSubmit = async (values) => {
    try {
      setLoader(true);
      let response = await communication.stockIn(values);
      if (response?.data?.status === "SUCCESS") {
        Swal.fire({ text: response.data.message, icon: "success" });
        reset();
        await getStockList(currentPage, searchString);
      } else if (response?.data?.status === "JWT_INVALID") {
        Swal.fire({ text: response.data.message, icon: "warning" });
        router.push("/");
      } else {
        Swal.fire({ text: response.data.message, icon: "warning" });
      }
    } catch (error) {
      Swal.fire({ text: error.message, icon: "warning" });
    } finally {
      setLoader(false);
    }
  };

  async function getStockList(page, searchString, isSearch = false) {
    try {
      setLoader(true);
      const serverResponse = await communication.getStockList(
        page,
        searchString
      );
      if (serverResponse?.data?.status === "SUCCESS") {
        setStock(serverResponse?.data.stock);
        setPageCount(serverResponse?.data?.totalPages);
        setPage(page);
        if (isSearch) {
          setCurrentPage(1);
        }
        const initialCheckedStatus = {};

        serverResponse?.data.stock.forEach((user) => {
          initialCheckedStatus[user._id] = user.isActive || false;
        });
        setCheckedStatus(initialCheckedStatus);
      } else if (serverResponse?.data?.status === "JWT_INVALID") {
        Swal.fire({ text: serverResponse.data.message, icon: "warning" });
        router.push("/");
        setLoader(false);
      } else {
        setStock([]);
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
  const getExportStock = async () => {
    try {
      Swal.fire({
        text: "Are you sure you want to Export the Data?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#5149E4",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes",
        cancelButtonText: "No",
        reverseButtons: true,
      }).then(async function (result) {
        if (result.isConfirmed) {
          const serverResponse = await communication.getExportStock();
          if (serverResponse?.data) {
            const file = new Blob([serverResponse.data], {
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            FileSaver.saveAs(file, "stock.xlsx");
          } else {
            Swal.fire({
              text: "Failed to export data in excel",
              icon: "warning",
            });
          }
        } else {
          return;
        }
      });
    } catch (error) {}
  };
  const handleFileChange = (event) => {
    alert("Under Maintainance");
    return;

    const selectedFile = event.target.files[0];
    console.log("Selected file:", selectedFile);

    Swal.fire({
      text: "Are you sure you want to import the file?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#5149E4",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      reverseButtons: true,
    }).then(async function (result) {
      if (result.isConfirmed) {
        importData(selectedFile);
      } else {
        return;
      }
    });
  };
  const importData = async (selectedFile) => {
    try {
      const formData = new FormData();
      formData.append("users", selectedFile);
      const serverResponse = await communication.importExcelStockData(formData);
      if (serverResponse?.data?.status === "SUCCESS") {
        Swal.fire({ text: serverResponse?.data?.message, icon: "success" });
      } else if (serverResponse?.data?.status === "JWT_INVALID") {
        Swal.fire({ text: serverResponse?.data?.message, icon: "warning" });
        router.push("/");
      } else {
        Swal.fire({ text: serverResponse?.data?.message, icon: "warning" });
      }
    } catch (error) {
      Swal.fire({
        text: error?.response?.data?.message || error?.message,
        icon: "error",
      });
    }
  };
  async function changeStockStatus(e, stockId) {
    try {
      setLoader(true);

      let response = await communication.changeStockStatus({
        stockId: stockId,
      });
      if (response?.data?.status === "SUCCESS") {
        Swal.fire({ text: response.data.message, icon: "success" });
        setCheckedStatus((prevStatus) => ({
          ...prevStatus,
          [stockId]: true,
        }));
        getStockList(currentPage, searchString);
      } else if (response?.data?.status === "JWT_INVALID") {
        Swal.fire({ text: response.data.message, icon: "warning" });
        router.push("/");
      } else {
        Swal.fire({ text: response.data.message, icon: "warning" });
      }
    } catch (error) {
      Swal.fire({ text: error.message, icon: "warning" });
    } finally {
      setLoader(false);
    }
  }
  const deleteStock = async () => {
    try {
      setLoader(true);
      let payload = {
        userIds: [...selectedCheckboxes],
      };
      let response = await communication.deleteStock(payload);
      if (response?.data?.status === "SUCCESS") {
        Swal.fire({ text: response.data.message, icon: "success" });
        await getStockList(currentPage, searchString);
      } else if (response?.data?.status === "JWT_INVALID") {
        Swal.fire({ text: response.data.message, icon: "warning" });
        router.push("/");
      } else {
        Swal.fire({ text: response.data.message, icon: "warning" });
      }
    } catch (error) {
      Swal.fire({ text: error.message, icon: "warning" });
    } finally {
      setLoader(false);
    }
  };
  const handleSearch = (e) => {
    setSearchString(e.target.value);
    let isSearch = true;
    clearTimeout(timeoutId);
    let _timeOutId = setTimeout(() => {
      getStockList(currentPage, e.target.value, isSearch);
    }, 2000);
    setTimeoutId(_timeOutId);
  };
  useEffect(() => {
    getStockList(currentPage, searchString);
  }, [isPageUpdated]);

  useEffect(() => {
    const id = getValues("locationId");
    if (id) {
      getLocationWiseBlock(id, setLoader, router, setBlocks);
    }
  }, [location]);

  useEffect(() => {
    const id = getValues("blockId");
    if (id) {
      const rackDetails = blocks.find((ele) => ele._id === id);
      setRacks(rackDetails?.rackId ?? []);
    } else {
      setRacks([]);
    }
  }, [rack]);

  useEffect(() => {
    const id = getValues("categoryId");
    if (id) {
      const parameterDetails = category.find((ele) => ele.categoryId === id);
      setValue("parameterId", parameterDetails._id);
      setParameter(parameterDetails.parameter ?? []);
    } else {
      setParameter([]);
      setValue("parameterId", "");
    }
  }, [categoryId]);
  useEffect(() => {
    const id = getValues("rackId");
    // console.log(id, "RRR");
    if (id) {
      getRackPartation(id, setLoader, router, setRackPartation);
    } else {
      setRackPartation([]);
    }
  }, [_rackIdForPrtn]);
  useEffect(() => {
    getLocations(setLoader, router, setLocations);
    getParameter(setLoader, router, setCategory);
    getBrands(setLoader, router, setBrands);
  }, []);
  return (
    <>
      {loader ? (
        <Loader />
      ) : (
        <>
          <div className="form_view ">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="form_title">
                <h5>Stock In</h5>
              </div>
              <div className="stock_row row m-0 mt-3 mb-3 ps-5">
                <div className="stock_input col-lg-1 col-md-1  d-flex align-items-center">
                  <h6>Select Location</h6>
                </div>
                <div className="col-lg-2 col-md-2 mb-3">
                  <select
                    {...register("locationId", {
                      required: "Location is required",
                    })}
                    className="selectBox text-capitalize"
                    style={{ width: "100%" }}
                  >
                    <option value="">Select location</option>
                    {locations.map((ele, index) => {
                      return (
                        <option value={ele._id} key={index}>
                          {" "}
                          {ele.name}
                        </option>
                      );
                    })}
                  </select>
                  <div style={{ height: "5px" }}>
                    {errors.locationId && (
                      <p
                        className="text-danger text-start"
                        style={{ fontSize: "0.7rem" }}
                      >
                        {errors.locationId.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="stock_input col-lg-1 col-md-1  d-flex align-items-center">
                  <h6>Select Block</h6>
                </div>
                <div className="col-lg-2 col-md-2 mb-3">
                  <select
                    {...register("blockId", {
                      required: "Block is required",
                    })}
                    className="selectBox"
                    style={{ width: "100%" }}
                  >
                    <option value="">Select Block</option>
                    {blocks.map((ele, index) => {
                      return (
                        <option value={ele._id} key={index}>
                          {" "}
                          {ele.blockNo}
                        </option>
                      );
                    })}
                  </select>
                  <div style={{ height: "5px" }}>
                    {errors.blockId && (
                      <p
                        className="text-danger text-start"
                        style={{ fontSize: "0.7rem" }}
                      >
                        {errors.blockId.message}
                      </p>
                    )}
                  </div>
                </div>
                {racks.length >= 1 && (
                  <>
                    <div className="stock_input col-lg-1  col-md-1 mb-3 d-flex align-items-center">
                      <h6>Select Rack</h6>
                    </div>
                    <div className="col-lg-2 col-md-2 mb-3">
                      <select
                        {...register("rackId", {
                          required: "Rack is required",
                        })}
                        className="selectBox"
                        style={{ width: "100%" }}
                      >
                        <option value="">Select Rack</option>
                        {racks.map((ele, index) => {
                          return (
                            <option value={ele._id} key={index}>
                              {" "}
                              {ele.rackNo}
                            </option>
                          );
                        })}
                      </select>
                      <div style={{ height: "5px" }}>
                        {errors.rackId && (
                          <p
                            className="text-danger text-start"
                            style={{ fontSize: "0.7rem" }}
                          >
                            {errors.rackId.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                )}
                {rackPartation.length > 1 && (
                  <>
                    <div className="stock_input col-lg-1 col-md-1  d-flex align-items-center">
                      <h6>Select Partation</h6>
                    </div>
                    <div className="col-lg-2 col-md-2 mb-3">
                      <select
                        {...register("partitionName", {
                          required: "Partation is required",
                        })}
                        className="selectBox"
                        style={{ width: "100%" }}
                      >
                        <option value="">Select Partation</option>
                        {rackPartation?.map((ele, index) => {
                          return (
                            <option value={ele.partitionName} key={index}>
                              {" "}
                              {ele.partitionName}
                            </option>
                          );
                        })}
                      </select>
                      <div style={{ height: "5px" }}>
                        {errors.partitionName && (
                          <p
                            className="text-danger text-start"
                            style={{ fontSize: "0.7rem" }}
                          >
                            {errors.partitionName.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                )}
                {/* <div className="stock_input col-lg-1 col-md-1  d-flex align-items-center">
                  <h6>Category</h6>
                </div>
                <div className="stock_input col-lg-2 col-md-2">
                  <select
                    {...register("categoryId", {
                      required: "Category is required",
                    })}
                    className="selectBox text-capitalize"
                    style={{ width: "100%" }}
                  >
                    <option value="">Select Category</option>
                    {category.map((ele, index) => {
                      return (
                        <option value={ele.categoryId} key={index}>
                          {" "}
                          {ele.name}
                        </option>
                      );
                    })}
                  </select>
                  <div style={{ height: "5px" }}>
                    {errors.categoryId && (
                      <p
                        className="text-danger text-start"
                        style={{ fontSize: "0.7rem" }}
                      >
                        {errors.categoryId.message}
                      </p>
                    )}
                  </div>
                </div> */}

                <div className="stock_input col-lg-1 col-md-1 mb-3 d-flex align-items-center">
                  <h6>Category</h6>
                </div>
                <div className="stock_input col-lg-2 col-md-2 mb-3">
                  <select
                    {...register("categoryId", {
                      required: "Category is required",
                    })}
                    className="selectBox text-capitalize"
                    style={{ width: "100%" }}
                  >
                    <option value="">Select Category</option>
                    {category.map((ele, index) => {
                      return (
                        <option value={ele.categoryId} key={index}>
                          {" "}
                          {ele.name}
                        </option>
                      );
                    })}
                  </select>
                  <div style={{ height: "5px" }}>
                    {errors.categoryId && (
                      <p
                        className="text-danger text-start"
                        style={{ fontSize: "0.7rem" }}
                      >
                        {errors.categoryId.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="stock_input col-lg-1 col-md-1 mb-3  d-flex align-items-center">
                  <h6>Brand/Make</h6>
                </div>
                <div className="col-lg-2 col-md-2 mb-3">
                  <select
                    {...register("brandId", {
                      required: "Brand is required",
                    })}
                    className="selectBox text-capitalize"
                    style={{ width: "100%" }}
                  >
                    <option value="">Select Brand</option>
                    {brands.map((ele, index) => {
                      return (
                        <option value={ele._id} key={index}>
                          {" "}
                          {ele.name}
                        </option>
                      );
                    })}
                  </select>
                  <div style={{ height: "5px" }}>
                    {errors.brandId && (
                      <p
                        className="text-danger text-start"
                        style={{ fontSize: "0.7rem" }}
                      >
                        {errors.brandId.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="stock_input col-lg-1 col-md-1  d-flex align-items-center">
                  <h6>Condition Type</h6>
                </div>
                <div className="col-lg-2 col-md-2 mb-3">
                  <select
                    {...register("conditionType", {
                      required: "condition is required",
                    })}
                    className="selectBox text-capitalize"
                    style={{ width: "100%" }}
                  >
                    <option value="">Select Condition</option>
                    <option value="new">New</option>
                    <option value="refurbished">Refurbished</option>
                  </select>
                  <div style={{ height: "5px" }}>
                    {errors.conditionType && (
                      <p
                        className="text-danger text-start"
                        style={{ fontSize: "0.7rem" }}
                      >
                        {errors.conditionType.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="stock_input col-lg-1 col-md-1 mb-3 d-flex align-items-center">
                  <h6>Status</h6>
                </div>
                <div className="col-lg-2 col-md-2 mb-3">
                  <select
                    {...register("status", {
                      required: "Status is required",
                    })}
                    className="selectBox text-capitalize"
                    style={{ width: "100%" }}
                  >
                    <option value="">Select Status</option>
                    {stockStatus.map((ele, index) => {
                      return (
                        <option value={ele} key={index}>
                          {" "}
                          {ele}
                        </option>
                      );
                    })}
                  </select>
                  <div style={{ height: "5px" }}>
                    {errors.status && (
                      <p
                        className="text-danger text-start"
                        style={{ fontSize: "0.7rem" }}
                      >
                        {errors.status.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="stock_input col-lg-1 col-md-1 mb-3  d-flex align-items-center">
                  <h6 className="me-1">Serial No</h6>
                  <input
                    type="checkbox"
                    style={{ width: "13px", backgroundColor: "#B9B9B9" }}
                  />
                </div>
                <div className="col-lg-2 col-md-2 mb-3">
                  <input
                    type="text"
                    {...register("serialNo", {
                      required: "SerialNo is required",
                    })}
                    className="inputBox"
                    style={{ width: "100%", height: "31px" }}
                  />
                  <div style={{ height: "5px" }}>
                    {errors.serialNo && (
                      <p
                        className="text-danger text-start"
                        style={{ fontSize: "0.7rem" }}
                      >
                        {errors.serialNo.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="stock_input col-lg-1 col-md-1 mb-3 d-flex align-items-center">
                  <h6>Quantity</h6>
                </div>
                <div className="col-lg-2 col-md-2 mb-3">
                  <input
                    type="text"
                    {...register("quantity", {
                      required: "Quantity is required",
                    })}
                    className="inputBox"
                    style={{ width: "100%", height: "31px" }}
                  />
                  <div style={{ height: "5px" }}>
                    {errors.quantity && (
                      <p
                        className="text-danger text-start"
                        style={{ fontSize: "0.7rem" }}
                      >
                        {errors.quantity.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="stock_input col-lg-1 col-md-1  d-flex align-items-center">
                  <h6>Model Name</h6>
                </div>
                <div className="col-lg-2 col-md-2 mb-3">
                  <input
                    type="text"
                    {...register("modelName", {
                      required: "Model Name is required",
                    })}
                    className="inputBox"
                    style={{ width: "100%", height: "31px" }}
                  />
                  <div style={{ height: "5px" }}>
                    {errors.modelName && (
                      <p
                        className="text-danger text-start"
                        style={{ fontSize: "0.7rem" }}
                      >
                        {errors.modelName.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="stock_input col-lg-1 col-md-1 mb-3 d-flex align-items-center">
                  <h6>Item Code</h6>
                </div>
                <div className="col-lg-2 col-md-2 mb-3">
                  <input
                    type="text"
                    {...register("itemCode", {
                      required: "Item code is required",
                    })}
                    className="inputBox"
                    style={{ width: "100%", height: "31px" }}
                  />

                  <div style={{ height: "5px" }}>
                    {errors.itemCode && (
                      <p
                        className="text-danger text-start"
                        style={{ fontSize: "0.7rem" }}
                      >
                        {errors.itemCode.message}
                      </p>
                    )}
                  </div>
                </div>

                {parameter?.map((item, index) => (
                  <React.Fragment key={index}>
                    <div className="col-lg-1 col-md-1 mb-3 d-flex align-items-center">
                      <h6>{item}</h6>
                    </div>
                    <div className="col-lg-2 col-md-2 mb-3 d-flex align-items-center">
                      <input
                        type="text"
                        {...register(`parameter[${item}]`)}
                        className="inputBox"
                        style={{ width: "100%", height: "31px" }}
                      />
                      <div style={{ height: "5px" }}>
                        {/* {errors.mobile && (
                          <p className="text-danger text-start" style={{ fontSize: "0.7rem" }}>
                            {errors.mobile.message}
                          </p>
                        )} */}
                      </div>
                    </div>
                  </React.Fragment>
                ))}
              </div>
              <div className="stock_row row m-0 mt-3 mb-3 ps-5">
                <div className="col-lg-1 col-md-1  d-flex align-items-center"></div>
                <div className="col-lg-2 col-md-3">
                  <button className="savebtn mb-1" type="submit">
                    <Image src={saveIcon} alt="saveIcon"></Image>Save
                  </button>
                </div>
              </div>
            </form>
          </div>
          <div className="table_view">
            <div className="d-flex justify-content-between pt-3 pb-3">
              <div className="border border-3 border-solid border-color-#bababa ps-1 d-flex align-items-center">
                <Image src={search} alt="serchIcon"></Image>
                <input
                  type="text"
                  value={searchString}
                  onChange={handleSearch}
                  placeholder="search"
                  style={{
                    background: "#f5f5f5",
                    height: "100%",
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                  className="ps-2"
                />
                {/* <button className="savebtn mb-1" onClick={() => getRoleList(1, searchString)}>Search</button> */}
              </div>
              <div className="d-flex gap-2" style={{ fontSize: "10px" }}>
                {/* <div>
                  <input
                    type="file"
                    name="file"
                    onChange={handleFileChange}
                    id="file"
                    style={{ display: "none" }}
                    ref={fileInputRef}
                  />
                  <label htmlFor="file" className="savebtn mb-1 cursor-pointer">
                    <Image alt="" src={importicon}></Image>
                    Import
                  </label>
                </div> */}
                {/* <button
                  onClick={getExportStock}
                  className="savebtn mb-1"
                  type="button"
                >
                  <Image alt="" src={exporticon}></Image>Export Template
                </button> */}
                <button
                  onClick={() => alert("Under Maintainance")}
                  className="savebtn mb-1"
                  type="submit"
                >
                  <Image alt="" src={deleteicon}></Image>Delete
                </button>
              </div>
            </div>
            <div className="table_wrapper">
              <div className="table_main">
                <div className="table_container_parameter">
                  <div className="table_header">
                    <div className="checkbox_wrapper">
                      <input
                        type="checkbox"
                        id="selectAllCheckbox"
                        onChange={(e) => handleSelectAllChange(e)}
                        checked={selectAllChecked}
                      />
                    </div>
                    <div className="edit">
                      <h5>Edit</h5>
                    </div>
                    <div className="on_off_switch">
                      <h5>Off/On</h5>
                    </div>
                    <div className="sr_no">
                      <h5>Sr. No.</h5>
                    </div>
                    <div className="item_code">
                      <h5>Location</h5>
                    </div>
                    <div className="item_code">
                      <h5>Item Code</h5>
                    </div>
                    <div className="block_in_stock">
                      <h5>Block</h5>
                    </div>
                    <div className="rack_in_stock">
                      <h5>Rack</h5>
                    </div>
                    <div className="serial_stock">
                      <h5>Serial No.</h5>
                    </div>
                    <div className="category_stock">
                      <h5>Category</h5>
                    </div>
                    <div className="condition_type">
                      <h5>Condition Type</h5>
                    </div>
                    <div className="condition_type">
                      <h5>Status</h5>
                    </div>
                    <div className="brand_make">
                      <h5>Brand/Make</h5>
                    </div>
                  </div>
                  <div
                    className="table_data_wrapper"
                    style={{ height: "32dvh" }}
                  >
                    {stock?.length > 0 ? (
                      <>
                        {stock?.map((stockDetails, index) => (
                          <div className="table_data" key={index}>
                            <div className="checkbox_wrapper">
                              <input
                                type="checkbox"
                                id={stockDetails._id}
                                onChange={(e) => handleCheckboxChange(e)}
                                checked={selectedCheckboxes.includes(
                                  stockDetails._id
                                )}
                                disabled={!stockDetails.isActive}
                                className={`${
                                  stockDetails.isActive
                                    ? "cursor-pointer"
                                    : "cursor-not-allowed"
                                }`}
                              />
                            </div>
                            <div className="edit">
                              <Image
                                title="Update"
                                className={`${
                                  stockDetails.isActive
                                    ? "cursor-pointer"
                                    : "cursor-not-allowed"
                                }`}
                                onClick={() => {
                                  if (stockDetails.isActive) {
                                    router.push(
                                      `/admin/dashboard/stock/update-stock?stockId=${stockDetails._id}`
                                    );
                                  }
                                }}
                                src={edit}
                                alt="edit-icon"
                              />
                            </div>
                            <div className="on_off_switch">
                              <div className="form-check form-switch">
                                <input
                                  class="form-check-input cursor-pointer"
                                  type="checkbox"
                                  checked={
                                    checkedStatus[stockDetails._id] || false
                                  }
                                  id={`toggleSwitch${stockDetails._id}`}
                                  onChange={(event) =>
                                    changeStockStatus(event, stockDetails._id)
                                  }
                                  style={{ width: "30px", height: "15px" }}
                                />
                              </div>
                            </div>
                            <div className="sr_no">
                              <h6>
                                {Number(pageLimit) * (page - 1) + (index + 1)}
                              </h6>
                            </div>
                            <div className="item_code">
                              <h6>{stockDetails?.location}</h6>
                            </div>
                            <div className="item_code">
                              <h6>{stockDetails?.itemCode}</h6>
                            </div>
                            <div className="block_in_stock">
                              <h6>{stockDetails?.block}</h6>
                            </div>
                            <div className="rack_in_stock">
                              <h6>
                                {stockDetails?.rack ? stockDetails?.rack : "-"}
                              </h6>
                            </div>
                            <div className="serial_stock">
                              <h6>{stockDetails?.serialNo}</h6>
                            </div>
                            <div className="category_stock">
                              <h6>{stockDetails?.category}</h6>
                            </div>
                            <div className="condition_type">
                              <h6>{stockDetails?.conditionType}</h6>
                            </div>
                            <div className="condition_type">
                              <h6>{stockDetails?.status}</h6>
                            </div>
                            <div
                              className="brand_make"
                              style={{ display: "flex" }}
                            >
                              <h6>{stockDetails?.brand}</h6>
                            </div>
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className="data_not_available_wrapper">
                        <h5>Data Not Available</h5>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <Pagination
              isPageUpdated={isPageUpdated}
              setIsPageUpdated={setIsPageUpdated}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              pageCount={pageCount}
            />
          </div>
        </>
      )}
    </>
  );
}
