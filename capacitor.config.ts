import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "io.github.hgck000.scottbook",
  appName: "ScottBook",
  webDir: "dist",
  loggingBehavior: "debug",
  backgroundColor: "#f4efe4",
  plugins: {
    SystemBars: {
      insetsHandling: "css",
      hidden: false
    }
  }
};

export default config;
