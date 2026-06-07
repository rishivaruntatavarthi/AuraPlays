import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Users, MapPin, Clock, Calendar } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const PlayFeed = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const res = await api.get('/games');
      setGames(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const joinGame = async (gameId) => {
    try {
      await api.post(`/games/${gameId}/join`);
      alert("Successfully joined the game! You earned +20 Karma Points!");
      fetchGames();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to join game');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin w-12 h-12 border-4 border-accent border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 pb-20">
      <div className="mb-8">
        <h1 className="text-4xl font-black tracking-tight mb-2 flex items-center gap-3">
          <Trophy className="text-accent" size={36} /> Play
        </h1>
        <p className="text-muted-foreground text-lg">Find games nearby and join the community.</p>
      </div>

      {games.length > 0 ? (
        <div className="grid gap-6">
          {games.map((game, index) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              key={game.id} 
              className="bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col gap-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold">{game.title}</h2>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin size={14} /> {game.slot.court.name}, {game.slot.court.city}
                  </p>
                </div>
                <div className="bg-secondary text-secondary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {game.sportType}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm font-medium">
                <div className="flex items-center gap-2 bg-secondary/50 rounded-xl px-3 py-2 border border-border">
                  <Calendar size={16} className="text-accent" /> {game.slot.slotDate}
                </div>
                <div className="flex items-center gap-2 bg-secondary/50 rounded-xl px-3 py-2 border border-border">
                  <Clock size={16} className="text-accent" /> {game.slot.startTime.substring(0, 5)}
                </div>
                <div className="flex items-center gap-2 bg-secondary/50 rounded-xl px-3 py-2 border border-border">
                  <Users size={16} className="text-accent" /> {game.currentPlayers} / {game.maxPlayers} Players
                </div>
                <div className="flex items-center gap-2 bg-secondary/50 rounded-xl px-3 py-2 border border-border">
                  <Trophy size={16} className="text-accent" /> {game.skillLevelRequired || 'Any Skill'}
                </div>
              </div>

              <div className="mt-2 pt-4 border-t border-border flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center font-bold text-xs">
                    {game.host.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Hosted by</p>
                    <p className="text-sm font-semibold">{game.host.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-muted-foreground">Price per player</p>
                    <p className="font-bold text-green-500">₹{game.pricePerPlayer}</p>
                  </div>
                  
                  {game.host.id === user?.id ? (
                    <button disabled className="bg-secondary text-secondary-foreground px-6 py-2 rounded-xl font-bold opacity-70">
                      Hosting
                    </button>
                  ) : game.currentPlayers >= game.maxPlayers ? (
                    <button disabled className="bg-destructive/10 text-destructive px-6 py-2 rounded-xl font-bold">
                      Full
                    </button>
                  ) : (
                    <button 
                      onClick={() => joinGame(game.id)}
                      className="bg-accent text-accent-foreground px-6 py-2 rounded-xl font-bold shadow-lg hover:shadow-accent/30 hover:-translate-y-0.5 transition-all"
                    >
                      Join Game
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-3xl p-12 text-center shadow-sm">
          <Trophy size={64} className="mx-auto text-muted mb-4 opacity-50" />
          <p className="text-xl font-semibold text-foreground">No open games nearby.</p>
          <p className="text-muted-foreground mt-2">Be the first to host a game and invite others!</p>
        </div>
      )}
    </div>
  );
};

export default PlayFeed;
