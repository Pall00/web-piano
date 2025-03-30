// src/components/CategorySelector/CategorySelector.jsx
import { motion } from 'framer-motion'
import {
  CategoryContainer,
  CategoryTitle,
  CategoryList,
  CategoryCard,
  CardTitle,
  CardDescription,
  DifficultyBadge,
} from './CategorySelector.styles'

const CategorySelector = ({ categories, activeCategory, onSelectCategory }) => {
  return (
    <CategoryContainer>
      <CategoryTitle>Flashcard Sets</CategoryTitle>
      <CategoryList>
        {categories.map(category => (
          <motion.div key={category.id} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <CategoryCard
              $isActive={category.id === activeCategory}
              onClick={() => onSelectCategory(category.id)}
            >
              <CardTitle>{category.name}</CardTitle>
              <CardDescription>{category.description}</CardDescription>
              <DifficultyBadge $difficulty={category.difficulty}>
                {category.difficulty}
              </DifficultyBadge>
            </CategoryCard>
          </motion.div>
        ))}
      </CategoryList>
    </CategoryContainer>
  )
}

export default CategorySelector
