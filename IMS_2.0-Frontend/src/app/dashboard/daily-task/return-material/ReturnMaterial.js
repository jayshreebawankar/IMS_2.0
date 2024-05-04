"use client";
import Image from "next/image";
import { useForm } from "react-hook-form";
import saveIcon from "../../../../../../public/images/rolecreate/saveicon.png";
import { useEffect, useState } from "react";
import Loader from "@/reusable/Loader";
import Swal from "sweetalert2";
import { communication } from "@/apis/communication";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";
// import addIcon from "../../../../../../public/images/add.svg";
// import deleteicon from "../../../../../public/images/rolecreate/delete.png";
import deleteicon from "../../../../../../public/images/rolecreate/delete.png";
import addIcon from "../../../../../../public/add.svg";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getBrands,
  getCategory,
  getCategoryWiseParameter,
  getLocationWiseBlock,
  getLocations,
  getParameter,
} from "@/apis/comman-apis";
import { stockStatus } from "@/utils/helper/stock-status-array";

const ReturnMaterial = () => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
    getValues,
    setValue,
    setError,
  } = useForm({
    defaultValues: {
      quantity: 1,
      parameterId: "",
      parameter: {},
    },
  });

  const [loader, setLoader] = useState(false);

  const [locations, setLocations] = useState([]);
  const [category, setCategory] = useState([]);
  const [brands, setBrands] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [parameter, setParameter] = useState([]);
  const [racks, setRacks] = useState([]);
  const searchParams = useSearchParams();
  const [dataToAddList, setDataToAddList] = useState([]);
  const [addedDataId, setAddedDataId] = useState([]);
  const [isShowMaterialList, setIsShowMaterialList] = useState(false);
  const [modelName, setModelName] = useState("");
  const [isRackExist, setIsRackExist] = useState(null);
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [materialList, setMaterialList] = useState([]);

  const [materialIdList, setMaterialIdList] = useState([]);

  const handleMaterialChange = (event) => {
    setSelectedMaterial(event.target.value);
    const selectedIndex = event.target.selectedIndex;
    const materialId = event.target[selectedIndex].getAttribute("data-id");
    // setModelName(materialId);
  };
  const handleAddMaterial = () => {
    if (selectedMaterial) {
      const selectedIndex = dataToAddList.findIndex(
        (ele) => ele.categoryId.name === selectedMaterial
      );
      const materialId = dataToAddList[selectedIndex].categoryId._id;

      if (!materialList.includes(selectedMaterial)) {
        setMaterialList([...materialList, selectedMaterial]);
        setMaterialIdList([...materialIdList, materialId]);
      }

      setValue("materialId", "");
      setSelectedMaterial("");
      setError("materialId", {
        message: "",
      });
    } else {
      setError("materialId", {
        message: "Please enter material",
      });
    }
  };

  const handleRemoveMaterial = (index) => {
    setMaterialList((prevList) => prevList.filter((_, i) => i !== index));
    setMaterialIdList((prevList) => prevList.filter((_, i) => i !== index));
  };

  const location = watch("locationId");
  const categoryId = watch("categoryId");
  const rack = watch("blockId");

  const onSubmit = async (values) => {
    console.log("values", values);
    // if (materialList.length == 0 || values.materialId == "") {
    //   setError("materialId", {
    //     message: "Material is required",
    //   });
    // } else {
    try {
      setLoader(true);
      const dataToSend = {
        materialId: searchParams.get("materialId"),
        // addedData: addedDataId,
        // addedData: ["66222d649c31a2fb87cbc32f"],
        addedData: materialIdList,
        // ...values,
      };
      let response = await communication.returnMaterial(dataToSend);
      if (response?.data?.status === "SUCCESS") {
        Swal.fire({ text: response.data.message, icon: "success" });
        reset();
        router.push("/admin/dashboard/daily-task/");
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
    // }
  };

  async function getMaterialById() {
    try {
      setLoader(true);
      const responseFromServer = await communication.getMaterialById({
        materialId: searchParams.get("materialId"),
      });
      if (responseFromServer?.data?.status === "SUCCESS") {
        // Set default values for each form field
        setIsRackExist(responseFromServer?.data?.material.rackId);
        setDataToAddList(responseFromServer?.data?.material.dataToAddList);
        setModelName(responseFromServer?.data?.material.modelName);
        setIsShowMaterialList(responseFromServer?.data?.material.categoryId.isReplaceable !== true);
        const materialData = responseFromServer?.data?.material;
        setValue("locationId", materialData?.locationId);
        await getLocationWiseBlock(materialData?.locationId, setLoader, router, setBlocks);
        setValue("parameterId", materialData?.parameterId);
        setValue("modelName", materialData?.modelName);
        setValue("conditionType", materialData?.conditionType);
        setValue("itemCode", materialData?.itemCode);
        setValue("parameter", materialData?.parameter);
        setValue("serialNo", materialData?.serialNo);
        setValue("status", materialData?.status);
        setValue("categoryId", materialData?.categoryId._id);
        setValue("rackId", materialData?.rackId);
        setValue("brandId", materialData?.brandId);
        setValue("blockId", materialData?.blockId);
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

  async function callAPIs(params) {
    await getLocations(setLoader, router, setLocations);
    await getParameter(setLoader, router, setCategory);
    await getBrands(setLoader, router, setBrands);
    await getMaterialById();
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
                <h5>Return Material</h5>
              </div>
              <div className="row m-0 mt-3 mb-3 ps-5 ">
                <div className="col-lg-1 col-md-1 mb-3 d-flex align-items-center">
                  <h6>Select Location</h6>
                </div>
                <div className="col-lg-2 col-md-3 mb-3 ">
                  <select
                    disabled
                    {...register("locationId", {
                      required: "Location is required",
                    })}
                    className="selectBox text-capitalize"
                    style={{ width: "100%" }}
                  >
                    <option value="">Select location</option>
                    {locations.map((ele, index) => {
                      return (
                        <option
                          value={ele._id}
                          key={index}
                          selected={ele._id === getValues("locationId") ? true : false}
                        >
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
                <div className="col-lg-1 col-md-1  mb-3 d-flex align-items-center">
                  <h6>Select Block</h6>
                </div>
                <div className="col-lg-2 col-md-3  mb-3">
                  <select
                    disabled
                    {...register("blockId", {
                      required: "Block is required",
                    })}
                    className="selectBox"
                    style={{ width: "100%" }}
                  >
                    <option value="">Select Block</option>
                    {blocks.map((ele, index) => {
                      return (
                        <option
                          value={ele._id}
                          key={index}
                          selected={ele._id === getValues("blockId") ? true : false}
                        >
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

                {racks.length >= 1 && isRackExist && (
                  <>
                    {" "}
                    <div className="col-lg-1 col-md-1  d-flex align-items-center">
                      <h6>Select Rack</h6>
                    </div>
                    <div className="col-lg-2 col-md-3">
                      <select
                        disabled
                        {...register("rackId", {
                          required: "Rack is required",
                        })}
                        className="selectBox"
                        style={{ width: "100%" }}
                      >
                        <option value="">Select Rack</option>
                        {racks.map((ele, index) => {
                          return (
                            <option
                              value={ele._id}
                              key={index}
                              selected={ele._id === getValues("rackId") ? true : false}
                            >
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
                <div className="col-lg-1 col-md-1  mb-3  d-flex align-items-center">
                  <h6>Category</h6>
                </div>
                <div className="col-lg-2 col-md-3  mb-3">
                  <select
                    disabled
                    {...register("categoryId", {
                      required: "Category is required",
                    })}
                    className="selectBox text-capitalize"
                    style={{ width: "100%" }}
                  >
                    <option value="">Select Category</option>
                    {category.map((ele, index) => {
                      return (
                        <option
                          value={ele.categoryId}
                          key={index}
                          selected={ele.categoryId === getValues("categoryId") ? true : false}
                        >
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

                <div className="col-lg-1 col-md-1  mb-3  d-flex align-items-center">
                  <h6>Brand/Make</h6>
                </div>
                <div className="col-lg-2 col-md-3  mb-3">
                  <select
                    disabled
                    {...register("brandId", {
                      required: "Brand is required",
                    })}
                    className="selectBox text-capitalize"
                    style={{ width: "100%" }}
                  >
                    <option value="">Select Brand</option>
                    {brands.map((ele, index) => {
                      return (
                        <option
                          value={ele._id}
                          key={index}
                          selected={ele._id === getValues("brandId") ? true : false}
                        >
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

                <div className="col-lg-1 col-md-1 mb-3 d-flex align-items-center">
                  <h6>Condition Type</h6>
                </div>
                <div className="col-lg-2 col-md-3 mb-3">
                  <select
                    disabled
                    {...register("conditionType", {
                      required: "condition is required",
                    })}
                    className="selectBox text-capitalize"
                    style={{ width: "100%" }}
                  >
                    <option value="">Select Condition</option>
                    <option
                      value="new"
                      selected={"new" === getValues("conditionType") ? true : false}
                    >
                      New
                    </option>
                    <option
                      value="refurbished"
                      selected={"refurbished" === getValues("conditionType") ? true : false}
                    >
                      Refurbished
                    </option>
                  </select>
                  <div style={{ height: "5px" }}>
                    {errors.conditionType && (
                      <p className="text-danger text-start" style={{ fontSize: "0.7rem" }}>
                        {errors.conditionType.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="col-lg-1 col-md-1  mb-3  d-flex align-items-center">
                  <h6>Status</h6>
                </div>
                <div className="col-lg-2 col-md-3  mb-3">
                  <select
                    disabled
                    {...register("status", {
                      required: "Status is required",
                    })}
                    className="selectBox text-capitalize"
                    style={{ width: "100%" }}
                  >
                    <option value="">Select Status</option>
                    {stockStatus.map((ele, index) => {
                      return (
                        <option
                          value={ele}
                          key={index}
                          selected={ele === getValues("status") ? true : false}
                        >
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
                <div className="col-lg-1 col-md-1  mb-3 d-flex align-items-center">
                  <h6>Item Code</h6>
                </div>
                <div className="col-lg-2 col-md-3  mb-3">
                  <input
                    disabled
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
                <div className="col-lg-1 col-md-1  mb-3 d-flex align-items-center">
                  <h6 className="me-1">Serial No</h6>
                  <input type="checkbox" style={{ width: "13px", backgroundColor: "#B9B9B9" }} />
                </div>
                <div className="col-lg-2 col-md-3  mb-3">
                  <input
                    disabled
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

                <div className="col-lg-1 col-md-1  d-flex align-items-center">
                  <h6>Quantity</h6>
                </div>
                <div className="col-lg-2 col-md-3 ">
                  <input
                    disabled
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

                <div className="col-lg-1 col-md-1  d-flex align-items-center">
                  <h6>Model Name</h6>
                </div>
                <div className="col-lg-2 col-md-3">
                  <input
                    disabled
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
              </div>
              <div className="row m-0 mt-3 mb-3 ps-5">
                {parameter?.map((item) => (
                  <>
                    <div className="col-lg-1 col-md-1 mt-2 d-flex align-items-center">
                      <h6>{item}</h6>
                    </div>
                    <div className="col-lg-2 col-md-3 mt-2 d-flex align-items-center">
                      <input
                        disabled
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
                  </>
                ))}
              </div>

              <div className="row m-0 mt-3 mb-3 ps-5">
                {isShowMaterialList && (
                  <>
                    <div className="col-lg-1 col-md-1 d-flex align-items-center">
                      <h6>Select Material</h6>
                    </div>
                    <div className="col-lg-2 col-md-3">
                      <select
                        {...register("materialId")}
                        className="selectBox text-capitalize"
                        style={{ width: "100%" }}
                        onChange={handleMaterialChange}
                        value={selectedMaterial} // Add value prop to control the selected value
                      >
                        <option value="">Select Material</option>
                        {dataToAddList.map((ele, index) => {
                          return (
                            <option
                              value={ele.categoryId.name}
                              key={index}
                              data-id={ele.categoryId._id} // Added data-id attribute
                            >
                              {`${ele.categoryId.name} (${modelName})`}
                            </option>
                          );
                        })}
                      </select>

                      <div style={{ height: "5px" }}>
                        {errors.materialId && (
                          <p className="text-danger text-start" style={{ fontSize: "0.7rem" }}>
                            {errors.materialId.message}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddMaterial}
                      style={{
                        height: "28px",
                        width: "35px",
                        border: "1px solid #BABABA",
                        marginBottom: "11px",
                      }}
                    >
                      <Image src={addIcon}></Image>
                    </button>
                  </>
                )}
                {materialList.length > 0 && (
                  <div className="col-lg-12 mt-3">
                    <h6>Selected Materials:</h6>
                    <ul className="list-unstyled d-flex gap-2">
                      {materialList.map((material, index) => (
                        <li key={index}>
                          {material}
                          <button
                            type="button"
                            onClick={() => handleRemoveMaterial(index)}
                            className="btn btn-link btn-sm"
                          >
                            <Image className="cursor-pointer ms-1" alt="" src={deleteicon}></Image>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="row m-0 mt-3 mb-3 ps-5">
                <div className="col-lg-1 col-md-1  d-flex align-items-center"></div>
                <div className="col-lg-3 col-md-3 d-flex gap-2">
                  <button className="savebtn mb-1" type="submit" onClick={handleSubmit(onSubmit)}>
                    <Image src={saveIcon} alt="saveIcon"></Image>Return
                  </button>
                  <button
                    className="savebtn mb-1"
                    type="button"
                    onClick={() => router.back("/admin/dashboard/daily-task/")}
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

export default ReturnMaterial;
