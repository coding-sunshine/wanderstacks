// Clipboard is optional: without it the text stays a selectable block inside its open details.
// One delegated listener, so copies of a caption (the lightbox clones them) work too.
if (navigator.clipboard) {
  document.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((b) => (b.hidden = false))
  document.addEventListener('click', (e) => {
    const b = (e.target as Element).closest<HTMLButtonElement>('[data-copy]')
    if (b) navigator.clipboard.writeText(b.previousElementSibling!.textContent!).then(() => {
      b.textContent = 'Copied'; setTimeout(() => (b.textContent = 'Copy'), 1500)
    }, () => {})
  })
}
