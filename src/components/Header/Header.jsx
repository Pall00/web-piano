// src/components/Header/Header.jsx
import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import ThemeToggle from '../ThemeToggle/ThemeToggle'
import {
  HeaderContainer,
  NavContainer,
  Logo,
  LogoIcon,
  LogoText,
  MobileMenuButton,
  Nav,
  NavLink,
  HeaderActions,
} from './Header.styles'

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <HeaderContainer $isScrolled={isScrolled}>
      <NavContainer>
        <Logo to="/">
          <LogoIcon>🎹</LogoIcon>
          <LogoText>Piano Teacher</LogoText>
        </Logo>

        <HeaderActions>
          <ThemeToggle />
          <MobileMenuButton onClick={toggleMobileMenu}>
            <span>☰</span>
          </MobileMenuButton>
        </HeaderActions>

        <Nav $isOpen={isMobileMenuOpen}>
          <NavLink
            to="/flashcards"
            $isActive={location.pathname === '/flashcards'}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Flashcards
          </NavLink>
          <NavLink
            to="/notation"
            $isActive={location.pathname === '/notation'}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Notation
          </NavLink>
          <NavLink
            to="/chord-trainer"
            $isActive={location.pathname === '/chord-trainer'}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Chord Trainer
          </NavLink>
          <NavLink
            to="/settings"
            $isActive={location.pathname === '/settings'}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Settings
          </NavLink>
        </Nav>
      </NavContainer>
    </HeaderContainer>
  )
}

export default Header
