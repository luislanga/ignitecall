import { globalCss } from '@ignite-ui/react'
import { serialize } from 'v8'

export const globalStyles = globalCss({
    '*': {
        boxSizing: 'border-box',
        padding: 0,
        margin: 0
    },

    body: {
        backgroundColor: '$gray900',
        color: '$gray100',
        '-webkit-font-smoothing': 'antialiased',
    },
})