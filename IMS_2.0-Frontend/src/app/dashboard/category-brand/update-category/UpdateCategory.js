"use client";
import Image from "next/image";
import saveIcon from "../../../../../../public/images/rolecreate/saveicon.png";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import { communication } from "@/apis/communication";
import { useRouter, useSearchParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import Loader from "@/reusable/Loader";

const UpdateCategory = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loader, setLoader] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const [errorForCategoryFlag, seterrorForCategoryFlag] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm();

  const getCategoryById = async (values) => {
    try {
      setLoader(true);

      let response = await communication.getCategoryById({
        categoryId: searchParams.get("categoryId"),
      });
      if (response?.data?.status === "SUCCESS") {
        // Swal.fire({ text: response.data.message, icon: "success" });
        // let user = response.data.user;
        setValue("category", response.data.category.name);
        setSelectedOption(response.data.category.isReplaceable ? "Yes" : "No");
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
  const onSubmit = async (values) => {
    if (selectedOption == "") {
      seterrorForCategoryFlag("Please confirm one");
      return;
    }
    try {
      let payload = {
        categoryId: searchParams.get("categoryId"),
        name: values.category,
        isReplaceable: selectedOption === "Yes" ? true : false,
      };
      setLoader(true);
      const serverResponse = await communication.updateCategory(payload);
      if (serverResponse?.data?.status === "SUCCESS") {
        router.push("/admin/dashboard/category-brand/");
        // await getAllCategory(currentPage, searchString);
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
  const CheckboxChange = (event) => {
    setSelectedOption(event.target.value);
    seterrorForCategoryFlag("");
  };
  //   const updateUser = async (values) => {
  //     try {
  //       setLoader(true);
  //       let payload = {
  //         name: values.name,
  //         email: values.email,
  //         mobile: values.mobile,
  //         password: values.password,
  //         userId: searchParams.get("userId"),
  //         roleId: getCookie("roleId"),
  //       };
  //       let response = await communication.updateUser(payload);
  //       if (response?.data?.status === "SUCCESS") {
  //         Swal.fire({ text: response.data.message, icon: "success" });
  //         router.push(`/admin/dashboard/user/`);
  //         // reset();
  //         // await getUserList(currentPage, searchString);
  //       } else if (response?.data?.status === "JWT_INVALID") {
  //         Swal.fire({ text: response.data.message, icon: "warning" });
  //         router.push("/");
  //       } else {
  //         Swal.fire({ text: response.data.message, icon: "warning" });
  //       }
  //     } catch (error) {
  //       Swal.fire({ text: error.message, icon: "warning" });
  //     } finally {
  //       setLoader(false);
  //     }
  //   };
  useEffect(() => {
    getCategoryById();
  }, []);
  return (
    <>
      {loader ? (
        <Loader />
      ) : (
        <div
          className="form_view"
          id="form_part1"
          style={{ width: "100%", height: "60%", margin: "80px" }}
        >
          <form onSubmit={handleSubmit(onSubmit)} style={{ height: "55%" }}>
            <div className="form_title">
              <h5>Update Category</h5>
            </div>
            <div className="row m-0 mt-3 mb-3 d-flex justify-content-center ">
              <div className="col-lg-2 col-md-3  d-flex align-items-center">
                <h6>Category Name</h6>
              </div>
              <div className="col-lg-4 col-md-4">
                <div>
                  <input
                    type="text"
                    {...register("category", {
                      required: "Category is required",
                    })}
                    className="inputBox"
                  />
                  <div style={{ height: "5px" }}>
                    {errors.category && (
                      <p
                        className="text-danger text-start"
                        style={{ fontSize: "0.8rem" }}
                      >
                        {errors.category.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="row m-0 mt-3 mb-3 ms-2  d-flex justify-content-center">
              <div className="col-lg-2 col-md-3  d-flex align-items-center">
                <h6>Add to this category</h6>
              </div>
              <div className="col-lg-4 col-md-4 col-sm-8 p-0 ms-3">
                <div className="d-flex gap-3">
                  <label className="cursor-pointer">
                    <input
                      className="cursor-pointer"
                      type="checkbox"
                      value="Yes"
                      checked={selectedOption === "Yes"}
                      onChange={CheckboxChange}
                    />
                    &nbsp; Yes
                  </label>
                  <label className="cursor-pointer">
                    <input
                      className="cursor-pointer"
                      type="checkbox"
                      value="No"
                      checked={selectedOption === "No"}
                      onChange={CheckboxChange}
                    />
                    &nbsp; No
                  </label>
                </div>
                {/* <div style={{ height: "5px" }}>
                  {errorForRackFlag && (
                    <p
                      className="text-danger text-start"
                      style={{ fontSize: "0.8rem" }}
                    >
                      {errorForRackFlag}
                    </p>
                  )}
                </div> */}
              </div>
              {/* {selectedOption === "Yes" && (
                  <>
                    <div className="col-lg-2 col-md-2 col-sm-4 p-0 d-flex align-items-center">
                      <h6>Rack Select</h6>
                    </div>
                    <div className="col-lg-4 col-md-4 col-sm-8 p-0">
                      <Multiselect
                        isObject={false}
                        options={props?.rackList.map((rackData) => rackData.rackNo)}
                        onSelect={(selectedList) => {
                          const selectedIds = selectedList.map((selectedRackNo) => {
                            const selectedRack = props?.rackList.find(
                              (rackData) => rackData.rackNo === selectedRackNo
                            );
                            return selectedRack ? selectedRack._id : null;
                          });

                          setPropertyType(selectedIds);
                        }}
                        onRemove={(selectedList) => {
                          const selectedIds = selectedList.map((selectedRackNo) => {
                            const selectedRack = props?.rackList.find(
                              (rackData) => rackData.rackNo === selectedRackNo
                            );
                            return selectedRack ? selectedRack._id : null;
                          });

                          setPropertyType(selectedIds);
                        }}
                        keepSearchTerm={true}
                        showCheckbox={true}
                        showArrow
                        // customArrow
                        // className=" inputBox p-0 w-75"
                        rules={{ required: "Rack no is required" }}
                        style={{
                          multiselectContainer: {
                            width: "120px",
                            // width: "auto",
                            position: "absolute",
                            border: "1px solid #929292",
                            background: "#fff",
                            height: "30px",
                            // overflowX: "hidden",
                          },
                          inputField: {
                            // To change input field position or margin
                            marginTop: "0",
                            marginRight: "2px",
                            marginBottom: "5px",
                          },
                          chips: {
                            background: "blue",
                          },
                          optionContainer: {
                            border: "1px solid #929292",
                            height: "130px",
                            scrollbarWidth: "thin",
                          },
                          option: {
                            color: "black",
                            background: "none",
                          },
                          searchBox: {
                            border: "black",
                            fontSize: "15px",
                            height: "40px",
                            width: "auto",
                            overflowX: "scroll",
                            scrollbarWidth: "none",
                            display: "flex",
                          },
                        }}
                        // style={{
                        //   position: "absolute",
                        //   zIndex: 9999, // Adjust the z-index value based on your layout
                        //   top: "100%", // Position the dropdown below the input box
                        //   left: 0, // Align with the left edge of the input box
                        //   width: "100%", // Set the width to match the input box or adjust as needed
                        // }}
                      />

                      <div style={{ height: "5px" }}>
                        {errors.rackNo && (
                          <p className="text-danger text-start" style={{ fontSize: "0.8rem" }}>
                            {errors.rackNo.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                )} */}
            </div>
            <div className="row m-0 mt-3 mb-3  d-flex justify-content-center ">
              <div className="col-lg-1 col-md-3  d-flex align-items-center"></div>
              <div className="col-lg-3 col-md-3 d-flex gap-4 mt-4">
                <button className="savebtn mb-1" type="submit">
                  <Image alt="" src={saveIcon}></Image>Update
                </button>
                <button
                  onClick={() => router.push("/admin/dashboard/category-brand")}
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

export default UpdateCategory;
