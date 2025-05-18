# Tetris Game with Next.js

A modern implementation of the classic Tetris game built with Next.js, TypeScript, and React. This project showcases a clean, responsive UI with smooth animations and game mechanics.

![Tetris Gameplay](https://via.placeholder.com/800x500.png?text=Tetris+Gameplay+Screenshot)

## 🎮 Features

- Classic Tetris gameplay mechanics
- Responsive design that works on desktop
- Score tracking with local high score persistence
- Next piece preview
- Pause/resume functionality
- Game over detection
- Smooth animations and transitions
- Keyboard controls for desktop play

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Fonts**: Geist (by Vercel)
- **Build Tool**: Vite (via Next.js)

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0.0 or later
- npm or yarn package manager

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/tetris-next.git
   cd tetris-next
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) to play the game in your browser.

## 🎮 How to Play

### Controls

- **Left/Right Arrow**: Move piece horizontally
- **Up Arrow**: Rotate piece
- **Down Arrow**: Soft drop (move down faster)
- **Space**: Hard drop (instantly drop piece)
- **P**: Pause/Resume game
- **R**: Reset game (when game is over)

### Game Rules

- Clear lines by filling them completely with blocks
- Score points for each line cleared
- The game speeds up as you clear more lines
- Game ends when blocks stack to the top of the board

## 🏗️ Project Structure

```
src/
├── app/                  # Next.js App Router
│   ├── layout.tsx        # Root layout with providers
│   └── page.tsx          # Main game page
├── components/
│   ├── tetris/           # Tetris game components
│   │   ├── components/   # Reusable game UI components
│   │   ├── hooks/        # Custom React hooks
│   │   └── TetrisGame.tsx # Main game component
│   ├── TetrisContext.tsx # Game state management
│   └── ScoreDisplay.tsx  # Score display component
└── styles/               # Global styles
```

## 📦 Dependencies

- `next`: 14.x
- `react`: ^18.2.0
- `react-dom`: ^18.2.0
- `typescript`: ^5.0.0
- `tailwindcss`: ^3.0.0
- `geist`: ^1.1.0

## 🚀 Deployment

This project can be easily deployed to Vercel, Netlify, or any other platform that supports Next.js applications.

### Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyour-username%2Ftetris-next)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ using Next.js
