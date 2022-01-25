import React from "react";
import { Outlet } from "react-router-dom";
import { SWRConfig } from "swr";

export const App: React.VFC = () => {
  return (
    <>
      <SWRConfig
        value={{
          fetcher: (resource, init) =>
            fetch(resource, init).then((res) => res.json()),
        }}
      >
        <Outlet />
      </SWRConfig>
    </>
  );
};
