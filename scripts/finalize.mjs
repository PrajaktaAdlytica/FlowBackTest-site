import fs from "node:fs";
import path from "node:path";
const routes = [
  "product",
  "product/desk",
  "product/review",
  "product/proof",
  "product/signal",
  "product/report",
  "method",
  "data",
  "pricing",
  "solutions",
  "about",
  "contact",
  "privacy",
  "terms",
  "sign-in",
  "resources",
  "study",
  "demo",
  "demo/map",
  "demo/scenarios",
  "demo/backtest",
  "demo/records",
];
const source = fs.readFileSync("dist/index.html", "utf8");
for (const route of routes) {
  fs.mkdirSync(path.join("dist", route), { recursive: true });
  fs.writeFileSync(path.join("dist", route, "index.html"), source);
}
fs.writeFileSync("dist/404.html", source);
console.log(`Prepared ${routes.length + 1} static routes.`);
