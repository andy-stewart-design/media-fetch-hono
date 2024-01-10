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

  if (!API_KEY) return c.json({ errors: ["No ImageKit API Key provided"] });

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
  const base64String = arrayBufferToBase64(imgArray);

  return c.json(base64String);
});

export default handle(app);

// Function to convert ArrayBuffer to base64
function arrayBufferToBase64(u8: Uint8Array) {
  const bytes: Array<string> = [];
  u8.forEach((byte) => {
    bytes.push(String.fromCharCode(byte));
  });
  return btoa(bytes.join(""));
}

// ------------------------------------------------------------------
// PIXABAY PARAMS FORMAT
// ------------------------------------------------------------------

type RequestParams = Record<string, string>;

export function formatRequestParams(params: RequestParams, key: string) {
  const src = params.src ?? undefined;
  const quality = params.q ?? undefined;
  const height = params.h ?? undefined;
  const width = params.w ?? undefined;

  console.log({ src, quality, height, width });

  if (!src || !quality || !height || !width) return undefined;

  console.log(
    `https://ik.imagekit.io/${key}/tr:w-${width},h-${height},q-${quality}/${src}`
  );
  return `https://ik.imagekit.io/${key}/tr:w-${width},h-${height},q-${quality}/${src}`;
}
