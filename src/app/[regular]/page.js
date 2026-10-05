import NotFound from "@layouts/404";
import About from "@layouts/About";
import Contact from "@layouts/Contact";
import Default from "@layouts/Default";
import SeoMeta from "@layouts/partials/SeoMeta";
import { getRegularPage, getSinglePage } from "@lib/contentParser";
import { notFound } from "next/navigation";

export const generateStaticParams = async () => {
  const slugs = getSinglePage("src/content");
  return slugs.map((item) => ({
    regular: item.slug,
  }));
};

const RegularPages = async ({ params }) => {
  const { regular } = await params;
  let data;
  try {
    // Throws at request time on Cloudflare Workers (no fs); the slug is then
    // unknown, so render the 404 page instead of a 500.
    data = await getRegularPage(regular);
  } catch {
    notFound();
  }
  const { title, meta_title, description, image, noindex, canonical, layout } =
    data.frontmatter;
  const { content } = data;

  return (
    <>
      <SeoMeta
        title={title}
        description={description ? description : content.slice(0, 120)}
        meta_title={meta_title}
        image={image}
        noindex={noindex}
        canonical={canonical}
      />
      {layout === "404" ? (
        <NotFound data={data} />
      ) : layout === "about" ? (
        <About data={data} />
      ) : layout === "contact" ? (
        <Contact data={data} />
      ) : (
        <Default data={data} />
      )}
    </>
  );
};

export default RegularPages;
