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
const pageLimit = process.env.NEXT_PUBLIC_LIMIT ?? 20;

const RackManagement = (props) => {
  const fileInputRef = useRef(null);
  const router = useRouter();

  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [selectedCheckboxes, setSelectedCheckboxes] = useState([]);

  const [searchString, setSearchString] = useState("");
  const [rackList, setRackList] = useState([]);
  const [timeoutId, setTimeoutId] = useState();

  const [currentPage, setCurrentPage] = useState(1);
  const [isPageUpdated, setIsPageUpdated] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [page, setPage] = useState(1);

  const [checkedStatus, setCheckedStatus] = useState({});

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
        return prevSelected.filter((id) => id !== checkboxId);
      } else {
        return [...prevSelected, checkboxId];
      }
    });
  };

  const handleSelectAllChange = (e) => {
    setSelectAllChecked(e.target.checked);

    setSelectedCheckboxes((prevSelected) =>
      e.target.checked ? rackList.map((rack) => rack._id) : []
    );
  };

  const deleteRack = async () => {
    if (selectedCheckboxes.length > 0) {
      Swal.fire({
        text: "Are you sure you want to delete this rack?",
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
            props.setLoader((prevState) => prevState + 1);
            let payload = {
              rackIds: [...selectedCheckboxes],
            };
            let response = await communication.deleteRack(payload);
            if (response?.data?.status === "SUCCESS") {
              Swal.fire({ text: response.data.message, icon: "success" });
              await getRackList(currentPage, searchString);
            } else if (response?.data?.status === "JWT_INVALID") {
              Swal.fire({ text: response.data.message, icon: "warning" });
              router.push("/");
            } else {
              Swal.fire({ text: response.data.message, icon: "warning" });
            }
          } catch (error) {
            Swal.fire({ text: error.message, icon: "warning" });
          } finally {
            props.setLoader((prevState) => prevState - 1);
          }
        } else {
        }
      });
    } else {
      Swal.fire({
        text: "Please select which rack you want to delete",
        icon: "warning",
      });
    }
  };
  async function changeRackStatus(e, rackId, isActive) {
    Swal.fire({
      text: `Are you sure you want to ${isActive ? "disable" : "enable"} rack?`,
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
          props.setLoader((prevState) => prevState + 1);

          let response = await communication.changeRackStatus({
            rackId: rackId,
          });
          if (response?.data?.status === "SUCCESS") {
            Swal.fire({ text: response.data.message, icon: "success" });
            setCheckedStatus((prevStatus) => ({
              ...prevStatus,
              [rackId]: true,
            }));
            getRackList(page, searchString);
            props?.getActiveRack();
          } else if (response?.data?.status === "JWT_INVALID") {
            Swal.fire({ text: response.data.message, icon: "warning" });
            router.push("/");
          } else {
            Swal.fire({ text: response.data.message, icon: "warning" });
          }
        } catch (error) {
          Swal.fire({ text: error.message, icon: "warning" });
        } finally {
          props.setLoader((prevState) => prevState - 1);
        }
      } else {
        return;
      }
    });
  }

  const onSubmit = async (values) => {
    try {
      let payload = {
        rackNo: Number(values.rackNo),
        partition: Number(values.partition),
      };
      props.setLoader((prevState) => prevState + 1);
      const serverResponse = await communication.createRack(payload);
      if (serverResponse?.data?.status === "SUCCESS") {
        Swal.fire({ text: serverResponse.data.message, icon: "success" });
        reset();
        await getRackList(currentPage, searchString);
      } else if (serverResponse?.data?.status === "JWT_INVALID") {
        Swal.fire({ text: serverResponse.data.message, icon: "warning" });
        router.push("/");
      } else {
        Swal.fire({ text: serverResponse.data.message, icon: "warning" });
      }
      props.setLoader((prevState) => prevState - 1);
    } catch (error) {
      Swal.fire({
        text: error?.response?.data?.message || error.message,
        icon: "warning",
      });
      props.setLoader((prevState) => prevState - 1);
    }
  };
  //get Role list on initial Load
  async function getRackList(page, searchString, isSearch = false) {
    try {
      props.setLoader((prevState) => prevState + 1);
      const serverResponse = await communication.getRackList(
        page,
        searchString
      );
      if (serverResponse?.data?.status === "SUCCESS") {
        setRackList(serverResponse?.data.rack);
        setPageCount(serverResponse?.data?.totalPages);
        setPage(page);
        if (isSearch) {
          setCurrentPage(1);
        }
        const initialCheckedStatus = {};

        serverResponse?.data.rack.forEach((rack) => {
          initialCheckedStatus[rack._id] = rack.isActive || false;
        });
        setCheckedStatus(initialCheckedStatus);
      } else if (serverResponse?.data?.status === "JWT_INVALID") {
        Swal.fire({ text: serverResponse.data.message, icon: "warning" });
        router.push("/");
        props.setLoader((prevState) => prevState - 1);
      } else {
        setRackList([]);
      }
      props.setLoader((prevState) => prevState - 1);
    } catch (error) {
      Swal.fire({
        text: error?.response?.data?.message || error.message,
        icon: "warning",
      });
      props.setLoader((prevState) => prevState - 1);
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
  const getExportRack = async () => {
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
          const serverResponse = await communication.getExportRack();
          //Create a Blob from the PDF Stream
          if (serverResponse?.data) {
            const file = new Blob([serverResponse.data], {
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            FileSaver.saveAs(file, "Rack.xlsx");
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
      formData.append("rack", selectedFile);
      const serverResponse = await communication.importExcelRackData(formData);
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
      getRackList("1", e.target.value, isSearch);
    }, 2000);
    setTimeoutId(_timeOutId);
  };
  useEffect(() => {
    getRackList(currentPage, searchString);
  }, [isPageUpdated]);
  return (
    <div style={{ width: "49%" }}>
      {" "}
      <div className="form_view" id="form_part1" style={{ width: "100%" }}>
        <form onSubmit={handleSubmit(onSubmit)} style={{ height: "55%" }}>
          <div className="form_title">
            <h5>Create Rack</h5>
          </div>
          <div className="row m-0 mt-3 mb-3 ms-md-3 rack_input">
            <div className="rack_label col-lg-2 col-md-2 col-sm-4 d-flex align-items-center">
              <h6>Rack No</h6>
            </div>
            <div className="col-lg-4 col-md-4 col-sm-8 p-0">
              <input
                style={{ width: "130px" }}
                type="text"
                {...register("rackNo", {
                  required: "Rack No is required",
                  pattern: {
                    value: /^[0-9]+$/,
                    message: "It should number only.",
                  },
                })}
                className="inputBox"
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
            <div className="rack_label col-lg-2 col-md-2 col-sm-4 p-0 d-flex align-items-center ">
              <h6>No of Partition</h6>
            </div>
            <div className="col-lg-4 col-md-2 col-sm-8 p-0">
              <input
                style={{ width: "130px" }}
                type="text"
                {...register("partition", {
                  required: "Partition Count is required",
                  pattern: {
                    value: /^[0-9]+$/,
                    message: "It should number only.",
                  },
                })}
                className="inputBox"
              />
              <div style={{ height: "5px" }}>
                {errors.partition && (
                  <p
                    className="text-danger text-start"
                    style={{ fontSize: "0.8rem" }}
                  >
                    {errors.partition.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="row m-0 mt-3 mb-3 ms-3 ">
            <div className="col-lg-2 col-md-2 d-flex align-items-center"></div>
            <div className="col-lg-4 col-md-4 p-0">
              <button className="savebtn mb-1" type="submit">
                <Image alt="" src={saveIcon}></Image>Save
              </button>
            </div>
          </div>
        </form>
      </div>
      <div
        className="table_view table_viewPart"
        style={{ width: "100%", marginTop: "47px" }}
      >
        <div className="d-flex justify-content-between pt-3 pb-3 ">
          <div className="border border-3 border-solid border-color-#bababa ps-1 me-1  d-flex align-items-center">
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
              onClick={getExportRack}
              className="savebtn mb-1"
              type="button"
            >
              <Image alt="" src={exporticon}></Image>Export Data
            </button>
            <button onClick={deleteRack} className="savebtn mb-1" type="button">
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
                <div className="rack_no">
                  <h5>Rack Number</h5>
                </div>
                <div className="rack_partition">
                  <h5>Rack Partition</h5>
                </div>
              </div>
              <div className="table_data_wrapper" style={{ height: "52dvh" }}>
                {rackList?.length > 0 ? (
                  <>
                    {rackList?.map((rackList, index) => (
                      <div className="table_data" key={index}>
                        <div className="checkbox_wrapper">
                          <input
                            // className={`${
                            //   rackList.isActive ? "cursor-pointer" : "cursor-not-allowed"
                            // }`}
                            type="checkbox"
                            id={rackList._id}
                            onChange={(e) => handleCheckboxChange(e)}
                            checked={selectedCheckboxes.includes(rackList._id)}
                            // disabled={!rackList.isActive}
                          />{" "}
                        </div>

                        <div className="on_off_switch ">
                          <div className="form-check form-switch ms-3">
                            <input
                              class="form-check-input cursor-pointer"
                              type="checkbox"
                              checked={checkedStatus[rackList._id] || false}
                              id={`toggleSwitch${rackList._id}`}
                              onChange={(event) =>
                                changeRackStatus(
                                  event,
                                  rackList._id,
                                  rackList.isActive
                                )
                              }
                              style={{ width: "35px", height: "15px" }}
                            />
                          </div>
                        </div>

                        <div className="edit">
                          <Image
                            title={`${rackList.isActive ? "Update" : ""}`}
                            className={`${
                              rackList.isActive
                                ? "cursor-pointer"
                                : "cursor-not-allowed"
                            }`}
                            src={edit}
                            alt="edit-icon"
                            onClick={() => {
                              if (rackList.isActive) {
                                router.push(
                                  `/admin/dashboard/rack-and-block/update-rack?rackId=${rackList._id}`
                                );
                              }
                            }}
                          />
                        </div>
                        <div className="sr_no">
                          <h6>
                            {Number(pageLimit) * (page - 1) + (index + 1)}
                          </h6>
                        </div>
                        <div className="rack_no">
                          <h6>{rackList.rackNo}</h6>
                        </div>
                        <div className="rack_partition">
                          <h6>
                            {rackList.partitionArray.map((item, index) => (
                              <span key={index}>
                                {item.partitionName}
                                {index !== rackList.partitionArray.length - 1
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
    </div>
  );
};

export default RackManagement;
