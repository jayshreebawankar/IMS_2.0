"use client";
import Image from "next/image";
import { useForm } from "react-hook-form";
import saveIcon from "../../../../../public/images/rolecreate/saveicon.png";
import search from "../../../../../public/images/rolecreate/search.png";
import importicon from "../../../../../public/images/rolecreate/import.png";
import exporticon from "../../../../../public/images/rolecreate/export.png";
import deleteicon from "../../../../../public/images/rolecreate/delete.png";
import password from "../../../../../public/images/user/password.png";
import showIcon from "../../../../../public/images/user/showIcon.png";
import edit from "../../../../../public/images/rolecreate/edit.png";
import { useEffect, useRef, useState } from "react";
import Loader from "@/reusable/Loader";
import Pagination from "@/reusable/Pagination";
import Swal from "sweetalert2";
import { communication } from "@/apis/communication";
import { useRouter } from "next/navigation";
import FileSaver from "file-saver";
const pageLimit = process.env.NEXT_PUBLIC_LIMIT ?? 20;

export default function UserManagement() {
  const fileInputRef = useRef(null);
  const router = useRouter();

  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [selectedCheckboxes, setSelectedCheckboxes] = useState([]);

  const [searchString, setSearchString] = useState("");
  const [user, setUser] = useState([]);
  const [loader, setLoader] = useState(false);
  const [locations, setLocations] = useState([]);

  const [passwordVisibility, setPasswordVisibility] = useState({});

  const [timeoutId, setTimeoutId] = useState();
  const [roleList, setRoleList] = useState([]);

  const [checkedStatus, setCheckedStatus] = useState({});

  const [currentPage, setCurrentPage] = useState(1);
  const [isPageUpdated, setIsPageUpdated] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [page, setPage] = useState(1);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const handlePasswordToggle = (userId) => {
    setPasswordVisibility((prevVisibility) => {
      const newVisibility = {};

      // Set all other users visibility to false
      Object.keys(prevVisibility).forEach((id) => {
        newVisibility[id] = false;
      });
      // Toggle the visibility for the current user
      newVisibility[userId] = !prevVisibility[userId];

      return newVisibility;
    });
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
      e.target.checked ? user.map((userDetails) => userDetails._id) : []
    );
  };

  const onSubmit = async (values) => {
    try {
      setLoader(true);
      let payload = {
        name: values.name,
        email: values.email,
        mobile: values.mobile,
        password: values.password,
        roleId: values.role,
        locationId: values.locationId,
      };
      let response = await communication.createUser(payload);
      if (response?.data?.status === "SUCCESS") {
        Swal.fire({ text: response.data.message, icon: "success" });
        reset();
        await getUserList(currentPage, searchString);
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

  async function getUserList(page, searchString, isSearch = false) {
    try {
      setLoader(true);
      const serverResponse = await communication.getUserList(
        page,
        searchString
      );
      if (serverResponse?.data?.status === "SUCCESS") {
        setUser(serverResponse?.data.user);
        setPageCount(serverResponse?.data?.totalPages);
        setPage(page);
        if (isSearch) {
          setCurrentPage(1);
        }
        const initialCheckedStatus = {};

        serverResponse?.data.user.forEach((user) => {
          initialCheckedStatus[user._id] = user.isActive || false;
        });
        setCheckedStatus(initialCheckedStatus);
      } else if (serverResponse?.data?.status === "JWT_INVALID") {
        Swal.fire({ text: serverResponse.data.message, icon: "warning" });
        router.push("/");
        setLoader(false);
      } else {
        setUser([]);
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

  const deleteUser = async () => {
    if (selectedCheckboxes.length > 0) {
      Swal.fire({
        text: "Are you sure you want to delete this user?",
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
              userIds: [...selectedCheckboxes],
            };
            let response = await communication.deleteUser(payload);
            if (response?.data?.status === "SUCCESS") {
              Swal.fire({ text: response.data.message, icon: "success" });
              await getUserList(currentPage, searchString);
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
        text: "Please select which user you want to delete",
        icon: "warning",
      });
    }
  };
  const handleSearch = (e) => {
    setSearchString(e.target.value);
    let isSearch = true;
    clearTimeout(timeoutId);
    let _timeOutId = setTimeout(() => {
      getUserList("1", e.target.value, isSearch);
    }, 2000);
    setTimeoutId(_timeOutId);
  };

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
  async function changeUserStatus(e, userId, isActive) {
    Swal.fire({
      text: `Are you sure you want to ${isActive ? "disable" : "enable"} user?`,
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

          let response = await communication.changeUserStatus({
            userId: userId,
          });
          if (response?.data?.status === "SUCCESS") {
            Swal.fire({ text: response.data.message, icon: "success" });
            setCheckedStatus((prevStatus) => ({
              ...prevStatus,
              [userId]: true,
            }));
            getUserList(currentPage, searchString);
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
  const getExportRole = async () => {
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
          const serverResponse = await communication.getExportUser();
          if (serverResponse?.data) {
            const file = new Blob([serverResponse.data], {
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            FileSaver.saveAs(file, "user.xlsx");
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
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    console.log("Selected file:", selectedFile);

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
  const importData = async (selectedFile) => {
    try {
      const formData = new FormData();
      formData.append("users", selectedFile);
      const serverResponse = await communication.importExcelRoleData(formData);
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
  async function getLocations() {
    try {
      setLoader(true);
      const serverResponse = await communication.getLocations();
      if (serverResponse?.data?.status === "SUCCESS") {
        setLocations(serverResponse?.data?.result);
      } else if (serverResponse?.data?.status === "JWT_INVALID") {
        Swal.fire({ text: serverResponse.data.message, icon: "warning" });
        router.push("/");
        setLoader(false);
      } else {
        setLocations([]);
      }
      setLoader(false);
    } catch (error) {
      Swal.fire({
        text: error?.serverResponse?.data?.message || error.message,
        icon: "warning",
      });
      setLoader(false);
    }
  }
  useEffect(() => {
    getUserList(currentPage, searchString);
    getActiveRole();
    getLocations();
  }, [isPageUpdated]);
  return (
    <>
      {loader ? (
        <Loader />
      ) : (
        <>
          <div className="form_view " id="form_part1">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="form_title">
                <h5>Create User</h5>
              </div>
              <div className="row m-0 mt-3 mb-3 ps-5">
                <div className="col-lg-1 col-md-2  d-flex align-items-center">
                  <h6>Role</h6>
                </div>
                <div className="col-lg-3  col-md-2">
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
                      <p
                        className="text-danger text-start"
                        style={{ fontSize: "0.7rem" }}
                      >
                        {errors.role.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="col-lg-1  col-md-2  d-flex align-items-center">
                  <h6>User Name</h6>
                </div>
                <div className="col-lg-3  col-md-2">
                  <input
                    type="text"
                    {...register("name", {
                      required: "Name is required",
                    })}
                    className="inputBox"
                  />
                  <div style={{ height: "5px" }}>
                    {errors.name && (
                      <p
                        className="text-danger text-start"
                        style={{ fontSize: "0.7rem" }}
                      >
                        {errors.name.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="col-lg-1  col-md-2  d-flex align-items-center">
                  <h6>Email</h6>
                </div>
                <div className="col-lg-3  col-md-2">
                  <input
                    type="text"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value:
                          /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/,
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
                      <p
                        className="text-danger text-start"
                        style={{ fontSize: "0.7rem" }}
                      >
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="row m-0 mt-3 mb-3 ps-5">
                <div
                  className="col-lg-1 col-md-2  d-flex align-items-center"
                  style={{ flexWrap: "wrap" }}
                >
                  <h6
                    style={{
                      flex: "1",
                      overflowWrap: "break-word",
                      margin: "0",
                    }}
                  >
                    Contact No.
                  </h6>
                </div>
                <div className="col-lg-3 col-md-2 ">
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
                      <p
                        className="text-danger text-start"
                        style={{ fontSize: "0.7rem" }}
                      >
                        {errors.mobile.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="col-lg-1 col-md-2  d-flex align-items-center">
                  <h6>Password</h6>
                </div>
                <div className="col-lg-3 col-md-2">
                  <input
                    type="text"
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 8,
                        message:
                          "Password should be at least 8 characters long",
                      },
                      maxLength: {
                        value: 20,
                        message: "Password cannot be longer than 20 characters",
                      },
                      pattern: {
                        value:
                          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
                        message:
                          "Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character",
                      },
                    })}
                    className="inputBox"
                  />
                  <div style={{ height: "5px" }}>
                    {errors.password && (
                      <p
                        className="text-danger text-start"
                        style={{ fontSize: "0.7rem" }}
                      >
                        {errors.password.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="col-lg-1  col-md-2  d-flex align-items-center">
                  <h6>Location</h6>
                </div>
                <div className="col-lg-3  col-md-2">
                  <select
                    {...register("locationId", {
                      required: "Location is required",
                    })}
                    className="selectBox text-capitalize"
                    style={{ width: "100%" }}
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
              </div>

              <div className="row m-0 mt-3 mb-3 ps-5">
                <div className="col-lg-1 col-md-2  d-flex align-items-center"></div>
                <div className="col-lg-3 col-md-4">
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
                  <label htmlFor="file" className="savebtn mb-1 cursor-pointer">
                    <Image alt="" src={importicon}></Image>
                    Import
                  </label>
                </div> */}
                <button
                  onClick={getExportRole}
                  className="savebtn mb-1"
                  type="submit"
                >
                  <Image alt="" src={exporticon}></Image>Export Data
                </button>
                <button
                  onClick={deleteUser}
                  className="savebtn mb-1"
                  type="submit"
                >
                  <Image alt="" src={deleteicon}></Image>Delete
                </button>
              </div>
            </div>
            <div className="table_wrapper">
              <div className="table_main">
                <div className="table_container_user">
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
                    <div className="on_off_switch">
                      <h5>Off/On</h5>
                    </div>
                    <div className="sr_no">
                      <h5>Sr.No.</h5>
                    </div>
                    <div className="user_Id">
                      <h5>User ID</h5>
                    </div>
                    <div className="user_name">
                      <h5>User Name</h5>
                    </div>
                    <div className="role_type">
                      <h5>Role Type</h5>
                    </div>
                    <div className="email">
                      <h5>Email</h5>
                    </div>
                    <div className="contact_no">
                      <h5>Contact No</h5>
                    </div>
                    <div className="password">
                      <h5>Password</h5>
                    </div>
                  </div>
                  <div
                    className="table_data_wrapper"
                    style={{ height: "45dvh" }}
                  >
                    {user?.length > 0 ? (
                      <>
                        {user?.map((userDetails, index) => (
                          <div className="table_data" key={index}>
                            <div className="checkbox_wrapper">
                              <input
                                type="checkbox"
                                id={userDetails._id}
                                onChange={(e) => handleCheckboxChange(e)}
                                checked={selectedCheckboxes.includes(
                                  userDetails._id
                                )}
                                // disabled={!userDetails.isActive}
                                // className={`${
                                //   userDetails.isActive ? "cursor-pointer" : "cursor-not-allowed"
                                // }`}
                              />
                            </div>
                            <div className="edit">
                              <Image
                                title={`${
                                  userDetails.isActive ? "Update" : ""
                                }`}
                                className={`${
                                  userDetails.isActive
                                    ? "cursor-pointer"
                                    : "cursor-not-allowed"
                                }`}
                                onClick={() => {
                                  if (userDetails.isActive) {
                                    router.push(
                                      `/admin/dashboard/user/edit-user?userId=${userDetails._id}`
                                    );
                                  }
                                }}
                                src={edit}
                                alt="edit-icon"
                              />
                            </div>
                            <div className="on_off_switch ">
                              <div className="form-check form-switch ">
                                <input
                                  class="form-check-input cursor-pointer"
                                  type="checkbox"
                                  checked={
                                    checkedStatus[userDetails._id] || false
                                  }
                                  id={`toggleSwitch${userDetails._id}`}
                                  onChange={(event) =>
                                    changeUserStatus(
                                      event,
                                      userDetails._id,
                                      userDetails.isActive
                                    )
                                  }
                                  style={{ width: "30px", height: "15px" }}
                                />
                              </div>
                            </div>
                            <div className="sr_no">
                              <h6>
                                {Number(pageLimit) * (page - 1) + (index + 1)}
                              </h6>
                            </div>
                            <div className="user_Id">
                              <h6>{userDetails?.userId}</h6>
                            </div>
                            <div className="user_name">
                              <h6>{userDetails?.name}</h6>
                            </div>
                            <div className="role_type">
                              <h6>{userDetails?.role}</h6>
                            </div>
                            <div className="email">
                              <h6>{userDetails?.email}</h6>
                            </div>
                            <div className="contact_no">
                              <h6>{userDetails?.mobile}</h6>
                            </div>
                            <div className="password">
                              {/* <input
                                value={userDetails.password}
                                type={passwordVisibility[userDetails._id] ? "text" : "password"}
                                style={{ background: "#f0f0f0" }}
                              />
                              <Image
                                className="password_icon cursor-pointer"
                                onClick={() => handlePasswordToggle(userDetails._id)}
                                alt=""
                                src={passwordVisibility[userDetails._id] ? showIcon : password}
                              ></Image> */}
                              {passwordVisibility[userDetails._id] ? (
                                <>
                                  <input
                                    value={userDetails.password}
                                    type={
                                      passwordVisibility[userDetails._id]
                                        ? "text"
                                        : "password"
                                    }
                                    style={{ background: "#f0f0f0" }}
                                  />
                                  <Image
                                    className="password_icon cursor-pointer ms-2"
                                    onClick={() =>
                                      handlePasswordToggle(userDetails._id)
                                    }
                                    alt=""
                                    src={
                                      passwordVisibility[userDetails._id]
                                        ? showIcon
                                        : password
                                    }
                                  ></Image>
                                </>
                              ) : (
                                <div className="d-flex align-items-center justify-content-center">
                                  <h6>********</h6>
                                  <Image
                                    className="password_icon cursor-pointer ms-2"
                                    onClick={() =>
                                      handlePasswordToggle(userDetails._id)
                                    }
                                    alt=""
                                    src={
                                      passwordVisibility[userDetails._id]
                                        ? showIcon
                                        : password
                                    }
                                  ></Image>
                                </div>
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
        </>
      )}
    </>
  );
}
