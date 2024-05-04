"use client";
import Loader from "@/reusable/Loader";
import Pagination from "@/reusable/Pagination";
import React, { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import addIcon from "../../../../../../public/add.svg";

import saveIcon from "../../../../../../public/images/rolecreate/saveicon.png";
import search from "../../../../../../public/images/rolecreate/search.png";
import importicon from "../../../../../../public/images/rolecreate/import.png";
import exporticon from "../../../../../../public/images/rolecreate/export.png";
import deleteicon from "../../../../../../public/images/rolecreate/delete.png";
import edit from "../../../../../../public/images/rolecreate/edit.png";
import Image from "next/image";
import { communication } from "@/apis/communication";
import Swal from "sweetalert2";
import { useRouter, useSearchParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { getCategory } from "@/apis/comman-apis";

const UpdateParameter = () => {
  const router = useRouter();
  const [categoryList, setCategoryList] = useState([]);
  const [loader, setLoader] = useState(false);
  const [categoryFillById, setCategoryFillById] = useState();
  const [_parameterList, _setPrameterList] = useState([]);
  const [parameterInput, setParameterInput] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    watch,
    setError,
    formState: { errors },
  } = useForm();

  const { fields, append } = useFieldArray({
    control,
    name: "dynamicFields",
  });
  const _parameterInput = watch("parameter");

  function addToPrameterList() {
    if (parameterInput) {
      _setPrameterList((prev) => [...prev, parameterInput]);
      setValue("parameter", "");
    } else {
      setError("parameter", {
        message: "Please enter parameter",
      });
    }
  }
  function deletePrameterList(id) {
    _setPrameterList(_parameterList.filter((item) => item != id));
  }
  useEffect(() => {
    setParameterInput(_parameterInput);
  }, [_parameterInput]);
  // const parameterxs = ["par1", "par2", "par3"];
  // React.useEffect(() => {
  //   parameterxs.forEach((parameter) => {
  //     append({ value: "" });
  //     setValue(`dynamicFields[${fields.length}].label`, "rrr");
  //   });
  // }, []);

  const searchParams = useSearchParams();
  const getParameterById = async (values) => {
    try {
      setLoader(true);

      let response = await communication.getParameterById({
        parameterId: searchParams.get("parameterId"),
      });
      if (response?.data?.status === "SUCCESS") {
        setCategoryFillById(response?.data?.parameter?.categoryId);
        let param = response?.data.parameter.parameter[0];
        setValue("category", ` ${response?.data?.parameter?.categoryId}`);
        // setValue("parameter", param);
        _setPrameterList([...response?.data?.parameter?.parameter]);

        // Swal.fire({ text: response.data.message, icon: "success" });
        // let user = response.data.user;
        // setValue("category", response.data.category.name);
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
    if (_parameterList.length == 0 && values.parameter == "") {
      setError("parameter", {
        message: "Parameter is required",
      });
    } else {
      try {
        let payload = {
          parameterId: searchParams.get("parameterId"),
          parameter: [..._parameterList],
          categoryId: values.category,
        };
        setLoader(true);
        const serverResponse = await communication.updateParameter(payload);
        if (serverResponse?.data?.status === "SUCCESS") {
          router.push("/admin/dashboard/parameter/");
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
    }
  };
  async function getAllCategory(page, searchString) {
    try {
      setLoader(true);
      const serverResponse = await communication.getAllCategory(
        page,
        searchString
      );
      if (serverResponse?.data?.status === "SUCCESS") {
        // setParameterId(serverResponse.data.category._id);
        setCategoryList(serverResponse?.data.category);
        // setPageCount(serverResponse?.data?.totalPages);
        // setPage(page);
      } else if (serverResponse?.data?.status === "JWT_INVALID") {
        Swal.fire({ text: serverResponse.data.message, icon: "warning" });
        router.push("/");
        setLoader(false);
      } else {
        setCategoryList([]);
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
    getCategory(setLoader, router, setCategoryList);
    getParameterById();
  }, []);
  useEffect(() => {
    if (categoryFillById && categoryList.length > 0) {
      setValue("category", `${categoryFillById}`);
    }
  }, [categoryFillById && categoryList.length]);
  return (
    <>
      {loader ? (
        <Loader />
      ) : (
        <div className="form_view w-100" id="form_part1">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form_title">
              <h5>Update Parameters</h5>
            </div>
            <div className="row m-0 mt-3 mb-3 ps-5">
              <div className="col-lg-2 col-md-2 justify-content-center d-flex align-items-center">
                <h6 style={{ marginRight: "10px" }}>Category Name</h6>
              </div>
              <div className="col-lg-2 col-md-2">
                <select
                  className="inputBox"
                  {...register("category", {
                    required: "Category is required",
                  })}
                  style={{ outline: "none" }}
                >
                  <option value="">Select Category</option>
                  {categoryList?.map((categoryData, index) => (
                    <option value={categoryData?._id} key={index + 1}>
                      {categoryData?.name.toUpperCase()}
                    </option>
                  ))}
                </select>
                <div style={{ height: "5px" }}>
                  {errors.category && (
                    <p
                      className="text-danger text-start"
                      style={{ fontSize: "0.7rem" }}
                    >
                      {errors.category.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="row m-0 mt-3 mb-3 ps-5">
              <div className="col-lg-2 col-md-2 justify-content-center d-flex align-items-center">
                <h6>Parameters Name</h6>
              </div>
              <div className="col-lg-2 col-md-2 d-flex flex-column">
                <input
                  type="text"
                  {...register("parameter")}
                  className="inputBox"
                />
                <div style={{ height: "5px" }}>
                  {errors.parameter && (
                    <p
                      className="text-danger text-start"
                      style={{ fontSize: "0.7rem" }}
                    >
                      {errors.parameter.message}
                    </p>
                  )}
                </div>
              </div>
              <div className=" col-lg-1 col-md-1 justify-content-start d-flex align-items-center">
                <button
                  type="button"
                  onClick={addToPrameterList}
                  className="p-1 d-flex align-items-center justify-content-center"
                  style={{
                    height: "32px",
                    width: "35px",
                    border: "1px solid #BABABA",
                  }}
                >
                  <Image alt="" src={addIcon}></Image>
                </button>
              </div>
            </div>
            <div className="row m-0 mt-3 mb-3 ps-5">
              {_parameterList.map((item, index) => (
                <div
                  key={index}
                  className="col-lg-3 col-md-3 my-2 justify-content-center d-flex align-items-center"
                >
                  <div className="d-flex  gap-3 align-items-center justify-content-center">
                    <h6>{item}</h6>
                    <Image
                      className="cursor-pointer"
                      key={index}
                      onClick={() => deletePrameterList(item)}
                      alt=""
                      src={deleteicon}
                    ></Image>
                  </div>
                </div>
              ))}
            </div>

            <div className="row m-0 mt-3 mb-3 ps-5">
              <div className="col-lg-2 col-md-2  d-flex align-items-center"></div>
              <div className="col-lg-3 col-md-3 d-flex gap-2">
                <button className="savebtn mb-1" type="submit">
                  <Image src={saveIcon} alt="saveIcon"></Image>Update
                </button>
                <button
                  onClick={() => router.push("/admin/dashboard/parameter")}
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

export default UpdateParameter;
