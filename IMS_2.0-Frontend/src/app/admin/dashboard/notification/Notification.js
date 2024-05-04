"use client";
import Image from "next/image";
import { communication } from "@/apis/communication";
import React, { useEffect, useState } from "react";
import edit from "../../../../../public/images/rolecreate/edit.png";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import search from "../../../../../public/images/rolecreate/search.png";
import deleteicon from "../../../../../public/images/rolecreate/delete.png";
import Pagination from "@/reusable/Pagination";
const pageLimit = process.env.NEXT_PUBLIC_LIMIT ?? 20;

const Notification = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isPageUpdated, setIsPageUpdated] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [page, setPage] = useState(1);
  const router = useRouter();

  const [loader, setLoader] = useState(false);
  const [notification, setNotification] = useState([]);
  const [roles, setRoles] = useState([]);

  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [selectedCheckboxes, setSelectedCheckboxes] = useState([]);

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
      e.target.checked ? notification.map((userDetails) => userDetails._id) : []
    );
  };

  const deleteSelectedNotification = async () => {
    try {
      setLoader(true);
      let payload = {
        notificationIds: selectedCheckboxes,
      };
      let response = await communication.deleteSelectedNotification(payload);
      if (response?.data?.status === "SUCCESS") {
        Swal.fire({ text: response.data.message, icon: "success" });
        getAllNotification();
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
  const deleteNotification = async (id) => {
    try {
      setLoader(true);
      let payload = {
        notificationId: id,
      };
      let response = await communication.deleteNotification(payload);
      if (response?.data?.status === "SUCCESS") {
        Swal.fire({ text: response.data.message, icon: "success" });
        getAllNotification();
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

  const deleteAllNotification = async () => {
    try {
      setLoader(true);
      let response = await communication.deleteAllNotification();
      if (response?.data?.status === "SUCCESS") {
        Swal.fire({ text: response.data.message, icon: "success" });
        getAllNotification();
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
  async function getAllNotification(page, searchString, isSearch = false) {
    try {
      setLoader(true);
      const serverResponse = await communication.getAllNotification({
        page: 1,
      });
      if (serverResponse?.data?.status === "SUCCESS") {
        setNotification(serverResponse?.data.notification);
        // setPageCount(serverResponse?.data?.totalPages);
        // setPage(page);
        // if (isSearch) {
        //   setCurrentPage(1);
        // }
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
        text: error?.response?.data?.message || error.message,
        icon: "warning",
      });
      setLoader(false);
    }
  }
  async function getNotificationCount() {
    try {
      setLoader(true);
      const serverResponse = await communication.getNotificationCount();
      if (serverResponse?.data?.status === "SUCCESS") {
        // Swal.fire({ text: serverResponse.data.message, icon: "success" });
      } else if (serverResponse?.data?.status === "JWT_INVALID") {
        Swal.fire({ text: serverResponse.data.message, icon: "warning" });
        router.push("/");
        setLoader(false);
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
  }
  useEffect(() => {
    getAllNotification();
    // getNotificationCount();
  }, []);
  return (
    <div className="table_view">
      {" "}
      <div className="d-flex justify-content-between pt-3 pb-3">
        <div className="border border-3 border-solid border-color-#bababa ps-1 d-flex align-items-center">
          <Image src={search} alt="serchIcon"></Image>
          <input
            type="text"
            // value={searchString}
            // onChange={handleSearch}
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
          </div>
          <button onClick={getExportRole} className="savebtn mb-1" type="submit">
            <Image alt="" src={exporticon}></Image>Export Template
          </button> */}
          <button
            onClick={() =>
              selectAllChecked
                ? deleteAllNotification()
                : deleteSelectedNotification()
            }
            className="savebtn mb-1"
            type="submit"
          >
            <Image alt="" src={deleteicon}></Image>
            {selectAllChecked ? "Delete All" : "Delete"}
          </button>
        </div>
      </div>
      <div className="table_wrapper">
        <div className="table_main">
          <div className="table_container_notification">
            <div className="table_header">
              <div className="checkbox_wrapper">
                <input
                  type="checkbox"
                  id="selectAllCheckbox"
                  onChange={(e) => handleSelectAllChange(e)}
                  checked={selectAllChecked}
                />
              </div>
              <div className="sr_no">
                <h5>Sr. No.</h5>
              </div>
              {/* <div className="edit">
                <h5>Edit</h5>
              </div> */}

              <div className="item_code2">
                <h5>Title</h5>
              </div>
              <div className="description">
                <h5>Description</h5>
              </div>
              <div className="action">
                <h5>Action</h5>
              </div>
            </div>
            <div className="table_data_wrapper">
              {notification?.length > 0 ? (
                <>
                  {notification?.map((materialDetails, index) => (
                    <div className="table_data" key={index}>
                      <div className="checkbox_wrapper">
                        <input
                          type="checkbox"
                          id={materialDetails._id}
                          onChange={(e) => handleCheckboxChange(e)}
                          checked={selectedCheckboxes.includes(
                            materialDetails._id
                          )}
                        />
                      </div>
                      <div className="sr_no">
                        <h6>{Number(pageLimit) * (page - 1) + (index + 1)}</h6>
                      </div>
                      {/* <div className="edit">
                        <Image
                          title="Update"
                          className={`${
                            materialDetails.isActive ? "cursor-pointer" : "cursor-not-allowed"
                          }`}
                          onClick={() => alert("Under Maintainance")}
                          // onClick={() => {
                          //   if (materialDetails.stockId.isActive) {
                          //     router.push(
                          //       `/admin/dashboard/stock/update-stock?stockId=${materialDetails._id}`
                          //     );
                          //   }
                          // }}
                          src={edit}
                          alt="edit-icon"
                        />
                      </div> */}

                      <div className="item_code2">
                        <h6>{materialDetails?.title}</h6>
                      </div>
                      <div className="description">
                        <h6>{materialDetails?.description}</h6>
                      </div>
                      {/* <div className="on_off_switch">
                        <div className="form-check form-switch ms-3">
                          <input
                            class="form-check-input cursor-pointer"
                            type="checkbox"
                            onChange={() => alert("Under Maintainance")}
                            // checked={checkedStatus[materialDetails._id] || false}
                            id={`toggleSwitch${materialDetails._id}`}
                            // onChange={(event) => changeStockStatus(event, materialDetails._id)}
                            style={{ width: "30px", height: "15px" }}
                          />
                        </div>
                      </div> */}

                      <div className="action" style={{ display: "flex" }}>
                        {/* <h6>{materialDetails?.conditionType}</h6> */}
                        {/* <button
                          className="actionbtn"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          Accept
                        </button> */}

                        <button
                          className="actionbtn"
                          //
                          onClick={() =>
                            deleteNotification(materialDetails._id)
                          }
                          disabled={
                            !selectedCheckboxes.includes(materialDetails._id)
                          }
                        >
                          Delete
                        </button>
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
  );
};

export default Notification;
