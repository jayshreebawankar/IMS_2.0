"use client";
import Loader from "@/reusable/Loader";
import Pagination from "@/reusable/Pagination";
import React, { useEffect, useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";

import addIcon from "../../../../../public/add.svg";

import saveIcon from "../../../../../public/images/rolecreate/saveicon.png";
import search from "../../../../../public/images/rolecreate/search.png";
import importicon from "../../../../../public/images/rolecreate/import.png";
import exporticon from "../../../../../public/images/rolecreate/export.png";
import deleteicon from "../../../../../public/images/rolecreate/delete.png";
import edit from "../../../../../public/images/rolecreate/edit.png";
import Image from "next/image";
import { communication } from "@/apis/communication";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import FileSaver from "file-saver";
import { getCategory } from "@/apis/comman-apis";
const pageLimit = process.env.NEXT_PUBLIC_LIMIT ?? 20;

const Parameter = () => {
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [page, setPage] = useState("1");

  const [searchString, setSearchString] = useState("");
  const [timeoutId, setTimeoutId] = useState();

  const [_parameterList, _setPrameterList] = useState([]);
  const [parameterInput, setParameterInput] = useState("");

  const [parameter, setParameter] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [loader, setLoader] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isPageUpdated, setIsPageUpdated] = useState(false);
  const [pageCount, setPageCount] = useState(0);

  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [selectedCheckboxes, setSelectedCheckboxes] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm();
  const _parameterInput = watch("parameter");

  function addToPrameterList() {
    if (parameterInput) {
      _setPrameterList((prev) => [...prev, parameterInput]);
      setValue("parameter", "");
    } else {
      setError("parameter", {
        message: "Please enter parameter",
      });
    }
  }
  const handleCheckboxChange = (e) => {
    const parameter = e.target.id;

    setSelectedCheckboxes((prevSelected) => {
      if (prevSelected.includes(parameter)) {
        return prevSelected.filter((id) => id !== parameter);
      } else {
        return [...prevSelected, parameter];
      }
    });
  };

  const handleSelectAllChange = (e) => {
    setSelectAllChecked(e.target.checked);

    setSelectedCheckboxes((prevSelected) =>
      e.target.checked
        ? parameter.map((parameterDetails) => parameterDetails._id)
        : []
    );
  };

  const createParameter = async (values) => {
    if (_parameterList.length == 0 && values.parameter == "") {
      setError("parameter", {
        message: "Parameter is required",
      });
    } else {
      try {
        let payload = {
          parameter: [..._parameterList],
          categoryId: values.category,
        };
        setLoader(true);
        const serverResponse = await communication.createParameter(payload);
        if (serverResponse?.data?.status === "SUCCESS") {
          Swal.fire({ text: serverResponse.data.message, icon: "success" });
          reset();
          _setPrameterList([]);
          await getAllParameter(currentPage, searchString);
        } else if (serverResponse?.data?.status === "JWT_INVALID") {
          Swal.fire({ text: serverResponse.data.message, icon: "warning" });
          router.push("/");
        } else {
          Swal.fire({ text: serverResponse.data.message, icon: "warning" });
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
  };
  const deleteParameter = async () => {
    if (selectedCheckboxes.length > 0) {
      Swal.fire({
        text: "Are you sure you want to delete this parmeter?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#5149E4",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it",
        cancelButtonText: "No, cancel",
        reverseButtons: true,
      }).then(async function (result) {
        if (result.isConfirmed) {
          try {
            setLoader(true);
            let payload = {
              parameterIds: [...selectedCheckboxes],
            };
            let response = await communication.deleteParameter(payload);
            if (response?.data?.status === "SUCCESS") {
              Swal.fire({ text: response.data.message, icon: "success" });
              await getAllParameter(currentPage, searchString);
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
        } else {
        }
      });
    } else {
      Swal.fire({
        text: "Please select which parameter you want to delete",
        icon: "warning",
      });
    }
  };

  async function getAllCategory(page, searchString) {
    try {
      setLoader(true);
      const serverResponse = await communication.getAllCategory(
        page,
        searchString
      );
      if (serverResponse?.data?.status === "SUCCESS") {
        // setParameterId(serverResponse.data.category._id);
        // setCategoryList(serverResponse?.data.category);
        // setPageCount(serverResponse?.data?.totalPages);
        // setPage(page);
      } else if (serverResponse?.data?.status === "JWT_INVALID") {
        Swal.fire({ text: serverResponse.data.message, icon: "warning" });
        router.push("/");
        setLoader(false);
      } else {
        setCategoryList([]);
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
  async function getAllParameter(page, searchString, isSearch = false) {
    try {
      setLoader(true);
      const serverResponse = await communication.getAllParameter(
        page,
        searchString
      );
      if (serverResponse?.data?.status === "SUCCESS") {
        setParameter(serverResponse?.data.parameter);
        setPageCount(serverResponse?.data?.totalPages);
        setPage(page);
        if (isSearch) {
          setCurrentPage(1);
        }
      } else if (serverResponse?.data?.status === "JWT_INVALID") {
        Swal.fire({ text: serverResponse.data.message, icon: "warning" });
        router.push("/");
        setLoader(false);
      } else {
        setParameter([]);
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

  const handleFileChange = (event) => {
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
        const selectedFile = event.target.files[0];
        importData(selectedFile);
      } else {
        return;
      }
    });
  };
  const getExportParameter = async () => {
    try {
      Swal.fire({
        text: "Are you sure you want to export the data?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#5149E4",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes",
        cancelButtonText: "No",
        reverseButtons: true,
      }).then(async function (result) {
        if (result.isConfirmed) {
          const serverResponse = await communication.getExportParameter();
          if (serverResponse?.data) {
            const file = new Blob([serverResponse.data], {
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            FileSaver.saveAs(file, "Parameter.xlsx");
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

  const importData = async (selectedFile) => {
    try {
      const formData = new FormData();
      formData.append("parameter", selectedFile);
      const serverResponse = await communication.importExcelParameterData(
        formData
      );
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
  function deletePrameterList(id) {
    _setPrameterList(_parameterList.filter((item) => item != id));
  }
  const handleSearch = (e) => {
    setSearchString(e.target.value);
    let isSearch = true;
    clearTimeout(timeoutId);
    let _timeOutId = setTimeout(() => {
      getAllParameter("1", e.target.value, isSearch);
    }, 2000);
    setTimeoutId(_timeOutId);
  };
  // useEffect(() => {
  //   getAllCategory();
  // }, []);
  useEffect(() => {
    setParameterInput(_parameterInput);
  }, [_parameterInput]);
  useEffect(() => {
    getAllParameter(currentPage, searchString);
    getCategory(setLoader, router, setCategoryList);
  }, [isPageUpdated]);
  return (
    <>
      {loader ? (
        <Loader />
      ) : (
        <>
          <div className="form_view ">
            <form onSubmit={handleSubmit(createParameter)}>
              <div className="form_title">
                <h5>Create Parameters</h5>
              </div>
              <div className="row m-0 mt-3 mb-3 ps-5">
                <div className="col-lg-2 col-md-2 justify-content-center d-flex align-items-center">
                  <h6 style={{ marginRight: "10px" }}>Category Name</h6>
                </div>
                <div className="col-lg-2 col-md-2">
                  <select
                    className="inputBox"
                    {...register("category", {
                      required: "Category is required",
                    })}
                    style={{ outline: "none" }}
                  >
                    <option value="">Select Category</option>
                    {categoryList?.map((categoryData, index) => (
                      <option value={categoryData?._id} key={index + 1}>
                        {categoryData?.name.toUpperCase()}
                      </option>
                    ))}
                  </select>
                  <div style={{ height: "5px" }}>
                    {errors.category && (
                      <p
                        className="text-danger text-start"
                        style={{ fontSize: "0.7rem" }}
                      >
                        {errors.category.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="row m-0 mt-3 mb-3 ps-5">
                <div className="col-lg-2 col-md-2 justify-content-center d-flex align-items-center">
                  <h6>Parameters Name</h6>
                </div>
                <div className="col-lg-2 col-md-2 d-flex flex-column">
                  <input
                    type="text"
                    {...register("parameter")}
                    className="inputBox"
                  />
                  <div style={{ height: "5px" }}>
                    {errors.parameter && (
                      <p
                        className="text-danger text-start"
                        style={{ fontSize: "0.7rem" }}
                      >
                        {errors.parameter.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="col-lg-1 col-md-1 justify-content-start d-flex align-items-center">
                  <button
                    type="button"
                    onClick={addToPrameterList}
                    className="p-1 d-flex align-items-center justify-content-center"
                    style={{
                      height: "28px",
                      width: "35px",
                      border: "1px solid #BABABA",
                      marginBottom: "11px",
                    }}
                  >
                    <Image src={addIcon}></Image>
                  </button>
                </div>
              </div>

              <div className="row m-0 mt-3 mb-3 ps-5">
                {_parameterList.map((item, index) => (
                  <div
                    key={index}
                    className="col-lg-3 col-md-3 my-2 justify-content-center d-flex align-items-center"
                  >
                    <div className="d-flex justify-content-center  gap-5 align-items-center">
                      <h6>{item}</h6>
                      <Image
                        className="cursor-pointer"
                        key={index}
                        onClick={() => deletePrameterList(item)}
                        alt=""
                        src={deleteicon}
                      ></Image>
                    </div>
                  </div>
                ))}
              </div>
              {/* <div>
                {_parameterList.map((item, index) => (
                  <div className="col-lg-2 col-md-2 justify-content-center d-flex align-items-center">
                    <div className="d-flex gap-3 align-items-center justify-content-center">
                      <p>{item}</p>
                      <Image
                        className="cursor-pointer"
                        key={index}
                        onClick={() => deletePrameterList(item)}
                        alt=""
                        src={deleteicon}
                      ></Image>
                    </div>
                  </div>
                ))}
              </div> */}
              <div className="row m-0 mt-3 mb-3 ps-5">
                <div className="col-lg-2 col-md-2  d-flex align-items-center"></div>
                <div className="col-lg-3 col-md-3">
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
                  <label htmlFor="file" className="savebtn mb-1 cursor-pointer" type="button">
                    <Image alt="" src={importicon}></Image>
                    Import
                  </label>
                </div> */}
                <button
                  onClick={getExportParameter}
                  className="savebtn mb-1"
                  type="button"
                >
                  <Image alt="" src={exporticon}></Image>Export Data
                </button>
                <button
                  className="savebtn mb-1"
                  type="button"
                  onClick={deleteParameter}
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
                    <div className="sr_no">
                      <h5>Sr. No.</h5>
                    </div>
                    <div className="category_parameter">
                      <h5>Category</h5>
                    </div>
                    <div className="tab_access">
                      <h5>Parameters</h5>
                    </div>
                  </div>
                  <div
                    className="table_data_wrapper"
                    style={{ height: "34dvh" }}
                  >
                    {parameter?.length > 0 ? (
                      <>
                        {parameter?.map((parameter, index) => (
                          <div className="table_data" key={index}>
                            <div className="checkbox_wrapper">
                              <input
                                type="checkbox"
                                id={parameter._id}
                                onChange={(e) => handleCheckboxChange(e)}
                                checked={selectedCheckboxes.includes(
                                  parameter._id
                                )}
                              />
                            </div>
                            <div
                              onClick={() =>
                                router.push(
                                  `/admin/dashboard/parameter/update-parameter?parameterId=${parameter._id}`
                                )
                              }
                              className="edit"
                            >
                              <Image
                                title="Update"
                                className="cursor-pointer"
                                src={edit}
                                alt="edit-icon"
                              />
                            </div>
                            <div className="sr_no">
                              <h6>
                                {Number(pageLimit) * (page - 1) + (index + 1)}
                              </h6>
                            </div>
                            <div className="category_parameter">
                              <h6>{parameter.name}</h6>
                            </div>
                            <div className="tab_access">
                              <h6>
                                {parameter.parameter.map((item, index) => (
                                  <span key={index}>
                                    {item}
                                    {index !== parameter.parameter.length - 1
                                      ? ", "
                                      : ""}
                                  </span>
                                ))}
                              </h6>
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
};

export default Parameter;
