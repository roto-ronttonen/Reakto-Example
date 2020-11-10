import { forEach, orderBy } from "lodash";
import React, { useCallback, useMemo, useState } from "react";
import { Product } from "../../../services/api-service";
import FiltersForm, { ProductFilters } from "../../filters-form";
import Button from "../_elements/button";
import Table from "../_elements/table";

type MainProps = {
  data: Product[];
  loading: boolean;
  refresh: (withErase?: boolean) => Promise<void>;
};

export default function Main({ data, loading, refresh }: MainProps) {
  const [filters, setFilters] = useState<ProductFilters>({});

  const [sortBy, setSortBy] = useState<{
    property: string;
    dir: "asc" | "desc";
  }>(null);

  const filteredData = useMemo(() => {
    if (!data) {
      return null;
    }

    let d = [...data];

    if (!filters) {
      return d;
    }
    forEach(filters, (value, key) => {
      d = d.filter((o) => o[key].toLowerCase().includes(value.toLowerCase()));
    });

    return d;
  }, [data, filters]);

  const onColClick = useCallback(
    (id: string) => {
      setSortBy((s) => {
        switch (id) {
          case "id":
          case "color":
          case "category":
            return s;
          default: {
            if (s && s.property === id) {
              const nextDir = s.dir === "asc" ? "desc" : "asc";
              return { ...s, dir: nextDir };
            } else {
              return { property: id, dir: "asc" };
            }
          }
        }
      });
    },
    [setSortBy]
  );

  const sortedAndFilteredData = useMemo(() => {
    if (sortBy) {
      const d = orderBy(filteredData, [sortBy.property], sortBy.dir);
      return d;
    }
    return filteredData;
  }, [sortBy, filteredData]);

  return (
    <main>
      <Button onClick={() => refresh(true)}>Refresh data</Button>
      <div className="spacing" />
      <FiltersForm loading={loading} filters={filters} onChange={setFilters} />
      <div className="spacing" />
      {process.browser && (
        <Table
          maxRows={50}
          loading={loading}
          onColClick={onColClick}
          data={sortedAndFilteredData}
          exampleRow={data ? data[0] : null}
        />
      )}

      <style jsx>{`
        main {
          padding: 64px 16px;
        }
        .spacing {
          height: 12px;
        }
      `}</style>
    </main>
  );
}
