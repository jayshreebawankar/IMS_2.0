"use client";
import Sidebar from "./sidebar";
import UserInfo from "@/reusable/userInfo";
import CustomProvider from "../customProvider";

export default function Layout({ children }) {
  return (
    <CustomProvider>
      <div className="dashboard_wrapper">
        <Sidebar />
        <div className="routes_view" style={{ backgroundColor: "#F0F0F0" }}>
          <UserInfo />
          {children}
        </div>
      </div>
    </CustomProvider>
  );
}
