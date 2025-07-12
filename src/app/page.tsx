"use client"

import Link from 'next/link'
import { useState } from 'react'
import { Topbar } from '@/components/Topbar'
import { Sidebar } from '@/components/Sidebar'
import { UploadModal } from '@/components/UploadModal'
import { HomeIcon, SubscriptionsIcon, UserIcon } from '@/components/icons'
import styles from './HomePage.module.css'

export default function HomePage() {
  const [showUploadModal, setShowUploadModal] = useState(false)

  return (
    <>
      <Topbar active="home" onCreateClick={() => setShowUploadModal(true)} />
      <div className="page-wrapper container">
        <Sidebar active="home" />
        <main className="main-content">
          <section className={`${styles.homeContentSection} custom-scrollbar`}>
            {/* Hero Section */}
            <div className={styles.heroSection}>
              <h1 className={styles.heroTitle}>Bienvenue sur notre plateforme vidéo</h1>
              <p className={styles.heroSubtitle}>Découvrez et partagez des vidéos de qualité en toute simplicité.</p>
              <Link href="/videos" className={styles.getStartedButton}>Commencer</Link>
            </div>
            {/* Features Section */}
            <div className={styles.featuresSection}>
              <div className={styles.featureItem}>
                <HomeIcon />
                <h3 className={styles.featureTitle}>Interface Intuitive</h3>
                <p className={styles.featureDescription}>Navigation simplifiée pour trouver rapidement ce qui vous intéresse.</p>
              </div>
              <div className={styles.featureItem}>
                <SubscriptionsIcon />
                <h3 className={styles.featureTitle}>Abonnements Faciles</h3>
                <p className={styles.featureDescription}>Suivez vos créateurs préférés et ne manquez aucune nouveauté.</p>
              </div>
              <div className={styles.featureItem}>
                <UserIcon />
                <h3 className={styles.featureTitle}>Confidentialité Respectée</h3>
                <p className={styles.featureDescription}>
                  Vos données personnelles ne sont jamais collectées ni partagées. Votre vie privée est notre priorité.
                </p>
              </div>
            </div>
          </section>
        </main>
      </div>
      {showUploadModal && (
        <UploadModal onClose={() => setShowUploadModal(false)} onUploadSuccess={() => setShowUploadModal(false)} />
      )}
    </>
  )
}
