/**
 * Fast production build for Direct Delhi Auto Hub.
 * Skips Metro bundling (APK is distributed via EAS, not Expo Go web).
 * Creates the static-build directory structure the serve.js expects.
 */

const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");
const staticBuild = path.join(projectRoot, "static-build");

function getDeploymentDomain() {
  const raw =
    process.env.REPLIT_INTERNAL_APP_DOMAIN ||
    process.env.REPLIT_DEV_DOMAIN ||
    process.env.EXPO_PUBLIC_DOMAIN ||
    "";
  if (!raw) return "directdelhiautohub.replit.app";
  let d = raw.trim();
  if (!/^https?:\/\//i.test(d)) d = `https://${d}`;
  return new URL(d).host;
}

const domain = getDeploymentDomain();
console.log(`Building for domain: ${domain}`);

// Recreate static-build directory
if (fs.existsSync(staticBuild)) {
  fs.rmSync(staticBuild, { recursive: true });
}
fs.mkdirSync(path.join(staticBuild, "ios"), { recursive: true });
fs.mkdirSync(path.join(staticBuild, "android"), { recursive: true });

// Write minimal manifests so serve.js manifest route returns something valid
const minimalManifest = (platform) => ({
  id: `direct-delhi-auto-hub-${platform}`,
  createdAt: new Date().toISOString(),
  runtimeVersion: "1.0.0",
  launchAsset: {
    key: "bundle",
    contentType: "application/javascript",
    url: `https://${domain}/bundle-${platform}.js`,
  },
  assets: [],
  metadata: {},
  extra: {
    expoClient: { name: "Direct Delhi Auto Hub", hostUri: domain },
  },
});

fs.writeFileSync(
  path.join(staticBuild, "ios", "manifest.json"),
  JSON.stringify(minimalManifest("ios"), null, 2),
);
fs.writeFileSync(
  path.join(staticBuild, "android", "manifest.json"),
  JSON.stringify(minimalManifest("android"), null, 2),
);

console.log("Build complete! Serving from:", `https://${domain}`);
process.exit(0);
