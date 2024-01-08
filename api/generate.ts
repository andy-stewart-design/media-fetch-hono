import { Hono } from "hono";
import { cors } from "hono/cors";
import { handle } from "hono/vercel";

export const config = {
  runtime: "edge",
};

const app = new Hono().basePath("/");

app.use("/*", cors());

app.get("/generate", async (c) => {
  const API_KEY = process.env.IMAGEKIT_KEY;

  if (!API_KEY) return c.json({ errors: ["No Pixabay API Key provided"] });

  const params = c.req.query();
  const apiURL = formatRequestParams(params, API_KEY);

  if (!apiURL)
    return c.json({
      errors: ["Invalid URL returned from the formatRequestParams function"],
    });

  const res = await fetch(apiURL);
  if (!res.ok)
    return c.json({
      errors: ["There was an error fetching this image"],
    });

  const buffer = await res.arrayBuffer();
  if (!buffer)
    return c.json({
      errors: ["There was an error generating the array buffer"],
    });

  const imgArray = new Uint8Array(buffer);

  return c.json({ res, buffer, imgArray });
});

export default handle(app);

// ------------------------------------------------------------------
// PIXABAY PARAMS FORMAT
// ------------------------------------------------------------------

type RequestParams = Record<string, string>;

export function formatRequestParams(params: RequestParams, key: string) {
  const src = params.src ?? undefined;
  const quality = params.q ?? undefined;
  const height = params.h ?? undefined;
  const width = params.w ?? undefined;

  if (!src || !quality || !height || !width) return undefined;

  return `https://ik.imagekit.io/${key}/tr:w-${width},h-${height},q-${quality}/${src}`;
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
