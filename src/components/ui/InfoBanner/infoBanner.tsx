import { useEffect, useState } from 'react';
import styles from './infoBanner.module.css';

export const DevBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('infoBannerDismissed');
    if (!dismissed) setVisible(true);
  }, []);

  const handleClose = () => {
    setVisible(false);
    localStorage.setItem('infoBannerDismissed', 'true');
  };

  if (!visible) return null;

  return (
    <div className={styles.infoBanner}>
      <span className={styles.infoBannerText}>🚧 Note: This site is a demo currently in development, not the final website!</span>
      <button className={styles.closeBtn} onClick={handleClose}>✖</button>
    </div>
  );
};
