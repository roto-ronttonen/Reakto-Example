import { flatten, isArray, mapKeys, uniq } from "lodash";
import { on } from "process";
import { useEffect, useMemo, useRef, useState } from "react";
import Loader from "./loader";

type TableData = {
  id: string;
  [key: string]: any;
};

type TableProps = {
  data: TableData[];
  onColClick?: (key: string) => void;
  // exampleRow can be used t render headers even without data
  exampleRow?: TableData;
  loading?: boolean;
  maxRows?: number;
};

const uniqueKeys = (data: TableData[]) => {
  if (isArray(data)) {
    const allKeys = data.map((d) => Object.keys(d));
    return uniq(flatten(allKeys));
  }
  return [];
};

const formatDataToString = (data: unknown) => {
  switch (typeof data) {
    case "string":
      return data;
    case "number":
    case "bigint":
      return data.toString();
    case "boolean":
      return data ? "true" : "false";
    case "undefined":
      return "undefined";
    case "object":
      if (isArray(data)) {
        return formatDataToString(data.join(", "));
      }
      return JSON.stringify(data);
    default:
      return null;
  }
};

export default function Table({
  data,
  exampleRow,
  loading,
  maxRows,
  onColClick,
}: TableProps) {
  // Used for pagination
  const [currPage, setCurrPage] = useState(0);

  const numPages = useMemo(() => {
    if (!data) {
      return 0;
    }
    if (!maxRows) {
      return 1;
    }
    return Math.ceil(data.length / maxRows);
  }, [data, maxRows]);

  const headers = useMemo(() => {
    const keys = uniqueKeys(data);
    if (!keys.length && exampleRow) {
      return uniq(Object.keys(exampleRow));
    }
    return keys;
  }, [data, exampleRow]);
  const renderedHeader = useMemo(() => {
    return (
      <tr>
        {headers.map((h, i) => (
          <th key={h} onClick={onColClick ? () => onColClick(h) : null}>
            {h}
          </th>
        ))}
      </tr>
    );
  }, [headers]);
  const renderedRows = useMemo(() => {
    if (!data) {
      return [];
    }
    let d = [...data];
    if (maxRows) {
      d = d.splice(currPage * maxRows, maxRows);
    }
    return d?.map((d, i) => (
      <tr key={d.id}>
        {headers?.map((h) => (
          <td key={h} onClick={onColClick ? () => onColClick(h) : null}>
            {formatDataToString(d[h])}
          </td>
        ))}
      </tr>
    ));
  }, [data, headers, maxRows, currPage]);

  if (loading) {
    return (
      <div className="table-wrapper">
        <Loader />
        <style jsx>{`
          .table-wrapper {
            display: flex;
            justify-content: center;
            align-items: center;
            border: 1px solid gray;
            height: 100%;
            width: 100%;
            min-height: 360px;
          }
        `}</style>
      </div>
    );
  }
  return (
    <div className="table-wrapper">
      {maxRows && (
        <div className="table-pagination">
          <button
            disabled={!(currPage > 9)}
            className="pagination-controller"
            onClick={() => setCurrPage(currPage - 10)}
          >
            {"<<"}
          </button>

          <button
            disabled={!(currPage !== 0)}
            className="pagination-controller"
            onClick={() => setCurrPage(currPage - 1)}
          >
            {"<"}
          </button>

          <button
            disabled={currPage === 0}
            className="pagination-controller"
            onClick={() => setCurrPage(0)}
          >
            1
          </button>
          <p className="pagination-current">{currPage + 1}</p>
          <button
            disabled={currPage === numPages - 1}
            className="pagination-controller"
            onClick={() => setCurrPage(numPages - 1)}
          >
            {numPages}
          </button>

          <button
            disabled={!(currPage !== numPages - 1)}
            className="pagination-controller"
            onClick={() => setCurrPage(currPage + 1)}
          >
            {">"}
          </button>

          <button
            disabled={!(currPage < numPages - 10)}
            className="pagination-controller"
            onClick={() => setCurrPage(currPage + 10)}
          >
            {">>"}
          </button>
        </div>
      )}
      <table>
        <thead>{renderedHeader}</thead>
        <tbody>{renderedRows}</tbody>
      </table>

      <style jsx>{`
        .table-wrapper {
          height: 100%;
          width: 100%;
        }
        table {
          overflow: auto;
          height: 100%;
          width: 100%;
          border-collapse: collapse;
        }
        table :global(td),
        table :global(th) {
          border: 1px solid #ddd;
          padding: 8px;
        }

        table :global(tr:nth-child(even)) {
          background-color: #f2f2f2;
        }

        table :global(tr:hover) {
          background-color: #ddd;
        }
        table :global(th) {
          padding-top: 12px;
          padding-bottom: 12px;
          text-align: left;
          background-color: #4caf50;
          color: white;
        }
        .table-pagination {
          display: flex;
        }
        .pagination-controller {
          border: none;
          background-color: white;
          padding: 0 12px;
          cursor: pointer;
          outline: none;
        }
        .pagination-current {
          display: inline-flex;
          justify-content: center;
          width: 48px;
        }
      `}</style>
    </div>
  );
}
