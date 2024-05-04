"use client";
import Image from "next/image";
import { communication } from "@/apis/communication";
import React, { useEffect, useState } from "react";
import edit from "../../../../../public/images/rolecreate/edit.png";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import search from "../../../../../public/images/rolecreate/search.png";
import Pagination from "@/reusable/Pagination";

const pageLimit = process.env.NEXT_PUBLIC_LIMIT ?? 20;

const StockManagement = () => {
  const [page, setPage] = useState(1);
  const router = useRouter();

  const [loader, setLoader] = useState(false);
  const [material, setMaterial] = useState([]);
  const [roles, setRoles] = useState([]);
  const [timeoutId, setTimeoutId] = useState();
  const [searchString, setSearchString] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [isPageUpdated, setIsPageUpdated] = useState(false);
  const [pageCount, setPageCount] = useState(0);

  async function fetchReturnMaterialList(page, searchString, isSearch = false) {
    try {
      setLoader(true);
      const serverResponse = await communication.fetchReturnMaterialList({
        page: page,
        searchString: searchString,
      });
      if (serverResponse?.data?.status === "SUCCESS") {
        setMaterial(serverResponse?.data.material);
        setPageCount(serverResponse?.data?.totalPages);
        setPage(page);
        if (isSearch) {
          setCurrentPage(1);
        }
      } else if (serverResponse?.data?.status === "JWT_INVALID") {
        Swal.fire({ text: serverResponse.data.message, icon: "warning" });
        router.push("/");
        setLoader(false);
      } else if (serverResponse?.data?.status == "FAILED") {
        setMaterial([]);

        // Swal.fire({
        //   text: res?.data?.message,
        //   icon: "warning",
        // });
      } else {
        setMaterial([]);

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
  }
  async function acceptRejectMaterial(id, status, remark = "") {
    try {
      setLoader(true);
      const serverResponse = await communication.acceptRejectMaterial({
        materialId: id,
        status: status,
        remark: remark,
      });
      if (serverResponse?.data?.status === "SUCCESS") {
        Swal.fire({ text: serverResponse.data.message, icon: "success" });
        fetchReturnMaterialList(currentPage, searchString);

        // setMaterial(serverResponse?.data.material);
        // setPageCount(serverResponse?.data?.totalPages);
        // setPage(page);
        // if (isSearch) {
        //   setCurrentPage(1);
        // }
      } else if (serverResponse?.data?.status === "JWT_INVALID") {
        Swal.fire({ text: serverResponse.data.message, icon: "warning" });
        router.push("/");
        setLoader(false);
      } else if (serverResponse.data.status == "FAILED") {
        Swal.fire({
          text: serverResponse?.data?.message,
          icon: "warning",
        });
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
  }
  const showInputDialog = (id, status) => {
    Swal.fire({
      // title: "Enter Remark For Rejection",
      html: '<input placeholder="Enter Remark for Rejection" type="text" id="remarkInput" class="swal2-input">',
      showCancelButton: true,
      confirmButtonText: "Submit",
      preConfirm: () => {
        const remarkInput = document.getElementById("remarkInput");
        return remarkInput.value;
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const remark = result.value;
        if (remark) {
          acceptRejectMaterial(id, status, remark);
        } else {
          Swal.fire({
            icon: "error",
            // title: "Invalid remark",
            text: "Remark required if you want to reject.",
          });
        }
      }
    });
  };
  const handleSearch = (e) => {
    setSearchString(e.target.value);
    let isSearch = true;
    clearTimeout(timeoutId);
    let _timeOutId = setTimeout(() => {
      fetchReturnMaterialList(currentPage, e.target.value, isSearch);
    }, 2000);
    setTimeoutId(_timeOutId);
  };

  useEffect(() => {
    fetchReturnMaterialList(currentPage, searchString);
  }, [isPageUpdated]);
  return (
    <div>
      {" "}
      <div className="border border-3  mb-2 border-solid w-25 border-color-#bababa ps-1 d-flex align-items-center">
        <Image src={search} alt="serchIcon"></Image>
        <input
          type="text"
          value={searchString}
          onChange={handleSearch}
          placeholder="search"
          style={{
            background: "#f5f5f5",
            height: "30px",
            fontSize: 14,
            fontWeight: 500,
            width: "100%",
          }}
          className="ps-2"
        />
        {/* <button className="savebtn mb-1" onClick={() => getRoleList(1, searchString)}>Search</button> */}
      </div>
      <div className="table_wrapper">
        <div className="table_main">
          <div className="table_container_stock">
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
              {/* <div className="edit">
                <h5>Edit</h5>
              </div> */}
              <div className="commonBlock">
                <h5>Category</h5>
              </div>
              <div className="commonBlock">
                <h5>Item Code</h5>
              </div>
              <div className="commonBlock">
                <h5>Model Name</h5>
              </div>

              <div className="commonBlock">
                <h5>Location</h5>
              </div>
              <div className="commonBlock">
                <h5>Block Name</h5>
              </div>
              <div className="commonBlock">
                <h5>Rack No</h5>
              </div>
              <div className="commonBlock">
                <h5>Serial No.</h5>
              </div>
              <div className="action" style={{ width: "400px" }}>
                <h5>Action</h5>
              </div>
            </div>
            <div className="table_data_wrapper" style={{ height: "78dvh" }}>
              {material?.length > 0 ? (
                <>
                  {material?.map((materialDetails, index) => (
                    <div className="table_data" key={index}>
                      {/* <div className="checkbox_wrapper">
                        <input
                          type="checkbox"
                          id={materialDetails._id}
                          // onChange={(e) => handleCheckboxChange(e)}
                          // checked={selectedCheckboxes.includes(materialDetails._id)}
                          disabled={!materialDetails.isActive}
                          className={`${
                            materialDetails.isActive ? "cursor-pointer" : "cursor-not-allowed"
                          }`}
                        />
                      </div> */}
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
                      <div className="commonBlock">
                        {/* <button onClick={router.push()}> */}
                        <h6>{materialDetails?.categoryId.name}</h6>
                        {/* </button> */}
                      </div>
                      <div className="commonBlock">
                        <h6>{materialDetails?.itemCode}</h6>
                      </div>
                      <div className="commonBlock">
                        <h6>{materialDetails?.modelName}</h6>
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

                      <div className="commonBlock">
                        <h6>{materialDetails?.locationId?.name}</h6>
                      </div>
                      <div className="commonBlock">
                        <h6>{materialDetails?.blockId?.blockNo}</h6>
                      </div>
                      <div className="commonBlock">
                        <h6>
                          {materialDetails?.rackId?.rackNo ? materialDetails?.rackId?.rackNo : "-"}
                        </h6>
                      </div>
                      <div className="commonBlock">
                        <h6>{materialDetails?.serialNo}</h6>
                      </div>

                      <div className="action" style={{ display: "flex", width: "400px" }}>
                        {/* <h6>{materialDetails?.brand}</h6> */}
                        <button
                          className="actionbtn"
                          onClick={(e) => {
                            // e.stopPropagation();
                            acceptRejectMaterial(materialDetails?._id, "accept");
                          }}
                        >
                          Accept
                        </button>
                        <button
                          className="actionbtn"
                          onClick={(e) => {
                            // e.stopPropagation();
                            showInputDialog(materialDetails?._id, "reject");
                          }}
                        >
                          Reject
                        </button>
                      </div>
                      {/* <div className="condition_type"> */}
                      {/* <h6>{materialDetails?.conditionType}</h6> */}
                      {/* </div> */}
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

export default StockManagement;
