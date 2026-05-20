import type { NextConfig } from "next";

import { ROUTES } from "./src/lib/routes";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/join",
        destination: ROUTES.groupsJoin,
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
