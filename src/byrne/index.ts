import './byrne.css'
import { mountLiving } from '../living'
import type { Mount } from '../types'

// A(150,300) B(350,300); the circles meet at C(250, 300 - 100*sqrt(3))
const figure = `
  <line data-step class="blue" x1="150" y1="300" x2="350" y2="300"/>
  <circle data-step class="black" cx="150" cy="300" r="200"/>
  <circle data-step class="black" cx="350" cy="300" r="200"/>
  <line data-step class="red" x1="150" y1="300" x2="250" y2="126.8"/>
  <line data-step class="yellow" x1="350" y1="300" x2="250" y2="126.8"/>`

export const mount: Mount = (el) =>
  mountLiving(el, {
    id: 'byrne-i-1',
    title: "Byrne's Euclid, Book I",
    statement: 'To describe an equilateral triangle upon a given finite straight line.',
    cite: 'Euclid, Elements I.1, in Oliver Byrne, The First Six Books of the Elements of Euclid, London: William Pickering, 1847 (public domain).',
    question: 'The blue line is given. Two circles are drawn, each centred on one end and reaching the other. Join the blue line to where the circles cross. What triangle do you get?',
    options: ['Equilateral', 'Isosceles', 'Scalene', 'Right-angled'],
    answer: 0,
    figure,
    viewBox: '-70 80 640 440',
    figureLabel: 'A blue line, two black circles, and a red and a yellow line meeting above it',
  }, 'byrne')
