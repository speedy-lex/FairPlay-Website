import React from 'react';
import { ChevronRightIcon } from '@/components/icons';
import styles from './CategoryFilter.module.css';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  ariaLabel?: string;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  setSelectedCategory,
  ariaLabel = 'Scroll Categories',
}) => {
  return (
    <div className={styles.categoryFilters}>
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => setSelectedCategory(category)}
          className={`${styles.categoryButton} ${
            category === selectedCategory ? styles.active : styles.inactive
          }`}
        >
          {category}
        </button>
      ))}
      <button className={styles.categoryScrollButton} aria-label={ariaLabel}>
        <ChevronRightIcon />
      </button>
    </div>
  );
};
