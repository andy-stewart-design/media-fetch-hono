type RequestParams = Record<string, string>;
type ImageService = "unsplash" | "pexels" | "pixabay";

export function formatRequestParams(
  params: RequestParams,
  service: ImageService,
  key: string
) {
  const query = params.query ?? "nyc";
  const amount = params.per_page ?? "10";
  const orientation = params.orientation ?? "all";
  const color = params.color ?? "any";

  if (service === "unsplash") {
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
}

// ------------------------------------------------------------------
// UNSPLASH HELPER FUNCTIONS
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
