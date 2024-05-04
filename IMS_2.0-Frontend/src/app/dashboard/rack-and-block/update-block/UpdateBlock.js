"use client";
import Image from "next/image";
import saveIcon from "../../../../../../public/images/rolecreate/saveicon.png";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { communication } from "@/apis/communication";
import Swal from "sweetalert2";
import { useRouter, useSearchParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import Multiselect from "multiselect-react-dropdown";
import Loader from "@/reusable/Loader";

const UpdateBlock = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [propertyType, setPropertyType] = useState([]);
  const [defaultRack, setDefaultRack] = useState([]);
  const [loader, setLoader] = useState(false);
  const [rackList, setRackList] = useState([]);

  const [locationList, setLocationList] = useState([]);
  const [locationId, setLocationId] = useState("");
  const [selectedOption, setSelectedOption] = useState(null);
  const [errorForRackFlag, setErrorRackFlag] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm();

  const CheckboxChange = (event) => {
    setSelectedOption(event.target.value);
    setErrorRackFlag("");
  };

  const getBlockById = async () => {
    try {
      setLoader(true);

      let response = await communication.getBlockById({
        blockId: searchParams.get("blockId"),
      });
      if (response?.data?.status === "SUCCESS") {
        setDefaultRack([...response?.data.block.rackNo]);
        setLocationId(response?.data.block.locationId);

        setValue("blockNo", response?.data.block.blockNo);
        setSelectedOption(response?.data.block.isRackAdded ? "Yes" : "No");
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

  const onSubmit = async (values) => {
    if (selectedOption == "") {
      setErrorRackFlag("Please select one");
      return;
    }
    try {
      let payload = {
        blockId: searchParams.get("blockId"),
        locationId: values.locationId,
        blockNo: values.blockNo,
        isRackAdded: selectedOption === "Yes" ? true : false,
        rackId: [...propertyType],
      };

      setLoader(true);
      const serverResponse = await communication.updateBlock(payload);
      if (serverResponse?.data?.status === "SUCCESS") {
        Swal.fire({ text: serverResponse.data.message, icon: "success" });
        router.push("/admin/dashboard/rack-and-block");
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

  const getActiveRack = async () => {
    try {
      setLoader(true);

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
      setLoader(false);
    }
  };

  async function getLocations() {
    try {
      setLoader(true);
      const serverResponse = await communication.getLocations();
      if (serverResponse?.data?.status === "SUCCESS") {
        setLocationList(serverResponse?.data?.result);
      } else if (serverResponse?.data?.status === "JWT_INVALID") {
        Swal.fire({ text: serverResponse.data.message, icon: "warning" });
        router.push("/");
        setLoader(false);
      } else {
        setLocationList([]);
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
  useEffect(() => {
    getBlockById();
    getActiveRack();
    getLocations();
  }, []);
  useEffect(() => {
    const selectedIds = defaultRack.map((selectedRackNo) => {
      const selectedRack = rackList.find(
        (rackData) => rackData.rackNo === selectedRackNo
      );
      return selectedRack ? selectedRack._id : null;
    });

    const filteredIds = selectedIds.filter((id) => id !== null);

    setPropertyType(filteredIds);
  }, [defaultRack, rackList.length]);

  useEffect(() => {
    if (locationId && locationList.length > 0) {
      setValue("locationId", locationId);
    }
  }, [locationId && locationList.length]);
  return (
    <>
      {loader ? (
        <Loader />
      ) : (
        <div className="form_view" id="form_part1" style={{ width: "100%" }}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            style={{ height: "55%", overflowY: "unset" }}
          >
            <div className="form_title">
              <h5>Update Block</h5>
            </div>
            <div className="row m-0 mt-3 mb-3 ms-md-3 ">
              <div className="col-lg-2 col-md-2 col-sm-4 d-flex align-items-center">
                <h6>Location Name</h6>
              </div>
              <div className="col-lg-4 col-md-4 col-sm-8 p-0">
                <select
                  {...register("locationId", {
                    required: "Location is required",
                  })}
                  className="selectBox text-capitalize"
                >
                  <option value="">Select Location</option>
                  {locationList.map((ele, index) => {
                    return (
                      <option value={ele._id} key={index}>
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
              <div className="col-lg-2 col-md-2 col-sm-4 p-0 d-flex align-items-center">
                <h6>Block Name</h6>
              </div>
              <div className="col-lg-4 col-md-4 col-sm-8 p-0">
                <input
                  style={{ width: "190px" }}
                  type="text"
                  {...register("blockNo", {
                    required: "Block is required",
                  })}
                  className="inputBox"
                />
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
            <div className="row m-0 mt-3 mb-3 ms-md-3">
              <div className="col-lg-2 col-md-2 col-sm-4 d-flex align-items-center ">
                <h6>Want Add Rack</h6>
              </div>
              <div className="col-lg-4 col-md-4 col-sm-8 d-flex align-items-center p-0 ">
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
                      type="checkbox"
                      className="cursor-pointer"
                      value="No"
                      checked={selectedOption === "No"}
                      onChange={CheckboxChange}
                    />
                    &nbsp; No
                  </label>
                  <h1>{errorForRackFlag}</h1>
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
                      className=" inputBox p-0 w-50"
                      rules={{ required: "Rack no is required" }}
                      selectedValues={defaultRack}
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
              <div className="col-lg-2 col-md-3  d-flex align-items-center"></div>
              <div className="col-lg-3 col-md-3 d-flex gap-2">
                <button className="savebtn mb-1" type="submit">
                  <Image alt="" src={saveIcon}></Image>Update
                </button>
                <button
                  onClick={() => router.push("/admin/dashboard/rack-and-block")}
                  className="savebtn mb-1"
                  type="button"
                >
                  <FontAwesomeIcon icon={faAngleLeft} />
                  Back
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default UpdateBlock;
