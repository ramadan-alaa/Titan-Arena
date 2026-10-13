# Titan Arena 🏆

A modern, responsive Knockout Tournament Bracket web application built with **React**, **TypeScript**, and **Tailwind CSS**.

![Titan Arena](public/favicon.svg)

## Features

- **Smart Tournament Seeding & BYE Distribution**:
  - Automatically calculates bracket capacity ($2^k$) for any number of competitors (odd or even).
  - Distributes BYEs (auto-qualifications) fairly across high seeds so that no two BYEs ever collide in Round 1.
- **Interactive Bracket Management**:
  - Click to select match winners and advance players forward in real time.
  - Ability to switch or toggle winners with automatic cascading tree updates.
- **Flexible Competitor Input**:
  - Individual competitor input (name & Enter).
  - Bulk import via copy-paste (from WhatsApp, Excel, or notes).
  - Quick presets for odd and even counts (3, 4, 5, 6, 7, 8, 10, 12, 16 competitors).
  - Shuffle seeds / randomize bracket draw.
- **Mobile-First & Responsive Design**:
  - Built-in Mobile Round Navigation Tabs (`Round 1`, `Semifinals`, `Final`) for small screens.
  - Touch-friendly match cards and momentum scrolling.
- **Bilingual Interface**:
  - Full Arabic and English language support with instant toggle.
  - Enhanced Arabic typography using Cairo font.
- **Live Leaderboard**:
  - Real-time standings tracking wins, losses, byes, and points.
- **Champion Reveal**:
  - Celebratory champion presentation with total stats and tournament replay option.

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Bundler**: Vite
- **Styling**: Tailwind CSS + Shadcn design tokens + Lucide Icons
- **Animations**: GSAP

## Getting Started

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

## License

MIT
