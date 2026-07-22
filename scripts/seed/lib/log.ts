export function logOk(message: string): void {
  console.log(`✔ ${message}`);
}

export function logInfo(message: string): void {
  console.log(`ℹ ${message}`);
}

export function logWarn(message: string): void {
  console.warn(`⚠ ${message}`);
}

export function logError(message: string): void {
  console.error(`✖ ${message}`);
}

export function logBlank(): void {
  console.log("");
}
