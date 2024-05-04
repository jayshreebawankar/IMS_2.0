"use client";
import { useEffect, useState } from "react";
import BlockManagement from "./BlockManagement";
import RackManagement from "./RackManagement";
import { communication } from "@/apis/communication";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import Loader from "@/reusable/Loader";

export default function Page() {
  const router = useRouter();
  const [rackList, setRackList] = useState([]);
  const [loader, setLoader] = useState(0);

  useEffect(() => {
    // getActiveRack();
  }, []);

  const getActiveRack = async () => {
    try {
      setLoader((prevState) => prevState + 1);

      let response = await communication.getActiveRack();
      if (response?.data?.status === "SUCCESS") {
        setRackList(response?.data.rack);
      } else if (response?.data?.status === "JWT_INVALID") {
        Swal.fire({ text: response.data.message, icon: "warning" });
        router.push("/");
      } else {
        Swal.fire({ text: response.data.message, icon: "warning" });
      }
    } catch (error) {
      Swal.fire({ text: error.message, icon: "warning" });
    } finally {
      setLoader((prevState) => prevState - 1);
    }
  };
  return (
    <>
      {false ? (
        <Loader />
      ) : (
        <div className="d-flex" style={{ width: "100%", gap: "2%" }}>
          <RackManagement getActiveRack={getActiveRack} setLoader={setLoader} />
          <BlockManagement rackList={rackList} setLoader={setLoader} />
        </div>
      )}
    </>
  );
}
