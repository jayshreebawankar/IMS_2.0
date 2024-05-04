"use client";
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleLeft,
  faAngleRight,
  faForwardStep,
} from "@fortawesome/free-solid-svg-icons";

const Pagination = ({
  isPageUpdated,
  setIsPageUpdated,
  currentPage,
  setCurrentPage,
  pageCount,
}) => {
  return (
    <div className="pagination_main">
      <div className="pagination_wrapper">
        <div className="pagination_total_count">
          {/* <h5>{currentPage}</h5>
          <h5>of</h5>
          <h5>{pageCount}</h5>
          <h5>page</h5> */}
        </div>

        <button
          onClick={() => {
            setCurrentPage(1);
            setIsPageUpdated(!isPageUpdated);
          }}
          disabled={
            currentPage === 1 || currentPage === "" || pageCount === 0
              ? true
              : false
          }
        >
          <p>First</p>
        </button>

        <button
          onClick={() => {
            if (["", 1, -1, null].includes(currentPage)) {
              setCurrentPage(1);
            } else {
              setCurrentPage(currentPage - 1);
            }
            setIsPageUpdated(!isPageUpdated);
          }}
          disabled={currentPage === 1 || pageCount === 1 ? true : false}
        >
          <FontAwesomeIcon icon={faAngleLeft} />
        </button>

        <input
          type="number"
          value={currentPage}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              setIsPageUpdated(!isPageUpdated);
            }
          }}
          onChange={(event) =>
            setCurrentPage(
              event.target.value > pageCount
                ? pageCount
                : event.target.value && event.target.value <= 1
                ? 1
                : event.target.value
            )
          }
          className="form-control"
        />
        <h5>of</h5>
        <h5>{pageCount}</h5>

        <button
          onClick={() => {
            setCurrentPage(currentPage + 1);
            setIsPageUpdated(!isPageUpdated);
          }}
          disabled={currentPage >= pageCount || pageCount === 1 ? true : false}
        >
          <FontAwesomeIcon icon={faAngleRight} />
          {/* <span style={{ color: "transparent", border: "1px red" }}>
            {" "}
            <FontAwesomeIcon
              icon={faForwardStep}
              style={{ color: "transparent" }}
            />
          </span> */}
        </button>

        <button
          onClick={() => {
            setCurrentPage(pageCount);
            setIsPageUpdated(!isPageUpdated);
          }}
          disabled={
            currentPage === pageCount || currentPage === "" || pageCount === 0
              ? true
              : false
          }
        >
          <p>Last</p>
        </button>
      </div>
    </div>
  );
};

export default Pagination;
