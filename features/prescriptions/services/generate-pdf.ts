import "server-only";

import puppeteer, { type Browser } from "puppeteer";

let browserPromise: Promise<Browser> | null = null;

async function launchBrowser(): Promise<Browser> {
  return puppeteer.launch({
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

async function getBrowser(): Promise<Browser> {
  // Reuse a live browser, but transparently relaunch a crashed/disconnected one.
  if (browserPromise) {
    try {
      const existing = await browserPromise;
      if (existing.connected) {
        return existing;
      }
    } catch {
      // Fall through to relaunch; never keep a rejected/dead promise cached.
    }
    browserPromise = null;
  }

  const pending = launchBrowser();
  browserPromise = pending;

  try {
    const browser = await pending;
    browser.once("disconnected", () => {
      if (browserPromise === pending) {
        browserPromise = null;
      }
    });
    return browser;
  } catch (error) {
    // Do not cache a failed launch — the next call should retry cleanly.
    if (browserPromise === pending) {
      browserPromise = null;
    }
    throw error;
  }
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
      const cookies = options.cookieHeader
        .split(";")
        .map((part) => {
          const [rawName, ...rest] = part.trim().split("=");
          return {
            name: rawName?.trim() ?? "",
            value: rest.join("="),
            domain: target.hostname,
            path: "/",
          };
        })
        .filter((cookie) => cookie.name.length > 0);

      if (cookies.length > 0) {
        await page.setCookie(...cookies);
      }
    }

    await page.setViewport({
      width: 794,
      height: 1123,
      deviceScaleFactor: 2,
    });
    await page.emulateMediaType("print");

    // Avoid `networkidle0`: dev HMR / Clerk sockets never go idle and would
    // stall until timeout. The explicit selector + asset waits below are the
    // real readiness signal for the printed sheet.
    await page.goto(options.printUrl, {
      waitUntil: "domcontentloaded",
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
      await document.fonts.ready;
    });

    const overflowingSheets = await page.evaluate(() => {
      const overflowTolerancePx = 2;
      return Array.from(
        document.querySelectorAll<HTMLElement>("[data-prescription-content]"),
      ).flatMap((content, index) =>
        content.scrollHeight - content.clientHeight > overflowTolerancePx
          ? [index + 1]
          : [],
      );
    });

    if (overflowingSheets.length > 0) {
      throw new Error(
        `Prescription content exceeds the safe writing area on page(s): ${overflowingSheets.join(", ")}`,
      );
    }

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "0mm",
        right: "0mm",
        bottom: "0mm",
        left: "0mm",
      },
      preferCSSPageSize: true,
    });

    return Buffer.from(pdf);
  } finally {
    await page.close().catch(() => undefined);
  }
}
