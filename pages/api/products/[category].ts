import { NextApiRequest, NextApiResponse } from "next";
import { find, orderBy, reject, uniq, uniqBy } from "lodash";
import { Availability, Category, Product } from "../../../services/api-service";
import { parseString } from "xml2js";

export interface LegacyProduct {
  color: string[];
  id: string;
  manufacturer: string;
  name: string;
  price: number;
  type: Category;
}

type XmlString = string;
export interface LegacyAvailability {
  id: string;
  DATAPAYLOAD: XmlString;
}

const parseStringPromise = <T = any>(xml: string): Promise<T> => {
  return new Promise((resolve, reject) => {
    parseString(xml, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
};

const parseLegacyAvailability = async (
  la: LegacyAvailability[]
): Promise<{ id: string; availability: string[] }[]> => {
  type AvailabilityParsed = {
    AVAILABILITY: { INSTOCKVALUE: string[] };
  };
  const parsed = [];
  for (const item of la) {
    try {
      const p = await parseStringPromise<AvailabilityParsed>(item.DATAPAYLOAD);
      parsed.push({ id: item.id, availability: p.AVAILABILITY.INSTOCKVALUE });
    } catch (e) {
      // Dont push
    }
  }
  return parsed;
};

const legacyApiHost = "https://bad-api-assignment.reaktor.com";

export default async function (req: NextApiRequest, res: NextApiResponse) {
  const { category } = req.query;
  const productsApiRes = await fetch(
    `${legacyApiHost}/products/${category as string}`
  );
  const legacyProducts: LegacyProduct[] = await productsApiRes.json();
  const uniqueManufacturers: string[] = uniqBy<LegacyProduct>(
    legacyProducts,
    (o) => o.manufacturer
  ).map((o) => o.manufacturer);

  let products: Product[] = [];

  // Map availabiltiy to products
  for (const manufacturer of uniqueManufacturers) {
    const availabilityRes = await fetch(
      `${legacyApiHost}/availability/${manufacturer}`
    );
    const a: {
      response: LegacyAvailability[];
    } = await availabilityRes.json();
    const availability = a.response;
    const lp: LegacyProduct[] = legacyProducts.filter(
      (o) => o.manufacturer === manufacturer
    );
    const parsedAvailability = await parseLegacyAvailability(availability);
    const p: Product[] = lp.map((o) => {
      const availability =
        find(
          parsedAvailability,
          (pa) => pa.id.toLowerCase() === o.id.toLowerCase()
        )?.availability[0] ||
        // Sometimes availability api return an undefined field
        // Default to error
        Availability.ERROR;
      const obj = {
        ...o,
        availability,
        category: o.type,
      };
      delete obj.type;
      return obj as Product;
    }) as Product[];
    products = [...products, ...p];
  }

  res.json(products);
  return res.end();
}
