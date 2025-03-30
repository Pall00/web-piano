// src/components/CategorySelector/CategorySelector.styles.js
import styled from 'styled-components'

export const CategoryContainer = styled.div`
  width: 100%;
  max-width: 800px; // Set a max-width for better layout control
  margin-bottom: ${({ theme }) => theme.spacing(10)};
  display: flex;
  flex-direction: column;
  align-items: center;
`

export const CategoryTitle = styled.h2`
  margin-bottom: ${({ theme }) => theme.spacing(6)};
  font-size: 2.2rem;
  color: ${({ theme }) => theme.colors.text.primary};
  text-align: center;
  width: 100%;
`

export const CategoryList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing(4)};
  width: 100%;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    grid-template-columns: 1fr;
  }
`

export const CategoryCard = styled.div`
  padding: ${({ theme }) => theme.spacing(5)};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  background-color: ${({ theme, $isActive }) =>
    $isActive
      ? theme.isDarkMode
        ? 'rgba(93, 142, 217, 0.3)'
        : theme.colors.primary.hover
      : theme.colors.background.paper};
  border: 2px solid
    ${({ theme, $isActive }) => ($isActive ? theme.colors.primary.main : theme.colors.border)};
  cursor: pointer;
  transition: all 0.2s ease;
  height: 100%;
  position: relative;
  box-shadow: ${({ theme, $isActive }) => ($isActive ? theme.shadows.medium : 'none')};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary.main};
    box-shadow: ${({ theme }) => theme.shadows.small};
    transform: translateY(-2px);
  }
`

export const CardTitle = styled.h3`
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  font-size: 1.8rem;
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 600;
`

export const CardDescription = styled.p`
  font-size: 1.4rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing(6)};
`

export const DifficultyBadge = styled.span`
  position: absolute;
  bottom: ${({ theme }) => theme.spacing(3)};
  right: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(2)};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-size: 1.2rem;
  text-transform: capitalize;

  ${({ $difficulty, theme }) => {
    if ($difficulty === 'beginner') {
      return `
        background-color: ${theme.colors.success};
        color: white;
      `
    } else if ($difficulty === 'intermediate') {
      return `
        background-color: ${theme.colors.secondary.main};
        color: white;
      `
    } else if ($difficulty === 'advanced') {
      return `
        background-color: ${theme.colors.error};
        color: white;
      `
    }
    return ''
  }}
`
