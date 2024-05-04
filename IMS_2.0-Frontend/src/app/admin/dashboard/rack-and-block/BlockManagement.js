"use client";
import Image from "next/image";
import saveIcon from "../../../../../public/images/rolecreate/saveicon.png";
import search from "../../../../../public/images/rolecreate/search.png";
import importicon from "../../../../../public/images/rolecreate/import.png";
import exporticon from "../../../../../public/images/rolecreate/export.png";
import deleteicon from "../../../../../public/images/rolecreate/delete.png";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import Pagination from "@/reusable/Pagination";
import edit from "../../../../../public/images/rolecreate/edit.png";
import { communication } from "@/apis/communication";
import Swal from "sweetalert2";
import FileSaver from "file-saver";
import { useRouter } from "next/navigation";
import Multiselect from "multiselect-react-dropdown";
import Loader from "@/reusable/Loader";
const pageLimit = process.env.NEXT_PUBLIC_LIMIT ?? 20;

const BlockManagement = (props) => {
  const fileInputRef = useRef(null);
  const router = useRouter();

  const [searchString, setSearchString] = useState("");
  const [blockList, setBlockList] = useState([]);
  const [rackList, setRackList] = useState([]);

  const [timeoutId, setTimeoutId] = useState();

  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [selectedCheckboxes, setSelectedCheckboxes] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [isPageUpdated, setIsPageUpdated] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [page, setPage] = useState(1);
  const [locations, setLocations] = useState([]);
  const [selectedOption, setSelectedOption] = useState("");
  const [propertyType, setPropertyType] = useState([]);

  const [checkedStatus, setCheckedStatus] = useState({});
  const [errorForRackFlag, setErrorRackFlag] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  async function changeUserStatus(e, blockId, isActive) {
    Swal.fire({
      text: `Are you sure you want to ${
        isActive ? "disable" : "enable"
      } block?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#5149E4",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      reverseButtons: true,
    }).then(async function (result) {
      if (result.isConfirmed) {
        try {
          props.setLoader(true);

          let response = await communication.changeBlockStatus({
            blockId: blockId,
          });
          if (response?.data?.status === "SUCCESS") {
            Swal.fire({ text: response.data.message, icon: "success" });
            setCheckedStatus((prevStatus) => ({
              ...prevStatus,
              [blockId]: true,
            }));
            getBlockList(page, searchString);
          } else if (response?.data?.status === "JWT_INVALID") {
            Swal.fire({ text: response.data.message, icon: "warning" });
            router.push("/");
          } else {
            Swal.fire({ text: response.data.message, icon: "warning" });
          }
        } catch (error) {
          Swal.fire({ text: error.message, icon: "warning" });
        } finally {
          props.setLoader(false);
        }
      } else {
        return;
      }
    });
  }
  const CheckboxChange = (event) => {
    setSelectedOption(event.target.value);
    setErrorRackFlag("");
  };
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
      e.target.checked ? blockList.map((userDetails) => userDetails._id) : []
    );
  };

  const onSubmit = async (values) => {
    let rackIds = values.rackNo ? values.rackNo : "";
    if (selectedOption == "") {
      setErrorRackFlag("Please confirm one");
      return;
    }
    try {
      let payload = {
        locationId: values.locationId,
        blockNo: values.blockNo,
        isRackAdded: selectedOption === "Yes" ? true : false,
        rackId: [...propertyType],
      };
      if (rackIds) {
        payload.rackId = [rackIds];
      }
      props.setLoader(true);
      const serverResponse = await communication.createBlock(payload);
      if (serverResponse?.data?.status === "SUCCESS") {
        Swal.fire({ text: serverResponse.data.message, icon: "success" });
        getBlockList(currentPage, searchString);
        setErrorRackFlag("");
        setSelectedOption("");
        setPropertyType([]);
        reset();
      } else if (serverResponse?.data?.status === "JWT_INVALID") {
        Swal.fire({ text: serverResponse.data.message, icon: "warning" });
        router.push("/");
      } else {
        Swal.fire({ text: serverResponse.data.message, icon: "warning" });
      }
      props.setLoader(false);
    } catch (error) {
      Swal.fire({
        text: error?.response?.data?.message || error.message,
        icon: "warning",
      });
      props.setLoader(false);
    }
  };
  async function getBlockList(page, searchString, isSearch = false) {
    try {
      props.setLoader(true);
      const serverResponse = await communication.getBlockList(
        page,
        searchString
      );
      if (serverResponse?.data?.status === "SUCCESS") {
        setBlockList(serverResponse?.data.block);
        setPageCount(serverResponse?.data?.totalPages);
        setPage(page);
        if (isSearch) {
          setCurrentPage(1);
        }
        const initialCheckedStatus = {};

        serverResponse?.data.block.forEach((block) => {
          initialCheckedStatus[block._id] = block.isActive || false;
        });
        setCheckedStatus(initialCheckedStatus);
      } else if (serverResponse?.data?.status === "JWT_INVALID") {
        Swal.fire({ text: serverResponse.data.message, icon: "warning" });
        router.push("/");
        props.setLoader(false);
      } else {
        setBlockList([]);
      }
      props.setLoader(false);
    } catch (error) {
      Swal.fire({
        text: error?.response?.data?.message || error.message,
        icon: "warning",
      });
      props.setLoader(false);
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
  const getExportBlock = async () => {
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
          const serverResponse = await communication.getExportBlock();
          if (serverResponse?.data) {
            const file = new Blob([serverResponse.data], {
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            FileSaver.saveAs(file, "Block.xlsx");
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
      formData.append("block", selectedFile);
      const serverResponse = await communication.importExcelBlockData(formData);
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
  const getActiveRack = async () => {
    try {
      props.setLoader(true);

      let response = await communication.getActiveRack();
      if (response?.data?.status === "SUCCESS") {
        setRackList(response?.data.rack);
      } else if (response?.data?.status === "JWT_INVALID") {
        Swal.fire({ text: response.data.message, icon: "warning" });
        router.push("/");
      } else {
        Swal.fire({ text: response.data.message, icon: "warning" });
      }
    } catch (error) {
      Swal.fire({ text: error.message, icon: "warning" });
    } finally {
      props.setLoader(false);
    }
  };
  const deleteBlock = async () => {
    if (selectedCheckboxes.length > 0) {
      Swal.fire({
        text: "Are you sure you want to delete this block?",
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
            props.setLoader(true);
            let payload = {
              blockIds: [...selectedCheckboxes],
            };
            let response = await communication.deleteBlock(payload);
            if (response?.data?.status === "SUCCESS") {
              Swal.fire({ text: response.data.message, icon: "success" });
              await getBlockList(currentPage, searchString);
            } else if (response?.data?.status === "JWT_INVALID") {
              Swal.fire({ text: response.data.message, icon: "warning" });
              router.push("/");
            } else {
              Swal.fire({ text: response.data.message, icon: "warning" });
            }
          } catch (error) {
            Swal.fire({ text: error.message, icon: "warning" });
          } finally {
            props.setLoader(false);
          }
        } else {
        }
      });
    } else {
      Swal.fire({
        text: "Please select which block you want to delete",
        icon: "warning",
      });
    }
  };
  async function getLocations() {
    try {
      props.setLoader(true);
      const serverResponse = await communication.getLocations();
      if (serverResponse?.data?.status === "SUCCESS") {
        setLocations(serverResponse?.data?.result);
      } else if (serverResponse?.data?.status === "JWT_INVALID") {
        Swal.fire({ text: serverResponse.data.message, icon: "warning" });
        router.push("/");
        props.setLoader(false);
      } else {
        setLocations([]);
      }
      props.setLoader(false);
    } catch (error) {
      Swal.fire({
        text: error?.response?.data?.message || error.message,
        icon: "warning",
      });
      props.setLoader(false);
    }
  }
  const handleSearch = (e) => {
    setSearchString(e.target.value);
    let isSearch = true;
    clearTimeout(timeoutId);
    let _timeOutId = setTimeout(() => {
      getBlockList("1", e.target.value, isSearch);
    }, 2000);
    setTimeoutId(_timeOutId);
  };
  useEffect(() => {
    getLocations();
  }, []);
  useEffect(() => {
    getBlockList(currentPage, searchString);
  }, [isPageUpdated]);

  useEffect(() => {
    if (selectedOption === "Yes") {
      getActiveRack();
    }
  }, [selectedOption]);
  return (
    <>
      <div style={{ width: "49%" }}>
        <div className="form_view" id="form_part1" style={{ width: "100%" }}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            style={{ height: "55%", overflowY: "unset" }}
          >
            <div className="form_title">
              <h5>Create Block</h5>
            </div>
            <div className="row m-0 mt-3 mb-3 ms-md-3 ">
              <div className="block_label col-lg-2 col-md-2 col-sm-4  d-flex align-items-center">
                <h6>Location Name</h6>
              </div>
              <div className="col-lg-4 col-md-4 col-sm-8 p-0 ">
                <select
                  {...register("locationId", {
                    required: "Location is required",
                  })}
                  className="selectBox text-capitalize"
                >
                  <option value="">Select Location</option>
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
              <div className="block_label col-lg-2 col-md-2 col-sm-4 p-0 d-flex align-items-center">
                <h6>Block Name</h6>
              </div>
              <div className="col-lg-4 col-md-2 col-sm-8 p-0 ">
                <input
                  style={{ width: "130px" }}
                  type="text"
                  {...register("blockNo", {
                    required: "Block is required",
                  })}
                  className="inputBox"
                />
                <div style={{ height: "5px" }}>
                  {errors.blockNo && (
                    <p
                      className="text-danger text-start"
                      style={{ fontSize: "0.8rem" }}
                    >
                      {errors.blockNo.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="row m-0 mt-3 mb-3 ms-md-3 ">
              <div className="col-lg-2 col-md-2 col-sm-4 d-flex align-items-center">
                <h6>Want Add Rack</h6>
              </div>
              <div className="col-lg-4 col-md-4 col-sm-8 p-0">
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
              {selectedOption === "Yes" && (
                <>
                  <div className="col-lg-2 col-md-2 col-sm-4 p-0 d-flex align-items-center">
                    <h6>Rack Select</h6>
                  </div>
                  <div className="col-lg-4 col-md-4 col-sm-8 p-0">
                    <Multiselect
                      isObject={false}
                      options={rackList.map((rackData) => rackData.rackNo)}
                      onSelect={(selectedList) => {
                        const selectedIds = selectedList.map(
                          (selectedRackNo) => {
                            const selectedRack = rackList.find(
                              (rackData) => rackData.rackNo === selectedRackNo
                            );
                            return selectedRack ? selectedRack._id : null;
                          }
                        );

                        setPropertyType(selectedIds);
                      }}
                      onRemove={(selectedList) => {
                        const selectedIds = selectedList.map(
                          (selectedRackNo) => {
                            const selectedRack = rackList.find(
                              (rackData) => rackData.rackNo === selectedRackNo
                            );
                            return selectedRack ? selectedRack._id : null;
                          }
                        );

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
                        <p
                          className="text-danger text-start"
                          style={{ fontSize: "0.8rem" }}
                        >
                          {errors.rackNo.message}
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="row m-0 mt-3 mb-3  ">
              <div className="col-lg-2 col-md-3 d-flex align-items-center"></div>
              <div className="col-lg-3 col-md-3">
                <button className="savebtn mb-1" type="submit">
                  <Image alt="" src={saveIcon}></Image>Save
                </button>
              </div>
            </div>
          </form>
        </div>
        <div className="table_view table_viewPart" style={{ width: "100%" }}>
          <div className="d-flex justify-content-between pt-3 pb-3 ">
            <div className="border border-3 border-solid border-color-#bababa ps-1 me-1 d-flex align-items-center">
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
                className="searchInput ps-2"
              />
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
                onClick={getExportBlock}
                className="savebtn mb-1"
                type="submit"
              >
                <Image alt="" src={exporticon}></Image>Export Data
              </button>
              <button
                onClick={deleteBlock}
                className="savebtn mb-1"
                type="submit"
              >
                <Image alt="" src={deleteicon}></Image>Delete
              </button>
            </div>
          </div>
          <div className="table_wrapper">
            <div className="table_main">
              <div className="table_container_rack">
                <div className="table_header">
                  <div className="checkbox_wrapper">
                    <input
                      type="checkbox"
                      id="selectAllCheckbox"
                      onChange={(e) => handleSelectAllChange(e)}
                      checked={selectAllChecked}
                    />{" "}
                  </div>
                  <div className="on_off_switch">
                    <h5>Off/On</h5>
                  </div>
                  <div className="edit">
                    <h5>Edit</h5>
                  </div>
                  <div className="sr_no">
                    <h5>Sr. No.</h5>
                  </div>
                  <div className="location_name">
                    <h5>Location Name</h5>
                  </div>
                  <div className="block_name">
                    <h5>Block Name</h5>
                  </div>
                  <div className="rack_name">
                    <h5>Rack Number</h5>
                  </div>
                </div>
                <div className="table_data_wrapper" style={{ height: "45dvh" }}>
                  {blockList?.length > 0 ? (
                    <>
                      {blockList?.map((blockDetails, index) => (
                        <div className="table_data" key={index}>
                          <div className="checkbox_wrapper">
                            <input
                              // className={`${
                              //   blockDetails.isActive ? "cursor-pointer" : "cursor-not-allowed"
                              // }`}
                              type="checkbox"
                              id={blockDetails._id}
                              onChange={(e) => handleCheckboxChange(e)}
                              checked={selectedCheckboxes.includes(
                                blockDetails._id
                              )}
                              // disabled={!blockDetails.isActive}
                            />{" "}
                          </div>
                          <div className="on_off_switch ">
                            <div className="form-check form-switch ms-3">
                              <input
                                class="form-check-input cursor-pointer"
                                type="checkbox"
                                checked={
                                  checkedStatus[blockDetails._id] || false
                                }
                                id={`toggleSwitch${blockDetails._id}`}
                                onChange={(event) =>
                                  changeUserStatus(
                                    event,
                                    blockDetails._id,
                                    blockDetails.isActive
                                  )
                                }
                                style={{ width: "35px", height: "15px" }}
                              />
                            </div>
                          </div>
                          <div className="edit">
                            <Image
                              title={`${blockDetails.isActive ? "Update" : ""}`}
                              className={`${
                                blockDetails.isActive
                                  ? "cursor-pointer"
                                  : "cursor-not-allowed"
                              }`}
                              onClick={() => {
                                if (blockDetails.isActive) {
                                  router.push(
                                    `/admin/dashboard/rack-and-block/update-block?blockId=${blockDetails._id}`
                                  );
                                }
                              }}
                              src={edit}
                              alt="edit-icon"
                            />
                          </div>
                          <div className="sr_no">
                            <h6>
                              {Number(pageLimit) * (page - 1) + (index + 1)}
                            </h6>
                          </div>
                          <div className="location_name">
                            <h6>{blockDetails.location}</h6>
                          </div>
                          <div className="block_name">
                            <h6>{blockDetails.blockNo}</h6>
                          </div>
                          {/* <div className="rack_name">
                            {blockDetails.rackNo.length > 0 ? (
                              <>
                                {blockDetails.rackNo.map((item, index) => (
                                  <h6 key={index}>{item + ","}</h6>
                                ))}
                              </>
                            ) : (
                              <h6>-</h6>
                            )}
                            
                          </div> */}
                          <div className="rack_name">
                            {blockDetails.rackNo.length > 0 ? (
                              <>
                                {blockDetails.rackNo.map((item, index) => (
                                  <React.Fragment key={index}>
                                    <h6>{item}</h6>
                                    {index !==
                                      blockDetails.rackNo.length - 1 && (
                                      <span>, </span>
                                    )}
                                  </React.Fragment>
                                ))}
                              </>
                            ) : (
                              <h6>-</h6>
                            )}
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
    </>
  );
};

export default BlockManagement;
