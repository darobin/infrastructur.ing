
import { DateTime } from "luxon";

export default function (eleventyConfig) {
  eleventyConfig.addFilter("stringify", (obj) => JSON.stringify(obj, null, 2));
  eleventyConfig.addFilter("encodeURIComponent", (str) => encodeURIComponent(str));
  eleventyConfig.addFilter("imagePath", function (post) {
    const image = post?.data?.image || this.ctx.image;
    const base = post.filePathStem.replace(post.fileSlug, '');
    return `${base}${image}`;
  });
  eleventyConfig.addFilter("unp", function (html) {
    return html.replace(/^\s*<p>/i, '').replace(/<\/p>\s*^/i, '');
  });

  eleventyConfig.addFilter("readableDate", (dateObj, format, zone) => {
    // Formatting tokens for Luxon: https://moment.github.io/luxon/#/formatting?id=table-of-tokens
    return DateTime.fromJSDate(dateObj, { zone: zone || "utc" }).toFormat(format || "yyyy-LL-dd");
  });

  eleventyConfig.addFilter("htmlDateString", (dateObj) => {
    // dateObj input: https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
    return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat('yyyy-LL-dd');
  });

  // Get the first `n` elements of a collection.
  eleventyConfig.addFilter("head", (array, n) => {
    if(!Array.isArray(array) || array.length === 0)  return [];
    if(n < 0) return array.slice(n);
    return array.slice(0, n);
  });

  // Get upcoming events
  eleventyConfig.addFilter("upcoming", (array) => {
    const today = DateTime.fromJSDate(new Date(), { zone: "utc" }).toFormat('yyyy-LL-dd');
    return sortByDate(array, true).filter(obj => obj?.data?.date && DateTime.fromJSDate(obj?.data?.date, { zone: "utc" }).toFormat('yyyy-LL-dd') >= today);
  });
  eleventyConfig.addFilter("preceding", (array) => {
    const today = DateTime.fromJSDate(new Date(), { zone: "utc" }).toFormat('yyyy-LL-dd');
    return sortByDate(array).filter(obj => obj?.data?.date && DateTime.fromJSDate(obj?.data?.date, { zone: "utc" }).toFormat('yyyy-LL-dd') < today);
  });

  // Return the smallest number argument
  eleventyConfig.addFilter("min", (...numbers) => Math.min.apply(null, numbers));

  // Return the keys used in an object
  eleventyConfig.addFilter("getKeys", target => Object.keys(target));

  eleventyConfig.addFilter("sortAlphabetically", strings =>
    (strings || []).sort((b, a) => b.localeCompare(a))
  );
}

function sortByDate (array, ascending) {
  const factor = ascending ? -1 : 1;
  return (array || []).sort((a, b) => {
    const at = a?.data?.date?.getTime();
    const bt = b?.data?.date?.getTime();
    if (!at && !bt) return 0;
    if (!at) return 1;
    if (!bt) return -1;
    if (at < bt) return 1 * factor;
    if (at > bt) return -1 * factor;
    return 0;
  });
}
