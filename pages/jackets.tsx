import React from "react";
import Layout from "../components/_global/layout";
import { Category, useProdutList } from "../services/api-service";

export default function Jackets() {
  const { data, loading, reFetch } = useProdutList(Category.JACKETS);

  return <Layout data={data} loading={loading} refresh={reFetch} />;
}
