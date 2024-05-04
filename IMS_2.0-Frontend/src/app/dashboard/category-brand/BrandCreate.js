"use client";
import Image from "next/image";
import saveIcon from "../../../../../public/images/rolecreate/saveicon.png";
import search from "../../../../../public/images/rolecreate/search.png";
import importicon from "../../../../../public/images/rolecreate/import.png";
import exporticon from "../../../../../public/images/rolecreate/export.png";
import deleteicon from "../../../../../public/images/rolecreate/delete.png";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import Pagination from "@/reusable/Pagination";
import { communication } from "@/apis/communication";
import Swal from "sweetalert2";
import edit from "../../../../../public/images/rolecreate/edit.png";
import { useRouter } from "next/navigation";
import FileSaver from "file-saver";
import Loader from "@/reusable/Loader";

const BrandCreate = () => {
  const [searchString, setSearchString] = useState("");
  const [timeoutId, setTimeoutId] = useState();
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [loader, setLoader] = useState(false);
  const [brand, setBrandList] = useState([]);
  const pageLimit = process.env.NEXT_PUBLIC_LIMIT ?? 20;
  const [page, setPage] = useState(1);

  const [currentPage, setCurrentPage] = useState(1);
  const [isPageUpdated, setIsPageUpdated] = useState(false);
  const [pageCount, setPageCount] = useState(0);

  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [selectedCheckboxes, setSelectedCheckboxes] = useState([]);

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
      e.target.checked ? brand.map((brandDetails) => brandDetails._id) : []
    );
  };

  const onSubmit = async (values) => {
    try {
      let payload = {
        name: values.brand,
      };
      setLoader(true);
      const serverResponse = await communication.createBrand(payload);
      if (serverResponse?.data?.status === "SUCCESS") {
        Swal.fire({ text: serverResponse.data.message, icon: "success" });
        reset();
        await getAllBrand(currentPage, searchString);
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

  const deleteBrand = async () => {
    if (selectedCheckboxes.length > 0) {
      Swal.fire({
        text: "Are you sure you want to delete this brand?",
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
              brandIds: [...selectedCheckboxes],
            };
            let response = await communication.deleteBrand(payload);
            if (response?.data?.status === "SUCCESS") {
              Swal.fire({ text: response.data.message, icon: "success" });
              await getAllBrand(currentPage, searchString);
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
        text: "Please select which brand you want to delete",
        icon: "warning",
      });
    }
  };

  //get Brand list on initial Load
  async function getAllBrand(page, searchString, isSearch = false) {
    try {
      setLoader(true);
      const serverResponse = await communication.getAllBrand(
        page,
        searchString
      );
      if (serverResponse?.data?.status === "SUCCESS") {
        setBrandList(serverResponse?.data.brand);
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
        setBrandList([]);
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
  const getExportBrand = async () => {
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
          const serverResponse = await communication.getExportBrand();
          if (serverResponse?.data) {
            const file = new Blob([serverResponse.data], {
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            FileSaver.saveAs(file, "Brand.xlsx");
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
    const formData = new FormData();
    formData.append("brand", selectedFile);
    try {
      const serverResponse = await communication.importExcelBrandData(formData);
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
      getAllBrand("1", e.target.value, isSearch);
    }, 2000);
    setTimeoutId(_timeOutId);
  };
  useEffect(() => {
    getAllBrand(currentPage, searchString);
  }, [isPageUpdated]);
  return (
    <>
      {false ? (
        <Loader />
      ) : (
        <div style={{ width: "49%" }}>
          {" "}
          <div className="form_view" id="form_part1" style={{ width: "100%" }}>
            <form onSubmit={handleSubmit(onSubmit)} style={{ height: "55%" }}>
              <div className="form_title">
                <h5>Create Brand</h5>
              </div>
              <div className="row m-0 mt-3 mb-3  ">
                <div className="col-lg-3 col-md-3  d-flex align-items-center">
                  <h6>Brand Name</h6>
                </div>
                <div className="col-lg-4 col-md-4">
                  <input
                    type="text"
                    {...register("brand", {
                      required: "Brand name is required",
                    })}
                    className="inputBox"
                  />
                  <div style={{ height: "5px" }}>
                    {errors.brand && (
                      <p
                        className="text-danger text-start"
                        style={{ fontSize: "0.8rem" }}
                      >
                        {errors.brand.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="row m-0 mt-3 mb-3">
                <div className="col-lg-3 col-md-3  d-flex align-items-center"></div>
                <div className="col-lg-3 col-md-3">
                  <button className="savebtn mb-1" type="submit">
                    <Image alt="" src={saveIcon}></Image>Save
                  </button>
                </div>
              </div>
            </form>
          </div>
          <div
            className="table_view table_viewPart"
            style={{ width: "100%", marginTop: "35px" }}
          >
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
                  <label htmlFor="file" className="savebtn mb-1 cursor-pointer" type="button">
                    <Image alt="" src={importicon}></Image>
                    Import
                  </label>
                </div> */}
                <button
                  onClick={getExportBrand}
                  className="savebtn mb-1"
                  type="button"
                >
                  <Image alt="" src={exporticon}></Image>Export Data
                </button>
                <button
                  className="savebtn mb-1"
                  type="button"
                  onClick={deleteBrand}
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
                    <div className="brand_name">
                      <h5>Brand Name</h5>
                    </div>
                  </div>
                  <div
                    className="table_data_wrapper"
                    // style={{ height: "50dvh" }}
                  >
                    {brand?.length > 0 ? (
                      <>
                        {brand?.map((brandDetails, index) => (
                          <div className="table_data" key={index}>
                            <div className="checkbox_wrapper">
                              <input
                                type="checkbox"
                                id={brandDetails._id}
                                onChange={(e) => handleCheckboxChange(e)}
                                checked={selectedCheckboxes.includes(
                                  brandDetails._id
                                )}
                              />
                            </div>
                            <div
                              onClick={() =>
                                router.push(
                                  `/admin/dashboard/category-brand/update-brand?brandId=${brandDetails._id}`
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
                            <div className="brand_name">
                              <h6>{brandDetails?.name}</h6>
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

export default BrandCreate;
