"use client";
import { useForm } from "react-hook-form";
import saveIcon from "../../../../../public/images/rolecreate/saveicon.png";
import search from "../../../../../public/images/rolecreate/search.png";
import importicon from "../../../../../public/images/rolecreate/import.png";
import exporticon from "../../../../../public/images/rolecreate/export.png";
import deleteicon from "../../../../../public/images/rolecreate/delete.png";
import edit from "../../../../../public/images/rolecreate/edit.png";
import Image from "next/image";
import { communication } from "@/apis/communication";
import { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import Loader from "@/reusable/Loader";
import { useRouter } from "next/navigation";
import Pagination from "@/reusable/Pagination";
import FileSaver from "file-saver";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft } from "@fortawesome/free-solid-svg-icons";
const pageLimit = process.env.NEXT_PUBLIC_LIMIT ?? 20;

export default function Location() {
  const [location, setlocation] = useState([]);
  const [loader, setLoader] = useState(false);
  const [locationId, setLocationId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchString, setSearchString] = useState("");
  const [pageCount, setPageCount] = useState(0);
  const [page, setPage] = useState(1);
  const [isUpdate, setIsUpdate] = useState(false);
  const [checkedStatus, setCheckedStatus] = useState({});
  const [isPageUpdated, setIsPageUpdated] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm();
  const onSubmit = async (values) => {
    let payload = {
      name: values?.location,
    };
    const serverResponse = await communication.createLocation(payload);
    if (serverResponse?.data?.status === "SUCCESS") {
      reset();
      getLocation(currentPage, searchString);
      Swal.fire({ text: serverResponse.data.message, icon: "success" });
    } else if (serverResponse?.data?.status === "JWT_INVALID") {
      Swal.fire({ text: serverResponse.data.message, icon: "warning" });
      router.push("/");
    } else {
      Swal.fire({ text: serverResponse.data.message, icon: "warning" });
    }
  };
  async function getLocation(page) {
    const serverResponse = await communication.getLocationList(page);
    if (serverResponse?.data?.status === "SUCCESS") {
      setlocation(serverResponse?.data.location);
      setPageCount(serverResponse?.data?.totalPages);
      setPage(page);

      // const initialCheckedStatus = {};

      // serverResponse?.data.result.forEach((result) => {
      //   initialCheckedStatus[result._id] = result.isActive || false;
      // });
      // setCheckedStatus(initialCheckedStatus);
    } else if (serverResponse?.data?.status === "JWT_INVALID") {
      Swal.fire({ text: serverResponse.data.message, icon: "warning" });
      router.push("/");
      // setLoader(false);
    } else {
      setlocation([]);
    }
  }
  const getLocationById = async (id) => {
    try {
      setLoader(true);

      let response = await communication.getLocationById({
        locationId: `${id}`,
      });
      if (response?.data?.status === "SUCCESS") {
        setIsUpdate(true);
        setLocationId(response.data.location._id);

        setValue("location", response.data.location.name);
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
  async function changeLocationStatus(e, locationId, isActive) {
    Swal.fire({
      text: `Are you sure you want to ${isActive ? "disable" : "enable"} location?`,
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
          setLoader(true);

          let response = await communication.changeLocationStatus({
            locationId: locationId,
          });
          if (response?.data?.status === "SUCCESS") {
            Swal.fire({ text: response.data.message, icon: "success" });
            setCheckedStatus((prevStatus) => ({
              ...prevStatus,
              [locationId]: true,
            }));
            getLocation(currentPage, searchString);
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
        return;
      }
    });
  }
  async function updateLocationById(values) {
    try {
      setLoader(true);
      let payload = {
        locationId: locationId,
        name: values?.location,
      };
      let response = await communication.updateLocationById(payload);
      if (response?.data?.status === "SUCCESS") {
        setIsUpdate(false);
        getLocation(currentPage, searchString);
        setValue("location", "");
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
  useEffect(() => {
    getLocation(currentPage, searchString);
  }, [isPageUpdated]);
  return (
    <>
      {loader && <Loader />}
      <div className="form_view" style={{ height: "30vh" }}>
        <form
          onSubmit={handleSubmit((values) =>
            isUpdate ? updateLocationById(values) : onSubmit(values)
          )}
        >
          <div className="form_title">
            {isUpdate ? <h5> Update Location </h5> : <h5> Create Location </h5>}
          </div>
          <div className="row m-0 mt-3 mb-3">
            <div className="col-lg-2 col-md-3 ps-5 d-flex align-items-center">
              <h6>Location Name</h6>
            </div>
            <div className="col-lg-3 col-md-4">
              <input
                type="text"
                className="inputBox text-capitalize"
                {...register("location", {
                  required: "Location is required",
                })}
              />
              <div style={{ height: "5px" }}>
                {errors.location && (
                  <p className="text-danger text-start" style={{ fontSize: "0.8rem" }}>
                    {errors.location.message}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="row m-0 mt-3 mb-3"></div>
          <div className="row m-0 mt-3 mb-3">
            <div className="col-lg-2 col-md-3"></div>
            <div className="col-lg-3 col-md-4 d-flex gap-3">
              <button className="savebtn mb-1" type="submit">
                <Image alt="" src={saveIcon}></Image>
                {isUpdate ? "Update" : "Save"}
              </button>
              {/* <button className="savebtn mb-1" type="submit">
                <Image alt="" src={saveIcon}></Image>
                {isUpdate ? "Back" : ""}
              </button> */}
              {isUpdate && (
                <button className="savebtn mb-1" type="submit">
                  <FontAwesomeIcon icon={faAngleLeft} />
                  Back
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
      <div className="table_view mt-3">
        <div className="table_wrapper">
          {/* style={{ height: "calc(92vh - 30vh)" }} */}
          <div className="table_main">
            <div className="table_container_location">
              {/* style={{ maxHeight: "450px" }} */}
              <div className="table_header">
                {/* <div className="checkbox_wrapper">
                  <input
                    type="checkbox"
                    id="selectAllCheckbox"
                    // onChange={(e) => handleSelectAllChange(e)}
                    // checked={selectAllChecked}
                  />
                </div> */}
                <div className="sr_no">
                  <h5>Sr. No.</h5>
                </div>
                <div className="edit">
                  <h5>Edit</h5>
                </div>
                <div className="on_off_switch">
                  <h5>Off/On</h5>
                </div>
                <div className="location">
                  <h5>Location</h5>
                </div>
              </div>
              <div className="table_data_wrapper" style={{ height: "48dvh" }}>
                {/* style={{ height: "100%" }} */}
                {location?.length > 0 ? (
                  <>
                    {location?.map((locationDetails, index) => (
                      <div className="table_data" key={index}>
                        {/* <div className="checkbox_wrapper">
                          <input
                            type="checkbox"
                            id={locationDetails._id}
                            // onChange={(e) => handleCheckboxChange(e)}
                            // checked={selectedCheckboxes.includes(
                            // roleDetails._id
                            // )}
                          />
                        </div> */}
                        <div className="sr_no">
                          <h6>{Number(pageLimit) * (page - 1) + (index + 1)}</h6>
                        </div>
                        <div className="edit">
                          <Image
                            title={`Update `}
                            // title={`${locationDetails.isActive ? "Update" : ""}`}
                            // title="Update"
                            className={`${
                              locationDetails.isActive ? "cursor-pointer" : "cursor-pointer"
                            }`}
                            onClick={() => getLocationById(locationDetails._id)}
                            src={edit}
                            alt="edit-icon"
                          />
                        </div>
                        <div className="on_off_switch ">
                          <div className="form-check form-switch ">
                            <input
                              class="form-check-input cursor-pointer"
                              type="checkbox"
                              checked={locationDetails.isActive || false}
                              id={`toggleSwitch${locationDetails._id}`}
                              onChange={(event) =>
                                changeLocationStatus(
                                  event,
                                  locationDetails._id,
                                  locationDetails.isActive
                                )
                              }
                              style={{ width: "30px", height: "15px" }}
                            />
                          </div>
                        </div>
                        <div className="location">
                          <h6>{locationDetails?.name}</h6>
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
  );
}
