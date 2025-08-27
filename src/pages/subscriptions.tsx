"use client"

import Head from 'next/head';
import { Topbar } from '@/components/ui/Topbar/Topbar'
import { Sidebar } from '@/components/ui/Sidebar/Sidebar'
import { NotImplementedSection } from '@/components/ui/NotImplemented/notImplementedSection'
import styles from './subscritpions.module.css'; // not used for now

export default function SubscriptionsPage() {
  return (
    <>
      <Head>
        <title>Subscriptions - FairPlay</title>
        <meta name="description" content="FairPlay is a free platform for sharing, discovering and supporting cultural, scientific and creative videos." />
      </Head>
      <Topbar />
      <div className="page-wrapper container">
        <Sidebar active="subscriptions" />
        <main className="main-content">
          <div className="custom-scrollbar">
            <NotImplementedSection />
          </div>
        </main>
      </div>
    </>
  )
}
