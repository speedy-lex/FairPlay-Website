"use client"

import Head from 'next/head';
import { Topbar } from '@/components/Topbar'
import { Sidebar } from '@/components/Sidebar'
import { NotImplementedSection } from '@/components/notImplementedSection'

export default function MyChannelPage() {
  return (
    <>
      <Head>
        <title>My Channel - FairPlay</title>
        <meta name="description" content="FairPlay is a free platform for sharing, discovering and supporting cultural, scientific and creative videos." />
      </Head>
      <Topbar active="channel" />
      <div className="page-wrapper container">
        <Sidebar active="channel" />
        <main className="main-content">
          <div className="custom-scrollbar">
            <NotImplementedSection />
          </div>
        </main>
      </div>
    </>
  )
}
