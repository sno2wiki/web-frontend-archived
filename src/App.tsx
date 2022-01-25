import React from "react";
import { Outlet } from "react-router-dom";

export const App: React.VFC = () => {
  return (
    <>
      <Outlet />
    </>
  );
};
