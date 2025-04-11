// src/components/NotationDisplay/ScoreSelector.jsx
import { useState } from 'react'
import {
  SelectorContainer,
  SelectorLabel,
  Select,
  UploadButton,
  FileInput,
} from './ScoreSelector.styles'
import { SAMPLE_SCORES } from '../../data/scoreData'

const ScoreSelector = ({ onScoreChange }) => {
  const [selectedScore, setSelectedScore] = useState(SAMPLE_SCORES[0].id)

  const handleScoreChange = e => {
    const scoreId = e.target.value
    setSelectedScore(scoreId)

    const selectedScoreData = SAMPLE_SCORES.find(score => score.id === scoreId)
    if (selectedScoreData) {
      onScoreChange(selectedScoreData.url)
    }
  }

  const handleFileUpload = e => {
    const file = e.target.files[0]
    if (!file) return

    // Check if file is MusicXML
    if (
      file.name.endsWith('.xml') ||
      file.name.endsWith('.musicxml') ||
      file.name.endsWith('.mxl')
    ) {
      // Create a URL for the file
      const fileUrl = URL.createObjectURL(file)
      onScoreChange(fileUrl)

      // Reset the select to a custom option
      setSelectedScore('custom')
    } else {
      alert('Please upload a MusicXML file (.xml, .musicxml, or .mxl)')
    }
  }

  return (
    <SelectorContainer>
      <SelectorLabel>Select a Score:</SelectorLabel>
      <Select value={selectedScore} onChange={handleScoreChange}>
        {SAMPLE_SCORES.map(score => (
          <option key={score.id} value={score.id}>
            {score.name}
          </option>
        ))}
        {selectedScore === 'custom' && <option value="custom">Custom Upload</option>}
      </Select>

      <UploadButton>
        Upload Score
        <FileInput type="file" accept=".xml,.musicxml,.mxl" onChange={handleFileUpload} />
      </UploadButton>
    </SelectorContainer>
  )
}

export default ScoreSelector
