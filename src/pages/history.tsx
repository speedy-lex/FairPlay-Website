"use client"

import Head from 'next/head';
import { Topbar } from '@/components/ui/Topbar/Topbar';
import { Sidebar } from '@/components/ui/Sidebar/Sidebar';
import { NotImplementedSection } from '@/components/ui/NotImplemented/notImplementedSection';

export default function HistoryPage() {
  return (
    <>
      <Head>
        <title>History - FairPlay</title>
        <meta name="description" content="FairPlay is a free platform for sharing, discovering and supporting cultural, scientific and creative videos." />
      </Head>
      <Topbar />
      <div className="page-wrapper container">
        <Sidebar active="history" />
        <main className="main-content">
          <div className="custom-scrollbar">
            <NotImplementedSection />
          </div>
        </main>
      </div>
    </>
  );
}
