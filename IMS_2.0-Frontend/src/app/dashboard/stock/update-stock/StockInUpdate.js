"use client";
import Image from "next/image";
import { useForm } from "react-hook-form";
import saveIcon from "../../../../../../public/images/rolecreate/saveicon.png";
import React, { useEffect, useState } from "react";
import Loader from "@/reusable/Loader";
import Swal from "sweetalert2";
import { communication } from "@/apis/communication";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { useRouter, useSearchParams } from "next/navigation";
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

const StockInUpdate = () => {
  const router = useRouter();

  const [loader, setLoader] = useState(false);
  const [isPartationPresent, setIsPartationPresent] = useState("");
  const [locations, setLocations] = useState([]);
  const [category, setCategory] = useState([]);
  const [brands, setBrands] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [parameter, setParameter] = useState([]);
  const [racks, setRacks] = useState([]);
  const searchParams = useSearchParams();
  const [rackPartation, setRackPartation] = useState([]);

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

  const onSubmit = async (values) => {
    try {
      setLoader(true);
      const dataToSend = {
        stockId: searchParams.get("stockId"),
        ...values,
      };
      let response = await communication.updateStock(dataToSend);
      if (response?.data?.status === "SUCCESS") {
        Swal.fire({ text: response.data.message, icon: "success" });
        reset();
        router.push("/admin/dashboard/stock");
      } else if (response?.data?.status === "JWT_INVALID") {
        Swal.fire({ text: response.data.message, icon: "warning" });
        router.push("/");
      } else {
        Swal.fire({ text: response.data.message, icon: "warning" });
      }
    } catch (error) {
      Swal.fire({
        text: error?.response?.data?.message || error.message,
        icon: "warning",
      });
    } finally {
      setLoader(false);
    }
  };

  async function getStockById() {
    try {
      setLoader(true);
      const responseFromServer = await communication.getStockById(searchParams.get("stockId"));
      if (responseFromServer?.data?.status === "SUCCESS") {
        // Set default values for each form field
        setIsPartationPresent(responseFromServer?.data?.stock.partitionName);
        getRackPartation(
          responseFromServer?.data?.stock.rackId,
          setLoader,
          router,
          setRackPartation
        );
        const stockData = responseFromServer?.data?.stock;
        setValue("locationId", stockData?.locationId);
        await getLocationWiseBlock(stockData?.locationId, setLoader, router, setBlocks);
        setValue("parameterId", stockData?.parameterId);
        setValue("modelName", stockData?.modelName);
        setValue("conditionType", stockData?.conditionType);
        setValue("itemCode", stockData?.itemCode);
        setValue("parameter", stockData?.parameter);
        setValue("serialNo", stockData?.serialNo);
        setValue("status", stockData?.status);
        setValue("categoryId", stockData?.categoryId._id);
        setValue("rackId", stockData?.rackId);
        setValue("brandId", stockData?.brandId);
        setValue("blockId", stockData?.blockId);
        // setValue("partitionName", stockData?.partitionName);
      } else if (responseFromServer?.data?.status === "JWT_INVALID") {
        Swal.fire({ text: responseFromServer?.data?.message, icon: "warning" });
        router.push("/login");
      } else {
        Swal.fire({ text: responseFromServer?.data?.message, icon: "warning" });
      }
    } catch (error) {
      Swal.fire({
        text: error?.response?.data?.message || error.message,
        icon: "warning",
      });
    } finally {
      setLoader(false);
    }
  }
  useEffect(() => {
    setValue("partitionName", isPartationPresent);
  }, [rackPartation, rackPartation.length]);
  useEffect(() => {
    const id = getValues("categoryId");
    if (id) {
      const parameterDetails = category.find((ele) => ele.categoryId === id);
      setValue("parameterId", parameterDetails?._id);
      setParameter(parameterDetails?.parameter ?? []);
    } else {
      setParameter([]);
      setValue("parameterId", "");
    }
  }, [categoryId]);

  useEffect(() => {
    const id = getValues("locationId");
    if (id) {
      getLocationWiseBlock(id, setLoader, router, setBlocks);
    }
  }, [location]);

  useEffect(() => {
    const id = getValues("blockId");
    if (id) {
      const rackDetails = blocks?.find((ele) => ele._id === id);
      setRacks(rackDetails?.rackId ?? []);
    } else {
      setRacks([]);
    }
  }, [rack]);
  useEffect(() => {
    const id = getValues("rackId");
    // console.log(id, "RRR");
    if (id) {
      getRackPartation(id, setLoader, router, setRackPartation);
    } else {
      setRackPartation([]);
    }
  }, [_rackIdForPrtn]);

  async function callAPIs(params) {
    await getLocations(setLoader, router, setLocations);
    await getParameter(setLoader, router, setCategory);
    await getBrands(setLoader, router, setBrands);
    await getStockById();
  }

  useEffect(() => {
    callAPIs();
  }, []);

  return (
    <>
      {loader ? (
        <Loader />
      ) : (
        <>
          <div className="form_view " style={{ height: "55%" }}>
            <form>
              <div className="form_title">
                <h5>Stock Update</h5>
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
                      <p className="text-danger text-start" style={{ fontSize: "0.7rem" }}>
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
                      <p className="text-danger text-start" style={{ fontSize: "0.7rem" }}>
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
                          <p className="text-danger text-start" style={{ fontSize: "0.7rem" }}>
                            {errors.rackId.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                )}
                {isPartationPresent && (
                  <>
                    {" "}
                    {/* {rackPartation.length > 1 && ( */}
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
                            <p className="text-danger text-start" style={{ fontSize: "0.7rem" }}>
                              {errors.partitionName.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </>
                    {/* // )} */}
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
                      <p className="text-danger text-start" style={{ fontSize: "0.7rem" }}>
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
                      <p className="text-danger text-start" style={{ fontSize: "0.7rem" }}>
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
                      <p className="text-danger text-start" style={{ fontSize: "0.7rem" }}>
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
                      <p className="text-danger text-start" style={{ fontSize: "0.7rem" }}>
                        {errors.status.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="stock_input col-lg-1 col-md-1  d-flex align-items-center">
                  <h6 className="me-1">Serial No</h6>
                  <input type="checkbox" style={{ width: "13px", backgroundColor: "#B9B9B9" }} />
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
                      <p className="text-danger text-start" style={{ fontSize: "0.7rem" }}>
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
                      <p className="text-danger text-start" style={{ fontSize: "0.7rem" }}>
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
                      <p className="text-danger text-start" style={{ fontSize: "0.7rem" }}>
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
                      <p className="text-danger text-start" style={{ fontSize: "0.7rem" }}>
                        {errors.itemCode.message}
                      </p>
                    )}
                  </div>
                </div>

                {parameter?.map((item, index) => (
                  <React.Fragment key={index}>
                    <div className="col-lg-1 col-md-1 mt-2 d-flex align-items-center">
                      <h6>{item}</h6>
                    </div>
                    <div className="col-lg-2 col-md-2 mt-2 d-flex align-items-center">
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
              <div className="row m-0 mt-3 mb-3 ps-5 py-3">
                <div className="col-lg-1 col-md-1  d-flex align-items-center"></div>
                <div className="col-lg-3 col-md-3 d-flex gap-2">
                  <button className="savebtn mb-1" type="submit" onClick={handleSubmit(onSubmit)}>
                    <Image src={saveIcon} alt="saveIcon"></Image>Update
                  </button>
                  <button
                    className="savebtn mb-1"
                    type="button"
                    onClick={() => router.back("/admin/dashboard/stock")}
                  >
                    <FontAwesomeIcon icon={faAngleLeft} />
                    Back
                  </button>
                </div>
              </div>
            </form>
          </div>
        </>
      )}
    </>
  );
};

export default StockInUpdate;
