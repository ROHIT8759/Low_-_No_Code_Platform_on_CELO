import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

if (typeof window !== 'undefined') {
    
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: jest.fn(),
            removeListener: jest.fn(),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            dispatchEvent: jest.fn(),
        })),
    })

    
    global.window.ethereum = {
        request: jest.fn(),
        on: jest.fn(),
        removeListener: jest.fn(),
    }

    
    Object.assign(navigator, {
        clipboard: {
            writeText: jest.fn(),
        },
    })
}
