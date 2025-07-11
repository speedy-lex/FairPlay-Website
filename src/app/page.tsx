"use client"

import Link from 'next/link'
import { useState } from 'react'
import { Layout } from '@/components/Layout'
import { UploadModal } from '@/components/UploadModal'
import { HomeIcon, SubscriptionsIcon, UserIcon } from '@/components/icons'
import styles from './HomePage.module.css'

export default function HomePage() {
  const [showUploadModal, setShowUploadModal] = useState(false)

  return (
    <Layout active="home" onCreateClick={() => setShowUploadModal(true)}>
      <section className={`${styles.homeContentSection} custom-scrollbar`}>
        <nav className={styles.mainNav}>
                <ul>
                    <li><a href="#about">About</a></li>
                    <li><a href="#features">Our Values</a></li>
                    <li><a href="#community">Community</a></li>
                    <li><a href="#extension">Extension</a></li>
                    <li><a href="#development">Development</a></li>
                    <li><a href="https://ko-fi.com/openstream" className="btn-donate">Donate</a></li>
                </ul>
            </nav>
        <h1 className={styles.heroTitle}>Libérez-vous de l'emprise des réseaux sociaux.</h1>
        <p className={styles.heroSubtitle}>
          Profitez de vidéos et de contenus captivants, gratuitement, pour toujours.
          Pas d'algorithmes intrusifs, pas de publicités, juste du contenu pertinent.
        </p>
        <Link href="/videos" className={styles.callToActionButton}>Commencer à explorer</Link>
        <div className={styles.featuresSection}>
          <div className={styles.featureCard}>
            <HomeIcon className={styles.featureIcon} />
            <h3 className={styles.featureTitle}>Expérience sans distraction</h3>
            <p className={styles.featureDescription}>
              Conçu pour vous offrir une expérience de visionnage pure, sans les distractions habituelles des réseaux sociaux.
            </p>
          </div>
          <div className={styles.featureCard}>
            <SubscriptionsIcon className={styles.featureIcon} />
            <h3 className={styles.featureTitle}>Contenu sélectionné</h3>
            <p className={styles.featureDescription}>
              Découvrez des vidéos de qualité sélectionnées avec soin, loin du bruit et de la désinformation.
            </p>
          </div>
          <div className={styles.featureCard}>
            <UserIcon className={styles.featureIcon} />
            <h3 className={styles.featureTitle}>Confidentialité Respectée</h3>
            <p className={styles.featureDescription}>
              Vos données personnelles ne sont jamais collectées ni partagées. Votre vie privée est notre priorité.
            </p>
          </div>
        </div>
      </section>

      {showUploadModal && (
        <UploadModal onClose={() => setShowUploadModal(false)} onUploadSuccess={() => setShowUploadModal(false)} />
      )}
    </Layout>
  )
}
