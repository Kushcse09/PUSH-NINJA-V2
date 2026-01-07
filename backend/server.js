import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { rateLimit } from 'express-rate-limit';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import gamesRouter from './routes/games.js';
import playersRouter from './routes/players.js';
import { supabase, supabaseAdmin } from './config/supabase.js';
import escrowService from './services/escrowService.js';
import { validateGameInput, validateScoreSubmission, sanitizeRoomCode, isValidLives } from './utils/validation.js';
import { validateSocketEvent, createSocketRateLimiter } from './middleware/socketValidation.js';


dotenv.config();

const app = express();

// Parse multiple origins from environment variable
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000')
  .split(',')
  .map(s => s.trim());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Apply rate limiting to Socket.IO connections
io.use(createSocketRateLimiter(10, 1000)); // 10 events per second per client

const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// REST API rate limiting - prevent DoS attacks
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per 15 minutes
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Make io accessible globally for routes
global.io = io;

// Routes with rate limiting
app.use('/api/games', apiLimiter, gamesRouter);
app.use('/api/players', apiLimiter, playersRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'Push Ninja Backend',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      games: '/api/games',
      players: '/api/players',
      health: '/health'
    }
  });
});

// Socket.IO for real-time updates
// Track active players in games for disconnect handling
const activeGamePlayers = new Map(); // gameId -> { player1SocketId, player2SocketId }
const disconnectTimers = new Map(); // socketId -> { gameId, timer, playerAddress }
const roomCodeMap = new Map(); // roomCode -> { gameId, createdAt, creatorAddress }
const playerReadyMap = new Map(); // gameId -> Set of ready player addresses (for staking confirmation)
const DISCONNECT_GRACE_PERIOD_MS = 5000; // 5 seconds
const ROOM_CODE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes (reduced from 30 to prevent memory buildup)

// Store interval references for cleanup on shutdown
let roomCodeCleanupInterval = null;
let staleGameCleanupInterval = null;

// Clean up expired room codes periodically
roomCodeCleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [code, data] of roomCodeMap.entries()) {
    if (now - data.createdAt > ROOM_CODE_EXPIRY_MS) {
      roomCodeMap.delete(code);
      console.log(`🗑️ Expired room code: ${code}`);
    }
  }
}, 60000); // Check every minute

// Clean up stale games (waiting for > 100 seconds without anyone joining)
const STALE_GAME_TIMEOUT_MS = 100 * 1000; // 100 seconds
staleGameCleanupInterval = setInterval(async () => {
  try {
    const cutoffTime = new Date(Date.now() - STALE_GAME_TIMEOUT_MS).toISOString();

    // Cancel all games in WAITING state that are older than the cutoff
    const { data: staleGames, error: findError } = await supabaseAdmin
      .from('games')
      .select('game_id, created_at')
      .eq('state', 0) // WAITING state
      .lt('created_at', cutoffTime);

    if (findError) {
      console.error('Error finding stale games:', findError);
      return;
    }

    if (staleGames && staleGames.length > 0) {
      const gameIds = staleGames.map(g => g.game_id);

      const { error: updateError } = await supabaseAdmin
        .from('games')
        .update({
          state: 3, // CANCELLED
          finished_at: new Date().toISOString()
        })
        .in('game_id', gameIds);

      if (updateError) {
        console.error('Error cancelling stale games:', updateError);
      } else {
        console.log(`🧹 Auto-cancelled ${staleGames.length} stale games: ${gameIds.join(', ')}`);

        // Notify all clients to refresh their game list
        io.emit('games_updated', []);
      }
    }
  } catch (error) {
    console.error('Error in stale game cleanup:', error);
  }
}, 30000); // Check every 30 seconds

