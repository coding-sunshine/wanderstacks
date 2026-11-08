export interface Weather {
  code: number
  temp: number
  cloud: number
  precip: number
  snow: number
  visibility: number
  wind: number
  tz: string
}

const TTL = 15 * 60_000
const FIELDS = 'temperature_2m,weather_code,cloud_cover,precipitation,snowfall,visibility,wind_speed_10m'

export function parse(j: any): Weather | null {
  const c = j?.current
  if (!c || typeof c.weather_code !== 'number' || typeof j.timezone !== 'string') return null
  return {
    code: c.weather_code,
    temp: c.temperature_2m,
    cloud: c.cloud_cover ?? 0,
    precip: c.precipitation ?? 0,
    snow: c.snowfall ?? 0,
    visibility: c.visibility ?? 50_000,
    wind: c.wind_speed_10m ?? 0,
    tz: j.timezone,
  }
}

// Open-Meteo, CC BY 4.0, no key. Null on any failure; the caller falls back to a clear sky.
export async function weatherAt(lat: number, lon: number): Promise<Weather | null> {
  const key = `wx:${lat.toFixed(2)},${lon.toFixed(2)}`
  try {
    const hit = JSON.parse(localStorage.getItem(key) ?? 'null')
    if (hit && Date.now() - hit.at < TTL) return hit.w
  } catch {}
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=${FIELDS}&timezone=auto`
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) })
    const w = res.ok ? parse(await res.json()) : null
    if (w) try { localStorage.setItem(key, JSON.stringify({ at: Date.now(), w })) } catch {}
    return w
  } catch {
    return null
  }
}

const WORDS: [number, string][] = [
  [0, 'clear'], [1, 'mainly clear'], [2, 'partly cloudy'], [3, 'overcast'], [48, 'fog'], [57, 'drizzle'],
  [67, 'rain'], [77, 'snow'], [82, 'rain showers'], [86, 'snow showers'], [99, 'thunderstorm'],
]

export const describe = (code: number) => WORDS.find(([max]) => code <= max)?.[1] ?? 'unknown'

export const localTime = (tz: string | null, lon: number, date = new Date()) => {
  if (tz) try { return new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit' }).format(date) } catch {}
  const solar = new Date(date.getTime() + (lon / 15) * 3_600_000)
  return `${String(solar.getUTCHours()).padStart(2, '0')}:${String(solar.getUTCMinutes()).padStart(2, '0')} solar`
}
