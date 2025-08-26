import React from 'react';
import { ChevronRightIcon } from '@/components/icons';

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
  ariaLabel = 'Faire défiler les catégories',
}) => {
  return (
    <div className="category-filters">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => setSelectedCategory(category)}
          className={`category-button ${
            category === selectedCategory ? 'active' : 'inactive'
          }`}
        >
          {category}
        </button>
      ))}
      <button className="category-scroll-button" aria-label={ariaLabel}>
        <ChevronRightIcon />
      </button>

      <style jsx>{`
        .category-filters {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          flex-wrap: wrap;
          justify-content: center;
          background: white;
          padding: 10px;
          border-radius: 8px;
          box-shadow: 2px 0 5px rgba(0, 0, 0, 0.03);
        }

        .category-button {
          background-color: var(--color-light-gray);
          border: 1px solid var(--color-light-gray);
          color: var(--color-medium-gray);
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 0.9em;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .category-button:hover {
          background-color: var(--color-accent);
          color: var(--color-white);
          border-color: var(--color-accent);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(106, 142, 251, 0.2);
        }

        .category-button.active {
          background-color: var(--color-accent);
          color: var(--color-white);
          border-color: var(--color-accent);
          box-shadow: 0 2px 8px rgba(106, 142, 251, 0.2);
        }

        .category-scroll-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: none;
          border: none;
          color: var(--color-medium-gray);
          cursor: pointer;
          font-size: 1.5em;
          border-radius: 50%;
          transition: background-color 0.3s ease, color 0.3s ease;
        }

        .category-scroll-button:hover {
          background-color: var(--color-light-gray);
          color: var(--color-dark-gray);
        }
      `}</style>
    </div>
  );
};
