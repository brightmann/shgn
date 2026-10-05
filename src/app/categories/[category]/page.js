import config from "@config/config.json";
import SeoMeta from "@layouts/partials/SeoMeta";
import Sidebar from "@layouts/partials/Sidebar";
import { getSinglePage } from "@lib/contentParser";
import { getTaxonomy } from "@lib/taxonomyParser";
import { slugify } from "@lib/utils/textConverter";
import Post from "@partials/Post";
import { notFound } from "next/navigation";

const { blog_folder } = config.settings;

export const generateStaticParams = async () => {
  const allCategories = getTaxonomy(`src/content/${blog_folder}`, "categories");
  return allCategories.map((category) => ({
    category: category,
  }));
};

const Category = async ({ params }) => {
  const { category } = await params;
  let posts, categories;
  try {
    // Throws at request time on Cloudflare Workers (no fs); the category is
    // then unknown, so render the 404 page instead of a 500.
    posts = getSinglePage(`src/content/${blog_folder}`);
    categories = getTaxonomy(`src/content/${blog_folder}`, "categories");
  } catch {
    notFound();
  }
  const filterPosts = posts.filter((post) =>
    post.frontmatter.categories.find((cat) => slugify(cat).includes(category))
  );
  if (filterPosts.length === 0) {
    notFound();
  }

  const categoriesWithPostsCount = categories.map((cat) => {
    const filteredPosts = posts.filter((post) =>
      post.frontmatter.categories.map((e) => slugify(e)).includes(cat)
    );
    return {
      name: cat,
      posts: filteredPosts.length,
    };
  });

  return (
    <>
      <SeoMeta pathname={`/categories/${category}`} title={category} />
      <div className="section mt-16">
        <div className="container">
          <h1 className="h2 mb-12">
            Showing posts from
            <span className="section-title ml-1 inline-block capitalize">
              {category.replace("-", " ")}
            </span>
          </h1>
          <div className="row">
            <div className="lg:col-8">
              <div className="row rounded border border-border p-4 px-3 dark:border-darkmode-border lg:p-6">
                {filterPosts.map((post, i) => (
                  <div key={`key-${i}`} className="col-12 mb-8 sm:col-6">
                    <Post post={post} />
                  </div>
                ))}
              </div>
            </div>
            <Sidebar posts={posts} categories={categoriesWithPostsCount} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Category;
