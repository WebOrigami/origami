import puppeteer from "puppeteer";

let failed = false;

const browser = await puppeteer.launch({
  args: ["--allow-file-access-from-files", "--disable-web-security"],
});
const page = await browser.newPage();

page.on("console", (msg) => {
  const text = msg.text();
  if (text.includes("❌")) {
    console.error(text);
    failed = true;
  }
});

// load your local index.html
// const url = new URL("index.html", import.meta.url);
const url = "http://localhost:5000/test/browser/index.html";
await page.goto(url);
await browser.close();
if (!failed) {
  console.log("✅ All tests passed");
}
process.exit(failed ? 1 : 0);
