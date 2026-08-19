import "server-only";

import chromium from "@sparticuz/chromium-min";
import type { Browser, LaunchOptions } from "puppeteer-core";
import puppeteer from "puppeteer-core";

let browserPromise: Promise<Browser> | null = null;

const SHARED_LAUNCH_ARGS = [
  "--no-sandbox",
  "--disable-setuid-sandbox",
  "--font-render-hinting=none",
  "--disable-dev-shm-usage",
];

/**
 * Must match the installed `@sparticuz/chromium-min` version.
 * Override with CHROMIUM_PACK_URL if you host the pack yourself.
 */
const CHROMIUM_PACK_VERSION = "147.0.0";
const DEFAULT_CHROMIUM_PACK_URL = `https://github.com/Sparticuz/chromium/releases/download/v${CHROMIUM_PACK_VERSION}/chromium-v${CHROMIUM_PACK_VERSION}-pack.x64.tar`;

function isServerlessRuntime(): boolean {
  return Boolean(
    process.env.VERCEL ||
      process.env.AWS_LAMBDA_FUNCTION_NAME ||
      process.env.AWS_EXECUTION_ENV,
  );
}

async function launchServerlessBrowser(): Promise<Browser> {
  chromium.setGraphicsMode = false;

  const packUrl =
    process.env.CHROMIUM_PACK_URL ?? DEFAULT_CHROMIUM_PACK_URL;

  return puppeteer.launch({
    args: [...chromium.args, ...SHARED_LAUNCH_ARGS],
    executablePath: await chromium.executablePath(packUrl),
    headless: "shell",
  });
}

async function launchLocalBrowser(): Promise<Browser> {
  const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
  const options: LaunchOptions = {
    headless: true,
    args: SHARED_LAUNCH_ARGS,
  };

  if (executablePath) {
    options.executablePath = executablePath;
  } else {
    options.channel = "chrome";
  }

  try {
    return await puppeteer.launch(options);
  } catch (error) {
    throw new Error(
      "Could not find a local Chrome install. Install Google Chrome or set PUPPETEER_EXECUTABLE_PATH.",
      { cause: error },
    );
  }
}

async function launchBrowser(): Promise<Browser> {
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    return launchLocalBrowser();
  }

  if (isServerlessRuntime()) {
    return launchServerlessBrowser();
  }

  return launchLocalBrowser();
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
