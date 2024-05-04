"use client";
import Image from "next/image";
import saveIcon from "../../../../../public/images/rolecreate/saveicon.png";
import search from "../../../../../public/images/rolecreate/search.png";
import importicon from "../../../../../public/images/rolecreate/import.png";
import exporticon from "../../../../../public/images/rolecreate/export.png";
import deleteicon from "../../../../../public/images/rolecreate/delete.png";
import edit from "../../../../../public/images/rolecreate/edit.png";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import Pagination from "@/reusable/Pagination";
import Swal from "sweetalert2";
import { communication } from "@/apis/communication";
import { useRouter } from "next/navigation";
import FileSaver from "file-saver";
import Loader from "@/reusable/Loader";

const CategoryCreate = () => {
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [searchString, setSearchString] = useState("");
  const [categoryList, setCategoryList] = useState([]);
  const [timeoutId, setTimeoutId] = useState();

  const [loader, setLoader] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isPageUpdated, setIsPageUpdated] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [page, setPage] = useState(1);
  const pageLimit = process.env.NEXT_PUBLIC_LIMIT ?? 20;

  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [selectedCheckboxes, setSelectedCheckboxes] = useState([]);

  const [errorForRackFlag, setErrorRackFlag] = useState("");
  const [selectedOption, setSelectedOption] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const handleCheckboxChange = (e) => {
    const checkboxId = e.target.id;

    setSelectedCheckboxes((prevSelected) => {
      if (prevSelected.includes(checkboxId)) {
        // If the checkbox is already in the array, remove it
        return prevSelected.filter((id) => id !== checkboxId);
      } else {
        // If the checkbox is not in the array, add it
        return [...prevSelected, checkboxId];
      }
    });
  };

  const handleSelectAllChange = (e) => {
    setSelectAllChecked(e.target.checked);

    // Update the array of selected checkboxes based on the "Select All" checkbox
    setSelectedCheckboxes((prevSelected) =>
      e.target.checked
        ? categoryList.map((categoryDetails) => categoryDetails._id)
        : []
    );
  };

  const onSubmit = async (values) => {
    if (selectedOption == "") {
      setErrorRackFlag("Please confirm one");
      return;
    }
    try {
      let payload = {
        name: values.category,
        // isReplaceable: selectedOption === "Yes" ? true : false,
        isReplaceable: selectedOption === "Yes" ? true : false,
      };
      setLoader(true);
      const serverResponse = await communication.createCategory(payload);
      if (serverResponse?.data?.status === "SUCCESS") {
        Swal.fire({ text: serverResponse.data.message, icon: "success" });
        setSelectedOption("");
        setErrorRackFlag("");
        reset();
        await getAllCategory(currentPage, searchString);
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
  };

  const deleteCategory = async () => {
    if (selectedCheckboxes.length > 0) {
      Swal.fire({
        text: "Are you sure you want to delete this category?",
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
              categoryIds: [...selectedCheckboxes],
            };
            let response = await communication.deleteCategory(payload);
            if (response?.data?.status === "SUCCESS") {
              Swal.fire({ text: response.data.message, icon: "success" });
              await getAllCategory(currentPage, searchString);
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
        text: "Please select which category you want to delete",
        icon: "warning",
      });
    }
  };

  //get Role list on initial Load
  async function getAllCategory(page, searchString, isSearch = false) {
    try {
      setLoader(true);
      const serverResponse = await communication.getAllCategory(
        page,
        searchString
      );
      if (serverResponse?.data?.status === "SUCCESS") {
        setCategoryList(serverResponse?.data.category);
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
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];

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
  const getExportCategory = async () => {
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
          const serverResponse = await communication.getExportCategory();
          //Create a Blob from the PDF Stream
          if (serverResponse?.data) {
            const file = new Blob([serverResponse.data], {
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            FileSaver.saveAs(file, "category.xlsx");
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
      formData.append("category", selectedFile);
      const serverResponse = await communication.importExcelCategoryData(
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
  const handleSearch = (e) => {
    setSearchString(e.target.value);
    let isSearch = true;
    clearTimeout(timeoutId);
    let _timeOutId = setTimeout(() => {
      getAllCategory("1", e.target.value, isSearch);
    }, 2000);
    setTimeoutId(_timeOutId);
  };
  useEffect(() => {
    getAllCategory(currentPage, searchString);
  }, [isPageUpdated]);

  const CheckboxChange = (event) => {
    setSelectedOption(event.target.value);
    setErrorRackFlag("");
  };
  return (
    <>
      {false ? (
        <Loader />
      ) : (
        <div style={{ width: "49%" }}>
          <div className="form_view" id="form_part1" style={{ width: "100%" }}>
            <form onSubmit={handleSubmit(onSubmit)} style={{ height: "55%" }}>
              <div className="form_title">
                <h5>Create Category</h5>
              </div>
              <div className="row m-0 mt-3 mb-3  ">
                <div className="col-lg-3 col-md-3  d-flex align-items-center">
                  <h6>Category Name</h6>
                </div>
                <div className="col-lg-4 col-md-4">
                  <div>
                    <input
                      type="text"
                      {...register("category", {
                        required: "Category is required",
                      })}
                      className="inputBox"
                    />
                    <div style={{ height: "5px" }}>
                      {errors.category && (
                        <p
                          className="text-danger text-start"
                          style={{ fontSize: "0.8rem" }}
                        >
                          {errors.category.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="row m-0 mt-3 mb-3  ">
                <div className="col-lg-3 col-md-3  d-flex align-items-center">
                  <h6>Add to this category</h6>
                </div>
                <div className="col-lg-4 col-md-4 col-sm-8 p-0 ms-3">
                  <div className="d-flex gap-3">
                    <label className="cursor-pointer">
                      <input
                        className="cursor-pointer"
                        type="checkbox"
                        value="Yes"
                        checked={selectedOption === "Yes"}
                        onChange={CheckboxChange}
                      />
                      &nbsp; Yes
                    </label>
                    <label className="cursor-pointer">
                      <input
                        className="cursor-pointer"
                        type="checkbox"
                        value="No"
                        checked={selectedOption === "No"}
                        onChange={CheckboxChange}
                      />
                      &nbsp; No
                    </label>
                  </div>
                  <div style={{ height: "5px" }}>
                    {errorForRackFlag && (
                      <p
                        className="text-danger text-start"
                        style={{ fontSize: "0.8rem" }}
                      >
                        {errorForRackFlag}
                      </p>
                    )}
                  </div>
                </div>
                {/* {selectedOption === "Yes" && (
                  <>
                    <div className="col-lg-2 col-md-2 col-sm-4 p-0 d-flex align-items-center">
                      <h6>Rack Select</h6>
                    </div>
                    <div className="col-lg-4 col-md-4 col-sm-8 p-0">
                      <Multiselect
                        isObject={false}
                        options={props?.rackList.map((rackData) => rackData.rackNo)}
                        onSelect={(selectedList) => {
                          const selectedIds = selectedList.map((selectedRackNo) => {
                            const selectedRack = props?.rackList.find(
                              (rackData) => rackData.rackNo === selectedRackNo
                            );
                            return selectedRack ? selectedRack._id : null;
                          });

                          setPropertyType(selectedIds);
                        }}
                        onRemove={(selectedList) => {
                          const selectedIds = selectedList.map((selectedRackNo) => {
                            const selectedRack = props?.rackList.find(
                              (rackData) => rackData.rackNo === selectedRackNo
                            );
                            return selectedRack ? selectedRack._id : null;
                          });

                          setPropertyType(selectedIds);
                        }}
                        keepSearchTerm={true}
                        showCheckbox={true}
                        showArrow
                        // customArrow
                        // className=" inputBox p-0 w-75"
                        rules={{ required: "Rack no is required" }}
                        style={{
                          multiselectContainer: {
                            width: "120px",
                            // width: "auto",
                            position: "absolute",
                            border: "1px solid #929292",
                            background: "#fff",
                            height: "30px",
                            // overflowX: "hidden",
                          },
                          inputField: {
                            // To change input field position or margin
                            marginTop: "0",
                            marginRight: "2px",
                            marginBottom: "5px",
                          },
                          chips: {
                            background: "blue",
                          },
                          optionContainer: {
                            border: "1px solid #929292",
                            height: "130px",
                            scrollbarWidth: "thin",
                          },
                          option: {
                            color: "black",
                            background: "none",
                          },
                          searchBox: {
                            border: "black",
                            fontSize: "15px",
                            height: "40px",
                            width: "auto",
                            overflowX: "scroll",
                            scrollbarWidth: "none",
                            display: "flex",
                          },
                        }}
                        // style={{
                        //   position: "absolute",
                        //   zIndex: 9999, // Adjust the z-index value based on your layout
                        //   top: "100%", // Position the dropdown below the input box
                        //   left: 0, // Align with the left edge of the input box
                        //   width: "100%", // Set the width to match the input box or adjust as needed
                        // }}
                      />

                      <div style={{ height: "5px" }}>
                        {errors.rackNo && (
                          <p className="text-danger text-start" style={{ fontSize: "0.8rem" }}>
                            {errors.rackNo.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                )} */}
              </div>

              <div className="row m-0 mt-3 mb-3  ">
                <div className="col-lg-3 col-md-3  d-flex align-items-center"></div>
                <div className="col-lg-3 col-md-3">
                  <button className="savebtn mb-1" type="submit">
                    <Image alt="" src={saveIcon}></Image>Save
                  </button>
                </div>
              </div>
            </form>
          </div>
          <div className="table_view table_viewPart" style={{ width: "100%" }}>
            <div className="d-flex justify-content-between pt-3 pb-3">
              <div className="border border-3 border-solid border-color-#bababa ps-1 d-flex align-items-center">
                <Image alt="" src={search}></Image>
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
                  className="ps-2 searchInput"
                />
                {/* <button className="savebtn mb-1" onClick={() => getRoleList(1, searchString)}>Search</button> */}
              </div>
              <div className="d-flex gap-2 ps-1" style={{ fontSize: "10px" }}>
                {/* <div>
                  <input
                    type="file"
                    name="file"
                    onChange={handleFileChange}
                    id="file"
                    style={{ display: "none" }}
                    ref={fileInputRef}
                  />
                  <label
                    htmlFor="file"
                    className="savebtn mb-1 cursor-pointer"
                    type="button"
                  >
                    <Image alt="" src={importicon}></Image>
                    Import
                  </label>
                </div> */}
                <button
                  onClick={getExportCategory}
                  className="savebtn mb-1"
                  type="submit"
                >
                  <Image alt="" src={exporticon}></Image>Export Data
                </button>
                <button
                  className="savebtn mb-1"
                  onClick={deleteCategory}
                  type="submit"
                >
                  <Image alt="" src={deleteicon}></Image>Delete
                </button>
              </div>
            </div>
            <div className="table_wrapper">
              <div className="table_main">
                <div className="table_container_category">
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
                    <div className="category">
                      <h5>Category</h5>
                    </div>
                  </div>
                  <div
                    className="table_data_wrapper"
                    style={{ height: "50dvh" }}
                  >
                    {categoryList?.length > 0 ? (
                      <>
                        {categoryList?.map((category, index) => (
                          <div className="table_data" key={index}>
                            <div className="checkbox_wrapper">
                              <input
                                type="checkbox"
                                id={category._id}
                                onChange={(e) => handleCheckboxChange(e)}
                                checked={selectedCheckboxes.includes(
                                  category._id
                                )}
                              />
                            </div>
                            <div
                              onClick={() =>
                                router.push(
                                  `/admin/dashboard/category-brand/update-category?categoryId=${category._id}`
                                )
                              }
                              className="edit cursor-pointer"
                            >
                              <Image
                                title="Update"
                                src={edit}
                                alt="edit-icon"
                              />
                            </div>

                            <div className="sr_no">
                              <h6>
                                {Number(pageLimit) * (page - 1) + (index + 1)}
                              </h6>
                            </div>
                            <div className="category">
                              <h6>{category?.name}</h6>
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
        </div>
      )}
    </>
  );
};

export default CategoryCreate;
