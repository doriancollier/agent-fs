import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SQLite VFS - Virtual Filesystem for AI Agents',
  description: 'Run AI coding agents in serverless environments with SQLite-backed virtual filesystem',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
