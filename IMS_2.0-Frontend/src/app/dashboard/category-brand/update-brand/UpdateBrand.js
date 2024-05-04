"use client";
import Image from "next/image";
import saveIcon from "../../../../../../public/images/rolecreate/saveicon.png";
import search from "../../../../../../public/images/rolecreate/search.png";
import importicon from "../../../../../../public/images/rolecreate/import.png";
import exporticon from "../../../../../../public/images/rolecreate/export.png";
import deleteicon from "../../../../../../public/images/rolecreate/delete.png";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Pagination from "@/reusable/Pagination";
import { communication } from "@/apis/communication";
import Swal from "sweetalert2";
import edit from "../../../../../../public/images/rolecreate/edit.png";
import { useRouter, useSearchParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import Loader from "@/reusable/Loader";

const UpdateBrand = () => {
  const router = useRouter();

  const [searchString, setSearchString] = useState("");
  const searchParams = useSearchParams();
  const [timeoutId, setTimeoutId] = useState();

  const [loader, setLoader] = useState(false);
  const [brand, setBrandList] = useState([]);
  const pageLimit = process.env.NEXT_PUBLIC_LIMIT ?? 20;
  const [page, setPage] = useState(1);

  const [currentPage, setCurrentPage] = useState(1);
  const [isPageUpdated, setIsPageUpdated] = useState(false);
  const [pageCount, setPageCount] = useState(0);

  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [selectedCheckboxes, setSelectedCheckboxes] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm();

  const onSubmit = async (values) => {
    try {
      let payload = {
        brandId: searchParams.get("brandId"),
        name: values.brand,
      };
      setLoader(true);
      const serverResponse = await communication.updateBrand(payload);
      if (serverResponse?.data?.status === "SUCCESS") {
        router.push("/admin/dashboard/category-brand/");
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

  //get Brand list on initial Load
  async function getBrandById() {
    try {
      setLoader(true);
      const serverResponse = await communication.getBrandById({
        brandId: searchParams.get("brandId"),
      });
      if (serverResponse?.data?.status === "SUCCESS") {
        setValue("brand", serverResponse?.data?.brand.name);
      } else if (serverResponse?.data?.status === "JWT_INVALID") {
        Swal.fire({ text: serverResponse.data.message, icon: "warning" });
        router.push("/");
        setLoader(false);
      } else {
        // setBrandList([]);
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
    getBrandById();
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
              <h5>Update Brand</h5>
            </div>
            <div className="row m-0 mt-5 mb-3 d-flex justify-content-center">
              <div className="col-lg-2 col-md-3 d-flex align-items-center">
                <h6>Brand Name</h6>
              </div>
              <div className="col-lg-4 col-md-4 ">
                <input
                  type="text"
                  {...register("brand", {
                    required: "Brand name is required",
                  })}
                  className="inputBox text-capitalize"
                />
                <div style={{ height: "5px" }}>
                  {errors.brand && (
                    <p
                      className="text-danger text-start"
                      style={{ fontSize: "0.8rem" }}
                    >
                      {errors.brand.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="row m-0 mt-3 mb-3 d-flex justify-content-center">
              <div className="col-lg-1 col-md-3  d-flex align-items-center"></div>
              <div className="col-lg-3 col-md-3 d-flex  gap-4 mt-4">
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

export default UpdateBrand;
