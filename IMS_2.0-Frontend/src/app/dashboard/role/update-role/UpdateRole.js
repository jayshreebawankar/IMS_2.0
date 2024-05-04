"use client";
import { useForm } from "react-hook-form";
import saveIcon from "../../../../../../public/images/rolecreate/saveicon.png";
import Image from "next/image";
import { communication } from "@/apis/communication";
import { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import { useRouter, useSearchParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import Loader from "@/reusable/Loader";

const UpdateRole = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loader, setLoader] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm();
  const onSubmit = async (values) => {
    // console.log("vvvvv v", values);
    try {
      const tab = [];
      for (const key in values) {
        if (key !== "role" && values[key]) {
          tab.push(key);
        }
      }

      if (tab.length === 0) {
        Swal.fire({ text: "Select at least one tab", icon: "warning" });
        return;
      }

      let payload = {
        roleId: searchParams.get("roleId"),
        role: values.role,
        tab,
      };
      setLoader(true);
      const serverResponse = await communication.updateRole(payload);
      if (serverResponse?.data?.status === "SUCCESS") {
        // for (const item of serverResponse?.data?.role.tab) {
        //   //   reset();
        //   // setValue()
        // }
        Swal.fire({ text: serverResponse.data.message, icon: "success" });
        // await getRoleList(currentPage, searchString);
        router.push(`/admin/dashboard/role/`);
      } else if (serverResponse?.data?.status === "JWT_INVALID") {
        Swal.fire({ text: serverResponse.data.message, icon: "warning" });
        router.push("/");
      } else {
        Swal.fire({ text: serverResponse.data.message, icon: "warning" });
      }
      setLoader(false);
    } catch (error) {
      Swal.fire({
        text: error?.serverResponse?.data?.message || error.message,
        icon: "warning",
      });
      setLoader(false);
    }
  };
  const getRoleById = async (values) => {
    try {
      setLoader(true);

      let response = await communication.getRoleById({
        roleId: `${searchParams.get("roleId")}`,
      });
      if (response?.data?.status === "SUCCESS") {
        // Swal.fire({ text: response.data.message, icon: "success" });
        setValue("role", response.data.role.role);
        response.data.role.tab.forEach((tab) => {
          setValue(tab, true);
        });
        // setValue("Role Management", true);
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

  useEffect(() => {
    getRoleById();
  }, []);
  return (
    <>
      {loader ? (
        <Loader />
      ) : (
        <div className="form_view" style={{ height: "45%" }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form_title">
              <h5>Update Role</h5>
            </div>
            <div className="row m-0 mt-3 mb-3">
              <div className="col-lg-2 col-md-3 ps-5 d-flex align-items-center">
                <h6>Role Name</h6>
              </div>
              <div className="col-lg-3 col-md-4">
                <input
                  type="text"
                  {...register("role", {
                    required: "Role is required",
                  })}
                  className="inputBox text-capitalize"
                />
                <div style={{ height: "5px" }}>
                  {errors.role && (
                    <p
                      className="text-danger text-start"
                      style={{ fontSize: "0.8rem" }}
                    >
                      {errors.role.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="row m-0 mt-3 mb-3">
              <div className="col-lg-2 col-md-3 ps-5 d-flex align-items-center">
                <h6>Tab Access</h6>
              </div>
              <div className="col-lg-10 col-md-9">
                <div className="row m-0">
                  <div className="col-lg-3 col-md-4 checkbox_main">
                    <input
                      type="checkbox"
                      id="role"
                      {...register("Role Management")}
                      className="checkbox"
                    />
                    <label htmlFor="role">Role Management</label>
                  </div>
                  <div className="col-lg-3 col-md-4 checkbox_main">
                    <input
                      type="checkbox"
                      {...register("category")}
                      className="checkbox"
                    />
                    <label htmlFor="role">Category</label>
                  </div>
                  <div className="col-lg-3 col-md-4 checkbox_main">
                    <input
                      type="checkbox"
                      {...register("parameter")}
                      className="checkbox"
                    />
                    <label htmlFor="role">Parameters</label>
                  </div>
                  <div className="col-lg-3 col-md-4 checkbox_main">
                    <input
                      type="checkbox"
                      {...register("brand")}
                      className="checkbox"
                    />
                    <label htmlFor="role">Brand</label>
                  </div>
                  <div className="col-lg-3 col-md-4 checkbox_main">
                    <input
                      type="checkbox"
                      {...register("Rack Management")}
                      className="checkbox"
                    />
                    <label htmlFor="role">Rack Management</label>
                  </div>
                  <div className="col-lg-3 col-md-4 checkbox_main">
                    <input
                      type="checkbox"
                      {...register("Block Management")}
                      className="checkbox"
                    />
                    <label htmlFor="role">Block Management</label>
                  </div>
                  <div className="col-lg-3 col-md-4 checkbox_main">
                    <input
                      type="checkbox"
                      {...register("Stock In")}
                      className="checkbox"
                    />
                    <label htmlFor="role">Stock In</label>
                  </div>
                  <div className="col-lg-3 col-md-4 checkbox_main">
                    <input
                      type="checkbox"
                      {...register("Stock List")}
                      className="checkbox"
                    />
                    <label htmlFor="role">Stock List</label>
                  </div>
                  <div className="col-lg-3 col-md-4 checkbox_main">
                    <input
                      type="checkbox"
                      {...register("Inventory Look")}
                      className="checkbox"
                    />
                    <label htmlFor="role">Inventory Look</label>
                  </div>
                  <div className="col-lg-3 col-md-4 checkbox_main">
                    <input
                      type="checkbox"
                      {...register("notification")}
                      className="checkbox"
                    />
                    <label htmlFor="role">Notification</label>
                  </div>
                  <div className="col-lg-3 col-md-4 checkbox_main">
                    <input
                      type="checkbox"
                      {...register("Stock Out")}
                      className="checkbox"
                    />
                    <label htmlFor="role">Stock Out</label>
                  </div>
                  <div className="col-lg-3 col-md-4 checkbox_main">
                    <input
                      type="checkbox"
                      {...register("report")}
                      className="checkbox"
                    />
                    <label htmlFor="role">Report</label>
                  </div>
                  <div className="col-lg-3 col-md-4 checkbox_main">
                    <input
                      type="checkbox"
                      {...register("User Management")}
                      className="checkbox"
                    />
                    <label htmlFor="role">User Management</label>
                  </div>
                </div>
              </div>
            </div>
            <div className="row m-0 mt-3 mb-3">
              <div className="col-lg-2 col-md-3"></div>
              <div className="col-lg-3 col-md-4 d-flex gap-3">
                <button className="savebtn mb-1" type="submit">
                  <Image alt="" src={saveIcon}></Image>Update
                </button>
                <button
                  onClick={() => router.push("/admin/dashboard/role")}
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

export default UpdateRole;
