import React from "react";
import Layout from "../components/_global/layout";
import { Category, useProdutList } from "../services/api-service";

export default function Shirts() {
  const { data, loading } = useProdutList(Category.SHIRTS);

  return <Layout data={data} loading={loading} />;
}
