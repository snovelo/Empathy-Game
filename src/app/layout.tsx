import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'The Empathy Game',
  description:
    'A multiplayer customer service training game. Strategically align with your customers\' emotions.',
  keywords: ['empathy', 'customer service', 'training', 'game', 'brokerage'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-slate-50 text-slate-900 antialiased">
        {children}
        <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-100 bg-white mt-auto">
          <p>
            The Empathy Game — For internal training purposes only.{' '}
            <span className="font-medium">
              This app does not provide legal, trading, or investment advice.
            </span>{' '}
            Sample scenarios are fictional and for educational use.
          </p>
        </footer>
      </body>
    </html>
  );
}
