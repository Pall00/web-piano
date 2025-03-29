// src/components/Header/Header.styles.js
import styled from 'styled-components'
import { Link } from 'react-router-dom'

export const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background-color: ${({ theme }) => theme.colors.background.paper};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${props => (props.$isScrolled ? props.theme.shadows.medium : 'none')};
  transition: all 0.3s ease;
  z-index: 1000;
`

export const NavContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 90%;
  max-width: 1200px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing(3)} 0;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: ${({ theme }) => theme.spacing(2)} 0;
  }
`

export const Logo = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(4)};
  text-decoration: none;
  color: inherit;
  z-index: 1001;

  &:hover {
    transform: scale(1.02);
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    gap: ${({ theme }) => theme.spacing(2)};
  }
`

export const LogoIcon = styled.span`
  font-size: 2.5rem;
  transition: transform 0.3s ease;

  ${Logo}:hover & {
    transform: rotate(10deg);
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: 2rem;
  }
`

export const LogoText = styled.h1`
  font-weight: 700;
  font-size: 2.2rem;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: 1.6rem;
  }
`

export const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  font-size: 2rem;
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  z-index: 1001;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    display: block;
  }
`

export const Nav = styled.nav`
  display: flex;
  gap: ${({ theme }) => theme.spacing(8)};
  align-items: center;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: 70%;
    background-color: ${({ theme }) => theme.colors.background.paper};
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing(4)};
    padding: ${({ theme }) => theme.spacing(20)} ${({ theme }) => theme.spacing(8)};
    transform: translateX(${props => (props.$isOpen ? '0' : '100%')});
    transition: transform 0.3s ease;
    box-shadow: ${({ theme, $isOpen }) => ($isOpen ? theme.shadows.medium : 'none')};
  }
`

export const NavLink = styled(Link)`
  text-decoration: none;
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: ${props => (props.$isActive ? '600' : '500')};
  font-size: 1.8rem;
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(4)};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  transition: all 0.2s ease;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    width: ${props => (props.$isActive ? '100%' : '0')};
    height: 2px;
    background-color: ${({ theme }) => theme.colors.primary.main};
    transform: translateX(-50%);
    transition: width 0.2s ease;
  }

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
    background-color: ${({ theme }) => theme.colors.primary.hover};

    &::after {
      width: 100%;
    }
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: 1.4rem;
    width: 100%;
    text-align: center;
  }
`

export const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(4)};
`
