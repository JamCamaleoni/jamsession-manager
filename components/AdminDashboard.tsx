import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Band, InstrumentType } from '../types';
import { generateNextBand, getUniqueBandName } from '../services/jamLogic';
import { BAND_NAMES, INSTRUMENTS } from '../constants';
import { Users, Edit3, Trash2, Plus, LogOut, RefreshCw, CheckCircle, Music, GripVertical, Clock, X, BarChart2, Dices, MonitorPlay, Mic, Guitar, Drum, Piano, MoreHorizontal, ArrowLeft, Play, Coffee } from 'lucide-react';

interface AdminDashboardProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  navigate: (path: string) => void;
  bands: Band[];
  setBands: React.Dispatch<React.SetStateAction<Band[]>>;
  pastBands: Band[];
}

// Helper component for Manual Band Editing
const ManualBandEditor = ({ 
  band, 
  allUsers, 
  onSave, 
  onCancel 
}: { 
  band: Band, 
  allUsers: User[], 
  onSave: (members: User[]) => void, 
  onCancel: () => void 
}) => {
  // Map UserID -> AssignedRole
  const [selectedMap, setSelectedMap] = useState<Map<string, InstrumentType>>(() => {
    const map = new Map<string, InstrumentType>();
    band.members.forEach(m => {
        map.set(m.id, m.assignedRole || m.instruments[0]);
    });
    return map;
  });

  // UI State
  const [viewMode, setViewMode] = useState<'INSTRUMENTS' | 'USERS'>('INSTRUMENTS');
  const [activeInstrument, setActiveInstrument] = useState<InstrumentType | null>(null);

  // Calculate occupied roles to determine disabled states
  const occupiedRoles = Array.from(selectedMap.values());

  const isInstrumentDisabled = (type: InstrumentType) => {
    // Voice and Other are always available (multi-slot)
    if (type === InstrumentType.VOICE || type === InstrumentType.OTHER) return false;
    // Others are disabled if already present in the map
    return occupiedRoles.includes(type);
  };

  const handleInstrumentClick = (type: InstrumentType) => {
    if (isInstrumentDisabled(type)) return;
    setActiveInstrument(type);
    setViewMode('USERS');
  };

  const handleUserSelect = (user: User) => {
    if (activeInstrument) {
      const newMap = new Map(selectedMap);
      newMap.set(user.id, activeInstrument);
      setSelectedMap(newMap);
      // Return to instrument view
      setViewMode('INSTRUMENTS');
      setActiveInstrument(null);
    }
  };

  const handleRemoveMember = (userId: string) => {
    const newMap = new Map(selectedMap);
    newMap.delete(userId);
    setSelectedMap(newMap);
  };

  const handleSave = () => {
    const newMembers: User[] = [];
    selectedMap.forEach((role, userId) => {
        const originalUser = allUsers.find(u => u.id === userId);
        if (originalUser) {
            newMembers.push({ ...originalUser, assignedRole: role });
        }
    });
    onSave(newMembers);
  };

  const getIcon = (type: InstrumentType, className: string) => {
    switch (type) {
      case InstrumentType.VOICE: return <Mic className={className} />;
      case InstrumentType.GUITAR: return <Guitar className={className} />;
      case InstrumentType.BASS: return <Guitar className={className} />; // Bass uses guitar icon
      case InstrumentType.DRUMS: return <Drum className={className} />;
      case InstrumentType.KEYS: return <Piano className={className} />;
      case InstrumentType.OTHER: return <MoreHorizontal className={className} />;
      default: return <Music className={className} />;
    }
  };

  // Render the Instrument Selection Grid
  if (viewMode === 'INSTRUMENTS') {
    return (
      <div className="mt-4 bg-slate-900/50 p-4 rounded-lg border border-slate-600 animate-fade-in cursor-default" onDragStart={(e) => e.stopPropagation()} draggable={true}>
        
        {/* INSTRUMENT ICONS GRID */}
        <div className="mb-6">
            <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Aggiungi Strumento</h4>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {INSTRUMENTS.map((inst) => {
                    const disabled = isInstrumentDisabled(inst.type);
                    return (
                        <button
                            key={inst.type}
                            onClick={() => handleInstrumentClick(inst.type)}
                            disabled={disabled}
                            className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                                disabled 
                                    ? 'bg-slate-800/50 border-slate-800 text-slate-600 cursor-not-allowed grayscale' 
                                    : 'bg-slate-800 border-slate-600 hover:border-indigo-500 hover:bg-indigo-500/10 text-indigo-300 hover:text-indigo-400 shadow-lg'
                            }`}
                        >
                            {getIcon(inst.type, "w-6 h-6 mb-1")}
                            <span className="text-[10px] font-bold">{inst.label}</span>
                        </button>
                    )
                })}
            </div>
        </div>

        {/* SELECTED MEMBERS LIST */}
        <div className="mb-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase mb-2 border-b border-slate-700 pb-1 flex justify-between">
                Formazione Attuale <span className="text-indigo-400">{selectedMap.size}</span>
            </h4>
            {selectedMap.size === 0 ? (
                <div className="text-slate-500 text-xs italic py-2 text-center">Nessun musicista selezionato</div>
            ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                    {Array.from(selectedMap.entries()).map(([userId, role]) => {
                        const user = allUsers.find(u => u.id === userId);
                        if (!user) return null;
                        return (
                            <div key={userId} className="flex items-center justify-between bg-slate-800 p-2 rounded border border-slate-700">
                                <div className="flex items-center gap-2">
                                    <div className="bg-indigo-900/50 p-1.5 rounded text-indigo-300">
                                        {getIcon(role, "w-3 h-3")}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-slate-200">{user.firstName} {user.lastName}</span>
                                        <span className="text-[10px] text-slate-500 uppercase">{role}</span>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleRemoveMember(userId)}
                                    className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>

        {/* ACTIONS */}
        <div className="flex gap-3">
            <button
            onClick={handleSave}
            className="flex-1 bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition"
            >
            <CheckCircle className="w-4 h-4" />
            Salva Band
            </button>
            <button
            onClick={onCancel}
            className="px-4 bg-slate-700 hover:bg-slate-600 text-slate-200 py-2 rounded-lg text-sm font-bold transition"
            >
            Annulla
            </button>
        </div>
      </div>
    );
  }

  // Render User Selection List (Filtered)
  const filteredUsers = allUsers.filter(u => {
      // Must be active
      if (u.status !== 'ACTIVE') return false;
      // Must have the instrument
      if (!activeInstrument || !u.instruments.includes(activeInstrument)) return false;
      // Must NOT already be in the band
      if (selectedMap.has(u.id)) return false;
      return true;
  });

  return (
    <div className="mt-4 bg-slate-900/50 p-4 rounded-lg border border-slate-600 animate-fade-in cursor-default" onDragStart={(e) => e.stopPropagation()} draggable={true}>
        <div className="flex items-center justify-between mb-4 border-b border-slate-700 pb-2">
            <button 
                onClick={() => { setViewMode('INSTRUMENTS'); setActiveInstrument(null); }}
                className="text-xs flex items-center text-slate-400 hover:text-white"
            >
                <ArrowLeft className="w-3 h-3 mr-1" /> Indietro
            </button>
            <div className="flex items-center gap-2 text-indigo-400">
                 {activeInstrument && getIcon(activeInstrument, "w-4 h-4")}
                 <span className="text-sm font-bold uppercase">{activeInstrument}</span>
            </div>
        </div>

        <div className="max-h-60 overflow-y-auto space-y-1 pr-2 custom-scrollbar mb-4">
            {filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                    Nessun {activeInstrument} disponibile
                </div>
            ) : (
                filteredUsers.map(u => (
                    <button
                        key={u.id}
                        onClick={() => handleUserSelect(u)}
                        className="w-full flex items-center justify-between p-3 rounded bg-slate-800 hover:bg-indigo-900/30 border border-transparent hover:border-indigo-500/30 transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            <img src={`https://api.dicebear.com/9.x/adventurer/svg?seed=${u.avatarSeed || u.username}`} className="w-8 h-8 rounded-full bg-slate-700" alt="av" />
                            <div className="text-left">
                                <div className="text-sm font-bold text-slate-200 group-hover:text-white">{u.firstName} {u.lastName}</div>
                                <div className="text-[10px] text-slate-500">{u.instruments.join(', ')}</div>
                            </div>
                        </div>
                        <Plus className="w-4 h-4 text-slate-500 group-hover:text-indigo-400" />
                    </button>
                ))
            )}
        </div>
    </div>
  );
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ users, setUsers, navigate, bands, setBands, pastBands }) => {
  const [activeTab, setActiveTab] = useState<'DB' | 'AUTO' | 'MANUAL' | 'STATS'>('DB');
  const [editingBandId, setEditingBandId] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [desiredBandSize, setDesiredBandSize] = useState<string>('');

  // Drag and Drop refs
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  const TRASH_INDEX = -1;
  const [isDragging, setIsDragging] = useState(false);
  const [isOverTrash, setIsOverTrash] = useState(false);

  // --- Actions ---

  const toggleUserStatus = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return { ...u, status: u.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE' };
      }
      return u;
    }));
  };

  const confirmDeleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    setUserToDelete(null);
  };

  const handleAddAutoBand = () => {
    const activeCount = users.filter(u => u.status === 'ACTIVE').length;
    if (activeCount < 3) {
      alert(`Impossibile generare le formazioni. Servono almeno 3 iscritti ATTIVI.`);
      return;
    }
    if (bands.length >= 15) {
      if (!window.confirm('Hai molte band. Vuoi aggiungerne comunque una nuova?')) {
        return;
      }
    }

    // Pass BOTH active bands and past bands to the algorithm, plus optional forced size
    const forceSize = parseInt(desiredBandSize);
    const newBand = generateNextBand(users, bands, pastBands, (!isNaN(forceSize) && forceSize > 0) ? forceSize : undefined);
    
    if (newBand) {
      setBands(prev => [...prev, newBand]);
    } else {
      alert("Impossibile creare una band con gli utenti attuali. Controlla che ci siano abbastanza batteristi/bassisti attivi.");
    }
  };

  const handleUpdateBandName = (bandId: string, newName: string) => {
    setBands(prev => prev.map(b => b.id === bandId ? { ...b, name: newName } : b));
  };
  
  const handleShuffleBandName = (bandId: string) => {
    const usedNames = new Set([
        ...bands.map(b => b.name),
        ...pastBands.map(b => b.name)
    ]);
    const uniqueName = getUniqueBandName(usedNames);
    handleUpdateBandName(bandId, uniqueName);
  };

  const handleUpdateDuration = (bandId: string, newDuration: string) => {
    // Allows float parsing (e.g. 6.5 minutes)
    setBands(prev => prev.map(b => b.id === bandId ? { ...b, durationMinutes: parseFloat(newDuration) || 0 } : b));
  };

  const handleAddManualBand = () => {
    const usedNames = new Set([
        ...bands.map(b => b.name),
        ...pastBands.map(b => b.name)
    ]);
    const uniqueName = getUniqueBandName(usedNames);
    const newBand: Band = {
      id: `manual-${Date.now()}`,
      name: uniqueName,
      members: [],
      isManual: true,
      durationMinutes: 6
    };
    setBands([...bands, newBand]);
    setEditingBandId(newBand.id);
  };

  const handleSaveMembers = (bandId: string, members: User[]) => {
    setBands(prev => prev.map(b => b.id === bandId ? { ...b, members } : b));
    setEditingBandId(null);
  };

  // --- Drag and Drop Logic ---
  const handleDragStart = (e: React.DragEvent, index: number) => {
    dragItem.current = index;
    setIsDragging(true);
  };

  const handleDragEnter = (e: React.DragEvent, index: number) => {
    if (!isOverTrash) {
       dragOverItem.current = index;
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setIsOverTrash(false);
    if (dragItem.current === null) return;

    const currentIndex = dragItem.current;
    const destinationIndex = dragOverItem.current;

    dragItem.current = null;
    dragOverItem.current = null;

    if (destinationIndex === TRASH_INDEX) {
      const _bands = [...bands];
      if (editingBandId === _bands[currentIndex].id) {
        setEditingBandId(null);
      }
      _bands.splice(currentIndex, 1);
      setBands(_bands);
      return;
    }

    if (destinationIndex !== null && destinationIndex !== currentIndex) {
      const _bands = [...bands];
      const draggedItemContent = _bands.splice(currentIndex, 1)[0];
      _bands.splice(destinationIndex, 0, draggedItemContent);
      setBands(_bands);
    }
  };

  const handleTrashDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragOverItem.current = TRASH_INDEX;
    setIsOverTrash(true);
  };

  const handleTrashDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOverTrash(false);
  };

  const handleTrashDrop = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // --- Renders ---

  const renderRoleBadge = (role: InstrumentType | undefined, customName: string | undefined) => {
      const colors: Record<string, string> = {
          [InstrumentType.VOICE]: 'bg-blue-600 text-white border-blue-500',
          [InstrumentType.GUITAR]: 'bg-orange-600 text-white border-orange-500',
          [InstrumentType.BASS]: 'bg-purple-600 text-white border-purple-500',
          [InstrumentType.DRUMS]: 'bg-red-600 text-white border-red-500',
          [InstrumentType.KEYS]: 'bg-yellow-600 text-white border-yellow-500',
          [InstrumentType.OTHER]: 'bg-gray-600 text-white border-gray-500',
      };
      
      const roleKey = role || InstrumentType.OTHER;
      const displayLabel = (roleKey === InstrumentType.OTHER && customName) ? customName : roleKey;

      return (
          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide border ${colors[roleKey] || colors[InstrumentType.OTHER]}`}>
              {displayLabel}
          </span>
      );
  };

  const renderDatabase = () => {
    // Calculate plays for display
    const playCounts: Record<string, number> = {};
    [...pastBands, ...bands].forEach(b => b.members.forEach(m => {
        playCounts[m.id] = (playCounts[m.id] || 0) + 1;
    }));

    return (
        <div className="bg-slate-800 rounded-xl shadow-xl overflow-hidden border border-slate-700">
        <div className="overflow-x-auto">
            <table className="w-full text-left">
            <thead className="bg-slate-900 text-slate-400 uppercase text-xs">
                <tr>
                <th className="px-6 py-4">Avatar</th>
                <th className="px-6 py-4">Nome</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Stage Name</th>
                <th className="px-6 py-4">Presenze</th>
                <th className="px-6 py-4">Strumenti</th>
                <th className="px-6 py-4 text-right">Azioni</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
                {users.map(user => (
                <tr key={user.id} className={`hover:bg-slate-700/50 transition-colors ${user.status === 'PAUSED' ? 'opacity-50 grayscale' : ''}`}>
                    <td className="px-6 py-4">
                    <img 
                        src={`https://api.dicebear.com/9.x/adventurer/svg?seed=${user.avatarSeed || user.username}`} 
                        alt="avatar" 
                        className="w-10 h-10 rounded-full bg-slate-600"
                    />
                    </td>
                    <td className="px-6 py-4 font-medium">
                    {user.firstName} {user.lastName}
                    </td>
                    <td className="px-6 py-4">
                    <button 
                        onClick={() => toggleUserStatus(user.id)}
                        className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold transition-colors ${user.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'}`}
                    >
                        {user.status === 'ACTIVE' ? <Play className="w-3 h-3" /> : <Coffee className="w-3 h-3" />}
                        {user.status === 'ACTIVE' ? 'ATTIVO' : 'IN PAUSA'}
                    </button>
                    </td>
                    <td className="px-6 py-4 text-indigo-400">@{user.username}</td>
                    <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${playCounts[user.id] ? 'bg-indigo-900 text-indigo-200' : 'bg-slate-700 text-slate-400'}`}>
                            {playCounts[user.id] || 0}
                        </span>
                    </td>
                    <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                        {user.instruments.map(i => (
                            <span key={i} className="text-xs bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded">
                                {i === InstrumentType.OTHER && user.customInstrument ? user.customInstrument : i}
                            </span>
                        ))}
                    </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                    {userToDelete === user.id ? (
                        <div className="flex items-center justify-end gap-2">
                        <button onClick={() => confirmDeleteUser(user.id)} className="bg-red-600 text-white px-3 py-1 rounded text-xs font-bold">Conferma</button>
                        <button onClick={() => setUserToDelete(null)} className="text-slate-400 hover:text-slate-200"><X className="w-4 h-4" /></button>
                        </div>
                    ) : (
                        <button onClick={() => setUserToDelete(user.id)} className="text-red-400 hover:text-red-300 p-2 hover:bg-red-900/20 rounded-full"><Trash2 className="w-4 h-4" /></button>
                    )}
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
        </div>
    );
  };

  const renderStats = () => {
    // Calc stats including PAST bands
    const appearances: Record<string, number> = {};
    const instrumentCounts: Record<string, number> = {};

    [...pastBands, ...bands].forEach(b => {
      b.members.forEach(m => {
        appearances[m.id] = (appearances[m.id] || 0) + 1;
        const role = m.assignedRole || InstrumentType.OTHER;
        instrumentCounts[role] = (instrumentCounts[role] || 0) + 1;
      });
    });

    const sortedUsers = [...users].sort((a, b) => (appearances[b.id] || 0) - (appearances[a.id] || 0)).slice(0, 5);
    const sortedInstruments = Object.entries(instrumentCounts).sort((a, b) => b[1] - a[1]);
    const totalJams = pastBands.length + bands.length;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
           <h3 className="text-lg font-bold text-white mb-4 flex items-center"><BarChart2 className="w-5 h-5 mr-2 text-indigo-400" /> Top Players</h3>
           <div className="space-y-3">
             {sortedUsers.map((u, idx) => (
               <div key={u.id} className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <span className="text-slate-500 font-bold w-4">{idx + 1}.</span>
                    <img src={`https://api.dicebear.com/9.x/adventurer/svg?seed=${u.avatarSeed || u.username}`} className="w-8 h-8 rounded-full bg-slate-700" alt="av" />
                    <span>{u.firstName} {u.lastName}</span>
                 </div>
                 <span className="font-bold text-indigo-400">{appearances[u.id] || 0} Jam</span>
               </div>
             ))}
           </div>
        </div>
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
           <h3 className="text-lg font-bold text-white mb-4 flex items-center"><Music className="w-5 h-5 mr-2 text-pink-400" /> Strumenti più suonati</h3>
           <div className="space-y-3">
              {sortedInstruments.map(([inst, count]) => (
                <div key={inst} className="flex items-center justify-between">
                  <span className="text-slate-300">{inst}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-pink-500" style={{ width: totalJams > 0 ? `${(count / (totalJams * 4)) * 100}%` : '0%' }}></div>
                    </div>
                    <span className="text-xs font-bold w-6 text-right">{count}</span>
                  </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    );
  }

  const renderBandCard = (band: Band, index: number, allowDrag: boolean, showEditButton: boolean) => (
    <div 
      key={band.id} 
      className={`rounded-xl p-4 border shadow-lg flex flex-col relative transition-all group duration-200 ${
        band.isManual ? 'bg-slate-800 border-indigo-500/50 shadow-indigo-900/20' : 'bg-slate-800 border-slate-700'
      } ${allowDrag ? 'cursor-grab active:cursor-grabbing' : ''} ${isDragging && dragItem.current === index ? 'opacity-50 scale-95' : 'opacity-100'}`}
      draggable={allowDrag}
      onDragStart={(e) => allowDrag && handleDragStart(e, index)}
      onDragEnter={(e) => allowDrag && handleDragEnter(e, index)}
      onDragEnd={handleDragEnd}
      onDragOver={(e) => e.preventDefault()}
    >
      {band.isManual && (
        <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] uppercase font-bold px-2 py-1 rounded-bl-lg rounded-tr-lg z-10">
          Manuale
        </div>
      )}

      <div className="flex items-center justify-between mb-3 border-b border-slate-700 pb-2 mt-1">
        <div className="flex items-center flex-1">
           {allowDrag && <div className="mr-2 text-slate-600 group-hover:text-slate-400"><GripVertical className="w-5 h-5" /></div>}
           <div className="flex flex-col w-full">
             <div className="flex justify-between w-full items-center">
                <div className="flex items-center flex-1 mr-2">
                    <input
                        type="text"
                        value={band.name}
                        onChange={(e) => handleUpdateBandName(band.id, e.target.value)}
                        className="bg-transparent text-lg font-bold text-indigo-400 focus:text-indigo-300 outline-none border-b border-transparent focus:border-indigo-500 w-full"
                        placeholder="Nome Band"
                    />
                    <button 
                        onClick={() => handleShuffleBandName(band.id)}
                        className="ml-2 text-slate-500 hover:text-white p-1 rounded-full hover:bg-slate-700 transition"
                        title="Cambia nome random"
                    >
                        <Dices className="w-4 h-4" />
                    </button>
                </div>
                <span className="text-xs text-slate-500 whitespace-nowrap pt-1">#{index + 1}</span>
             </div>
           </div>
        </div>
      </div>

      {/* Timer Settings Row */}
      <div className="flex items-center gap-2 mb-3 bg-slate-900/30 p-2 rounded">
          <Clock className="w-4 h-4 text-slate-500" />
          <span className="text-xs text-slate-400">Durata:</span>
          <input 
            type="number" 
            step="0.5"
            value={band.durationMinutes || 6} 
            onChange={(e) => handleUpdateDuration(band.id, e.target.value)}
            className="w-16 bg-transparent border-b border-slate-600 text-center text-sm font-bold focus:border-indigo-500 outline-none"
          />
          <span className="text-xs text-slate-400">min</span>
      </div>
      
      <div className="space-y-2 flex-1">
        {band.members.length === 0 ? (
          <p className="text-slate-500 text-sm italic py-2 text-center">Nessun membro</p>
        ) : (
          band.members.map(m => (
            <div key={m.id} className="flex items-center justify-between text-sm bg-slate-900/50 p-2 rounded-lg border border-slate-700/50">
               <div className="flex items-center gap-2">
                   <img src={`https://api.dicebear.com/9.x/adventurer/svg?seed=${m.avatarSeed || m.username}`} className="w-6 h-6 rounded-full bg-slate-700" alt="av" />
                   <span className="font-bold text-slate-200">{m.firstName} {m.lastName}</span>
               </div>
               <div>
                  {renderRoleBadge(m.assignedRole, m.customInstrument)}
               </div>
            </div>
          ))
        )}
      </div>

      {showEditButton && (
        <div className="mt-4 pt-4 border-t border-slate-700">
          {editingBandId === band.id ? (
            <ManualBandEditor 
              band={band} 
              allUsers={users} 
              onSave={(members) => handleSaveMembers(band.id, members)} 
              onCancel={() => setEditingBandId(null)}
            />
          ) : (
            <button 
              onClick={() => setEditingBandId(band.id)}
              className="w-full bg-slate-700 hover:bg-indigo-600 hover:text-white text-slate-300 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center"
            >
              <Edit3 className="w-4 h-4 mr-2" /> Modifica
            </button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white relative">
      <div className="bg-slate-800 border-b border-slate-700 p-4 flex justify-between items-center sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-2">
           <div className="w-3 h-8 bg-indigo-500 rounded-full"></div>
           <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-pink-400">Admin Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/projector-preview')}
            className="flex items-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white px-4 py-2 rounded-lg font-bold shadow-lg shadow-purple-900/20 transition-all hover:scale-105"
          >
            <MonitorPlay className="w-4 h-4" />
            LIVE MODE
          </button>
          <button onClick={() => navigate('/')} className="flex items-center text-sm text-slate-400 hover:text-white transition px-3 py-2 rounded hover:bg-slate-700"><LogOut className="w-4 h-4 mr-2" /> Esci</button>
        </div>
      </div>

      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="flex justify-center mb-8">
          <div className="bg-slate-800 p-1.5 rounded-xl inline-flex shadow-inner border border-slate-700 overflow-x-auto max-w-full">
            <button onClick={() => setActiveTab('DB')} className={`flex items-center px-4 md:px-6 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'DB' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}><Users className="w-4 h-4 mr-2" /> Iscritti</button>
            <button onClick={() => setActiveTab('MANUAL')} className={`flex items-center px-4 md:px-6 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'MANUAL' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}><Edit3 className="w-4 h-4 mr-2" /> Manuale</button>
            <button onClick={() => setActiveTab('AUTO')} className={`flex items-center px-4 md:px-6 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'AUTO' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}><RefreshCw className="w-4 h-4 mr-2" /> Randomizer</button>
            <button onClick={() => setActiveTab('STATS')} className={`flex items-center px-4 md:px-6 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'STATS' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}><BarChart2 className="w-4 h-4 mr-2" /> Stats</button>
          </div>
        </div>

        <div className="animate-fade-in">
          {activeTab === 'DB' && renderDatabase()}
          
          {activeTab === 'STATS' && renderStats()}

          {activeTab === 'AUTO' && (
            <div className="space-y-6 pb-24">
              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col md:flex-row items-center justify-between gap-4">
                <div><h3 className="text-lg font-bold text-white">Generatore / Scaletta</h3><p className="text-slate-400 text-sm">Ordina la scaletta. Clicca "Live Mode" per avviare lo show.</p></div>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="relative">
                        <input 
                            type="number" 
                            min="3" 
                            max="10"
                            placeholder="Auto" 
                            value={desiredBandSize}
                            onChange={(e) => setDesiredBandSize(e.target.value)}
                            className="w-20 bg-slate-900 border border-slate-600 rounded-lg px-3 py-4 text-center text-white font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                        <span className="absolute -top-2 left-2 px-1 bg-slate-800 text-[10px] text-slate-400">Membri</span>
                    </div>
                    <button onClick={handleAddAutoBand} className={`flex items-center px-6 py-4 font-bold rounded-full shadow-lg transition transform ${users.length < 3 ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:scale-105'}`}>
                        <Plus className="w-6 h-6 mr-2" /> 
                        <span className="whitespace-nowrap">Aggiungi Band Random</span>
                    </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{bands.map((band, idx) => renderBandCard(band, idx, true, false))}</div>
              {bands.length === 0 && <div className="text-center py-20"><Music className="w-16 h-16 mx-auto text-slate-700 mb-4" /><p className="text-slate-500 text-lg">Nessuna formazione presente.</p></div>}
            </div>
          )}
          {activeTab === 'MANUAL' && (
            <div className="space-y-8 pb-24">
              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex items-center justify-between mb-6">
                <div><h3 className="text-lg font-bold text-white">Crea Band Manuale</h3><p className="text-slate-400 text-sm">Crea e modifica band specificando i ruoli.</p></div>
                <button onClick={handleAddManualBand} className="flex items-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 transition shadow-lg"><Plus className="w-5 h-5 mr-2" /> Aggiungi Band</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{bands.map((band, idx) => renderBandCard(band, idx, true, true))}</div>
              {bands.length === 0 && <div className="text-center py-12 text-slate-500">Non ci sono band.</div>}
            </div>
          )}
        </div>
      </div>

      {(activeTab === 'MANUAL' || activeTab === 'AUTO') && (
        <div 
          className={`fixed bottom-8 left-0 right-0 mx-auto w-64 h-32 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all duration-300 z-50 ${isDragging ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-20 opacity-0 pointer-events-none'} ${isOverTrash ? 'bg-red-900/80 border-red-400 scale-110 shadow-[0_0_30px_rgba(220,38,38,0.6)]' : 'bg-slate-800/90 border-slate-500 shadow-2xl backdrop-blur-md'}`}
          onDragOver={handleTrashDragEnter}
          onDragLeave={handleTrashDragLeave}
          onDrop={handleTrashDrop}
        >
           <Trash2 className={`w-10 h-10 mb-2 transition-colors pointer-events-none ${isOverTrash ? 'text-white animate-bounce' : 'text-slate-400'}`}/>
           <span className={`font-bold pointer-events-none ${isOverTrash ? 'text-white' : 'text-slate-400'}`}>{isOverTrash ? 'Rilascia per eliminare!' : 'Trascina qui per eliminare'}</span>
        </div>
      )}
    </div>
  );
};