// Clean up stuck games on server startup
(async () => {
  try {
    console.log('🧹 Checking for stuck games on startup...');

    // Cancel all games in IN_PROGRESS state (state = 1)
    const { data: stuckGames, error: findError } = await supabaseAdmin
      .from('games')
      .select('game_id, state')
      .eq('state', 1); // IN_PROGRESS state

    if (findError) {
      console.error('Error finding stuck games:', findError);
    } else if (stuckGames && stuckGames.length > 0) {
      const gameIds = stuckGames.map(g => g.game_id);

      const { error: updateError } = await supabaseAdmin
        .from('games')
        .update({
          state: 3, // CANCELLED
          finished_at: new Date().toISOString()
        })
        .in('game_id', gameIds);

      if (updateError) {
        console.error('Error cancelling stuck games:', updateError);
      } else {
        console.log(`🧹 Cancelled ${stuckGames.length} stuck games: ${gameIds.join(', ')}`);
      }
    } else {
      console.log('✅ No stuck games found');
    }
  } catch (error) {
    console.error('Error in startup cleanup:', error);
  }
})();

io.on('connection', (socket) => {
  console.log('👤 Client connected:', socket.id);

  socket.on('subscribe:games', (betTier) => {
    const room = betTier ? `games:${betTier}` : 'games:all';
    socket.join(room);
    console.log(`📺 Client ${socket.id} subscribed to ${room}`);
  });

  socket.on('subscribe:player', (address) => {
    socket.join(`player:${address}`);
    console.log(`📺 Client ${socket.id} subscribed to player ${address}`);
  });

  // Subscribe to specific game for real-time updates
  socket.on('join:game', ({ gameId, playerAddress }) => {
    socket.join(`game:${gameId}`);
    socket.gameId = gameId;
    socket.playerAddress = playerAddress;

    // Track this player in the game
    if (!activeGamePlayers.has(gameId)) {
      activeGamePlayers.set(gameId, {});
    }
    const gamePlayers = activeGamePlayers.get(gameId);
    gamePlayers[playerAddress.toLowerCase()] = socket.id;

    console.log(`🎮 Player ${playerAddress.slice(0, 8)}... joined game ${gameId}`);

    // Notify opponent that player joined/reconnected
    socket.to(`game:${gameId}`).emit('opponent:connected', { playerAddress });

    // Clear any existing disconnect timer for this player
    const timerKey = `${gameId}:${playerAddress.toLowerCase()}`;
    if (disconnectTimers.has(timerKey)) {
      clearTimeout(disconnectTimers.get(timerKey).timer);
      disconnectTimers.delete(timerKey);
      console.log(`⏱️ Cleared disconnect timer for ${playerAddress.slice(0, 8)}... - reconnected!`);
      socket.to(`game:${gameId}`).emit('opponent:reconnected', { playerAddress });
    }
  });

  // Handle player ready event (after staking is confirmed)
  socket.on('game:playerReady', validateSocketEvent(
    validateGameInput,
    async ({ gameId, playerAddress }) => {
      // gameId and playerAddress are now validated and normalized
      const gameIdStr = gameId.toString();
      console.log(`✅ Player ${playerAddress.slice(0, 8)}... is ready in game ${gameIdStr}`);

      // Track this player as ready
      if (!playerReadyMap.has(gameIdStr)) {
        playerReadyMap.set(gameIdStr, new Set());
      }
      const readyPlayers = playerReadyMap.get(gameIdStr);
      readyPlayers.add(playerAddress); // Already lowercase from validation

      console.log(`📋 Ready players for game ${gameIdStr}:`, Array.from(readyPlayers));

      // Check if both players are now ready
      try {
        const { data: game, error } = await supabaseAdmin
          .from('games')
          .select('player1_address, player2_address, state')
          .eq('game_id', gameId)
          .single();

        if (error) {
          console.error(`❌ Failed to fetch game ${gameIdStr}:`, error);
          return;
        }

        console.log(`📊 Game ${gameIdStr} state: ${game?.state}, P1: ${game?.player1_address?.slice(0, 8)}, P2: ${game?.player2_address?.slice(0, 8) || 'none'}`);

        if (game && game.state === 1 && game.player1_address && game.player2_address) {
          const player1Ready = readyPlayers.has(game.player1_address.toLowerCase());
          const player2Ready = readyPlayers.has(game.player2_address.toLowerCase());

          console.log(`🎮 Game ${gameIdStr} readiness: P1=${player1Ready}, P2=${player2Ready}`);

          if (player1Ready && player2Ready) {
            console.log(`⏰ Both players ready! Starting countdown for game ${gameIdStr}`);

            // Clean up room code for this game (prevent memory leak)
            for (const [code, data] of roomCodeMap.entries()) {
              if (data.gameId.toString() === gameIdStr) {
                roomCodeMap.delete(code);
                console.log(`🗑️ Deleted room code ${code} (game starting)`);
                break;
              }
            }

            io.to(`game:${gameIdStr}`).emit('countdown:start', { gameId: gameIdStr, startTime: Date.now() + 500 });

            // Clean up the ready map for this game
            playerReadyMap.delete(gameIdStr);
          }
        } else if (game && game.state === 0) {
          console.log(`⏳ Game ${gameIdStr} still waiting for second player to join (state=0)`);
        }
      } catch (error) {
        console.error('Error checking player readiness:', error);
      }
    }
  ));


  // Handle start countdown sync (fallback for legacy behavior)
  socket.on('game:startCountdown', ({ gameId }) => {
    console.log(`⏰ Starting countdown for game ${gameId} (legacy trigger)`);
    io.to(`game:${gameId}`).emit('countdown:start', { gameId, startTime: Date.now() + 500 });
  });

  // Handle score updates
  socket.on('game:scoreUpdate', ({ gameId, playerAddress, score }) => {
    socket.to(`game:${gameId}`).emit('opponent:scoreUpdate', { playerAddress, score });
  });

  // Handle lives updates - broadcast when player loses a life
  socket.on('game:livesUpdate', ({ gameId, playerAddress, lives }) => {
    console.log(`❤️ Lives update: ${playerAddress.slice(0, 8)}... has ${lives} lives in game ${gameId}`);
    socket.to(`game:${gameId}`).emit('opponent:livesUpdate', { playerAddress, lives });
  });

  // Handle player elimination (lost all 3 lives) - ends game immediately for both players
  socket.on('game:playerEliminated', validateSocketEvent(
    validateScoreSubmission,
    async ({ gameId, playerAddress, score: finalScore }) => {
      console.log(`💀 Player ${playerAddress.slice(0, 8)}... eliminated in game ${gameId} with score ${finalScore}`);

      // Broadcast to all players in the game that someone was eliminated
      io.to(`game:${gameId}`).emit('game:playerEliminated', {
        eliminatedPlayer: playerAddress,
        finalScore
      });

      // Update game state in database with scores - USE RACE CONDITION PROTECTION
      try {
        // First, fetch current game state
        const { data: game, error: fetchError } = await supabase
          .from('games')
          .select('*')
          .eq('game_id', gameId)
          .eq('state', 1) // Only get if still IN_PROGRESS
          .single();

        if (fetchError || !game) {
          console.log(`⚠️ Game ${gameId} not found or already finished - skipping elimination`);
          return;
        }

        const isPlayer1Eliminated = game.player1_address.toLowerCase() === playerAddress;
        const winnerAddress = isPlayer1Eliminated ? game.player2_address : game.player1_address;

        // Build update object with the eliminated player's score
        const updateData = {
          state: 2, // FINISHED
          winner_address: winnerAddress,
          win_type: 'elimination',
          finished_at: new Date().toISOString(),
        };

        // Record the eliminated player's score
        if (isPlayer1Eliminated) {
          updateData.player1_score = finalScore;
          updateData.player1_finished = true;
        } else {
          updateData.player2_score = finalScore;
          updateData.player2_finished = true;
        }

        // Update with state check to prevent race condition
        const { data: updated, error: updateError } = await supabase
          .from('games')
          .update(updateData)
          .eq('game_id', gameId)
          .eq('state', 1) // Only update if still IN_PROGRESS
          .select()
          .single();

        if (updateError || !updated) {
          console.log(`⚠️ Game ${gameId} was already finished by another process - skipping`);
          return;
        }

        console.log(`🏆 Game ${gameId} finished - Winner: ${winnerAddress.slice(0, 8)}... (opponent eliminated with score ${finalScore})`);

        // Calculate scores and distribute prize
        const loserScore = finalScore;
        const player1Score = isPlayer1Eliminated ? loserScore : 0;
        const player2Score = isPlayer1Eliminated ? 0 : loserScore;

        const prizeResult = await escrowService.finishGame(
          gameId,
          winnerAddress,
          player1Score,
          player2Score,
          'elimination'
        );

        if (prizeResult.success) {
          console.log(`💰 Prize distributed on-chain: ${prizeResult.txHash}`);

          // Save payout tx hash to database
          await supabase.from('games').update({ finish_tx_hash: prizeResult.txHash }).eq('game_id', gameId);

          // Broadcast transaction hash to both players
          io.to(`game:${gameId}`).emit('game:prizeDistributed', {
            txHash: prizeResult.txHash,
            winner: winnerAddress
          });
        } else {
          console.error(`❌ Prize distribution failed: ${prizeResult.error}`);
        }

        // Request the winner to submit their final score for stats tracking
        io.to(`game:${gameId}`).emit('game:requestFinalScore', {
          gameId,
          winnerAddress
        });
      } catch (error) {
        console.error('Failed to update game after elimination:', error);
      }
    }
  ));

  // Handle winner's final score submission after elimination
  socket.on('game:submitWinnerScore', async ({ gameId, playerAddress, finalScore }) => {
    console.log(`🏆 Winner ${playerAddress.slice(0, 8)}... submitting final score ${finalScore} for game ${gameId}`);

    try {
      const { data: game } = await supabase
        .from('games')
        .select('*')
        .eq('game_id', gameId)
        .single();

      if (game) {
        const isPlayer1 = game.player1_address.toLowerCase() === playerAddress.toLowerCase();

        // Update the winner's score
        const updateData = {};
        if (isPlayer1) {
          updateData.player1_score = finalScore;
          updateData.player1_finished = true;
        } else {
          updateData.player2_score = finalScore;
          updateData.player2_finished = true;
        }

        await supabase
          .from('games')
          .update(updateData)
          .eq('game_id', gameId);

        console.log(`💰 Recorded winner's score: ${finalScore} for game ${gameId}`);
      }
    } catch (error) {
      console.error('Failed to record winner score:', error);
    }
  });

  // Register a room code for private games (so other browsers can look it up)
  socket.on('roomCode:register', ({ roomCode, gameId, creatorAddress }) => {
    const normalizedCode = roomCode.toUpperCase();
    roomCodeMap.set(normalizedCode, {
      gameId,
      createdAt: Date.now(),
      creatorAddress: creatorAddress.toLowerCase()
    });
    console.log(`🔑 Registered room code: ${normalizedCode} -> game ${gameId}`);

    // Broadcast to all clients that a new room code is available
    io.emit('roomCode:registered', { roomCode: normalizedCode, gameId });
  });

  // Look up a room code to get the game ID
  socket.on('roomCode:lookup', ({ roomCode }, callback) => {
    const normalizedCode = roomCode.toUpperCase();
    const data = roomCodeMap.get(normalizedCode);

    if (data) {
      console.log(`🔍 Room code lookup: ${normalizedCode} -> game ${data.gameId}`);
      callback({ success: true, gameId: data.gameId });
    } else {
      console.log(`❌ Room code not found: ${normalizedCode}`);
      callback({ success: false, error: 'Room code not found' });
    }
  });

  // Delete room code when game starts or is cancelled
  socket.on('roomCode:delete', ({ roomCode }) => {
    const normalizedCode = roomCode.toUpperCase();
    if (roomCodeMap.has(normalizedCode)) {
      roomCodeMap.delete(normalizedCode);
      console.log(`🗑️ Deleted room code: ${normalizedCode}`);
    }
  });

  // Handle game joined event - broadcast to all clients so creator gets notified
  socket.on('game:joined', (gameData) => {
    console.log(`🎮 Broadcasting game_joined event for game ${gameData.game_id}`);
    io.emit('game_joined', gameData);
  });

  socket.on('disconnect', () => {
    console.log('👋 Client disconnected:', socket.id);

    // Check if this socket was in an active game
    const gameId = socket.gameId;
    const playerAddress = socket.playerAddress;

    if (gameId && playerAddress) {
      console.log(`⚠️ Player ${playerAddress.slice(0, 8)}... disconnected from game ${gameId}`);

      // Start grace period timer
      const timerKey = `${gameId}:${playerAddress.toLowerCase()}`;
      const timer = setTimeout(async () => {
        console.log(`⏱️ Grace period expired for ${playerAddress.slice(0, 8)}... in game ${gameId}`);

        // Auto-forfeit the game
        try {
          const { supabase } = await import('./config/supabase.js');

          // Get game status
          const { data: game } = await supabase
            .from('games')
            .select('*')
            .eq('game_id', gameId)
            .single();

          if (game && game.state === 1) { // IN_PROGRESS
            const winnerAddress = game.player1_address.toLowerCase() === playerAddress.toLowerCase()
              ? game.player2_address
              : game.player1_address;

            // Update game to forfeited
            await supabase
              .from('games')
              .update({
                state: 4, // FORFEITED
                winner_address: winnerAddress,
                win_type: 'forfeit',
                finished_at: new Date().toISOString(),
              })
              .eq('game_id', gameId);

            // Notify remaining player
            io.to(`game:${gameId}`).emit('game:forfeited', {
              forfeitedBy: playerAddress,
              winner: winnerAddress,
              reason: 'disconnect_timeout'
            });

            console.log(`🏳️ Game ${gameId} forfeited due to disconnect. Winner: ${winnerAddress}`);

            // Distribute prize for forfeit (winner gets 98%, forfeit penalty applies if configured)
            const forfeitResult = await escrowService.forfeitGame(gameId, playerAddress);

            if (forfeitResult.success) {
              console.log(`💰 Forfeit prize distributed on-chain: ${forfeitResult.txHash}`);

              // Save payout tx hash to database
              await supabase.from('games').update({ finish_tx_hash: forfeitResult.txHash }).eq('game_id', gameId);

              // Notify remaining player of prize distribution
              io.to(`game:${gameId}`).emit('game:prizeDistributed', {
                txHash: forfeitResult.txHash,
                winner: winnerAddress
              });
            } else {
              console.error(`❌ Forfeit prize distribution failed: ${forfeitResult.error}`);
            }
          }
        } catch (error) {
          console.error('Failed to process forfeit:', error);
        }

        disconnectTimers.delete(timerKey);
      }, DISCONNECT_GRACE_PERIOD_MS);

      disconnectTimers.set(timerKey, { gameId, timer, playerAddress });

      // Notify opponent about disconnect  
      socket.to(`game:${gameId}`).emit('opponent:disconnected', {
        playerAddress,
        gracePeriodMs: DISCONNECT_GRACE_PERIOD_MS
      });
    }
  });
});

