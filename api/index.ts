import { Hono } from "hono";
import { cors } from "hono/cors";
import { handle } from "hono/vercel";

export const config = {
  runtime: "edge",
};

const app = new Hono().basePath("/");

app.use("/*", cors());

app.get("/", async (c) => {
  return c.json({ msg: "welcome to my api" });
});

export default handle(app);
