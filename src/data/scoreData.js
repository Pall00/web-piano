// src/data/scoreData.js

// Base URL for all sample scores
const BASE_URL = 'https://opensheetmusicdisplay.github.io/demo/'

// Complete list of sample scores available for the application
export const SAMPLE_SCORES = [
  // Original samples
  {
    id: 'beginner1',
    name: 'Clementi - Sonatina Op.36 No.1 Pt.1',
    url: `${BASE_URL}MuzioClementi_SonatinaOpus36No1_Part1.xml`,
    difficulty: 'beginner',
  },
  {
    id: 'beginner2',
    name: 'Bach - Prelude in C Major',
    url: `${BASE_URL}JohannSebastianBach_PraeludiumInCDur_BWV846_1.xml`,
    difficulty: 'beginner',
  },
  {
    id: 'intermediate1',
    name: 'Bach - Air',
    url: `${BASE_URL}JohannSebastianBach_Air.xml`,
    difficulty: 'intermediate',
  },
  {
    id: 'intermediate2',
    name: 'Mozart - An Chloe',
    url: `${BASE_URL}Mozart_AnChloe.xml`,
    difficulty: 'intermediate',
  },
  {
    id: 'advanced1',
    name: 'Joplin - The Entertainer',
    url: `${BASE_URL}ScottJoplin_The_Entertainer.xml`,
    difficulty: 'advanced',
  },
  // New samples
  {
    id: 'beethoven1',
    name: 'Beethoven - An die ferne Geliebte',
    url: `${BASE_URL}Beethoven_AnDieFerneGeliebte.xml`,
    difficulty: 'intermediate',
  },
  {
    id: 'clementi2',
    name: 'Clementi - Sonatina Op.36 No.1 Pt.2',
    url: `${BASE_URL}MuzioClementi_SonatinaOpus36No1_Part2.xml`,
    difficulty: 'beginner',
  },
  {
    id: 'clementi3',
    name: 'Clementi - Sonatina Op.36 No.3 Pt.1',
    url: `${BASE_URL}MuzioClementi_SonatinaOpus36No3_Part1.xml`,
    difficulty: 'intermediate',
  },
  {
    id: 'clementi4',
    name: 'Clementi - Sonatina Op.36 No.3 Pt.2',
    url: `${BASE_URL}MuzioClementi_SonatinaOpus36No3_Part2.xml`,
    difficulty: 'intermediate',
  },
  {
    id: 'gounod1',
    name: 'Gounod - Méditation',
    url: `${BASE_URL}CharlesGounod_Meditation.xml`,
    difficulty: 'intermediate',
  },
  {
    id: 'haydn1',
    name: 'Haydn - Concertante Cello',
    url: `${BASE_URL}JosephHaydn_ConcertanteCello.xml`,
    difficulty: 'advanced',
  },
  {
    id: 'joplin2',
    name: 'Joplin - Elite Syncopations',
    url: `${BASE_URL}ScottJoplin_EliteSyncopations.xml`,
    difficulty: 'advanced',
  },
  {
    id: 'mozart2',
    name: 'Mozart - Das Veilchen',
    url: `${BASE_URL}Mozart_DasVeilchen.xml`,
    difficulty: 'intermediate',
  },
  {
    id: 'mozart3',
    name: 'Mozart - Clarinet Quintet (Excerpt)',
    url: `${BASE_URL}Mozart_Clarinet_Quintet_Excerpt.mxl`,
    difficulty: 'advanced',
  },
  {
    id: 'mozart4',
    name: 'Mozart - String Quartet in G, K. 387',
    url: `${BASE_URL}Mozart_String_Quartet_in_G_K._387_1st_Mvmnt_excerpt.musicxml`,
    difficulty: 'advanced',
  },
  {
    id: 'national_anthem',
    name: 'Mozart/Holzer - Land der Berge (Austrian Anthem)',
    url: `${BASE_URL}Land_der_Berge.musicxml`,
    difficulty: 'intermediate',
  },
  {
    id: 'schubert1',
    name: 'Schubert - An Die Musik',
    url: `${BASE_URL}Schubert_An_die_Musik.xml`,
    difficulty: 'intermediate',
  },
  {
    id: 'debussy1',
    name: 'Debussy - Mandoline',
    url: `${BASE_URL}Debussy_Mandoline.xml`,
    difficulty: 'advanced',
  },
  {
    id: 'schumann1',
    name: 'Schumann - Dichterliebe',
    url: `${BASE_URL}Dichterliebe01.xml`,
    difficulty: 'advanced',
  },
  {
    id: 'telemann1',
    name: 'Telemann - Sonate-Nr.1.1-Dolce',
    url: `${BASE_URL}TelemannWV40.102_Sonate-Nr.1.1-Dolce.xml`,
    difficulty: 'intermediate',
  },
  {
    id: 'telemann2',
    name: 'Telemann - Sonate-Nr.1.2-Allegro',
    url: `${BASE_URL}TelemannWV40.102_Sonate-Nr.1.2-Allegro-F-Dur.xml`,
    difficulty: 'intermediate',
  },
  {
    id: 'saltarello',
    name: 'Anonymous - Saltarello',
    url: `${BASE_URL}Saltarello.mxl`,
    difficulty: 'intermediate',
  },
  {
    id: 'parlezmoi',
    name: 'Levasseur - Parlez Mois',
    url: `${BASE_URL}Parlez-moi.mxl`,
    difficulty: 'intermediate',
  },
]

// Helper function to get score by ID
export const getScoreById = id => {
  return SAMPLE_SCORES.find(score => score.id === id)
}

// Helper function to get score by URL
export const getScoreByUrl = url => {
  return SAMPLE_SCORES.find(score => score.url === url)
}

// Helper function to get scores by difficulty
export const getScoresByDifficulty = difficulty => {
  return SAMPLE_SCORES.filter(score => score.difficulty === difficulty)
}
