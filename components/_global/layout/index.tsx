import React from "react";
import { Product } from "../../../services/api-service";
import Main from "./main";
import Navigation from "./navigation";

type LayoutProps = {
  data?: Product[];
  loading?: boolean;
};

export default function Layout({ data, loading }: LayoutProps) {
  return (
    <div>
      <Navigation />
      <Main data={data} loading={loading} />
    </div>
  );
}
