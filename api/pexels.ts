import { Hono } from "hono";
import { cors } from "hono/cors";
import { handle } from "hono/vercel";
import type { PexelsAPIResponse } from "@type/api-response";
import type { StockImageData } from "@type/image-data";

export const config = {
  runtime: "edge",
};

const app = new Hono().basePath("/");

app.use("/*", cors());

app.get("/pexels", async (c) => {
  const API_KEY = process.env.PEXELS_KEY;

  if (!API_KEY) return c.json({ errors: ["No Pexels API Key provided"] });

  const params = c.req.query();
  const apiURL = formatRequestParams(params);

  if (!apiURL)
    return c.json({
      errors: [
        "Invalid Pexels URL returned from the formatRequestParams function",
      ],
    });

  const res = await fetch(apiURL, {
    headers: {
      Authorization: API_KEY,
    },
  });

  if (!res.ok) return res;

  const data: PexelsAPIResponse = await res.json();

  const formattedData: StockImageData[] = data.photos.map((result) => ({
    id: String(Math.random()),
    width: result.width,
    height: result.height,
    image_thumbnail: result.src.tiny,
    image_large: result.src.medium,
    image_download: result.src.original,
    image_link: result.url,
    photographer: result.photographer,
    photographer_avatar: undefined,
    photographer_link: result.photographer_url,
    source: "Pexels",
  }));

  return c.json(formattedData);
});

export default handle(app);

// ------------------------------------------------------------------
// PEXELS PARAMS FORMAT
// ------------------------------------------------------------------

type RequestParams = Record<string, string>;

export function formatRequestParams(params: RequestParams) {
  const query = params.query ?? "nyc";
  const page = params.page ?? "1";
  const amount = params.per_page ?? "10";
  const orientation = params.orientation ?? "all";
  const color = params.color ?? "any";

  const baseURL = "https://api.pexels.com/v1/search";
  const queryParam = `?query=${query}`;
  const pageParam = `&page=${page}`;
  const amountParam = `&per_page=${amount}`;
  const orientationParam = getPexelsOrientationFilter(orientation);
  const colorParam = getPexelsColorFilter(color);

  return [
    baseURL,
    queryParam,
    pageParam,
    amountParam,
    orientationParam,
    colorParam,
  ].join("");
}

// ------------------------------------------------------------------
// PEXELS PARAMS HELPER FUNCTIONS
// ------------------------------------------------------------------

function getPexelsOrientationFilter(value: string) {
  const param = "&orientation=";
  if (value === "all") return undefined;
  else return `${param}${value}`;
}

function getPexelsColorFilter(value: string) {
  const param = "&color=";
  if (value === "any") return undefined;
  else if (value === "grayscale") return `${param}gray`;
  else if (value === "teal") return `${param}turquoise`;
  else if (value === "purple") return `${param}#800080`;
  else return `${param}${value}`;
}
