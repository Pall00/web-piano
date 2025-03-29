// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeProvider'
import Header from './components/Header'
import GlobalStyles from './styles/GlobalStyles'
import FooterPiano from './components/FooterPiano'
import Home from './pages/Home'

function App() {
  return (
    <ThemeProvider>
      <GlobalStyles />
      <Router>
        <div className="app-container">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route
                path="/flashcards"
                element={<div className="content-page">Flashcards Page</div>}
              />
              <Route path="/notation" element={<div className="content-page">Notation Page</div>} />
              <Route
                path="/chord-trainer"
                element={<div className="content-page">Chord Trainer Page</div>}
              />
              <Route path="/settings" element={<div className="content-page">Settings Page</div>} />
            </Routes>
          </main>
          <FooterPiano showLabels={false} />
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App
