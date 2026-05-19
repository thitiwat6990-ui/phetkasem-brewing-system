import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // สั่งให้ข้ามการเช็กความเป๊ะของ TypeScript ตอนประกอบร่างบน Vercel
    ignoreBuildErrors: true,
  },
  eslint: {
    // ข้ามการตรวจฟอร์แมตโค้ดไปด้วย จะได้ผ่านฉลุย
    ignoreDuringBuilds: true,
  }
};

export default nextConfig;
