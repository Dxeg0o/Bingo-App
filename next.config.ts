import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // El proyecto vive dentro de una carpeta con otros lockfiles: fijamos la raíz.
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
