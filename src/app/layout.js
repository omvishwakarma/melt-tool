import Providers from '@/components/Providers';
import './globals.css';

export const metadata = {
  title: 'MELT — Simple Curation',
  description:
    'MELT Simple Curation Model — intentional date ideas, not instant noise.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
