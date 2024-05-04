"use client";
import { communication } from "@/apis/communication";
import React, { useEffect } from "react";
import Swal from "sweetalert2";

const Report = () => {
  async function monthlySoldOutMaterial() {
    try {
      const serverResponse = await communication.monthlySoldOutMaterial({
        year: 2024,
      });
      if (serverResponse?.data?.status === "SUCCESS") {
      } else if (serverResponse?.data?.status === "JWT_INVALID") {
        Swal.fire({ text: serverResponse.data.message, icon: "warning" });
        router.push("/");
      } else if (serverResponse?.data?.status == "FAILED") {
        // Swal.fire({
        //   text: res?.data?.message,
        //   icon: "warning",
        // });
      } else {
        Swal.fire({ text: serverResponse.data.message, icon: "warning" });
      }
    } catch (error) {
      Swal.fire({
        text: error?.serverResponse?.data?.message || error.message,
        icon: "warning",
      });
    }
  }

  useEffect(() => {
    monthlySoldOutMaterial();
  }, []);
  return <div>Page Under Maintainance</div>;
};

export default Report;
