"use client";
import Image from "next/image";
import { communication } from "@/apis/communication";
import React, { useEffect, useRef, useState } from "react";
import edit from "../../../../../public/images/rolecreate/edit.png";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import search from "../../../../../public/images/rolecreate/search.png";
import Pagination from "@/reusable/Pagination";
import { useForm } from "react-hook-form";
const pageLimit = process.env.NEXT_PUBLIC_LIMIT ?? 20;

const StockList = () => {
  const amountInputRefs = useRef([]);
  const [page, setPage] = useState(1);
  const router = useRouter();
  const [amounts, setAmounts] = useState({});
  const [loader, setLoader] = useState(false);
  const [material, setMaterial] = useState([]);
  const [roles, setRoles] = useState([]);
  const [searchString, setSearchString] = useState("");
  const [timeoutId, setTimeoutId] = useState();

  const [currentPage, setCurrentPage] = useState(1);
  const [isPageUpdated, setIsPageUpdated] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [emptyInputs, setEmptyInputs] = useState([]);

  async function getStatusWiseMaterialList(page, searchString, isSearch = false) {
    try {
      setLoader(true);
      const serverResponse = await communication.getStatusWiseMaterialList({
        page: 1,
        status: "accept",
      });
      if (serverResponse?.data?.status === "SUCCESS") {
        setMaterial(serverResponse?.data.material);
        setPageCount(serverResponse?.data?.totalPages);
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
  async function enterPriceForMaterial(materialId, amount) {
    // console.log("material", materialId, amount);
    // if (amount <= 0) {
    //   // amountInputRefs.current[index].focus(); // Focus on the input associated with this material
    //   Swal.fire({ text: "Please Enter amount", icon: "warning" });

    //   return;
    // }
    const enteredAmount = amounts[materialId];
    // Check if enteredAmount exists and is greater than 0 before proceeding
    if (!enteredAmount || enteredAmount <= 0) {
      // Show a warning message
      Swal.fire({ text: "Please Enter amount", icon: "warning" });
      return;
    }
    // if (amount <= 0) {
    //   setEmptyInputs((prev) => [...prev, materialId]);
    // } else {
    // setEmptyInputs((prev) => prev.filter((id) => id !== materialId));
    // Proceed with saving logic
    try {
      setLoader(true);
      const serverResponse = await communication.enterPriceForMaterial({
        // materialId: "65ddd03a48833379e1b090e9",
        // amount: 5623,
        materialId: materialId,
        amount: amount,
      });
      if (serverResponse?.data?.status === "SUCCESS") {
        Swal.fire({ text: serverResponse.data.message, icon: "success" });
        getStatusWiseMaterialList();
        setAmounts({});
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
  // }
  // Update handleAmount function to accept index and materialId
  const handleAmount = (e, materialId) => {
    const value = e.target.value;
    // Update the amounts state with the entered value for the corresponding material ID
    setAmounts((prevAmounts) => ({
      ...prevAmounts,
      [materialId]: value,
    }));

    // If the input is empty, add the material ID to emptyInputs; otherwise, remove it
    if (value === "") {
      setEmptyInputs((prev) => [...prev, materialId]);
    } else {
      setEmptyInputs((prev) => prev.filter((id) => id !== materialId));
    }
  };

  async function changeMaterialStatus(materialData, index) {
    // if (amount <= 0) {
    //   amountInputRefs.current[index].focus(); // Focus on the input associated with this material
    //   Swal.fire({ text: "Please Enter amount", icon: "warning" });
    //   return;
    // }

    try {
      setLoader(true);
      const serverResponse = await communication.changeMaterialStatus({
        stockId: materialData._id,
        status: materialData.status,
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
                <h5>Status</h5>
              </div>
              {/* <div className="condition_type">
                <h5>Enter Amount</h5>
              </div> */}
              <div className="action" style={{ width: "492px" }}>
                <h5>Enter Amount</h5>
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
                        // onClick={() =>
                        //   router.push(
                        //     `/admin/dashboard/daily-task/return-material?materialId=${materialDetails._id}`
                        //   )
                        // }
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
                        <h6>{materialDetails?.location}</h6>
                      </div>
                      <div className="block_in_stock">
                        <h6>{materialDetails?.block}</h6>
                      </div>
                      <div className="rack_in_stock">
                        <h6>{materialDetails?.rack}</h6>
                      </div>
                      <div className="serial_stock">
                        <h6>{materialDetails?.serialNo}</h6>
                      </div>

                      <div className="condition_type">
                        <h6>{materialDetails?.status}</h6>
                      </div>

                      <div className="action" style={{ display: "flex", width: "492px" }}>
                        {/* <h6>{materialDetails?.brand}</h6> */}
                        {/* <div className="w-50"> */}
                        <div>
                          <input
                            type="number"
                            className="w-75 inputBox"
                            placeholder="Enter Amount"
                            onChange={(e) => handleAmount(e, materialDetails._id)}
                            value={amounts[materialDetails._id] || ""} // Bind input value to amounts state
                          />
                          {emptyInputs.includes(materialDetails._id) && (
                            <div style={{ height: "5px" }}>
                              <p className="text-danger text-start" style={{ fontSize: "0.7rem" }}>
                                Please Enter amount
                              </p>
                            </div>
                          )}
                        </div>

                        <button
                          className="actionbtn"
                          // Pass materialId and corresponding amount from the state to enterPriceForMaterial
                          onClick={() => {
                            // Check if the corresponding input is empty
                            if (
                              amounts[materialDetails._id] === undefined ||
                              amounts[materialDetails._id] === ""
                            ) {
                              // If input is empty, add materialId to emptyInputs state
                              setEmptyInputs((prev) => [...prev, materialDetails._id]);
                            } else {
                              // If input is not empty, proceed with saving logic
                              enterPriceForMaterial(
                                materialDetails._id,
                                amounts[materialDetails._id]
                              );
                            }
                          }}
                        >
                          Save
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

export default StockList;
