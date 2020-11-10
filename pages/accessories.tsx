import React from "react";
import Layout from "../components/_global/layout";
import { Category, useProdutList } from "../services/api-service";

export default function Accessories() {
  const { data, loading } = useProdutList(Category.ACCESSORIES);

  return <Layout data={data} loading={loading} />;
}
