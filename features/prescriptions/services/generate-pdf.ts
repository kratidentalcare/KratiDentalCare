import "server-only";

import puppeteer, { type Browser } from "puppeteer";

let browserPromise: Promise<Browser> | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    browserPromise = puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--font-render-hinting=none",
        "--disable-dev-shm-usage",
      ],
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    });
  }
  return browserPromise;
}

export type GeneratePrescriptionPdfOptions = {
  /** Absolute URL to the authenticated print page. */
  printUrl: string;
  /** Forward the caller's session cookie so Clerk auth succeeds. */
  cookieHeader: string | null;
};

/**
 * Generate an A4 PDF by printing the shared PrescriptionPreview page in Chromium.
 * Reuses the React preview route — no second layout and no react-dom/server.
 */
export async function generatePrescriptionPdf(
  options: GeneratePrescriptionPdfOptions,
): Promise<Buffer> {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    if (options.cookieHeader) {
      const target = new URL(options.printUrl);
      const cookies = options.cookieHeader.split(";").map((part) => {
        const [rawName, ...rest] = part.trim().split("=");
        return {
          name: rawName?.trim() ?? "",
          value: rest.join("="),
          domain: target.hostname,
          path: "/",
        };
      }).filter((cookie) => cookie.name.length > 0);

      if (cookies.length > 0) {
        await page.setCookie(...cookies);
      }
    }

    await page.setViewport({
      width: 794,
      height: 1123,
      deviceScaleFactor: 2,
    });

    await page.goto(options.printUrl, {
      waitUntil: "networkidle0",
      timeout: 60_000,
    });

    await page.waitForSelector("[data-prescription-sheet]", {
      timeout: 30_000,
    });

    // Ensure template image(s) finished loading.
    await page.evaluate(async () => {
      const images = Array.from(document.images);
      await Promise.all(
        images.map((img) => {
          if (img.complete) {
            return Promise.resolve();
          }
          return new Promise<void>((resolve) => {
            img.addEventListener("load", () => resolve(), { once: true });
            img.addEventListener("error", () => resolve(), { once: true });
          });
        }),
      );
    });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
      preferCSSPageSize: true,
    });

    return Buffer.from(pdf);
  } finally {
    await page.close().catch(() => undefined);
  }
}
