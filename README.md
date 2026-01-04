# Push Ninja

<div align="center">

**A blockchain-powered token slicing game built on Push Chain**

[![Push Chain](https://img.shields.io/badge/Push%20Chain-Devnet-blue)](https://push.org/)
[![React](https://img.shields.io/badge/React-18.2.0-blue)](https://reactjs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![Live Demo](https://img.shields.io/badge/Demo-Live-green)](https://your-vercel-url.vercel.app)

[Live Demo](https://your-vercel-url.vercel.app) • [Documentation](./SETUP.md) • [Report Bug](https://github.com/Kushcse09/PUSH-NINJA-V2/issues)

</div>

---

## 🎮 About The Project

Push Ninja is an interactive blockchain gaming experience that combines fast-paced token slicing gameplay with Web3 technology. Slash flying tokens, avoid bombs, and immortalize your achievements as NFTs on the Push Chain blockchain!

### ✨ Key Features

- 🎯 **Intuitive Slash Mechanics** - Slice tokens with mouse/touch gestures
- 💣 **Strategic Gameplay** - Avoid bombs and maximize combos
- 🎨 **NFT Minting** - Mint your high scores as on-chain NFTs
- 👛 **Wallet Integration** - Connect with Push Wallet
- 🎮 **Multiplayer Mode** - Compete against other players in real-time
- 💰 **Staking System** - Stake PUSH tokens in multiplayer matches
- 🏆 **Achievement System** - Track stats, combos, and personal bests
- 📊 **Real-time Scoring** - Dynamic point system with combo multipliers
- 📱 **Responsive Design** - Play on desktop or mobile

---

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- Push Wallet
- Supabase account

### Installation

```bash
# Clone the repository
git clone https://github.com/Kushcse09/PUSH-NINJA-V2.git
cd PUSH-NINJA-V2

# Install dependencies
npm install
cd backend && npm install && cd ..

# Configure environment (see SETUP.md)
cp .env.local.example .env.local
cp backend/.env.example backend/.env

# Setup Supabase database (run supabase/schema.sql)

# Start development servers
npm run dev          # Frontend (port 3000)
cd backend && npm run dev  # Backend (port 3001)
```

Open http://localhost:3000

📖 **Full setup guide:** [SETUP.md](./SETUP.md)

---

## 🎯 Game Modes

### Single Player
- Slice tokens, avoid bombs
- Build combos for higher scores
- Mint your achievements as NFTs

### Multiplayer
- **Public Rooms** - Join random opponents
- **Private Rooms** - Create rooms with 6-character codes
- **Staking Tiers** - 0.001, 0.005, 0.01, 0.05 PUSH tokens
- **Prize Distribution** - Winner gets 98%, 2% platform fee

---

## 🛠️ Tech Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | Next.js 14, React 18, TypeScript |
| **Backend** | Node.js, Express, Socket.IO |
| **Blockchain** | Push Chain Devnet, Solidity, Hardhat, ethers.js |
| **Database** | Supabase (PostgreSQL) |
| **Deployment** | Vercel (Frontend), Railway/Render (Backend) |

---

## 📦 Smart Contracts

Deployed on Push Chain Devnet:

- **NFT Contract:** `0x7Da1841d68509BCd92A9bd98cc71E2F228cDc573`
- **Network:** Push Chain Devnet (Chain ID: 42101)
- **RPC:** https://evm.donut.rpc.push.org/
- **Explorer:** https://donut.push.network

---

## 🎮 How to Play

1. **Connect Wallet** - Click "Connect Wallet" and approve connection
2. **Choose Mode** - Single Player or Multiplayer
3. **Start Game** - Slash tokens, avoid bombs!
4. **Build Combos** - Slice multiple tokens rapidly for higher scores
5. **Mint NFT** - After game ends, mint your achievement as an NFT

---

## 📚 Documentation

- [Setup Guide](./SETUP.md) - Complete installation and configuration
- [Vercel Deployment](./VERCEL-DEPLOYMENT.md) - Deploy to production
- [Code Review](./CODE-REVIEW.md) - Technical review and recommendations

---

## 🚢 Deployment

### Frontend (Vercel)
1. Push to GitHub
2. Import project in Vercel
3. Add environment variables (see [VERCEL-DEPLOYMENT.md](./VERCEL-DEPLOYMENT.md))
4. Deploy

### Backend (Railway/Render)
1. Deploy backend separately
2. Update `NEXT_PUBLIC_API_BASE_URL` in Vercel
3. Configure CORS for your domain

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📝 License

MIT License - see LICENSE file for details

---

## 🔗 Links

- **Live Demo:** [your-vercel-url.vercel.app](https://your-vercel-url.vercel.app)
- **Push Chain:** [push.org](https://push.org/)
- **Documentation:** [SETUP.md](./SETUP.md)

---

<div align="center">

**Built with ❤️ on Push Chain**

[⭐ Star this repo](https://github.com/Kushcse09/PUSH-NINJA-V2) • [🐛 Report Bug](https://github.com/Kushcse09/PUSH-NINJA-V2/issues) • [💡 Request Feature](https://github.com/Kushcse09/PUSH-NINJA-V2/issues)

</div>
