"use client";
import { Fragment, useEffect, useState } from "react";
import logo from "../../../public/images/sideBarLogo.png";
import logout from "../../../public/images/logout.png";
import menuicon from "../../../public/images/menuicon.png";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDispatch } from "react-redux";
import Swal from "sweetalert2";
import { getCookie, setCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { io } from "socket.io-client";
import { communication, getServerUrl } from "@/apis/communication";

export default function Sidebar() {
  const currentUrl = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  // console.log("tab", getCookie("tab"));
  const [activeTab, setActiveTab] = useState(""); // State to hold the active tab
  //socket logic for notification start
  // const [socket, setSocket] = useState();
  const [notificationCount, setNotificationCount] = useState();

  // useEffect(() => {
  //   const socketConnection = io(getServerUrl(), { transports: ["websocket"] });
  //   setSocket(socketConnection);
  //   return () => {
  //     socketConnection.disconnect();
  //     console.log("disconnect");
  //   };
  // }, []);

  // useEffect(() => {
  //   if (socket) {
  //     socket.on("notificationCount", (data) => {
  //       setNotificationCount(data);
  //     });
  //   }
  // }, [socket]);

  const [socket, setSocket] = useState();
  useEffect(() => {
    const socketConnection = io(getServerUrl(), { transports: ["websocket"] });
    setSocket(socketConnection);
    return () => {
      socketConnection.disconnect();
      console.log("disconnect");
    };
  }, []);
  useEffect(() => {
    if (socket) {
      socket.on("notificationCount", (data = []) => {
        // if (data?.includes(loginUserDetails._id)) {
        getNotificationCount();
        // }
      });
    }
  }, [socket]);

  useEffect(() => {
    getNotificationCount();
  }, []);
  async function getNotificationCount() {
    try {
      const serverResponse = await communication.getNotificationCount();
      if (serverResponse?.data?.status === "SUCCESS") {
        // Swal.fire({ text: serverResponse.data.message, icon: "success" });
        setNotificationCount(serverResponse?.data?.notification);
      } else if (serverResponse.data.status == "FAILED") {
        setNotificationCount();
      }
      // else if (serverResponse?.data?.status === "JWT_INVALID") {
      //   Swal.fire({ text: serverResponse.data.message, icon: "warning" });
      //   router.push("/");
      // } else {
      //   Swal.fire({ text: serverResponse.data.message, icon: "warning" });
      // }
    } catch (error) {
      // Swal.fire({
      //   text: error?.serverResponse?.data?.message || error.message,
      //   icon: "warning",
      // });
    }
  }
  //socket logic for notification end
  useEffect(() => {
    // Get the tab value from the cookie or wherever you store it
    const tabFromCookie = getCookie("tab");
    setActiveTab(tabFromCookie);
  }, []);
  // console.log("currentUrl", currentUrl);
  const logoutHandler = () => {
    Swal.fire({
      title: "Are you sure you want to logout?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, logout",
      cancelButtonText: "No, cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire("Logged Out!", "You have been logged out.", "success");
        // dispatch(login({ isLoggedIn: false }));
        setCookie("isLoggedIn", false);
        router.push("/");
      } else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    });
  };
  return (
    <Fragment>
      <div className="sidebar">
        <div className="sidebar-logo">
          <Image src={logo} width={80} height={80} alt="logo"></Image>
        </div>
        <div className="sidebar-menus">
          <ul>
            {activeTab?.includes("Role Management") && (
              <li className="sidebar-menus-items">
                {currentUrl?.includes("/admin/dashboard/role") && (
                  <Image
                    className={`menu-icon rotate`}
                    src={menuicon}
                    alt="active-tab-icon"
                    width={16}
                    height={15}
                  ></Image>
                )}
                <Link
                  href={"/admin/dashboard/role"}
                  className={
                    currentUrl?.includes("/admin/dashboard/role") ? `menu-link-1` : "menu-link"
                  }
                >
                  Role Management
                </Link>
              </li>
            )}

            {(activeTab?.includes("user_management") || activeTab?.includes("User Management")) && (
              <li className="sidebar-menus-items">
                {currentUrl?.includes("/admin/dashboard/user") && (
                  <Image
                    className={`menu-icon rotate`}
                    src={menuicon}
                    alt="active-tab-icon"
                    width={16}
                    height={15}
                  ></Image>
                )}
                <Link
                  href={"/admin/dashboard/user"}
                  className={
                    currentUrl?.includes("/admin/dashboard/user") ? `menu-link-1` : "menu-link"
                  }
                >
                  User Management
                </Link>
              </li>
            )}

            <li className="sidebar-menus-items">
              {currentUrl?.includes("/admin/dashboard/location") && (
                <Image
                  className={`menu-icon rotate`}
                  src={menuicon}
                  alt="active-tab-icon"
                  width={16}
                  height={15}
                ></Image>
              )}
              <Link
                href={"/admin/dashboard/location"}
                className={
                  currentUrl?.includes("/admin/dashboard/location") ? `menu-link-1` : "menu-link"
                }
              >
                Location
              </Link>
            </li>
            {(activeTab?.includes("category") || activeTab?.includes("brand")) && (
              <li className="sidebar-menus-items">
                {currentUrl?.includes("/admin/dashboard/category-brand") && (
                  <Image
                    className={`menu-icon rotate`}
                    src={menuicon}
                    alt="active-tab-icon"
                    width={16}
                    height={15}
                  ></Image>
                )}
                <Link
                  href={"/admin/dashboard/category-brand"}
                  className={
                    currentUrl?.includes("/admin/dashboard/category-brand")
                      ? `menu-link-1`
                      : "menu-link"
                  }
                >
                  Category & Brand
                </Link>
              </li>
            )}
            {activeTab?.includes("parameter") && (
              <li className="sidebar-menus-items">
                {currentUrl?.includes("/admin/dashboard/parameter") && (
                  <Image
                    className={`menu-icon rotate`}
                    src={menuicon}
                    alt="active-tab-icon"
                    width={16}
                    height={15}
                  ></Image>
                )}
                <Link
                  href={"/admin/dashboard/parameter"}
                  className={
                    currentUrl?.includes("/admin/dashboard/parameter") ? `menu-link-1` : "menu-link"
                  }
                >
                  Parameters
                </Link>
              </li>
            )}
            {(activeTab?.includes("Rack Management") ||
              activeTab?.includes("Block Management")) && (
              <li className="sidebar-menus-items" style={{ display: "inline-flex" }}>
                {currentUrl?.includes("/admin/dashboard/rack-and-block") && (
                  <Image
                    className={`menu-icon rotate`}
                    src={menuicon}
                    alt="active-tab-icon"
                    width={16}
                    height={15}
                  ></Image>
                )}
                <Link
                  href={"/admin/dashboard/rack-and-block"}
                  className={
                    currentUrl?.includes("/admin/dashboard/rack-and-block")
                      ? `menu-link-1`
                      : "menu-link"
                  }
                >
                  Rack & Block Management
                </Link>
              </li>
            )}
            {activeTab?.includes("Stock In") && (
              <li className="sidebar-menus-items">
                {currentUrl === "/admin/dashboard/stock" && (
                  <Image
                    className={`menu-icon rotate`}
                    src={menuicon}
                    alt="active-tab-icon"
                    width={16}
                    height={15}
                  ></Image>
                )}
                <Link
                  href={"/admin/dashboard/stock"}
                  className={currentUrl === "/admin/dashboard/stock" ? `menu-link-1` : "menu-link"}
                >
                  Stock In
                </Link>
              </li>
            )}

            {activeTab?.includes("Stock In") && (
              <li className="sidebar-menus-items">
                {currentUrl === "/admin/dashboard/stock-list" && (
                  <Image
                    className={`menu-icon rotate`}
                    src={menuicon}
                    alt="active-tab-icon"
                    width={16}
                    height={15}
                  ></Image>
                )}
                <Link
                  href={"/admin/dashboard/stock-list"}
                  className={
                    currentUrl?.includes("/admin/dashboard/stock-list")
                      ? `menu-link-1`
                      : "menu-link"
                  }
                >
                  Stock List
                </Link>
              </li>
            )}

            {activeTab?.includes("Stock Out") && (
              <li className="sidebar-menus-items">
                {currentUrl === "/admin/dashboard/stock-out" && (
                  <Image
                    className={`menu-icon rotate`}
                    src={menuicon}
                    alt="active-tab-icon"
                    width={16}
                    height={15}
                  ></Image>
                )}
                <Link
                  href={"/admin/dashboard/stock-out"}
                  className={
                    currentUrl === "/admin/dashboard/stock-out" ? `menu-link-1` : "menu-link"
                  }
                >
                  Stock Out
                </Link>
              </li>
            )}

            {activeTab?.includes("report") && (
              <li className="sidebar-menus-items">
                {currentUrl?.includes("/admin/dashboard/report") && (
                  <Image
                    className={`menu-icon rotate`}
                    src={menuicon}
                    alt="active-tab-icon"
                    width={16}
                    height={15}
                  ></Image>
                )}
                <Link
                  href={"/admin/dashboard/report"}
                  className={
                    currentUrl?.includes("/admin/dashboard/report") ? `menu-link-1` : "menu-link"
                  }
                >
                  Report
                </Link>
              </li>
            )}
          </ul>
        </div>
        <div className="sidebar-bottom">
          <div className="sidebar-bottom-left cursor-pointer" onClick={logoutHandler}>
            <Image src={logout} alt="logout" width={32} height={32}></Image>
            <span>Logout</span>
          </div>
          <div className="sidebar-bottom-right">
            <div className="sidebar-bottom-right-heading">
              <h3>IMS</h3>
              <span>
                <h6 style={{ color: "black", fontWeight: "700" }}>Inventory</h6>
                <h6 style={{ color: "black", fontWeight: "700" }}>Management</h6>
                <h6 style={{ color: "black", fontWeight: "700" }}>System</h6>
              </span>
            </div>
            <div className="sidebar-bottom-right-heading-down">
              <h6>Powered by</h6>
              <h5>
                <Link
                  style={{ textDecoration: "none", color: "black" }}
                  target="_blank"
                  href="https://rsinfotechsys.com/"
                  className="sidebar-bottom-right-text"
                >
                  RS Infotech System (RSIS)
                </Link>
              </h5>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
}
