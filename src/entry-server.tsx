import { StrictMode } from 'react'
import { text } from 'node:stream/consumers'
import { prerenderToNodeStream } from 'react-dom/static'
import App from './App'
export { buildHead } from './lib/head'

// prerender (unlike renderToString) waits for React.lazy and Suspense content.
// Node's react-dom/static only ships the Node-stream variant.
export async function render(): Promise<string> {
  const { prelude } = await prerenderToNodeStream(
    <StrictMode>
      <App />
    </StrictMode>,
  )
  return text(prelude)
}
