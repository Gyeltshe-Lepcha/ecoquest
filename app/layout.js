import { Inter, Geist_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';
const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
});
const geistMono = Geist_Mono({
    subsets: ['latin'],
    variable: '--font-geist-mono',
});
export const metadata = {
    title: 'EcoQuest Bhutan | Zero Waste, One Scan at a Time',
    description: 'A gamified, IoT-integrated waste reduction platform designed for Bhutanese campuses and households. Turn waste management into an engaging challenge.',
    keywords: ['waste management', 'gamification', 'Bhutan', 'sustainability', 'IoT', 'smart bin', 'eco-friendly'],
    authors: [{ name: 'EcoQuest Bhutan Team' }],
    generator: 'v0.app',
    icons: {
        icon: [
            {
                url: '/icon-light-32x32.png',
                media: '(prefers-color-scheme: light)',
            },
            {
                url: '/icon-dark-32x32.png',
                media: '(prefers-color-scheme: dark)',
            },
            {
                url: '/icon.svg',
                type: 'image/svg+xml',
            },
        ],
        apple: '/apple-icon.png',
    },
    openGraph: {
        title: 'EcoQuest Bhutan | Zero Waste, One Scan at a Time',
        description: 'Turn waste management into an engaging challenge with gamification and IoT verification.',
        type: 'website',
        locale: 'en_US',
    },
};
export const viewport = {
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: '#10B981' },
        { media: '(prefers-color-scheme: dark)', color: '#059669' },
    ],
    width: 'device-width',
    initialScale: 1,
};
export default function RootLayout({ children, }) {
    return (<html lang="en" className={`${inter.variable} ${geistMono.variable} bg-background`}>
      <body className="font-sans antialiased min-h-screen">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>);
}
