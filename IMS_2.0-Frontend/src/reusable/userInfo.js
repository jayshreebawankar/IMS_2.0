import { getCookie } from "cookies-next";
import React, { useEffect, useReducer } from "react";
import { useSelector } from "react-redux";

const UserInfo = () => {
  const AuthUser = useSelector((state) => state.user);

  const [state, setState] = useReducer((state, newState) => ({ ...state, ...newState }), {
    userName: "",
    role: "",
  });

  useEffect(() => {
    setState({ userName: getCookie("userName"), role: getCookie("role") });
  }, []);

  return (
    <div className="top_header d-flex justify-content-end">
      <span style={{ fontSize: "0.7rem", textTransform: "capitalize" }}>
        Username : {state?.userName} &nbsp; &nbsp; Role: {state?.role}
      </span>
    </div>
  );
};

export default UserInfo;
