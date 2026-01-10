import styled from 'styled-components'

export const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing(4)};
  min-height: calc(100vh - 100px); /* Vähennetään headerin korkeus */
`

export const ContentArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start; /* Kortit ylhäällä, ei keskellä ruutua pystysuunnassa */
  width: 100%;
  max-width: 800px; /* Rajoitetaan leveyttä ettei kortti veny liikaa */
  gap: ${({ theme }) => theme.spacing(6)};
  margin-top: ${({ theme }) => theme.spacing(4)};

  .no-cards {
    font-size: 1.5rem;
    color: ${({ theme }) => theme.colors.text.secondary};
    margin-top: ${({ theme }) => theme.spacing(8)};
    text-align: center;
  }
`
