import config from "@config/config.json";
import PostSingle from "@layouts/PostSingle";
import { getSinglePage } from "@lib/contentParser";
import { getTaxonomy } from "@lib/taxonomyParser";
import { notFound } from "next/navigation";

const { blog_folder } = config.settings;

export const generateStaticParams = async () => {
  const allSlug = getSinglePage(`src/content/${blog_folder}`);
  return allSlug.map((item) => ({
    single: item.slug,
  }));
};

const Article = async ({ params }) => {
  const { single } = await params;
  let posts, categories;
  try {
    // Throws at request time on Cloudflare Workers (no fs); the post is then
    // unknown, so render the 404 page instead of a 500.
    posts = getSinglePage(`src/content/${blog_folder}`);
    categories = getTaxonomy(`src/content/${blog_folder}`, "categories");
  } catch {
    notFound();
  }
  const post = posts.find((p) => p.slug == single);
  if (!post) {
    notFound();
  }

  const relatedPosts = posts.filter((p) =>
    post.frontmatter.categories.some((cate) =>
      p.frontmatter.categories.includes(cate)
    )
  );

  const categoriesWithPostsCount = categories.map((category) => {
    const filteredPosts = posts.filter((post) =>
      post.frontmatter.categories.includes(category)
    );
    return {
      name: category,
      posts: filteredPosts.length,
    };
  });

  const { frontmatter, content } = post;

  return (
    <PostSingle
      frontmatter={frontmatter}
      content={content}
      slug={single}
      allCategories={categoriesWithPostsCount}
      relatedPosts={relatedPosts}
      posts={posts}
    />
  );
};

export default Article;
