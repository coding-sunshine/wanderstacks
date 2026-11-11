// Shared by ingest.ts and check.ts.
export const ROOT = new URL("../../", import.meta.url).pathname;
export const UA = { "User-Agent": "Mozilla/5.0 (compatible; library-panorama-fetcher/1.0)" };
export const API = "https://commons.wikimedia.org/w/api.php";
export const FREE = /^(CC0|CC BY(-SA)? \d|Public domain|PD\b)/i;
export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
export type Link = { to: string; yaw: number };
export type Node = { id: string; f: string; w: number; h: number; kind: "interior" | "exterior"; real: true; cap: string; by: string; lic: string; src: string; yaw0?: number; links?: Link[] };
export const isEqui = (w: number, h: number) => Math.abs(w / h / 2 - 1) <= 0.02;
