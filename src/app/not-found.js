import NotFound from "@layouts/404";
import { getRegularPage } from "@lib/contentParser";

// Static fallback: not-found.js runs at request time on Cloudflare Workers,
// where `fs` (used by getRegularPage) is unavailable. Without this fallback
// every unknown URL returns a 500 instead of the 404 page.
const fallbackData = {
  frontmatter: { title: "Error 404" },
  content: "## Page Not Found",
};

const NotFoundPage = async () => {
  let data = fallbackData;
  try {
    data = await getRegularPage("404");
  } catch {
    // fs is unavailable at runtime on Workers — use the static fallback.
  }

  return <NotFound data={data} />;
};

export default NotFoundPage;
