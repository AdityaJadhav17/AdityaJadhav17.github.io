import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import App from './App'
export { buildHead } from './lib/head'

export function render(): string {
  return renderToString(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
