<div align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
  <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
</div>

<br />

<div align="center">
  <h1 align="center">PathForge Academy</h1>
  <p align="center">
    <strong>An interactive computer science and algorithms learning platform.</strong>
    <br />
    Visualizing complex graph theory algorithms (A*, Dijkstra, BFS, DFS) through a hands-on sandbox.
    <br />
    <br />
    <a href="https://pathforge.app/">View Demo</a>
    ·
    <a href="https://github.com/MoaedMoussa/Path-Forge/issues">Report Bug</a>
    ·
    <a href="https://github.com/MoaedMoussa/Path-Forge/issues">Request Feature</a>
  </p>
</div>

<br />

## 📖 About The Project

I built **PathForge Academy** to bridge the gap between abstract computer science theories and concrete engineering skills. While studying data structures and algorithms, I realized that seeing the code execute visually in real-time was the fastest way to build strong mental models.

This platform provides an interactive curriculum where you can manipulate walls, adjust node weights, and watch algorithms traverse a grid—step by step.

### ✨ Key Features

- 🎓 **Interactive Courses**: Step-by-step learning modules covering Core Data Structures and Graph Theory.
- 🔬 **Pathfinding Lab**: A robust visual sandbox. Draw obstacles, configure terrain costs, and race algorithms against each other.
- 👥 **Study Groups**: Real-time collaborative coding and synchronized whiteboard sessions built on Firebase.
- 🌐 **Level Gallery**: Browse, play, and share custom pathfinding mazes built by the community.
- 📇 **Study Deck**: Flashcards utilizing spaced repetition to test your CS fundamentals.

---

## 💻 Tech Stack

- **Frontend**: [React 18](https://reactjs.org/) & [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **Backend/Realtime**: [Firebase Firestore & Auth](https://firebase.google.com/)
- **Routing**: [Wouter](https://github.com/molefrog/wouter) (for lightweight, hook-based routing)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)

---

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

You need Node.js and npm installed on your local machine.
* npm
  ```sh
  npm install npm@latest -g
  ```

### Installation

1. **Clone the repository**
   ```sh
   git clone https://github.com/MoaedMoussa/Path-Forge.git
   ```

2. **Navigate to the directory**
   ```sh
   cd Path-Forge
   ```

3. **Install NPM dependencies**
   ```sh
   npm install
   ```

4. **Environment Variables**
   Duplicate the `.env.example` file and rename it to `.env`. Fill in your Firebase configuration keys.
   ```sh
   cp .env.example .env
   ```

5. **Start the development server**
   ```sh
   npm run dev
   ```

---

## ☁️ Deployment

This project is highly optimized and ready for production deployment on modern hosting providers like Vercel, Netlify, or Firebase Hosting. 

Running the standard build command will output statically optimized files to the `dist/public` folder:

```sh
npm run build
```

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  <p>Built with ❤️ by <a href="https://github.com/MoaedMoussa">Moussa</a></p>
</div>
