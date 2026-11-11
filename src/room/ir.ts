export type Ir = { f: string; by: string; lic: string; src: string; measured: true }

// An entry counts only if it names its file, author, licence and source: no anonymous recordings.
export function pickIr(table: Record<string, Partial<Ir>>, id: string): Ir | null {
  const e = table[id]
  return e?.measured === true && e.f && e.by && e.lic && e.src ? (e as Ir) : null
}
