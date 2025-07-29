import React from 'react';
import styles from './notImplementedSection.module.css';

export const NotImplementedSection = () => {
  return (
    <div className={styles.container}>
      <img
        src="./images/feature-not-available.png"
        alt="Feature not available"
        className={styles.image}
      />
      <h2 className={styles.title}>Nothing here yet</h2>
      <p className={styles.text}>
        Help us to make this feature!{' '}
        <a href="https://newstreamteam.github.io/NewStream-Main/contributors.html" className={styles.link}>
          Take a look at #contributors
        </a>
      </p>
    </div>
  );
};
