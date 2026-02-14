# PolitaOS Terminal

<div align="center">

An interactive Valentine's Day experience disguised as a retro terminal interface. Features a progressive conversation system with typewriter animations, emotional cat images, and a unique unlock mechanism that playfully insists on getting the right answer.

<br/>

![Demo](./src/assets/gif/App-working.gif)

<br/>

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) ![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black) ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white) ![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

</div>

## Project Overview

A creative Valentine's Day web application that mimics a retro terminal interface. The app presents a playful conversation where the user is persistently asked a Valentine's question. Through an interactive unlock mechanism, the "Yes" button remains disabled until the user clicks "No" 10 times, triggering amusing terminal reactions and displaying emotional cat images along the way. Built with React and featuring smooth typewriter animations for an authentic terminal experience.

**Key Features:**
- Custom typewriter effect with character-by-character typing and natural pauses
- Progressive conversation system with 10 unique response messages
- Dynamic cat image system across 5 emotional categories (sad, fun, flower, happy, heart)
- Startup screen with terminal boot experience
- Fully responsive design optimized for mobile and desktop
- Permission-based unlock mechanism with terminal-style error messages

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
## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.