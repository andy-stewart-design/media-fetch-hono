import { Hono } from "hono";
import { cors } from "hono/cors";
import { handle } from "hono/vercel";
import type { PixabayAPIResponse } from "@type/api-response";
import type { StockImageData } from "@type/image-data";

export const config = {
  runtime: "edge",
};

const app = new Hono().basePath("/");

app.use("/*", cors());

app.get("/pixabay", async (c) => {
  const API_KEY = process.env.PIXABAY_KEY;

  if (!API_KEY) return c.json({ errors: ["No Pixabay API Key provided"] });

  const params = c.req.query();
  const apiURL = formatRequestParams(params, API_KEY);

  if (!apiURL)
    return c.json({
      errors: [
        "Invalid Pixabay URL returned from the formatRequestParams function",
      ],
    });

  const res = await fetch(apiURL);

  if (!res.ok) return res;

  const data: PixabayAPIResponse = await res.json();

  // console.log({ pixabay: data });

  const formattedData: StockImageData[] = data.hits.map((result) => ({
    id: String(Math.random()),
    width: result.imageWidth,
    height: result.imageHeight,
    image_thumbnail: result.previewURL,
    image_large: result.webformatURL,
    image_download: result.largeImageURL,
    image_link: result.pageURL,
    photographer: result.user,
    photographer_avatar:
      result.userImageURL !== "" ? result.userImageURL : undefined,
    photographer_link: `https://pixabay.com/users/${result.user}-${result.user_id}`,
    source: "Pixabay",
  }));

  return c.json(formattedData);
});

export default handle(app);

// ------------------------------------------------------------------
// PIXABAY PARAMS FORMAT
// ------------------------------------------------------------------

type RequestParams = Record<string, string>;

export function formatRequestParams(params: RequestParams, key: string) {
  const query = params.query ?? "nyc";
  const amount = params.per_page ?? "10";
  const orientation = params.orientation ?? "all";
  const color = params.color ?? "any";

  const baseURL = "https://pixabay.com/api/";
  const apiKeyParam = `?key=${key}`;
  const queryParam = `&q=${query}`;
  const amountParam = `&per_page=${amount}`;
  const orientationParam = getPixabayOrientationFilter(orientation);
  const colorParam = getPixabayColorFilter(color);

  return [
    baseURL,
    apiKeyParam,
    queryParam,
    amountParam,
    orientationParam,
    colorParam,
  ].join("");
}

// ------------------------------------------------------------------
// PIXABAY PARAMS HELPER FUNCTIONS
// ------------------------------------------------------------------

function getPixabayOrientationFilter(value: string) {
  const param = "&orientation=";
  if (value === "all" || value === "square") return undefined;
  else if (value === "landscape") return `${param}horizontal`;
  else if (value === "portrait") return `${param}vertical`;
}

function getPixabayColorFilter(value: string) {
  const param = "&colors=";
  if (value === "any") return undefined;
  else if (value === "teal") return `${param}turquoise`;
  else if (value === "purple") return `${param}lilac`;
  else return `${param}${value}`;
}
