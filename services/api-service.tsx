import { forEach, omit, set } from "lodash";
import React, { useContext, useRef } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import qs from "qs";

export enum Category {
  JACKETS = "jackets",
  SHIRTS = "shirts",
  ACCESSORIES = "accessories",
}

export enum Availability {
  INSTOCK = "INSTOCK",
  LESSTHAN10 = "LESSTHAN10",
  OUTOFSTOCK = "OUTOFSTOCK",
  ERROR = "ERROR",
}

export interface Product {
  id: string;
  name: string;
  category: Category;
  availability: Availability;
  color: string[];
  manufacturer: string;
  price: number;
}

class Fetcher {
  async list<T>(url: string): Promise<T[]> {
    const res = await fetch(url);
    return await res.json();
  }
}

export class ApiService {
  private fetcher: Fetcher;
  private apiHost: string;
  constructor(_apiHost: string, _fetcher: Fetcher) {
    this.apiHost = _apiHost;
    this.fetcher = _fetcher;
  }

  async listProducts(category: string): Promise<Product[]> {
    const products = await this.fetcher.list<Product>(
      `${this.apiHost}/products/${category}`
    );

    return products;
  }
}

const defaultService = new ApiService("/api", new Fetcher());

type LastUpdated = number;

interface ApiServiceProduct {
  products: Product[];
  __lastUpdated__: LastUpdated;
}

interface ApiServiceContext {
  jackets: ApiServiceProduct;
  shirts: ApiServiceProduct;
  accessories: ApiServiceProduct;
}

const initialState = {
  jackets: { products: null, __lastUpdated__: 0 },
  shirts: { products: null, __lastUpdated__: 0 },
  accessories: { products: null, __lastUpdated__: 0 },
};

export const ApiServiceContext = React.createContext<{
  state: ApiServiceContext;
  setState: React.Dispatch<React.SetStateAction<ApiServiceContext>>;
}>(null);

type ApiServiceProviderProps = {
  children: React.ReactNode;
  storageKey?: string;
};
export const ApiServiceProvider = ({
  children,
  storageKey = "api-cache",
}: ApiServiceProviderProps) => {
  const [state, setState] = useState<ApiServiceContext>(() => {
    // Get items from session storage if exist
    try {
      const items = window.sessionStorage.getItem(storageKey);
      if (!items) {
        throw new Error();
      }
      const parsed = JSON.parse(items);
      return parsed;
    } catch (e) {
      return initialState;
    }
  });

  useEffect(() => {
    // Save state to session storage onChange
    if (window && state) {
      try {
        const s = { ...state };
        forEach(s, (value, key) => {
          s[key].__lastUpdated = 0;
        });

        window.sessionStorage.setItem(storageKey, JSON.stringify(s));
      } catch (e) {
        // Do nothing on error
      }
    }
  }, [state]);

  return (
    <ApiServiceContext.Provider value={{ state, setState }}>
      {children}
    </ApiServiceContext.Provider>
  );
};

export function useProdutList(category: Category) {
  const { state, setState } = useContext(ApiServiceContext);

  const [data, setData] = useState<Product[]>(state[category].products);
  const [error, setError] = useState(null);
  const mounted = useRef(false);
  const loading = useMemo(() => {
    return !data && !error;
  }, [data, error]);

  const f = useCallback(
    async (withErase?: boolean) => {
      const erase = () => {
        if (mounted.current) {
          setData(null);
          setState((s) => {
            s[category].products = null;
            return { ...s };
          });
        }
      };
      setError(null);
      if (withErase) {
        erase();
      }
      try {
        const products = await defaultService.listProducts(category);
        if (mounted.current) {
          setData(products);
          setState((s) => {
            s[category].products = products;
            s[category].__lastUpdated__ = Date.now();
            return { ...s };
          });
        }
      } catch (e) {
        if (mounted.current) {
          setError(e);
          erase();
        }
      }
    },
    [category, setData, setError, setState]
  );

  const init = useCallback(() => {
    // if state set from there
    if (state[category].products) {
      if (mounted.current) {
        setData(state[category].products);
      }
    }
    // If data is older than 30 sec revalidate
    const shouldRevalidate =
      Date.now() > state[category].__lastUpdated__ + 30000;

    // Check if should revalidate
    if (state[category].products === null || shouldRevalidate) {
      f();
    }
  }, [state, f]);
  useEffect(() => {
    mounted.current = true;
    init();
    return () => {
      mounted.current = false;
    };
  }, []);
  return { data, error, loading, reFetch: f };
}

export default defaultService;
