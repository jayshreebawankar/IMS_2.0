"use client";
import Image from "next/image";
import { useForm } from "react-hook-form";
import saveIcon from "../../../../../../public/images/rolecreate/saveicon.png";
import { useEffect, useState } from "react";
import Loader from "@/reusable/Loader";
import Swal from "sweetalert2";
import { communication } from "@/apis/communication";
import { useRouter, useSearchParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft } from "@fortawesome/free-solid-svg-icons";

const UpdateUser = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loader, setLoader] = useState(false);
  const [locationList, setLocationList] = useState([]);

  const [roleList, setRoleList] = useState([]);
  const [roleId, setRoleId] = useState("");
  const [locationId, setLocationId] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm();

  const getActiveRole = async () => {
    try {
      setLoader(true);

      let response = await communication.getActiveRole();
      if (response?.data?.status === "SUCCESS") {
        // Swal.fire({ text: response.data.message, icon: "success" });
        setRoleList(response?.data.role);
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
  const getUserById = async (values) => {
    try {
      setLoader(true);

      let response = await communication.getUserById(searchParams.get("userId"));
      if (response?.data?.status === "SUCCESS") {
        // Swal.fire({ text: response.data.message, icon: "success" });
        let user = response.data.user;
        setRoleId(user.roleId);
        setLocationId(user.locationId);
        // setValue("role", user.roleId);
        setValue("name", user.name);
        setValue("email", user.email);
        setValue("mobile", user.mobile);
        setValue("password", user.password);
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
  const updateUser = async (values) => {
    try {
      setLoader(true);
      let payload = {
        name: values.name,
        email: values.email,
        mobile: values.mobile,
        password: values.password,
        userId: searchParams.get("userId"),
        roleId: values.role,
        locationId: values.locationId,
      };
      let response = await communication.updateUser(payload);
      if (response?.data?.status === "SUCCESS") {
        Swal.fire({ text: response.data.message, icon: "success" });
        router.push(`/admin/dashboard/user/`);
        // reset();
        // await getUserList(currentPage, searchString);
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
    getUserById();
    getActiveRole();
    getLocations();
  }, []);
  useEffect(() => {
    if (roleId && roleList.length > 0) {
      setValue("role", roleId);
    }
  }, [roleList, roleList.length]);
  useEffect(() => {
    setValue("locationId", locationId);
  }, [locationId, locationList.length]);
  return (
    <>
      {loader ? (
        <Loader />
      ) : (
        <div className="form_view w-100" id="form_part1">
          <form onSubmit={handleSubmit(updateUser)}>
            <div className="form_title">
              <h5>Update User</h5>
            </div>
            <div className="row m-0 mt-3 mb-3 ps-5">
              <div className="col-lg-1 col-md-1  d-flex align-items-center">
                <h6>Role</h6>
              </div>
              <div className="col-lg-3  col-md-3">
                <select
                  {...register("role", {
                    required: "Role is required",
                  })}
                  className="inputBox text-capitalize"
                >
                  <option value="">Select Role</option>
                  {roleList.map((role, index) => (
                    <option value={role._id} key={index}>
                      {role.role}
                    </option>
                  ))}
                </select>
                <div style={{ height: "5px" }}>
                  {errors.role && (
                    <p className="text-danger text-start" style={{ fontSize: "0.7rem" }}>
                      {errors.role.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="col-lg-1 col-md-1  d-flex align-items-center">
                <h6>User Name</h6>
              </div>
              <div className="col-lg-3 col-md-3">
                <input
                  type="text"
                  {...register("name", {
                    required: "Name is required",
                  })}
                  className="inputBox"
                />
                <div style={{ height: "5px" }}>
                  {errors.name && (
                    <p className="text-danger text-start" style={{ fontSize: "0.7rem" }}>
                      {errors.name.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="col-lg-1 col-md-1  d-flex align-items-center">
                <h6>Email</h6>
              </div>
              <div className="col-lg-3 col-md-3">
                <input
                  type="text"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/,
                      message: "Invalid email address",
                    },
                    maxLength: {
                      value: 35,
                      message: "Email cannot be longer than 35 characters",
                    },
                  })}
                  className="inputBox"
                />
                <div style={{ height: "5px" }}>
                  {errors.email && (
                    <p className="text-danger text-start" style={{ fontSize: "0.7rem" }}>
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="row m-0 mt-3 mb-3 ps-5">
              <div className="col-lg-1 col-md-1  d-flex align-items-center">
                <h6>Contact No.</h6>
              </div>
              <div className="col-lg-3 col-md-3">
                <input
                  type="text"
                  className="inputBox"
                  {...register("mobile", {
                    required: "Mobile Number is required",
                    minLength: {
                      value: 10,
                      message: "Mobile Should be 10 digits",
                    },
                    maxLength: {
                      value: 10,
                      message: "Mobile Should be 10 digits",
                    },
                  })}
                />
                <div style={{ height: "5px" }}>
                  {errors.mobile && (
                    <p className="text-danger text-start" style={{ fontSize: "0.7rem" }}>
                      {errors.mobile.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="col-lg-1 col-md-1  d-flex align-items-center">
                <h6>Password</h6>
              </div>
              <div className="col-lg-3 col-md-3">
                <input
                  type="text"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "Password should be at least 8 characters long",
                    },
                    maxLength: {
                      value: 20,
                      message: "Password cannot be longer than 20 characters",
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
                      message:
                        "Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character",
                    },
                  })}
                  className="inputBox"
                />
                <div style={{ height: "5px" }}>
                  {errors.password && (
                    <p className="text-danger text-start" style={{ fontSize: "0.7rem" }}>
                      {errors.password.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="col-lg-1 col-md-1  d-flex align-items-center">
                <h6>Location</h6>
              </div>
              <div className="col-lg-3 col-md-3">
                <select
                  {...register("locationId", {
                    required: "Location is required",
                  })}
                  className="selectBox text-capitalize"
                  style={{ width: "100%" }}
                >
                  <option value="">Select Location</option>
                  {locationList.map((ele, index) => {
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
                    <p className="text-danger text-start" style={{ fontSize: "0.7rem" }}>
                      {errors.locationId.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="row m-0 mt-3 mb-3 ps-5">
              <div className="col-lg-1 col-md-1  d-flex align-items-center"></div>
              <div className="col-lg-3 col-md-3 d-flex gap-2">
                <button className="savebtn mb-1" type="submit">
                  <Image src={saveIcon} alt="saveIcon"></Image>Save
                </button>
                <button
                  onClick={() => router.push("/admin/dashboard/user")}
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

export default UpdateUser;
