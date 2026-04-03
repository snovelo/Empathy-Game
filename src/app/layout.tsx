import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'The GOLD Standard Game',
  description:
    'A multiplayer customer service training game. Go Beyond, Own Every Moment, Lead with Care, Do It Together.',
  keywords: ['GOLD standard', 'customer service', 'training', 'game', 'brokerage'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-dark-950 text-slate-100 antialiased">
        {children}
        <footer className="py-4 text-center text-xs text-slate-500 border-t border-slate-800 bg-dark-900 mt-auto">
          <p>
            The GOLD Standard Game — For internal training purposes only.{' '}
            <span className="font-medium text-slate-400">
              This app does not provide legal, trading, or investment advice.
            </span>{' '}
            Sample scenarios are fictional and for educational use.
          </p>
        </footer>
      </body>
    </html>
  );
}
