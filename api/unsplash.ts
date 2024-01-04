import { Hono } from "hono";
import { cors } from "hono/cors";
import { handle } from "hono/vercel";
import { formatRequestParams } from "@type/format-request-params";
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
  const apiURL = formatRequestParams(params, "unsplash", API_KEY);

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
    image_large: result.links.download,
    image_link: result.links.html,
    photographer: result.user.name,
    photographer_link: result.user.links.html,
    source: "Unsplash",
  }));

  return c.json(formattedData);
});

export default handle(app);
