import { Hono } from "hono";
import { cors } from "hono/cors";
import { handle } from "hono/vercel";
import type { UnsplashAPIResponse } from "@type/api-response";
import type { StockImageData } from "@type/image-data";

export const config = {
  runtime: "edge",
};

const app = new Hono().basePath("/");

app.use("/*", cors());

app.get("/unsplash", async (c) => {
  const API_KEY = process.env.UNSPLASH_KEY;

  if (!API_KEY) return c.json({ errors: ["No Unsplash API Key provided"] });

  const params = c.req.query();
  const apiURL = formatRequestParams(params, API_KEY);

  if (!apiURL)
    return c.json({
      errors: [
        "Invalid Unsplash URL returned from the formatRequestParams function",
      ],
    });

  const res = await fetch(apiURL);

  if (!res.ok) return res;

  const data: UnsplashAPIResponse = await res.json();

  const formattedData: StockImageData[] = data.results.map((result) => ({
    id: result.id,
    width: result.width,
    height: result.height,
    image_thumbnail: result.urls.thumb,
    image_large: result.urls.regular,
    image_download: result.links.download,
    image_link: result.links.html,
    photographer: result.user.name,
    photographer_avatar: result.user.profile_image.small,
    photographer_link: result.user.links.html,
    source: "Unsplash",
  }));

  return c.json(formattedData);
});

export default handle(app);

// ------------------------------------------------------------------
// UNSPLASH PARAMS FORMAT
// ------------------------------------------------------------------

type RequestParams = Record<string, string>;

export function formatRequestParams(params: RequestParams, key: string) {
  const query = params.query ?? "nyc";
  const amount = params.per_page ?? "10";
  const orientation = params.orientation ?? "all";
  const color = params.color ?? "any";

  const baseURL = "https://api.unsplash.com/search/photos";
  const queryParam = `?query=${query}`;
  const amountParam = `&per_page=${amount}`;
  const orientationParam = getUnsplashOrientationFilter(orientation);
  const colorParam = getUnsplashColorFilter(color);
  const apiKeyParam = `&client_id=${key}`;

  return [
    baseURL,
    queryParam,
    amountParam,
    orientationParam,
    colorParam,
    apiKeyParam,
  ].join("");
}

// ------------------------------------------------------------------
// UNSPLASH PARAMS HELPER FUNCTIONS
// ------------------------------------------------------------------

function getUnsplashOrientationFilter(value: string) {
  if (value === undefined) return value;

  const param = "&orientation=";
  if (value === "all") return undefined;
  else if (value === "square") return `${param}squarish`;
  else return `${param}${value}`;
}

function getUnsplashColorFilter(value: string) {
  if (value === undefined) return value;

  const param = "&color=";
  if (value === "any") return undefined;
  else if (value === "grayscale") return `${param}black_and_white`;
  else if (value === "pink") return `${param}magenta`;
  else return `${param}${value}`;
}
