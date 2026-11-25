import { createRequire } from "module";

const require = createRequire(import.meta.url);
const bufferModule = require("buffer");

// Polyfill removed SlowBuffer on Node 25+/26+ for legacy dependencies (e.g. buffer-equal-constant-time)
if (!bufferModule.SlowBuffer) {
  bufferModule.SlowBuffer = bufferModule.Buffer;
}

const { default: app } = await import("../backend/index.js");

export default app;