// Subscribe to Supabase real-time changes
const gamesChannel = supabase
  .channel('games-changes')
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'games' },
    (payload) => {
      console.log('📡 Game update:', payload.eventType, payload.new?.game_id);

      // Broadcast to all clients in the appropriate rooms
      io.to('games:all').emit('game:update', payload);

      if (payload.new?.bet_tier) {
        io.to(`games:${payload.new.bet_tier}`).emit('game:update', payload);
      }
    }
  )
  .subscribe();

const playersChannel = supabase
  .channel('players-changes')
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'players' },
    (payload) => {
      console.log('📡 Player update:', payload.new?.address);

      if (payload.new?.address) {
        io.to(`player:${payload.new.address}`).emit('player:update', payload);
      }
    }
  )
  .subscribe();

// Start server
httpServer.listen(PORT, () => {
  console.log('');
  console.log('🚀 Push Ninja Backend Server');
  console.log('================================');
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌐 API: http://localhost:${PORT}`);
  console.log(`🔌 WebSocket: http://localhost:${PORT}`);
  console.log(`🎯 Frontend: ${process.env.FRONTEND_URL}`);
  console.log(`🔗 Contract: ${process.env.ESCROW_CONTRACT_ADDRESS || 'None'}`);
  console.log(`💰 Escrow Service: ${escrowService.isReady() ? 'Ready ✅' : 'Disabled ❌'}`);
  console.log('================================');
  console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully...');

  // Clear background timers
  if (roomCodeCleanupInterval) {
    clearInterval(roomCodeCleanupInterval);
    console.log('🧹 Cleared room code cleanup interval');
  }
  if (staleGameCleanupInterval) {
    clearInterval(staleGameCleanupInterval);
    console.log('🧹 Cleared stale game cleanup interval');
  }

  // Close socket connections
  io.close(() => {
    console.log('🔌 Socket.IO closed');
  });

  httpServer.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
