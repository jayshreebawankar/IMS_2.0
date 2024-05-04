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
const pageLimit = process.env.NEXT_PUBLIC_LIMIT ?? 20;

export default function RoleManagement() {
  const fileInputRef = useRef(null);

  const [roles, setRoles] = useState([]);
  const [loader, setLoader] = useState(false);
  const [timeoutId, setTimeoutId] = useState();
  const [currentPage, setCurrentPage] = useState(1);
  const [isPageUpdated, setIsPageUpdated] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [page, setPage] = useState(1);
  const [searchString, setSearchString] = useState("");
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [selectedCheckboxes, setSelectedCheckboxes] = useState([]);

  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm();

  const onSubmit = async (values) => {
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
        role: values.role,
        tab,
      };
      setLoader(true);
      const serverResponse = await communication.createRole(payload);
      if (serverResponse?.data?.status === "SUCCESS") {
        for (const key in values) {
          reset();
        }
        Swal.fire({ text: serverResponse.data.message, icon: "success" });
        await getRoleList(currentPage, searchString);
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

  //get Role list on initial Load
  async function getRoleList(page, searchString, isSearch = false) {
    try {
      setLoader(true);
      const serverResponse = await communication.getRoleList(page, searchString);
      if (serverResponse?.data?.status === "SUCCESS") {
        setRoles(serverResponse?.data.roles);
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
        setRoles([]);
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
          const serverResponse = await communication.getExportRole();
          if (serverResponse?.data) {
            const file = new Blob([serverResponse.data], {
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            FileSaver.saveAs(file, "role.xlsx");
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
      formData.append("roles", selectedFile);
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
        text: error?.serverResponse?.data?.message || error?.message,
        icon: "error",
      });
    }
  };

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
        console.log("Selected file:", selectedFile);
        importData(selectedFile);
      } else {
      }
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
      e.target.checked ? roles.map((userDetails) => userDetails._id) : []
    );
  };
  const deleteRole = async () => {
    if (selectedCheckboxes.length > 0) {
      try {
        Swal.fire({
          text: "Are you sure you want to delete this role?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#5149E4",
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes, delete it",
          cancelButtonText: "No, cancel",
          reverseButtons: true,
        }).then(async function (result) {
          if (result.isConfirmed) {
            setLoader(true);
            let payload = {
              roleIds: [...selectedCheckboxes],
            };
            let response = await communication.deleteRole(payload);
            if (response?.data?.status === "SUCCESS") {
              Swal.fire({ text: response.data.message, icon: "success" });
              await getRoleList(currentPage, searchString);
            } else if (response?.data?.status === "JWT_INVALID") {
              Swal.fire({ text: response.data.message, icon: "warning" });
              router.push("/");
            } else {
              Swal.fire({ text: response.data.message, icon: "warning" });
              setLoader(false);
            }
          } else {
          }
        });
      } catch (error) {
        Swal.fire({ text: error.message, icon: "warning" });
      } finally {
        setLoader(false);
      }
    } else {
      Swal.fire({
        text: "Please select which role you want to delete",
        icon: "warning",
      });
    }
  };
  const handleSearch = (e) => {
    setSearchString(e.target.value);
    let isSearch = true;
    clearTimeout(timeoutId);
    let _timeOutId = setTimeout(() => {
      getRoleList("1", e.target.value, isSearch);
    }, 2000);
    setTimeoutId(_timeOutId);
  };
  useEffect(() => {
    getRoleList(currentPage, searchString);
  }, [isPageUpdated]);
  return (
    <>
      {loader ? (
        <Loader />
      ) : (
        <>
          <div className="form_view">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="form_title">
                <h5> Create Role </h5>
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
                    className="inputBox"
                  />
                  <div style={{ height: "5px" }}>
                    {errors.role && (
                      <p className="text-danger text-start" style={{ fontSize: "0.8rem" }}>
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
                        id="category"
                        type="checkbox"
                        {...register("category")}
                        className="checkbox"
                      />
                      <label htmlFor="category">Category</label>
                    </div>
                    <div className="col-lg-3 col-md-4 checkbox_main">
                      <input
                        id="parameter"
                        type="checkbox"
                        {...register("parameter")}
                        className="checkbox"
                      />
                      <label htmlFor="parameter">Parameters</label>
                    </div>
                    <div className="col-lg-3 col-md-4 checkbox_main">
                      <input
                        id="brand"
                        type="checkbox"
                        {...register("brand")}
                        className="checkbox"
                      />
                      <label htmlFor="brand">Brand</label>
                    </div>
                    <div className="col-lg-3 col-md-4 checkbox_main">
                      <input
                        id="Rack Management"
                        type="checkbox"
                        {...register("Rack Management")}
                        className="checkbox"
                      />
                      <label htmlFor="Rack Management">Rack Management</label>
                    </div>
                    <div className="col-lg-3 col-md-4 checkbox_main">
                      <input
                        id="Block Management"
                        type="checkbox"
                        {...register("Block Management")}
                        className="checkbox"
                      />
                      <label htmlFor="Block Management">Block Management</label>
                    </div>
                    <div className="col-lg-3 col-md-4 checkbox_main">
                      <input
                        id="Stock In"
                        type="checkbox"
                        {...register("Stock In")}
                        className="checkbox"
                      />
                      <label htmlFor="Stock In">Stock In</label>
                    </div>
                    <div className="col-lg-3 col-md-4 checkbox_main">
                      <input
                        id="Stock List"
                        type="checkbox"
                        {...register("Stock List")}
                        className="checkbox"
                      />
                      <label htmlFor="Stock List">Stock List</label>
                    </div>
                    <div className="col-lg-3 col-md-4 checkbox_main">
                      <input
                        id="Inventory Look"
                        type="checkbox"
                        {...register("Inventory Look")}
                        className="checkbox"
                      />
                      <label htmlFor="Inventory Look">Inventory Look</label>
                    </div>
                    <div className="col-lg-3 col-md-4 checkbox_main">
                      <input
                        id="notification"
                        type="checkbox"
                        {...register("notification")}
                        className="checkbox"
                      />
                      <label htmlFor="notification">Notification</label>
                    </div>
                    <div className="col-lg-3 col-md-4 checkbox_main">
                      <input
                        id="Stock Out"
                        type="checkbox"
                        {...register("Stock Out")}
                        className="checkbox"
                      />
                      <label htmlFor="Stock Out">Stock Out</label>
                    </div>
                    <div className="col-lg-3 col-md-4 checkbox_main">
                      <input
                        id="report"
                        type="checkbox"
                        {...register("report")}
                        className="checkbox"
                      />
                      <label htmlFor="report">Report</label>
                    </div>
                    <div className="col-lg-3 col-md-4 checkbox_main">
                      <input
                        id="User Management"
                        type="checkbox"
                        {...register("User Management")}
                        className="checkbox"
                      />
                      <label htmlFor="User Management">User Management</label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row m-0 mt-3 mb-3">
                <div className="col-lg-2 col-md-3"></div>
                <div className="col-lg-3 col-md-4">
                  <button className="savebtn mb-1" type="submit">
                    <Image alt="" src={saveIcon}></Image>Save
                  </button>
                </div>
              </div>
            </form>
          </div>
          <div className="table_view">
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
                  className="ps-2"
                />
                {/* <button className="savebtn mb-1" onClick={() => getRoleList(1, searchString)}>Search</button> */}
              </div>
              <div className="d-flex gap-2" style={{ fontSize: "10px" }}>
                {/* <button onClick={() => importData()} className="savebtn mb-1" type="submit">
                  <Image alt="" src={importicon}></Image>import
                </button> */}
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
                <button onClick={getExportRole} className="savebtn mb-1" type="submit">
                  <Image alt="" src={exporticon}></Image>
                  Export Data
                </button>
                <button onClick={deleteRole} className="savebtn mb-1" type="submit">
                  <Image alt="" src={deleteicon}></Image>Delete
                </button>
              </div>
            </div>
            <div className="table_wrapper" style={{ height: "39vh" }}>
              <div className="table_main">
                <div className="table_container_role">
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
                    <div className="user_type">
                      <h5>User Type</h5>
                    </div>
                    <div className="tab_access">
                      <h5>Tab Access</h5>
                    </div>
                  </div>
                  <div className="table_data_wrapper">
                    {roles?.length > 0 ? (
                      <>
                        {roles?.map((roleDetails, index) => (
                          <div className="table_data" key={index}>
                            <div className="checkbox_wrapper">
                              <input
                                type="checkbox"
                                id={roleDetails._id}
                                onChange={(e) => handleCheckboxChange(e)}
                                checked={selectedCheckboxes.includes(roleDetails._id)}
                              />
                            </div>
                            <div className="edit">
                              <Image
                                title="Update"
                                className="cursor-pointer"
                                onClick={() =>
                                  router.push(
                                    `/admin/dashboard/role/update-role?roleId=${roleDetails._id}`
                                  )
                                }
                                src={edit}
                                alt="edit-icon"
                              />
                            </div>
                            <div className="sr_no">
                              <h6>{Number(pageLimit) * (page - 1) + (index + 1)}</h6>
                            </div>
                            <div className="user_type">
                              <h6>{roleDetails?.role}</h6>
                            </div>
                            <div className="tab_access">
                              {roleDetails?.tab.map((ele, index) => {
                                return (
                                  <>
                                    {roleDetails.tab.length === index + 1 ? (
                                      <h6 key={index}>{ele}</h6>
                                    ) : (
                                      <h6 key={index}>{ele},</h6>
                                    )}
                                  </>
                                );
                              })}
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
