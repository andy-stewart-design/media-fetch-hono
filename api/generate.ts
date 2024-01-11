import { Hono } from "hono";
import { cors } from "hono/cors";
import { handle } from "hono/vercel";

export const config = {
  runtime: "edge",
};

interface StockImageData {
  src: string;
  width: number;
  height: number;
  quality: number;
}

const app = new Hono().basePath("/");

app.use("/*", cors());

app.get("/generate", async (c) => {
  const API_KEY = process.env.IMAGEKIT_KEY;
  if (!API_KEY) return c.json({ errors: ["No ImageKit API Key provided"] });

  const res = await fetch(
    `https://ik.imagekit.io/${API_KEY}/tr:w-1600,h-1600,q-50/https://unsplash.com/photos/kZokA2VTKn4/download?ixid=M3w1NDg2OTB8MHwxfHNlYXJjaHw1fHxueWN8ZW58MHx8fHwxNzA0OTIwOTY0fDA`
  );

  //   https://unsplash.com/photos/kZokA2VTKn4/download?ixid=M3w1NDg2OTB8MHwxfHNlYXJjaHw1fHxueWN8ZW58MHx8fHwxNzA0OTIwOTY0fDA
  //   https://images.pexels.com/photos/5011944/pexels-photo-5011944.jpeg
  //   https://pixabay.com/get/gf2e0f652d7e52d8bfbac17fc571f7e0654eba79141bd466c6d0b42691f8dc9a74194db3ce6b1adeb7b5658283658e37da751a99cd83407ea472b347474372f2e_1280.jpg

  //   const params = c.req.query();
  //   const apiURL = formatRequestParams(params, API_KEY);

  //   if (!apiURL)
  //     return c.json({
  //       errors: ["Invalid URL returned from the formatRequestParams function"],
  //     });

  //   const res = await fetch(apiURL);
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
  const base64String = u8ToBase64(imgArray);

  return c.json(base64String);
});

app.post("/generate", async (c) => {
  const API_KEY = process.env.IMAGEKIT_KEY;
  if (!API_KEY) return c.json({ errors: ["No ImageKit API Key provided"] });

  const body: StockImageData = await c.req.json();
  const apiURL = formatRequestParams2(body, API_KEY);
  if (!apiURL)
    return c.json({
      errors: ["Invalid URL returned from the formatRequestParams function"],
    });

  const res = await fetch(apiURL);
  if (!res.ok)
    return c.json({
      errors: ["There was an error fetching the requested image"],
    });

  const buffer = await res.arrayBuffer();
  if (!buffer)
    return c.json({
      errors: ["There was an error generating the array buffer"],
    });

  const imgArray = new Uint8Array(buffer);
  const base64String = u8ToBase64(imgArray);

  return c.json({ data: base64String });
});

export default handle(app);

// ------------------------------------------------------------------
// COVERT UINT8 ARRAY to BASE64
// ------------------------------------------------------------------
function u8ToBase64(u8: Uint8Array) {
  const bytes: Array<string> = [];
  u8.forEach((byte) => {
    bytes.push(String.fromCharCode(byte));
  });
  return btoa(bytes.join(""));
}

// ------------------------------------------------------------------
// IMAGEKIT PARAMS FORMAT
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

export function formatRequestParams2(params: StockImageData, key: string) {
  const src = params.src ?? undefined;
  const quality = params.quality ?? undefined;
  const height = params.height ?? undefined;
  const width = params.width ?? undefined;

  if (!src || !quality || !height || !width) return undefined;

  return `https://ik.imagekit.io/${key}/tr:w-${width},h-${height},q-${quality}/${src}`;
}
