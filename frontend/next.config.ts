import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 's4.anilist.co' },
      { protocol: 'https', hostname: 'img.anili.st' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'cdn.myanimelist.net' },
      { protocol: 'https', hostname: 'myanimelist.net' },
      { protocol: 'https', hostname: 'i.imgur.com' },
      // Otakudesu image CDN (WordPress)
      { protocol: 'https', hostname: 'i0.wp.com' },
      { protocol: 'https', hostname: 'i1.wp.com' },
      { protocol: 'https', hostname: 'i2.wp.com' },
      { protocol: 'https', hostname: 'i3.wp.com' },
      { protocol: 'https', hostname: 'otakudesu.fit' },
      { protocol: 'https', hostname: 'otakudesu.blog' },
      // Samehadaku
      { protocol: 'https', hostname: 'v2.samehadaku.how' },
      { protocol: 'https', hostname: 'samehadaku.how' },
      // Wildcard untuk CDN gambar lainnya
      { protocol: 'https', hostname: '**.wp.com' },
      { protocol: 'https', hostname: '**.blogspot.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https: blob:",
              // Izinkan iframe dari semua video host yang digunakan Otakudesu & Samehadaku
              "frame-src 'self' https: blob: https://www.blogger.com https://*.blogger.com https://desustream.me https://*.desustream.me https://filemoon.sx https://*.filemoon.sx https://vidhide.com https://*.vidhide.com https://streamtape.com https://doodstream.com https://*.doodstream.com https://krakenfiles.com https://v2.samehadaku.how https://otakudesu.fit https://otakudesu.blog",
              "connect-src 'self' https:",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
