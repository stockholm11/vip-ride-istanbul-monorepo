import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

interface CategoryFilterProps {
  currentCategory: string;
  onCategoryChange: (category: string) => void;
  categories?: { id: string; label: string }[];
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  currentCategory,
  onCategoryChange,
  categories,
}) => {
  const { t } = useTranslation();

  const fallbackCategories = [
    { id: '', label: t('vipTours.allTours') },
    { id: 'cultural-historical', label: t('nav.culturalHistoricalTours') },
    { id: 'shopping-entertainment', label: t('nav.shoppingEntertainmentTours') },
    { id: 'nature-excursion', label: t('nav.natureExcursionTours') },
    { id: 'yacht-boat', label: t('nav.yachtBoatTours') },
  ];

  const renderedCategories =
    categories && categories.length
      ? [{ id: '', label: t('vipTours.allTours') }, ...categories]
      : fallbackCategories;

  return (
    <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-10 px-2 sm:px-4 md:px-0">
      {renderedCategories.map((category) => (
        <motion.button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={`px-3 sm:px-5 py-2 sm:py-3 rounded-md text-sm sm:text-base font-medium whitespace-nowrap ${
            currentCategory === category.id
            ? 'bg-primary text-white'
            : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {category.label}
        </motion.button>
      ))}
    </div>
  );
};

export default CategoryFilter;
