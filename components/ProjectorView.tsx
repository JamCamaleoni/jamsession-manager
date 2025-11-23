import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ViewState, Band, InstrumentType, User, Game } from '../types';
import { GAMES } from '../constants';
import { ArrowLeft, Play, Pause, RotateCcw, SkipForward, Check, X as XIcon, Plus, UserPlus, Search, Edit3, Trash2, Gamepad2, Hand, Footprints, Info, PlayCircle, Clock, Timer, Maximize2, Minimize2 } from 'lucide-react';

interface ProjectorViewProps {
  bands: Band[];
  allUsers: User[];
  navigate: (path: string) => void;
  onNextBand: () => void;
  onAddMember: (user: User, role: InstrumentType) => void;
  onRemoveMember: (userId: string) => void;
  onUpdateBandName: (bandId: string, newName: string) => void;
  isStandalone?: boolean; // New prop to detect if running on /live
}

export const ProjectorView: React.FC<ProjectorViewProps> = ({ bands, allUsers, navigate, onNextBand, onAddMember, onRemoveMember, onUpdateBandName, isStandalone = false }) => {
  const currentBand = bands.length > 0 ? bands[0] : null;
  const nextBand = bands.length > 1 ? bands[1] : null;
  
  // Timer State (Main Band Timer)
  const [timeLeft, setTimeLeft] = useState<number>(0); // in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [isTimeUp, setIsTimeUp] = useState(false);
  
  // Confirmation State for "Next Band"
  const [confirmNext, setConfirmNext] = useState(false);

  // Add Member Modal State
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserToAdd, setSelectedUserToAdd] = useState<User | null>(null);

  // Edit Name State
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Edit Timer State
  const [isEditingTimer, setIsEditingTimer] = useState(false);
  const [tempTimerString, setTempTimerString] = useState('');
  const timerInputRef = useRef<HTMLInputElement>(null);

  // GAMES STATE
  const [isGamesMenuOpen, setIsGamesMenuOpen] = useState(false);
  const [activeGame, setActiveGame] = useState<Game | null>(null);
  // 'EXPLAIN' = Description + Selection, 'PLAYING' = Description + Timer, null = Off
  const [gameMode, setGameMode] = useState<'EXPLAIN' | 'PLAYING' | null>(null); 
  const [isTimerFullscreen, setIsTimerFullscreen] = useState(false);
  
  // Game Timer State
  const [gameTimeLeft, setGameTimeLeft] = useState<number>(60); // Default 60s
  const [selectedDurationOption, setSelectedDurationOption] = useState<number>(60);
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [isGameTimeUp, setIsGameTimeUp] = useState(false);
  
  // Init timer when band changes
  useEffect(() => {
    if (currentBand) {
        // durationMinutes can be float (e.g. 6.5)
        setTimeLeft(Math.floor((currentBand.durationMinutes || 6) * 60));
        setIsRunning(false);
        setIsTimeUp(false);
        setConfirmNext(false);
        setTempName(currentBand.name);
        // Reset game on new band
        setGameMode(null);
        setActiveGame(null);
        setIsGameRunning(false);
        setIsGameTimeUp(false);
        setIsTimerFullscreen(false);
    }
  }, [currentBand?.id, currentBand?.durationMinutes]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
        nameInputRef.current.focus();
    }
  }, [isEditingName]);

  // Focus timer input
  useEffect(() => {
    if (isEditingTimer && timerInputRef.current) {
        timerInputRef.current.focus();
    }
  }, [isEditingTimer]);

  // MAIN TIMER LOGIC
  useEffect(() => {
    let interval: number | undefined;
    if (isRunning && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft(prev => {
            if (prev <= 1) {
                setIsRunning(false);
                setIsTimeUp(true);
                return 0;
            }
            return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  // GAME TIMER LOGIC
  useEffect(() => {
    let interval: number | undefined;
    if (gameMode === 'PLAYING' && isGameRunning && gameTimeLeft > 0) {
      interval = window.setInterval(() => {
        setGameTimeLeft(prev => {
            if (prev <= 1) {
                setIsGameRunning(false);
                setIsGameTimeUp(true);
                return 0;
            }
            return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameMode, isGameRunning, gameTimeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAdjustTime = (deltaSeconds: number) => {
      setTimeLeft(prev => Math.max(0, prev + deltaSeconds));
      setIsTimeUp(false); // If we add time, remove the alert
  };

  // Stop the alarm and show normal screen again (paused at 00:00)
  const handleDismissAlarm = () => {
    setIsTimeUp(false);
    setIsRunning(false);
  };

  const handleNextBandClick = () => {
    // UI Logic instead of window.confirm
    setConfirmNext(true);
  };
  
  const confirmNextBand = () => {
      setConfirmNext(false);
      onNextBand();
  };

  const cancelNextBand = () => {
      setConfirmNext(false);
  };

  const handleAddMemberConfirm = (role: InstrumentType) => {
    if (selectedUserToAdd) {
        onAddMember(selectedUserToAdd, role);
        setIsAddMemberOpen(false);
        setSelectedUserToAdd(null);
        setSearchTerm('');
    }
  };

  const handleRemoveMemberClick = (userId: string) => {
      // Direct removal, no confirmation, no timeout to ensure immediate UI feedback
      onRemoveMember(userId);
  };

  const handleSaveName = () => {
      if (currentBand && tempName.trim()) {
          onUpdateBandName(currentBand.id, tempName.trim());
      }
      setIsEditingName(false);
  };

  const handleKeyDownName = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleSaveName();
      if (e.key === 'Escape') {
          setTempName(currentBand?.name || '');
          setIsEditingName(false);
      }
  };

  const parseTimerInput = (str: string): number => {
    // formats: "5" => 5 min, "5:30" => 5 min 30s
    if (str.includes(':')) {
        const parts = str.split(':');
        const m = parseInt(parts[0]) || 0;
        const s = parseInt(parts[1]) || 0;
        return m * 60 + s;
    }
    return (parseFloat(str) || 0) * 60;
  };

  const handleSaveTimer = () => {
      const seconds = parseTimerInput(tempTimerString);
      setTimeLeft(Math.max(0, seconds));
      setIsEditingTimer(false);
  };

  const handleKeyDownTimer = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleSaveTimer();
      if (e.key === 'Escape') setIsEditingTimer(false);
  };

  // Game Logic
  const handleSelectGame = (game: Game) => {
    setActiveGame(game);
    // Reset selection defaults
    setSelectedDurationOption(60); 
    setGameMode('EXPLAIN');
    setIsTimerFullscreen(false);
    setIsGamesMenuOpen(false);
    setIsGameTimeUp(false);
  };

  const handleStartGame = () => {
      setGameTimeLeft(selectedDurationOption);
      setIsGameRunning(true);
      setGameMode('PLAYING');
      // If the main band timer isn't running, start it too (optional, but makes sense)
      if (!isRunning && timeLeft > 0) {
          setIsRunning(true);
      }
  };

  const getGameIcon = (iconName: string, className: string) => {
      switch(iconName) {
          case 'hand': return <Hand className={className} />;
          case 'footprints': return <Footprints className={className} />;
          default: return <Gamepad2 className={className} />;
      }
  };

  const renderRoleBadge = (role: InstrumentType | undefined, customName: string | undefined) => {
    const colors: Record<string, string> = {
        [InstrumentType.VOICE]: 'bg-blue-600 border-blue-400 text-white',
        [InstrumentType.GUITAR]: 'bg-orange-600 border-orange-400 text-white',
        [InstrumentType.BASS]: 'bg-purple-600 border-purple-400 text-white',
        [InstrumentType.DRUMS]: 'bg-red-600 border-red-400 text-white',
        [InstrumentType.KEYS]: 'bg-yellow-600 border-yellow-400 text-white',
        [InstrumentType.OTHER]: 'bg-gray-600 border-gray-400 text-white',
    };
    
    const roleKey = role || InstrumentType.OTHER;
    const displayLabel = (roleKey === InstrumentType.OTHER && customName) ? customName : roleKey;

    return (
        <span className={`inline-block px-3 py-1 rounded-full text-sm md:text-base font-bold uppercase tracking-wide border-2 shadow-lg ${colors[roleKey] || colors[InstrumentType.OTHER]}`}>
            {displayLabel}
        </span>
    );
  };

  // --- JAM FOOTER COMPONENT (Reusable) ---
  const JamFooter = () => (
    <div className="bg-black/40 backdrop-blur-md p-6 border-t border-white/10 flex items-center justify-between absolute bottom-0 left-0 right-0 z-50">
        <div className="flex items-center gap-4">
            <div className="text-left">
                <span className="block text-xs uppercase font-bold text-white/60 tracking-widest">Jam Timer</span>
                <div className={`text-4xl md:text-5xl font-black tabular-nums ${timeLeft < 30 && timeLeft > 0 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                    {formatTime(timeLeft)}
                </div>
            </div>
            {/* Minimal controls for Jam Timer */}
            <div className="flex gap-2">
                <button onClick={() => setIsRunning(!isRunning)} className="bg-white/10 hover:bg-white/20 p-3 rounded-full text-white transition">
                        {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
                <div className="flex flex-col gap-1">
                    <button onClick={() => handleAdjustTime(60)} className="bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase">+1m</button>
                    <button onClick={() => handleAdjustTime(-60)} className="bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase">-1m</button>
                </div>
            </div>
        </div>

        <div className="text-right opacity-50 hidden md:block">
            <span className="text-lg font-bold">{currentBand?.name}</span>
        </div>
    </div>
  );

  if (!currentBand) {
      return (
          <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
              <h1 className="text-4xl font-bold text-slate-500 mb-8">IN ATTESA DI FORMAZIONI...</h1>
              {!isStandalone && (
                <button onClick={() => navigate('/admin')} className="bg-slate-800 px-6 py-3 rounded-lg hover:bg-slate-700 transition">Torna all'Admin</button>
              )}
          </div>
      )
  }

  // --- GAME MODE ---
  if (activeGame && gameMode) {
      const isPlaying = gameMode === 'PLAYING';

      // --- FULLSCREEN TIMER MODE ---
      if (isPlaying && isTimerFullscreen) {
          return (
            <div className={`fixed inset-0 z-[200] bg-gradient-to-br ${activeGame.color} flex flex-col`}>
                {/* Controls */}
                <div className="absolute top-6 right-6 flex gap-4 z-50">
                    <button 
                        onClick={() => setIsTimerFullscreen(false)}
                        className="bg-black/20 text-white hover:bg-white hover:text-black font-bold p-3 rounded-full backdrop-blur-md transition border-2 border-white/20"
                        title="Riduci a icona"
                    >
                        <Minimize2 className="w-6 h-6" />
                    </button>
                    <button 
                        onClick={() => { setGameMode(null); setActiveGame(null); setIsGameRunning(false); }}
                        className="bg-black/20 text-white hover:bg-white hover:text-black font-bold p-3 rounded-full backdrop-blur-md transition border-2 border-white/20"
                    >
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center text-center text-white relative">
                    <div className="flex items-center gap-3 mb-8 bg-black/20 px-8 py-3 rounded-full backdrop-blur-md">
                        {getGameIcon(activeGame.icon, "w-8 h-8")}
                        <span className="text-2xl font-bold uppercase tracking-widest">{activeGame.title}</span>
                    </div>

                    {/* MASSIVE TIMER */}
                    <div className="relative">
                        {isGameTimeUp ? (
                            <div className="animate-pulse flex flex-col items-center">
                                <h1 className="text-[20vw] font-black leading-none drop-shadow-2xl">STOP!</h1>
                            </div>
                        ) : (
                            <div className="text-[30vw] font-black leading-none tabular-nums drop-shadow-2xl tracking-tighter">
                                {formatTime(gameTimeLeft)}
                            </div>
                        )}
                    </div>

                    {/* Game Controls */}
                    <div className="mt-8 flex gap-4">
                        {!isGameTimeUp && (
                            <button 
                                onClick={() => setIsGameRunning(!isGameRunning)} 
                                className="bg-white text-black p-6 rounded-full hover:scale-110 transition shadow-xl"
                            >
                                {isGameRunning ? <Pause className="w-10 h-10" /> : <Play className="w-10 h-10" />}
                            </button>
                        )}
                        <button onClick={() => setGameTimeLeft(prev => prev + 30)} className="bg-white/20 hover:bg-white/40 text-white px-6 py-2 rounded-xl font-bold backdrop-blur-md transition text-xl">+30s</button>
                    </div>
                </div>

                <JamFooter />
            </div>
          );
      }

      // --- STANDARD / EXPLAIN MODE (Keep Title/Desc visible) ---
      return (
        <div className={`fixed inset-0 z-[200] bg-gradient-to-br ${activeGame.color} flex flex-col`}>
            {/* Top Bar */}
            <div className="absolute top-4 right-4 flex gap-4 z-50">
                 <button 
                    onClick={() => { setGameMode(null); setActiveGame(null); setIsGameRunning(false); }}
                    className="bg-black/20 text-white font-bold px-6 py-3 rounded-full hover:bg-black/40 transition border border-white/10"
                >
                    CHIUDI GIOCO
                </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-white animate-fade-in relative pb-32">
                {/* Fixed Title Section */}
                <div className="mb-6 p-6 bg-white/20 rounded-full backdrop-blur-md shadow-2xl">
                    {getGameIcon(activeGame.icon, "w-24 h-24 md:w-32 md:h-32")}
                </div>
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 uppercase tracking-tight drop-shadow-lg leading-none">{activeGame.title}</h1>
                <p className="text-xl md:text-3xl font-medium max-w-5xl leading-relaxed bg-black/20 p-6 md:p-8 rounded-2xl backdrop-blur-sm mb-12 border border-white/10">
                    {activeGame.description}
                </p>

                {/* DYNAMIC ACTION BOX */}
                <div className="bg-black/30 p-8 rounded-3xl backdrop-blur-md min-w-[300px] md:min-w-[500px] shadow-2xl border border-white/10 transition-all duration-500">
                    {!isPlaying ? (
                        // SELECTION MODE
                        <div className="animate-fade-in">
                            <h3 className="text-xl font-bold uppercase tracking-widest mb-6 opacity-80">Seleziona Durata</h3>
                            <div className="flex flex-wrap justify-center gap-4 mb-8">
                                {[30, 60, 120, 180].map(sec => (
                                    <button
                                        key={sec}
                                        onClick={() => setSelectedDurationOption(sec)}
                                        className={`px-5 py-3 rounded-xl font-bold text-xl transition-all ${selectedDurationOption === sec ? 'bg-white text-black scale-110 shadow-xl' : 'bg-black/40 text-white hover:bg-black/60'}`}
                                    >
                                        {sec >= 60 ? `${sec/60}m` : `${sec}s`}
                                    </button>
                                ))}
                            </div>
                            <button 
                                onClick={handleStartGame}
                                className="w-full bg-white text-black font-black px-12 py-5 rounded-xl text-3xl shadow-2xl hover:scale-105 transition flex items-center justify-center"
                            >
                                <PlayCircle className="w-8 h-8 mr-3" />
                                GIOCA ORA
                            </button>
                        </div>
                    ) : (
                        // PLAYING MODE (EMBEDDED TIMER)
                        <div className="animate-fade-in flex flex-col items-center">
                             <div className="flex items-center justify-between w-full mb-4 px-2">
                                 <span className="text-sm font-bold uppercase tracking-widest opacity-60">Tempo Rimanente</span>
                                 <button 
                                    onClick={() => setIsTimerFullscreen(true)}
                                    className="text-white hover:bg-white/20 p-2 rounded-lg transition"
                                    title="Tutto Schermo"
                                 >
                                     <Maximize2 className="w-5 h-5" />
                                 </button>
                             </div>
                             
                             {isGameTimeUp ? (
                                <div className="text-6xl md:text-8xl font-black mb-6 animate-pulse text-white">STOP!</div>
                             ) : (
                                <div className="text-7xl md:text-9xl font-black tabular-nums tracking-tighter leading-none mb-6 text-white drop-shadow-xl">
                                    {formatTime(gameTimeLeft)}
                                </div>
                             )}

                             <div className="flex gap-4 w-full justify-center">
                                 {!isGameTimeUp && (
                                     <button 
                                        onClick={() => setIsGameRunning(!isGameRunning)} 
                                        className="bg-white text-black p-4 rounded-full hover:scale-110 transition shadow-xl"
                                     >
                                        {isGameRunning ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
                                     </button>
                                 )}
                                 <button onClick={() => setGameTimeLeft(prev => prev + 30)} className="bg-white/20 hover:bg-white/40 text-white px-5 py-2 rounded-xl font-bold backdrop-blur-md transition">+30s</button>
                             </div>
                        </div>
                    )}
                </div>
            </div>

            <JamFooter />
        </div>
      );
  }

  // --- RENDER STATES (STANDARD) ---

  // 1. STATE: TIME IS UP (BASTA!)
  if (isTimeUp) {
    return (
      <div 
        onClick={handleDismissAlarm}
        className="fixed inset-0 z-[100] bg-red-600 flex flex-col items-center justify-center cursor-pointer animate-[pulse_0.5s_ease-in-out_infinite]"
      >
          <h1 className="text-[25vw] font-black text-black leading-none select-none">BASTA!</h1>
          <p className="text-black font-bold text-2xl mt-4 bg-white/20 px-6 py-2 rounded-full">Clicca ovunque per fermare</p>
      </div>
    );
  }

  // 2. STATE: URGENT (< 30s)
  if (timeLeft > 0 && timeLeft <= 30 && !isAddMemberOpen && !isGamesMenuOpen) {
     return (
        <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
             {/* Controls visible even in urgent mode */}
             {!isStandalone && (
                <button 
                    onClick={() => navigate('/admin')} 
                    className="absolute top-4 left-4 z-[101] flex items-center text-slate-400 hover:text-white bg-slate-800 px-4 py-2 rounded-lg"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" /> Admin
                </button>
             )}
             <div className="absolute top-4 right-4 z-[101] flex gap-2">
                <button onClick={() => handleAdjustTime(-30)} className="bg-slate-800 text-white px-3 py-1 rounded font-bold">-30s</button>
                <button onClick={() => handleAdjustTime(30)} className="bg-slate-800 text-white px-3 py-1 rounded font-bold">+30s</button>
             </div>

             <div className="flex flex-col items-center">
                 <div className="text-[35vw] font-black text-red-600 leading-none tracking-tighter tabular-nums animate-pulse">
                     {timeLeft}
                 </div>
                 <h2 className="text-white text-4xl font-bold uppercase tracking-widest mt-4">Chiudere!</h2>
             </div>
        </div>
     );
  }

  // 3. STATE: NORMAL
  return (
    <div key={currentBand.id} className="min-h-screen relative flex flex-col overflow-hidden bg-black transition-colors duration-200">
      
      {/* Top Controls - Split to avoid overlay blocking */}
      {!isStandalone && (
        <button 
            onClick={() => navigate('/admin')} 
            className="absolute top-4 left-4 z-50 flex items-center text-slate-400 hover:text-white bg-black/50 hover:bg-black/80 px-4 py-2 rounded-lg backdrop-blur transition-all"
        >
            <ArrowLeft className="w-5 h-5 mr-2" /> Admin
        </button>
      )}

      {/* Top Right Controls */}
      <div className="absolute top-4 right-4 z-50 flex gap-2">
           {/* GAME BUTTON */}
          <button 
            onClick={() => setIsGamesMenuOpen(true)}
            className={`flex items-center gap-2 px-3 py-1 rounded backdrop-blur transition-colors font-bold mr-4 ${activeGame ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white animate-pulse' : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'}`}
          >
              <Gamepad2 className="w-4 h-4" />
              GIOCHI
          </button>

          <button onClick={() => handleAdjustTime(-60)} className="bg-slate-800/80 hover:bg-slate-700 text-white px-3 py-1 rounded backdrop-blur transition-colors font-bold">-1m</button>
          <button onClick={() => handleAdjustTime(-30)} className="bg-slate-800/80 hover:bg-slate-700 text-white px-3 py-1 rounded backdrop-blur transition-colors font-bold">-30s</button>
          <button onClick={() => handleAdjustTime(30)} className="bg-slate-800/80 hover:bg-slate-700 text-white px-3 py-1 rounded backdrop-blur transition-colors font-bold">+30s</button>
          <button onClick={() => handleAdjustTime(60)} className="bg-slate-800/80 hover:bg-slate-700 text-white px-3 py-1 rounded backdrop-blur transition-colors font-bold">+1m</button>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col md:flex-row h-screen">
         
         {/* LEFT: CURRENT BAND (70%) */}
         <div className="flex-[3] flex flex-col justify-center p-8 md:p-12 relative">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-slate-800 via-black to-black -z-10"></div>
            
            {/* Header */}
            <div className="mb-8 relative z-10 mt-16 md:mt-0">
                <div className="flex items-center justify-between max-w-5xl mb-4">
                  <div className="inline-block bg-red-600 text-white font-black text-xl px-4 py-1 rounded shadow-lg shadow-red-600/50 animate-pulse">
                      ON STAGE
                  </div>
                </div>

                {isEditingName ? (
                    <div className="flex items-center gap-4">
                        <input
                            ref={nameInputRef}
                            value={tempName}
                            onChange={(e) => setTempName(e.target.value)}
                            onKeyDown={handleKeyDownName}
                            onBlur={handleSaveName}
                            className="text-5xl md:text-7xl lg:text-8xl font-black text-white bg-transparent border-b-2 border-indigo-500 outline-none w-full shadow-none p-0 tracking-tight"
                        />
                        <button onClick={handleSaveName} className="bg-green-600 p-3 rounded-full hover:bg-green-500">
                            <Check className="w-8 h-8 text-white" />
                        </button>
                    </div>
                ) : (
                    <div className="group flex items-center gap-4">
                        <h1 
                            className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tight drop-shadow-2xl cursor-pointer hover:text-indigo-200 transition-colors"
                            onClick={() => { setTempName(currentBand.name); setIsEditingName(true); }}
                        >
                            {currentBand.name}
                        </h1>
                        <button 
                            onClick={() => { setTempName(currentBand.name); setIsEditingName(true); }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-white p-2"
                        >
                            <Edit3 className="w-8 h-8" />
                        </button>
                    </div>
                )}
            </div>

            {/* Members Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl relative z-10">
                {currentBand.members.map(m => (
                    <div key={m.id} className="relative group flex items-center bg-slate-900/60 border border-slate-700/50 p-4 rounded-2xl backdrop-blur-sm shadow-2xl transform transition hover:scale-105">
                        <img 
                          src={`https://api.dicebear.com/9.x/adventurer/svg?seed=${m.avatarSeed || m.username}`} 
                          className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-slate-700 border-4 border-slate-800 shadow-lg mr-6" 
                          alt="avatar" 
                        />
                        <div className="flex flex-col items-start min-w-0">
                            <span className="text-2xl md:text-3xl font-bold text-white mb-2 truncate w-full">
                                {m.firstName} {m.lastName}
                            </span>
                            {renderRoleBadge(m.assignedRole, m.customInstrument)}
                        </div>
                        
                        {/* Remove Button - Visible on hover/touch */}
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleRemoveMemberClick(m.id);
                            }}
                            className="absolute -top-3 -right-3 z-50 bg-red-600 hover:bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg transform hover:scale-110 border-2 border-slate-900"
                            title="Rimuovi musicista"
                        >
                            <XIcon className="w-5 h-5" />
                        </button>
                    </div>
                ))}
                
                {/* ADD MEMBER BUTTON */}
                <button 
                    onClick={() => setIsAddMemberOpen(true)}
                    className="flex items-center justify-center bg-slate-900/30 border-2 border-dashed border-slate-600 p-4 rounded-2xl hover:bg-slate-800/50 hover:border-indigo-500 hover:text-indigo-400 transition-all group min-h-[120px]"
                >
                    <div className="flex flex-col items-center">
                        <Plus className="w-10 h-10 mb-2 opacity-50 group-hover:opacity-100 group-hover:scale-110 transition" />
                        <span className="font-bold text-slate-500 group-hover:text-indigo-400">AGGIUNGI</span>
                    </div>
                </button>
            </div>

            {/* TIMER (Integrated at bottom of left panel) */}
            <div className="mt-auto pt-12 flex items-center gap-8 relative z-10">
                 
                 {isEditingTimer ? (
                     <div className="flex items-center gap-2">
                        <input
                            ref={timerInputRef}
                            value={tempTimerString}
                            onChange={(e) => setTempTimerString(e.target.value)}
                            onKeyDown={handleKeyDownTimer}
                            onBlur={handleSaveTimer}
                            placeholder="MM:SS"
                            className="text-8xl md:text-9xl font-black bg-transparent text-white border-b-2 border-indigo-500 outline-none w-80 md:w-96"
                        />
                        <button onClick={handleSaveTimer} className="bg-green-600 p-4 rounded-full hover:bg-green-500">
                           <Check className="w-8 h-8 text-white" />
                        </button>
                     </div>
                 ) : (
                    <div 
                        onClick={() => { setTempTimerString(formatTime(timeLeft)); setIsEditingTimer(true); }}
                        className={`text-8xl md:text-9xl font-black tabular-nums tracking-tighter transition-colors text-slate-200 cursor-pointer hover:text-indigo-200`}
                        title="Clicca per modificare il tempo"
                    >
                        {formatTime(timeLeft)}
                    </div>
                 )}

                 <div className="flex gap-4">
                     {!isRunning ? (
                         <button onClick={() => setIsRunning(true)} className="bg-green-600 hover:bg-green-500 text-white p-6 rounded-full shadow-2xl transition hover:scale-110">
                             <Play className="w-10 h-10 fill-current" />
                         </button>
                     ) : (
                         <button onClick={() => setIsRunning(false)} className="bg-yellow-600 hover:bg-yellow-500 text-white p-6 rounded-full shadow-2xl transition hover:scale-110">
                             <Pause className="w-10 h-10 fill-current" />
                         </button>
                     )}
                     <button 
                        onClick={() => { setIsRunning(false); setTimeLeft(Math.floor((currentBand.durationMinutes || 6) * 60)); setIsTimeUp(false); }} 
                        className="bg-slate-700 hover:bg-slate-600 text-white p-6 rounded-full shadow-2xl transition hover:scale-110"
                        title="Reset Timer"
                     >
                         <RotateCcw className="w-10 h-10" />
                     </button>
                     
                     <div className="w-px h-20 bg-slate-700 mx-2"></div>
                     
                     {/* NEXT BAND CONTROLS */}
                     {!confirmNext ? (
                        <button 
                            onClick={handleNextBandClick}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white p-6 rounded-full shadow-2xl transition hover:scale-110"
                            title="Prossima Band"
                        >
                            <SkipForward className="w-10 h-10" />
                        </button>
                     ) : (
                        <div className="flex gap-2 animate-fade-in">
                            <button 
                                onClick={confirmNextBand}
                                className="bg-red-600 hover:bg-red-500 text-white px-6 py-4 rounded-2xl shadow-2xl transition hover:scale-105 flex flex-col items-center justify-center font-bold text-xs"
                                title="Conferma"
                            >
                                <Check className="w-6 h-6 mb-1" />
                                CONFERMA
                            </button>
                             <button 
                                onClick={cancelNextBand}
                                className="bg-slate-600 hover:bg-slate-500 text-white px-4 py-4 rounded-2xl shadow-2xl transition hover:scale-105 flex flex-col items-center justify-center font-bold text-xs"
                                title="Annulla"
                            >
                                <XIcon className="w-6 h-6 mb-1" />
                            </button>
                        </div>
                     )}
                 </div>
            </div>
         </div>

         {/* RIGHT: NEXT BAND (30%) */}
         <div className="hidden md:flex flex-1 bg-slate-900 border-l border-slate-800 p-8 flex-col justify-center">
            <h2 className="text-slate-500 font-bold text-2xl uppercase tracking-widest mb-8 border-b border-slate-700 pb-4">Next Up</h2>
            
            {nextBand ? (
                <div className="opacity-60">
                    <h3 className="text-4xl font-bold text-white mb-6">{nextBand.name}</h3>
                    <ul className="space-y-4">
                        {nextBand.members.map(m => (
                            <li key={m.id} className="flex items-center text-xl text-slate-300">
                                <span className="w-2 h-2 bg-indigo-500 rounded-full mr-4"></span>
                                <span className="font-semibold mr-2">{m.firstName} {m.lastName}</span>
                                <span className="text-slate-500 text-sm uppercase">({m.assignedRole || '?'})</span>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <div className="text-slate-600 text-xl italic">
                    Nessuna altra band in scaletta.
                </div>
            )}
         </div>
      </div>

      {/* GAMES MENU MODAL */}
      {isGamesMenuOpen && (
          <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-slate-800 rounded-2xl border border-slate-600 w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                  <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-900">
                      <h2 className="text-2xl font-bold text-white flex items-center">
                          <Gamepad2 className="w-6 h-6 mr-2 text-purple-400" /> DATABASE GIOCHI
                      </h2>
                      <button onClick={() => setIsGamesMenuOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-700">
                          <XIcon className="w-6 h-6" />
                      </button>
                  </div>
                  
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto">
                      {GAMES.map(game => (
                          <div 
                            key={game.id} 
                            onClick={() => handleSelectGame(game)}
                            className={`relative group cursor-pointer rounded-xl overflow-hidden border border-slate-700 hover:border-white transition-all duration-300 transform hover:-translate-y-1 shadow-lg`}
                          >
                              <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-20 group-hover:opacity-40 transition-opacity`}></div>
                              <div className="p-6 flex flex-col items-center text-center relative z-10">
                                  <div className="mb-4 p-4 bg-white/10 rounded-full text-white">
                                      {getGameIcon(game.icon, "w-12 h-12")}
                                  </div>
                                  <h3 className="text-xl font-bold text-white mb-2">{game.title}</h3>
                                  <p className="text-sm text-slate-300 line-clamp-2">{game.description}</p>
                                  <div className="mt-4 px-4 py-2 bg-white/10 rounded-lg text-xs font-bold text-white uppercase tracking-wider group-hover:bg-white group-hover:text-black transition-colors">
                                      Seleziona
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}

      {/* ADD MEMBER MODAL */}
      {isAddMemberOpen && (
          <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-slate-800 rounded-2xl border border-slate-600 w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                  
                  {/* Modal Header */}
                  <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900">
                      <h2 className="text-xl font-bold text-white flex items-center">
                          <UserPlus className="w-5 h-5 mr-2 text-indigo-400" /> Aggiungi Musicista Live
                      </h2>
                      <button onClick={() => { setIsAddMemberOpen(false); setSelectedUserToAdd(null); }} className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-700">
                          <XIcon className="w-6 h-6" />
                      </button>
                  </div>

                  {/* Search Bar */}
                  <div className="p-4 border-b border-slate-700 bg-slate-800/50">
                      <div className="relative">
                          <Search className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                          <input 
                              type="text" 
                              placeholder="Cerca per nome o strumento..." 
                              className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-10 pr-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                          />
                      </div>
                  </div>

                  {/* Content Area */}
                  <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                      {!selectedUserToAdd ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {allUsers
                                  .filter(u => !currentBand.members.find(m => m.id === u.id)) // Exclude current members
                                  .filter(u => 
                                      u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                      u.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                      u.instruments.some(i => i.toLowerCase().includes(searchTerm.toLowerCase()))
                                  )
                                  .map(u => (
                                      <div 
                                          key={u.id} 
                                          onClick={() => setSelectedUserToAdd(u)}
                                          className="flex items-center p-3 rounded-lg hover:bg-indigo-600/20 hover:border-indigo-500 border border-transparent cursor-pointer transition-all group"
                                      >
                                          <img src={`https://api.dicebear.com/9.x/adventurer/svg?seed=${u.avatarSeed || u.username}`} className="w-10 h-10 rounded-full bg-slate-700 mr-3" alt="av" />
                                          <div className="flex-1">
                                              <h4 className="font-bold text-slate-200 group-hover:text-white">{u.firstName} {u.lastName}</h4>
                                              <p className="text-xs text-slate-400">{u.instruments.join(', ')}</p>
                                          </div>
                                          <Plus className="w-5 h-5 text-slate-500 group-hover:text-indigo-400" />
                                      </div>
                                  ))
                              }
                              {allUsers.filter(u => !currentBand.members.find(m => m.id === u.id)).length === 0 && (
                                  <div className="col-span-2 text-center py-8 text-slate-500">Tutti i musicisti sono già sul palco!</div>
                              )}
                          </div>
                      ) : (
                          <div className="p-4 flex flex-col items-center">
                              <img src={`https://api.dicebear.com/9.x/adventurer/svg?seed=${selectedUserToAdd.avatarSeed || selectedUserToAdd.username}`} className="w-24 h-24 rounded-full bg-slate-700 mb-4 shadow-xl border-4 border-indigo-500" alt="av" />
                              <h3 className="text-2xl font-bold text-white mb-6">Come suona {selectedUserToAdd.firstName}?</h3>
                              
                              <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                                  {selectedUserToAdd.instruments.map(inst => (
                                      <button 
                                          key={inst}
                                          onClick={() => handleAddMemberConfirm(inst)}
                                          className="bg-slate-700 hover:bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg transition transform hover:scale-105"
                                      >
                                          {inst === InstrumentType.OTHER && selectedUserToAdd.customInstrument ? selectedUserToAdd.customInstrument : inst}
                                      </button>
                                  ))}
                              </div>
                              <button onClick={() => setSelectedUserToAdd(null)} className="mt-8 text-slate-400 hover:text-white underline">Scegli un altro</button>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};