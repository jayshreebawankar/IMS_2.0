"use client";
import Image from "next/image";
import { communication } from "@/apis/communication";
import React, { useEffect, useState } from "react";
import edit from "../../../../../public/images/rolecreate/edit.png";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import search from "../../../../../public/images/rolecreate/search.png";
import Pagination from "@/reusable/Pagination";
import { getCookie } from "cookies-next";

const pageLimit = process.env.NEXT_PUBLIC_LIMIT ?? 20;

const DailyTask = () => {
  const [page, setPage] = useState(1);
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [TechnicianList, setTechnicianList] = useState([]);
  const [loader, setLoader] = useState(false);
  const [material, setMaterial] = useState([]);
  const [roles, setRoles] = useState([]);
  const [timeoutId, setTimeoutId] = useState();
  const [searchString, setSearchString] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [isPageUpdated, setIsPageUpdated] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [roleName, setRoleName] = useState("");
  // console.log(roleName, "rRRRR");

  // console.log("roleeeeeeeeeeeee", role);
  async function fetchAssignMaterial(
    page,
    searchString,
    userId,
    isSearch = false
  ) {
    try {
      setLoader(true);
      let payload = {
        page: page,
        searchString: searchString,
      };
      if (userId) {
        payload.userId = userId;
      }
      const serverResponse = await communication.fetchAssignMaterial(payload);
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
  const technicianList = async () => {
    try {
      setLoader(true);

      let response = await communication.getTechnicianList();
      if (response?.data?.status === "SUCCESS") {
        // Swal.fire({ text: response.data.message, icon: "success" });
        setTechnicianList(response?.data.user);
        // await getRoleList(currentPage, searchString);
      } else if (response?.data?.status === "JWT_INVALID") {
        Swal.fire({ text: response.data.message, icon: "warning" });
        router.push("/");
      } else {
        Swal.fire({ text: response.data.message, icon: "warning" });
      }
      // console.log("thhhech", TechnicianList);
    } catch (error) {
      Swal.fire({ text: error.message, icon: "warning" });
    } finally {
      setLoader(false);
    }
  };
  useEffect(() => {
    technicianList();
    setRoleName(getCookie("role"));
  }, []);

  const handleSearch = (e) => {
    setSearchString(e.target.value);
    let isSearch = true;
    clearTimeout(timeoutId);
    let _timeOutId = setTimeout(() => {
      fetchAssignMaterial(currentPage, e.target.value, "", isSearch);
    }, 2000);
    setTimeoutId(_timeOutId);
  };
  useEffect(() => {
    fetchAssignMaterial(currentPage, searchString);
  }, [isPageUpdated]);
  return (
    <div>
      {" "}
      <div className="row d-flex m-0 mb-3">
        <div className="col-2 justify-content-center d-flex align-items-center">
          <div className="border border-3  mb-2 border-solid border-color-#bababa ps-1 d-flex align-items-center">
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
        </div>
        <div className="col-2 justify-content-center d-flex align-items-center">
          {roleName === "admin" && (
            <div
              className="border border-3 mb-2 border-solid border-color-#bababa d-flex align-items-center"
              style={{ background: "#f5f5f5" }}
            >
              <select
                className="inputBox"
                style={{
                  height: "30px",
                  background: "#f5f5f5",
                  border: "none",
                  width: "100%",
                }}
                // {...register("userId", {
                //   required: "Technician is required",
                // })}
                onChange={(e) =>
                  fetchAssignMaterial(currentPage, "", e.target.value)
                }
              >
                {/* <option>Roshan</option>
                  <option>Roshan 2</option> */}
                <option value="">Select Technician</option>
                {TechnicianList.map((ele, index) => {
                  return (
                    <option value={ele._id} key={index}>
                      {ele.name}
                    </option>
                  );
                })}
              </select>
              {/* <div style={{ height: "5px" }}>
                  {errors.userId && (
                    <p className="text-danger text-start" style={{ fontSize: "0.7rem" }}>
                      {errors.userId.message}
                    </p>
                  )}
                </div> */}
            </div>
          )}
        </div>
      </div>
      <div className="table_wrapper">
        <div className="table_main">
          <div className="table_container_daily">
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
              <div className="category_stock">
                <h5>Category</h5>
              </div>
              <div className="assigned">
                <h5>Assigned</h5>
              </div>
              <div className="item_code2">
                <h5>Item Code</h5>
              </div>
              <div className="model_name">
                <h5>Model Name</h5>
              </div>

              <div className="item_code">
                <h5>Location</h5>
              </div>
              <div className="block_in_stock">
                <h5>Block Name</h5>
              </div>
              <div className="rack_in_stock">
                <h5>Rack No</h5>
              </div>
              <div className="serial_stock">
                <h5>Serial No.</h5>
              </div>

              <div className="condition_type">
                <h5>Type</h5>
              </div>
              <div className="brand_make">
                <h5>Brand</h5>
              </div>
            </div>
            <div className="table_data_wrapper" style={{ height: "94%" }}>
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
                            materialDetails.isActive
                              ? "cursor-pointer"
                              : "cursor-not-allowed"
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
                      <div
                        className="category_stock"
                        style={{ cursor: "pointer" }}
                        title={materialDetails && "Return"}
                      >
                        {/* <button onClick={router.push()}> */}
                        <h6
                          style={{ color: "#0000FF" }}
                          onClick={() =>
                            router.push(
                              `/admin/dashboard/daily-task/return-material?materialId=${materialDetails._id}`
                            )
                          }
                        >
                          {materialDetails?.category}
                        </h6>
                        {/* </button> */}
                      </div>
                      <div className="assigned">
                        <h6>{materialDetails?.assignedTo.name}</h6>
                      </div>
                      <div className="item_code2">
                        <h6>{materialDetails?.itemCode}</h6>
                      </div>
                      <div className="model_name">
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

                      <div className="item_code">
                        <h6>{materialDetails?.location}</h6>
                      </div>
                      <div className="block_in_stock">
                        <h6>{materialDetails?.block}</h6>
                      </div>
                      <div className="rack_in_stock">
                        <h6>
                          {materialDetails?.rack ? materialDetails?.rack : "-"}
                        </h6>
                      </div>
                      <div className="serial_stock">
                        <h6>{materialDetails?.serialNo}</h6>
                      </div>

                      <div className="condition_type">
                        <h6>{materialDetails?.conditionType}</h6>
                      </div>
                      <div className="brand_make" style={{ display: "flex" }}>
                        <h6>{materialDetails?.brand}</h6>
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

export default DailyTask;
