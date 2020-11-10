import React from "react";
import { Availability } from "../services/api-service";
import Button from "./_global/_elements/button";
import Select from "./_global/_elements/select";
import TextInput from "./_global/_elements/text-input";

export interface ProductFilters {
  name?: string;
  availability?: Availability;
}

type FiltersFormProps<T> = {
  loading: boolean;
  onChange: (filters: T) => void;
  filters: T;
  storageKey?: string;
};

export default function FiltersForm({
  onChange,
  filters,
}: FiltersFormProps<ProductFilters>) {
  return (
    <form>
      <div className="form-row">
        <div className="form-col">
          <TextInput
            label="Name"
            placeholder="Enter name"
            value={filters?.name || ""}
            onChange={(e) => onChange({ ...filters, name: e.target.value })}
          />
        </div>
        <div className="form-col">
          <Select
            label="Availability"
            options={([
              Availability.INSTOCK,
              Availability.LESSTHAN10,
              Availability.OUTOFSTOCK,
            ] as Availability[]).map((o) => ({
              label: o,
              value: o,
            }))}
            value={filters?.availability}
            onChange={(e) =>
              onChange({
                ...filters,
                availability: e.target.value as Availability,
              })
            }
          />
        </div>
      </div>

      <style jsx>{`
        form {
          display: flex;
        }
        .form-row {
          display: flex;
          width: 100%;
        }
        .form-col {
          padding: 12px;
          flex: 1 1 0;
        }
      `}</style>
    </form>
  );
}
