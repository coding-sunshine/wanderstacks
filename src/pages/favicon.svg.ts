import { favicon } from '../brand/marks'

export const GET = () => new Response(favicon({ ink: '#ece5d3', accent: '#c9a961', tile: '#0f1613' }), { headers: { 'Content-Type': 'image/svg+xml' } })
