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

const InventoryLook = () => {
  const [page, setPage] = useState(1);
  const router = useRouter();

  const [loader, setLoader] = useState(false);
  const [material, setMaterial] = useState([]);
  const [roles, setRoles] = useState([]);
  const [searchString, setSearchString] = useState("");
  const [timeoutId, setTimeoutId] = useState();

  const [currentPage, setCurrentPage] = useState(1);
  const [isPageUpdated, setIsPageUpdated] = useState(false);
  const [pageCount, setPageCount] = useState(0);

  async function getStatusWiseMaterialList(
    page,
    searchString,
    isSearch = false
  ) {
    try {
      setLoader(true);
      const serverResponse = await communication.getStatusWiseMaterialList({
        page: 1,
        status: "sell",
      });
      if (serverResponse?.data?.status === "SUCCESS") {
        setMaterial(serverResponse?.data.material);
        // setPageCount(serverResponse?.data?.totalPages);
        // setPage(page);
        // if (isSearch) {
        //   setCurrentPage(1);
        // }
      } else if (serverResponse.data.status == "FAILED") {
        setMaterial([]);
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
  async function changeMaterialStatus(materialData) {
    try {
      setLoader(true);
      const serverResponse = await communication.changeMaterialStatus({
        stockId: materialData._id,
        status: "sell",
      });
      if (serverResponse?.data?.status === "SUCCESS") {
        Swal.fire({ text: serverResponse.data.message, icon: "success" });
        setMaterial(serverResponse?.data.material);
        getStatusWiseMaterialList();
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
  const handleSearch = (e) => {
    setSearchString(e.target.value);
    let isSearch = true;
    clearTimeout(timeoutId);
    let _timeOutId = setTimeout(() => {
      getStatusWiseMaterialList(currentPage, e.target.value, isSearch);
    }, 2000);
    setTimeoutId(_timeOutId);
  };

  useEffect(() => {
    getStatusWiseMaterialList();
  }, []);
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
          <div className="table_container_inventory">
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
              <div className="item_code">
                <h5>Model Name</h5>
              </div>

              <div className="item_code">
                <h5>Location</h5>
              </div>
              <div className="item_code">
                <h5>Item Code</h5>
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
                <h5>Status</h5>
              </div>
              <div className="condition_type">
                <h5>Amount</h5>
              </div>
              <div className="action">
                <h5>Action</h5>
              </div>
            </div>
            <div className="table_data_wrapper">
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
                      <div className="category_stock">
                        {/* <button onClick={router.push()}> */}
                        <h6
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
                        <h6>{materialDetails?.modelName}</h6>
                      </div>

                      <div className="item_code">
                        <h6>{materialDetails?.location}</h6>
                      </div>
                      <div className="item_code">
                        <h6>{materialDetails?.itemCode}</h6>
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
                        <h6>{materialDetails?.status}</h6>
                      </div>
                      <div className="condition_type">
                        <h6>&#8377;{materialDetails?.amount}</h6>
                      </div>
                      <div className="action" style={{ display: "flex" }}>
                        {/* <h6>{materialDetails?.brand}</h6> */}
                        <button
                          className="actionbtn"
                          onClick={(e) => changeMaterialStatus(materialDetails)}
                        >
                          Sell
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

export default InventoryLook;
