import { useState } from 'react'
import Card from './components/Card'
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/react"

import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Card/>
    </>
  )
}

export default App
