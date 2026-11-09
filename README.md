# GREEDY_PIG-Group_5
# Greedy Pig Reimagined 🐷🎲

**CSC 419: Advances in Web, Mobile and Blockchain Development**
Pan-Atlantic University, School of Science and Technology
Academic Session 2026/2027 (First Semester) | Group Project

🔗 **Live demo:** [https://YOUR-APP-URL](https://YOUR-APP-URL)
🔗 **API:** [https://YOUR-API-URL](https://YOUR-API-URL)

## Team

| Name | Matric No. | Responsibility |
|------|------------|----------------|
| Basil Daudu | [Matric No.] | Backend core, Steal on a 6 |
| Ayanfeoluwa Runsewe| [Matric No.] | Live tutorial, UX and responsiveness |
| Ijeamaka Okeke | 23120112038 | Reactions (taunts and cheers), deployment |

## About

An upgraded version of the push-your-luck dice game [Greedy Pig](https://greedy-pig.vercel.app/), now backed by a real database and API. All dice rolls and scoring run on the server, so players cannot cheat.

## Our Three Improvements

| # | Improvement | Category | What it does |
|---|-------------|----------|--------------|
| 1 | **Steal on a 6** | Gameplay and rules | Rolling a 6 lets you reset another player's score to 0. |
| 2 | **Live tutorial** | Accessibility and experience | An interactive walkthrough that teaches new players the rules before they play. Skippable and replayable. |
| 3 | **Taunts and cheers** | Multiplayer and social | Server events trigger playful pop-ups and animations: banter for the victim of a steal, hype for the leader or winner. |

## Tech Stack

- **Frontend:** [e.g. React / JavaScript], hosted on Vercel
- **Backend:** [e.g. Node.js + Express], hosted on Render
- **Database:** [e.g. PostgreSQL on Neon]

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/games` | Create a new game with players |
| GET | `/api/games/:id` | Get current game state |
| POST | `/api/games/:id/roll` | Roll the dice (server-side) |
| POST | `/api/games/:id/hold` | Bank the turn score |
| POST | `/api/games/:id/steal` | Use a 6 to reset a target's score |
| GET | `/api/messages?trigger=` | Get a random taunt or cheer |
| GET/POST | `/api/players/:id/tutorial` | Read or save tutorial completion |

## Running Locally

**Prerequisites:** Node.js 18+, a PostgreSQL database

```bash
# 1. Clone the repo
git clone https://github.com/YOUR-USERNAME/YOUR-REPO.git
cd YOUR-REPO

# 2. Backend
cd backend
cp .env.example .env     # then fill in the values
npm install
npm run migrate          # create tables and seed messages
npm run dev

# 3. Frontend (new terminal)
cd frontend
cp .env.example .env
npm install
npm run dev
```

**Environment variables**

| Variable | Used in | Description |
|----------|---------|-------------|
| `DATABASE_URL` | backend | Postgres connection string |
| `PORT` | backend | Server port (default 5000) |
| `CORS_ORIGIN` | backend | Frontend URL allowed to call the API |
| `VITE_API_URL` | frontend | Backend base URL |

## How to Play

1. Choose your players.
2. On your turn, **Roll** to add to your turn total.
3. Rolling a **1** wipes your turn total and ends your turn.
4. **Hold** to bank your points.
5. Roll a **6** and you can **Steal**, sending another player's score back to 0.
6. First to reach the target score wins.

## Project Structure

```
├── frontend/    # UI, tutorial, reaction components
├── backend/     # API, game logic, validation
└── README.md
```

## Acknowledgements

Based on the original [Greedy Pig](https://github.com/Hemephelus/greed_pig) by Hemephelus.
