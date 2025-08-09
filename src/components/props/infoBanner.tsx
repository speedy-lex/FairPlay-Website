import { useEffect, useState } from 'react';

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
    <div className="info-banner">
      <span className="info-banner-text">🚧 Note: This site is a demo currently in development, not the final website!</span>
      <button className="close-btn" onClick={handleClose}>✖</button>
    </div>
  );
};
