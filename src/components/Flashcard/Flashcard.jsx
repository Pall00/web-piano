// src/components/Flashcard/Flashcard.jsx
import { useMemo } from 'react'
import { CardContainer, CardInner, CardFront, CardBack, CardContent } from './Flashcard.styles'
import FlashcardNotation from './FlashcardNotation'
import { generateSingleNoteXML } from '../../utils/xmlGenerator'

const Flashcard = ({ card, isFlipped, onFlip }) => {
  // Generoidaan XML vain jos kortin tyyppi on 'notation' ja data on muuttunut
  // Tämä parantaa suorituskykyä estämällä turhat uudelleenlaskennat
  const notationXml = useMemo(() => {
    if (card.type === 'notation' && card.noteName) {
      return generateSingleNoteXML(card.noteName, card.clef)
    }
    return null
  }, [card])

  return (
    <CardContainer onClick={onFlip}>
      <CardInner $isFlipped={isFlipped}>
        {/* KORTIN ETUPUOLI */}
        <CardFront>
          <CardContent>
            {/* Jos tyyppi on notation, näytä viivasto, muuten teksti */}
            {card.type === 'notation' ? (
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <FlashcardNotation xmlData={notationXml} />
                <span style={{ fontSize: '1rem', color: '#888', marginTop: '-10px' }}>
                  Mikä nuotti?
                </span>
              </div>
            ) : (
              <h2>{card.front}</h2>
            )}

            <span
              style={{
                fontSize: '0.8rem',
                color: '#aaa',
                marginTop: '1.5rem',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              Klikkaa kääntääksesi
            </span>
          </CardContent>
        </CardFront>

        {/* KORTIN KÄÄNTÖPUOLI */}
        <CardBack>
          <CardContent>
            <h2>{card.back}</h2>

            {card.type === 'notation' && (
              <div style={{ marginTop: '1rem', color: '#eee' }}>
                <p>
                  Soita pianolla: <strong>{card.noteName}</strong>
                </p>
              </div>
            )}
          </CardContent>
        </CardBack>
      </CardInner>
    </CardContainer>
  )
}

export default Flashcard
