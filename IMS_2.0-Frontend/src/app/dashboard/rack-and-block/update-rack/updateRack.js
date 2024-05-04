"use client";
import Image from "next/image";
import saveIcon from "../../../../../../public/images/rolecreate/saveicon.png";
import search from "../../../../../../public/images/rolecreate/search.png";
import importicon from "../../../../../../public/images/rolecreate/import.png";
import exporticon from "../../../../../../public/images/rolecreate/export.png";
import deleteicon from "../../../../../../public/images/rolecreate/delete.png";
import edit from "../../../../../../public/images/rolecreate/edit.png";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Pagination from "@/reusable/Pagination";
import Swal from "sweetalert2";
import { useRouter, useSearchParams } from "next/navigation";
import { communication } from "@/apis/communication";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import Loader from "@/reusable/Loader";

const UpdateRack = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loader, setLoader] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm();
  const getRackById = async (values) => {
    try {
      setLoader(true);

      let response = await communication.getRackById({
        rackId: searchParams.get("rackId"),
      });
      if (response?.data?.status === "SUCCESS") {
        // Swal.fire({ text: response.data.message, icon: "success" });
        // let user = response.data.user;
        setValue("rackNo", response.data.rack.rackNo);
        setValue("partition", response.data.rack.partition);
        // setValue("name", user.name);
        // setValue("email", user.email);
        // setValue("mobile", user.mobile);
        // setValue("password", user.password);
        // setValue("location", user.location);
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
  const updateRack = async (values) => {
    try {
      let payload = {
        rackId: searchParams.get("rackId"),
        rackNo: Number(values.rackNo),
        partition: Number(values.partition),
      };
      setLoader(true);
      const serverResponse = await communication.updateRackDetails(payload);
      if (serverResponse?.data?.status === "SUCCESS") {
        Swal.fire({ text: serverResponse.data.message, icon: "success" });
        reset();
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
  useEffect(() => {
    getRackById();
  }, []);
  return (
    <>
      {loader ? (
        <Loader />
      ) : (
        <div className="form_view" id="form_part1" style={{ width: "100%" }}>
          <form onSubmit={handleSubmit(updateRack)} style={{ height: "55%" }}>
            <div className="form_title">
              <h5>Update Rack</h5>
            </div>
            <div className="row m-0 mt-3 mb-3 ms-md-3 ">
              <div className="col-lg-2 col-md-2 col-sm-4 d-flex align-items-center">
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
                {errors.rackNo && (
                  <p
                    className="text-danger text-start"
                    style={{ fontSize: "0.8rem" }}
                  >
                    {errors.rackNo.message}
                  </p>
                )}
              </div>
              <div className="col-lg-2 col-md-2 col-sm-4 p-0 d-flex align-items-center">
                <h6>No of Partition</h6>
              </div>
              <div className="col-lg-4 col-md-4 col-sm-8 p-0">
                <input
                  style={{ width: "130px" }}
                  type="text"
                  {...register("partition", {
                    required: "Partition Count is required",
                    pattern: {
                      value: /^[0-9]+$/,
                      message: "Partition count should number only.",
                    },
                  })}
                  className="inputBox"
                />
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

            <div className="row m-0 mt-3 mb-3 ms-3 ">
              <div className="col-lg-2 col-md-2 d-flex align-items-center"></div>
              <div className="col-lg-4 col-md-4 p-0 d-flex gap-2">
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
export default UpdateRack;
