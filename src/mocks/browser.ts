import { setupWorker } from 'msw/browser'
import { g2pHandlers } from './handlers/g2p.handlers'

export const worker = setupWorker(...g2pHandlers)
