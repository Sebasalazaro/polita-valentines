# Valentine Terminal (Spec)

Build a single-page React app that looks like a retro Linux terminal.

## Core UX
- The terminal prints messages with a typewriter animation (character-by-character).
- The user sees two buttons: **Yes** and **No**.
- **Yes** starts disabled (permission denied vibe).
- Clicking **No**:
  - increments an attempt counter
  - prints a short terminal reaction each time
- After **10 No attempts** (configurable):
  - print a funny sequence like:
    - "Oh shoot, lemme try something. I'm new to this Linux console"
    - "chmod 400: love_letter.txt"
    - "sudo --askpass 'will you be my valentine?'"
  - then enable **Yes**
- Clicking **Yes**:
  - prints a celebratory sequence
  - ends with a sweet message

## Tech constraints
- React + hooks
- Keep it simple: single component is fine, but structure as a state machine (steps)
- Auto-scroll terminal to the latest line
- Style: monospace, dark terminal, blinking cursor
