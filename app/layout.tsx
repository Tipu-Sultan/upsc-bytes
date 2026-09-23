import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppHeader } from '@/components/ui/AppHeader';
import { Toaster } from 'sonner';
import { ServiceWorkerRegister } from '@/components/pwa/ServiceWorkerRegister';

export const metadata: Metadata = {
  title: { default: 'UPSC Bytes', template: '%s · UPSC Bytes' },
  description: 'Visual-first learning and revision platform for UPSC preparation.',
  applicationName: 'UPSC Bytes',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, title: 'UPSC Bytes', statusBarStyle: 'black-translucent' },
};

export const viewport: Viewport = { themeColor: '#070b14', colorScheme: 'dark light' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><AppHeader />{children}<Toaster position="top-right" richColors closeButton theme="dark" /><ServiceWorkerRegister /></body></html>;
}
