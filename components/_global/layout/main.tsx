import { forEach } from "lodash";
import React, { useCallback, useMemo, useState } from "react";
import { Product } from "../../../services/api-service";
import FiltersForm, { ProductFilters } from "../../filters-form";
import Table from "../_elements/table";

type MainProps = {
  data?: Product[];
  loading?: boolean;
};

export default function Main({ data, loading }: MainProps) {
  const [filters, setFilters] = useState<ProductFilters>({});

  const filteredData = useMemo(() => {
    if (!data) {
      return null;
    }
    if (!filters) {
      return data;
    }
    let d = [...data];

    forEach(filters, (value, key) => {
      d = d.filter((o) => o[key].toLowerCase().includes(value.toLowerCase()));
    });

    return d;
  }, [data, filters]);

  return (
    <main>
      <FiltersForm loading={loading} filters={filters} onChange={setFilters} />
      {process.browser && (
        <Table
          maxRows={50}
          loading={loading}
          data={filteredData}
          exampleRow={data ? data[0] : null}
        />
      )}

      <style jsx>{`
        main {
          padding: 64px 16px;
        }
      `}</style>
    </main>
  );
}
