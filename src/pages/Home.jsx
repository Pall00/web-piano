// src/pages/Home.jsx
import React from 'react'
import styled from 'styled-components'

const HomeContainer = styled.div`
  padding-top: 10rem;
  padding-bottom: 2rem;
  width: 90%;
  max-width: 1200px;
  margin: 0 auto;
`

const Home = () => {
  return (
    <HomeContainer>
      <h1>Welcome to Piano Teacher</h1>
      <p>Select an option from the menu to get started.</p>
    </HomeContainer>
  )
}

export default Home
