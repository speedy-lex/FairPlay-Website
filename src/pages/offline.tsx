"use client"

import Head from 'next/head';
import { Topbar } from '@/components/Topbar'
import { Sidebar } from '@/components/Sidebar'
import { NotImplementedSection } from '@/components/props/notImplementedSection'

export default function OfflinePage() {
  return (
    <>
      <Head>
        <title>Offline - FairPlay</title>
        <meta name="description" content="FairPlay is a free platform for sharing, discovering and supporting cultural, scientific and creative videos." />
      </Head>
      <Topbar />
      <div className="page-wrapper container">
        <Sidebar active="offline" />
        <main className="main-content">
          <div className="custom-scrollbar">
            <NotImplementedSection />
          </div>
        </main>
      </div>
    </>
  )
}
