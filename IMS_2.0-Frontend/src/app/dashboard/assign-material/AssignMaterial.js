"use client";
import Image from "next/image";
import saveIcon from "../../../../../public/images/rolecreate/saveicon.png";
import search from "../../../../../public/images/rolecreate/search.png";
import Swal from "sweetalert2";
import { communication } from "@/apis/communication";
import { useEffect, useState } from "react";
// const searchParams = useSearchParams();
import {
  getBrands,
  getCategory,
  getCategoryWiseParameter,
  getLocationWiseBlock,
  getLocations,
  getParameter,
  getRackPartation,
} from "@/apis/comman-apis";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Loader from "@/reusable/Loader";
import { stockStatus } from "@/utils/helper/stock-status-array";

const AssignMaterial = () => {
  const [material, setMaterial] = useState([]);
  const [TechnicianList, setTechnicianList] = useState([]);
  const [category, setCategory] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loader, setLoader] = useState(false);
  const [parameter, setParameter] = useState([]);
  const [selectedList, setSelectedList] = useState([]);
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [selectAllCheckedStock, setSelectAllCheckedStock] = useState(false);
  const [stockIds, setStockIds] = useState([]);
  const [userId, setUserId] = useState("");
  const router = useRouter();
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
  const categoryId = watch("categoryId");

  const [expandedModals, setExpandedModals] = useState([]);

  const toggleModal = (modelName) => {
    setExpandedModals((prevExpandedModals) => {
      if (prevExpandedModals.includes(modelName)) {
        return prevExpandedModals.filter((modal) => modal !== modelName);
      } else {
        return [...prevExpandedModals, modelName];
      }
    });
  };

  const handleCheckboxChange = (event, materialData) => {
    const isChecked = event.target.checked;

    if (isChecked) {
      // Add materialData to selectedList
      setSelectedList((prev) => [...prev, materialData]);
      console.log("rrrrr materialData", materialData);
    } else {
      // Remove materialData from selectedList
      setSelectedList((prev) => prev.filter((item) => item._id !== materialData._id));
      setStockIds((prev) => prev.filter((item) => item !== materialData._id));
    }
  };
  const handleSelectAllChange = (event) => {
    const isChecked = event.target.checked;

    if (isChecked) {
      // Select all checkboxes
      setSelectedList([...material]);
    } else {
      // Deselect all checkboxes
      setSelectedList([]);
      setStockIds([]);
      setSelectAllCheckedStock(false);
    }
    setSelectAllChecked(isChecked);
  };
  const handleSelectAllChangeStock = (event) => {
    const isChecked = event.target.checked;
    setSelectAllCheckedStock(isChecked);
    if (isChecked) {
      // If "Select All" is checked, select all checkboxes
      const allMaterialIds = selectedList.map((item) => item._id);
      setStockIds(allMaterialIds);
    } else {
      // If "Select All" is unchecked, deselect all checkboxes
      setStockIds([]);
    }
  };

  const getStockIds = (event, materialData) => {
    const isChecked = event.target.checked;

    if (isChecked) {
      // Add materialData to selectedList
      setStockIds((prev) => [...prev, materialData._id]);
    } else {
      // Remove materialData from selectedList
      setStockIds((prev) => prev.filter((item) => item !== materialData._id));
    }
  };
  useEffect(() => {
    const fetchMaterial = async () => {
      const id = getValues("categoryId");

      try {
        let payload = {
          categoryId: id,
        };
        if (id) {
          let response = await communication.getCategoryWiseParameter(payload);
          if (response?.data?.status === "SUCCESS") {
            setParameter(response?.data?.parameter);
          }
        }
      } catch (error) {
        Swal.fire({ text: error.message, icon: "warning" });
      }
    };
    fetchMaterial();
  }, [categoryId]);
  const onSubmit = async (values) => {
    setStockIds([]);
    try {
      let payload = {
        categoryId: values.categoryId,
        status: values.status,
        brandId: values.brandId,
        conditionType: values.conditionType,
        // parameter: ["para-1"],
        // parametersToMatch: ["one"],
        page: 1,
      };
      // let payload = {};
      // payload.categoryId = values.categoryId;
      // payload.status = values.status;
      // payload.brandId = values.brandId;
      // payload.conditionType = values.conditionType;
      setLoader(true);
      let response = await communication.getMaterialList(payload);
      if (response?.data?.status === "SUCCESS") {
        Swal.fire({ text: response.data.message, icon: "success" });
        reset();
        setMaterial(response?.data.stock);
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

  const technicianList = async () => {
    try {
      setLoader(true);

      let response = await communication.getTechnicianList();
      if (response?.data?.status === "SUCCESS") {
        // Swal.fire({ text: response.data.message, icon: "success" });
        setTechnicianList(response?.data.user);
        // await getRoleList(currentPage, searchString);
      } else if (response?.data?.status === "JWT_INVALID") {
        Swal.fire({ text: response.data.message, icon: "warning" });
        router.push("/");
      } else {
        Swal.fire({ text: response.data.message, icon: "warning" });
      }
      // console.log("thhhech", TechnicianList);
    } catch (error) {
      Swal.fire({ text: error.message, icon: "warning" });
    } finally {
      setLoader(false);
    }
  };
  useEffect(() => {
    technicianList();
  }, []);

  const handleAssign = async () => {
    if (!userId) {
      alert("Please Select Technician");
      return;
    }
    try {
      setLoader(true);
      let payload = {
        stockIds: stockIds,
        userId: userId,
      };
      let response = await communication.AssignMaterial(payload);
      if (response?.data?.status === "SUCCESS") {
        Swal.fire({ text: response.data.message, icon: "success" });
        setSelectedList([]);
        setMaterial([]);
        setParameter([]);
        // setTechnicianList(response?.data.user);
        // await getRoleList(currentPage, searchString);
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

  async function callAPIs(params) {
    // await getLocations(setLoader, router, setLocations);
    await getCategory(setLoader, router, setCategory);
    await getBrands(setLoader, router, setBrands);
    // await getStockById();
  }

  useEffect(() => {
    callAPIs();
  }, []);

  return (
    <>
      {loader ? (
        <Loader />
      ) : (
        <div class="container-fluid d-flex gap-4" style={{ height: "96%" }}>
          <div className="form_view pt-0" style={{ width: "30%", height: "100%" }}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="form_title">
                <h5>Select Material</h5>
              </div>
              <div>
                <div className="p-4">
                  <div class="row">
                    <div class="col-md-6 d-flex align-items-center">
                      <h6>Select Category</h6>
                    </div>
                    <div class="col-md-6 ">
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
                            <option value={ele._id} key={index}>
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
                  </div>
                  <div class="row mt-2">
                    <div class="col-md-6 d-flex align-items-center ">
                      <h6>Select Status</h6>
                    </div>
                    <div class="col-md-6">
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
                  </div>
                  <div class="row mt-2">
                    <div class="col-md-6 d-flex align-items-center">
                      <h6>Brand</h6>
                    </div>
                    <div class="col-md-6">
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
                  </div>
                  <div class="row mt-2">
                    <div class="col-md-6 d-flex align-items-center">
                      <h6>Condition Type</h6>
                    </div>
                    <div class="col-md-6 mt-2">
                      <select
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
                  </div>
                  <div className="row mt-3">
                    <div className="col-12 d-flex align-items-center justify-content-center">
                      <div
                        className="border border-3 border-solid border-color-#bababa ps-1 d-flex justify-content-center align-items-center"
                        style={{ width: "40%", height: "150%" }}
                      >
                        <Image
                          src={search}
                          alt="serchIcon"
                          // className="ps-2"
                        ></Image>
                        <input
                          type="submit"
                          value={"Search"}
                          style={{
                            background: "#f5f5f5",
                            height: "100%",
                            width: "67%",
                            fontSize: 14,
                            fontWeight: 500,
                            textAlign: "center",
                          }}
                          // className="ps-2"
                        />
                        {/* <button className="savebtn mb-1" onClick={() => getRoleList(1, searchString)}>Search</button> */}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-5 p-2">
                <div style={{ color: "black" }}>
                  <h6>Parameters</h6>
                </div>
                <div className="mt-3" style={{ maxHeight: "300px", overflowY: "auto" }}>
                  {parameter.map((modal, index) => (
                    // console.log("modal",modal)
                    <div key={index} className="modal-container">
                      <div className="d-flex gap-2 mb-2">
                        <div
                          onClick={() => toggleModal(modal.modelName)}
                          style={{ cursor: "pointer" }}
                        >
                          {expandedModals.includes(modal.modelName) ? "-" : "+"}
                        </div>

                        <div
                          onClick={() => toggleModal(modal.modelName)}
                          style={{ cursor: "pointer" }}
                        >
                          {modal.modelName}
                        </div>
                      </div>

                      {expandedModals.includes(modal.modelName) && (
                        <ul className="parameter-list" style={{ listStyle: "none" }}>
                          {modal.parameterList.map((param, paramIndex) => (
                            <li key={paramIndex}>
                              <input type="checkbox" className="me-3" />
                              {param}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </form>
          </div>
          <div className="row" style={{ width: "70%", height: "40%" }}>
            <div className="col-12">
              <div>
                <div className="table_view">
                  <div className="table_wrapper">
                    <div className="table_main">
                      <div className="table_container">
                        <div className="table_header">
                          <div className="checkbox_wrapper">
                            <input
                              type="checkbox"
                              id="selectAllCheckbox"
                              onChange={(e) => handleSelectAllChange(e)}
                              checked={selectAllChecked}
                              // onChange={(e) => handleSelectAllChange(e)}
                              // checked={selectAllChecked}
                            />
                          </div>
                          <div className="sr_no">
                            <h5>Sr. No.</h5>
                          </div>
                          <div className="assign_column">
                            <h5>Location</h5>
                          </div>
                          <div className="assign_column">
                            <h5>Block Name</h5>
                          </div>
                          <div className="assign_column">
                            <h5>Rack No</h5>
                          </div>
                          <div className="assign_column">
                            <h5>Serial No.</h5>
                          </div>
                          <div className="assign_column_category ">
                            <h5>Category</h5>
                          </div>
                        </div>
                        <div className="table_data_wrapper" style={{ height: "34vh" }}>
                          {material.map((materialData, index) => (
                            <div className="table_data" key={index}>
                              <div className="checkbox_wrapper">
                                <input
                                  type="checkbox"
                                  id={materialData._id}
                                  onChange={(e) => handleCheckboxChange(e, materialData)}
                                  checked={selectedList.some(
                                    (item) => item._id === materialData._id
                                  )}
                                />
                              </div>
                              <div className="sr_no">
                                <h6>
                                  {index + 1}
                                  {/* {Number(pageLimit) * (page - 1) + (index + 1)} */}
                                </h6>
                              </div>
                              <div className="assign_column">
                                <h6>{materialData.location}</h6>
                              </div>
                              <div className="assign_column">
                                <h6>{materialData.block}</h6>
                              </div>
                              <div className="assign_column">
                                <h6>{materialData.rack ? materialData.rack : "-"}</h6>
                              </div>
                              <div className="assign_column">
                                <h6>{materialData.serialNo}</h6>
                              </div>
                              <div className="assign_column_category ">
                                <h6>{materialData.category}</h6>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-12 mt-4">
              <div>
                <div className="table_view">
                  <div className="table_wrapper">
                    <div className="table_main">
                      <div className="table_container">
                        <div className="table_header">
                          <div className="checkbox_wrapper">
                            <input
                              type="checkbox"
                              id="selectAllCheckbox"
                              onChange={(e) => handleSelectAllChangeStock(e)}
                              checked={selectAllCheckedStock}
                            />
                          </div>
                          <div className="sr_no">
                            <h5>Sr. No.</h5>
                          </div>
                          <div className="assign_column">
                            <h5>Location</h5>
                          </div>
                          <div className="assign_column">
                            <h5>Block Name</h5>
                          </div>
                          <div className="assign_column">
                            <h5>Rack No</h5>
                          </div>
                          <div className="assign_column">
                            <h5>Serial No.</h5>
                          </div>
                          <div className="assign_column">
                            <h5>Category</h5>
                          </div>
                        </div>
                        <div className="table_data_wrapper">
                          {selectedList.map((materialData, index) => (
                            <div className="table_data" key={index}>
                              <div className="checkbox_wrapper">
                                <input
                                  type="checkbox"
                                  id={materialData._id}
                                  onChange={(e) => getStockIds(e, materialData)}
                                  // checked={selectedList.includes(materialData._id)}
                                  checked={stockIds.some((item) => item === materialData._id)}
                                />
                              </div>
                              <div className="sr_no">
                                <h6>
                                  {index + 1}
                                  {/* {Number(pageLimit) * (page - 1) + (index + 1)} */}
                                </h6>
                              </div>
                              <div className="assign_column">
                                <h6>{materialData.location}</h6>
                              </div>
                              <div className="assign_column">
                                <h6>{materialData.block}</h6>
                              </div>
                              <div className="assign_column">
                                <h6>{materialData.rack ? materialData.rack : "-"}</h6>
                              </div>
                              <div className="assign_column">
                                <h6>{materialData.serialNo}</h6>
                              </div>
                              <div className="assign_column">
                                <h6>{materialData.category}</h6>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* <Pagination
          isPageUpdated={isPageUpdated}
          setIsPageUpdated={setIsPageUpdated}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          pageCount={pageCount}
        /> */}
                </div>
              </div>
            </div>
            <div className="row d-flex m-0 mt-3 mb-3 ps-5">
              <div className="col-3 justify-content-center d-flex align-items-center select_tech">
                <h6>Select Technician</h6>
              </div>
              <div className="col-3  d-flex align-items-center">
                <select
                  className="inputBox"
                  style={{ height: "91%", background: "#f5f5f5" }}
                  // {...register("userId", {
                  //   required: "Technician is required",
                  // })}
                  onChange={(e) => setUserId(e.target.value)}
                >
                  {/* <option>Roshan</option>
                  <option>Roshan 2</option> */}
                  <option value="">Select Technician</option>
                  {TechnicianList.map((ele, index) => {
                    return (
                      <option value={ele._id} key={index}>
                        {ele.name}
                      </option>
                    );
                  })}
                </select>
                {/* <div style={{ height: "5px" }}>
                  {errors.userId && (
                    <p className="text-danger text-start" style={{ fontSize: "0.7rem" }}>
                      {errors.userId.message}
                    </p>
                  )}
                </div> */}
              </div>
              <div className="col-3 d-flex align-items-center">
                <button
                  onClick={() =>
                    stockIds.length >= 1 ? handleAssign() : alert("Please Select Stock")
                  }
                  className="savebtn mb-1"
                  type="submit"
                  style={{ height: "91%" }}
                >
                  <Image src={saveIcon} alt="saveIcon"></Image>Assign material
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AssignMaterial;
