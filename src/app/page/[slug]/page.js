import config from "@config/config.json";
import Pagination from "@layouts/components/Pagination";
import SeoMeta from "@layouts/partials/SeoMeta";
import { getListPage, getSinglePage } from "@lib/contentParser";
import { sortByDate } from "@lib/utils/sortFunctions";
import { markdownify } from "@lib/utils/textConverter";
import Post from "@partials/Post";
import { notFound } from "next/navigation";

const { blog_folder, summary_length } = config.settings;

export const generateStaticParams = async () => {
  const getAllSlug = getSinglePage(`src/content/${blog_folder}`);
  const allSlug = getAllSlug.map((item) => item.slug);
  const { pagination } = config.settings;
  const totalPages = Math.ceil(allSlug.length / pagination);
  let paths = [];

  for (let i = 1; i < totalPages; i++) {
    paths.push({
      slug: (i + 1).toString(),
    });
  }

  return paths;
};

const BlogPagination = async ({ params }) => {
  const { slug } = await params;
  const currentPage = parseInt(slug || "1");
  const { pagination } = config.settings;
  let posts, postIndex;
  try {
    // Throws at request time on Cloudflare Workers (no fs); the page is then
    // unknown, so render the 404 page instead of a 500.
    posts = getSinglePage(`src/content/${blog_folder}`);
    postIndex = await getListPage(`src/content/${blog_folder}/_index.md`);
  } catch {
    notFound();
  }

  const indexOfLastPost = currentPage * pagination;
  const indexOfFirstPost = indexOfLastPost - pagination;
  const orderedPosts = sortByDate(posts);
  const currentPosts = orderedPosts.slice(indexOfFirstPost, indexOfLastPost);
  const { frontmatter } = postIndex;
  const { title } = frontmatter;
  const totalPages = Math.ceil(posts.length / pagination);

  return (
    <>
      <SeoMeta pathname={`/page/${slug}`} title={title} />
      <section className="section">
        <div className="container">
          {markdownify(title, "h1", "h2 mb-8 text-center")}
          <div className="row mb-16">
            {currentPosts.map((post, i) => (
              <div className="mt-16 lg:col-6" key={post.slug}>
                <Post post={post} />
              </div>
            ))}
          </div>
          <Pagination totalPages={totalPages} currentPage={currentPage} />
        </div>
      </section>
    </>
  );
};

export default BlogPagination;
