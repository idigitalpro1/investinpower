import { access, readFile } from "node:fs/promises";
import { extname, resolve } from "node:path";

const root = process.cwd();
const previewOnly = process.env.PREVIEW_ONLY === "1";
const requiredFiles = [
  "index.html",
  "404.html",
  "styles.css",
  "script.js",
  "favicon.svg",
  "social-card.svg",
  "social-card.png",
  "robots.txt",
  "sitemap.xml",
  "site.webmanifest",
  "vercel.json",
  "PLACEHOLDERS.md"
];

for (const file of requiredFiles) {
  await access(resolve(root, file));
}

const index = await readFile(resolve(root, "index.html"), "utf8");
const notFound = await readFile(resolve(root, "404.html"), "utf8");
const styles = await readFile(resolve(root, "styles.css"), "utf8");
const script = await readFile(resolve(root, "script.js"), "utf8");
const socialCard = await readFile(resolve(root, "social-card.svg"), "utf8");
const socialCardPng = await readFile(resolve(root, "social-card.png"));
const robots = await readFile(resolve(root, "robots.txt"), "utf8");
const sitemap = await readFile(resolve(root, "sitemap.xml"), "utf8");
const vercel = JSON.parse(await readFile(resolve(root, "vercel.json"), "utf8"));

const checks = [
  [/<html\s+lang="en"/i.test(index), "index has a language declaration"],
  [/<meta\s+name="viewport"/i.test(index), "index has a viewport meta tag"],
  [/<meta\s+name="description"/i.test(index), "index has a meta description"],
  [/<link\s+rel="canonical"\s+href="https:\/\/investinpower\.org\/"/i.test(index), "index has the required canonical URL"],
  [/<meta\s+property="og:title"/i.test(index) && /<meta\s+property="og:url"/i.test(index), "index has Open Graph metadata"],
  [/social-card\.png/i.test(index) && !/social-card\.svg/i.test(index), "social metadata uses a raster sharing image"],
  [socialCardPng.subarray(1, 4).toString("ascii") === "PNG" && socialCardPng.readUInt32BE(16) === 1200 && socialCardPng.readUInt32BE(20) === 630, "social image is a valid 1200x630 PNG"],
  [/<meta\s+name="twitter:card"/i.test(index), "index has Twitter card metadata"],
  [(index.match(/<h1\b/gi) || []).length === 1, "index has exactly one H1"],
  [/<header\b/i.test(index) && /<nav\b/i.test(index) && /<main\b/i.test(index) && /<footer\b/i.test(index), "index uses semantic landmarks"],
  [/class="skip-link"/i.test(index), "index has a skip link"],
  [/prefers-reduced-motion/.test(styles), "styles respect reduced motion"],
  [/focus-visible/.test(styles), "styles provide visible keyboard focus"],
  [/<meta\s+name="robots"\s+content="noindex"/i.test(notFound), "404 is noindex"],
  [/Sitemap:\s+https:\/\/investinpower\.org\/sitemap\.xml/.test(robots), "robots points to the canonical sitemap"],
  [/<loc>https:\/\/investinpower\.org\/<\/loc>/.test(sitemap), "sitemap contains the canonical home URL"],
  [vercel.cleanUrls === true, "Vercel clean URLs are enabled"],
  [!/(google-analytics|googletagmanager|stripe|paypal|facebook\.net)/i.test(index + script), "no analytics, ads, or payment scripts are present"],
  [!/<script[^>]+src="https?:/i.test(index), "no third-party scripts are present"],
  [!/<form\b/i.test(index), "no inactive data-collection form is present"],
  [!/(Organization|NGO|Corporation)\"\s*:/i.test(index), "no unverified organization structured data is present"]
];

const failures = checks.filter(([passed]) => !passed).map(([, label]) => label);
if (failures.length) {
  throw new Error(`Validation failed:\n- ${failures.join("\n- ")}`);
}

const localRefs = [...index.matchAll(/(?:href|src)="\/(?!\/)([^"#?]+)"/g)].map((match) => match[1]);
for (const ref of new Set(localRefs)) {
  if (!extname(ref) && ref !== "") continue;
  await access(resolve(root, ref));
}

const placeholderText = [index, socialCard].join("\n");
const placeholderMatches = [...placeholderText.matchAll(/\[[^\]\n]+\]/g)].map((match) => match[0]);
const uniquePlaceholders = [...new Set(placeholderMatches)].sort();

const releaseSentinels = [
  [index.includes("replace-me@example.invalid"), "placeholder contact endpoint remains"],
  [index.includes("data-placeholder-mailto"), "placeholder contact behavior remains"],
  [/mission preview/i.test(index + socialCard), "preview labeling remains"],
  [index.includes("00—PREVIEW"), "preview edition marker remains"],
  [/copy needed/i.test(socialCard), "social sharing art still says copy needed"]
].filter(([present]) => present).map(([, label]) => label);

console.log(`Preview validation passed: ${requiredFiles.length} required files and ${checks.length} policy checks.`);
console.log(`Unresolved placeholders (${uniquePlaceholders.length}):`);
for (const placeholder of uniquePlaceholders) console.log(`- ${placeholder}`);

if (releaseSentinels.length) {
  console.log("Production release gates:");
  for (const sentinel of releaseSentinels) console.log(`- ${sentinel}`);
}

if (!previewOnly && (uniquePlaceholders.length || releaseSentinels.length)) {
  throw new Error("Production validation refused: approved copy and working contact details must replace every preview placeholder.");
}
