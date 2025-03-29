// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import Header from './components/Header'
import GlobalStyles from './styles/GlobalStyles'

function App() {
  return (
    <ThemeProvider>
      <GlobalStyles />
      <Router>
        <Header />
        <Routes>
          <Route
            path="/"
            element={
              <div
                style={{ paddingTop: '10rem', margin: '0 auto', width: '90%', maxWidth: '1200px' }}
              >
                Home Page
              </div>
            }
          />
          <Route
            path="/flashcards"
            element={
              <div
                style={{ paddingTop: '10rem', margin: '0 auto', width: '90%', maxWidth: '1200px' }}
              >
                Flashcards Page
              </div>
            }
          />
          <Route
            path="/notation"
            element={
              <div
                style={{ paddingTop: '10rem', margin: '0 auto', width: '90%', maxWidth: '1200px' }}
              >
                Notation Page
              </div>
            }
          />
          <Route
            path="/chord-trainer"
            element={
              <div
                style={{ paddingTop: '10rem', margin: '0 auto', width: '90%', maxWidth: '1200px' }}
              >
                Chord Trainer Page
              </div>
            }
          />
          <Route
            path="/settings"
            element={
              <div
                style={{ paddingTop: '10rem', margin: '0 auto', width: '90%', maxWidth: '1200px' }}
              >
                Settings Page
              </div>
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App
