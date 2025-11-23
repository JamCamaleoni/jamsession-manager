import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, InstrumentType } from '../types';
import { INSTRUMENTS, ADMIN_CREDENTIALS, AVATAR_OPTIONS } from '../constants';
import { Mic, Guitar, Drum, Piano, MoreHorizontal, ArrowLeft, Check, Mail, Phone, Instagram, Facebook, Twitter } from 'lucide-react';

interface RegistrationProps {
  navigate: (path: string) => void;
  onRegister: (user: User) => void;
}

export const Registration: React.FC<RegistrationProps> = ({ navigate, onRegister }) => {
  // Personal Info
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  
  // Avatar
  const [selectedAvatarSeed, setSelectedAvatarSeed] = useState<string>(AVATAR_OPTIONS[0].seed);

  // Instruments (Multi-select)
  const [selectedInstruments, setSelectedInstruments] = useState<InstrumentType[]>([]);
  const [customInstrument, setCustomInstrument] = useState('');

  // Contacts
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [x, setX] = useState('');

  const toggleInstrument = (type: InstrumentType) => {
    setSelectedInstruments(prev => {
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
      } else {
        return [...prev, type];
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Backdoor Check
    if (
      firstName.trim().toLowerCase() === ADMIN_CREDENTIALS.firstName &&
      lastName.trim().toLowerCase() === ADMIN_CREDENTIALS.lastName
    ) {
      navigate('/admin');
      return;
    }

    if (!firstName || !lastName || !username) {
      alert('Per favori compila nome, cognome e nome utente.');
      return;
    }

    if (selectedInstruments.length === 0) {
      alert('Per favori seleziona almeno uno strumento.');
      return;
    }

    if (selectedInstruments.includes(InstrumentType.OTHER) && !customInstrument) {
      alert('Per favori specifica lo strumento in "Altro".');
      return;
    }

    const newUser: User = {
      id: Date.now().toString(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      username: username.trim(),
      instruments: selectedInstruments,
      customInstrument: selectedInstruments.includes(InstrumentType.OTHER) ? customInstrument.trim() : undefined,
      email: email.trim() || undefined,
      phoneNumber: phoneNumber.trim() || undefined,
      instagram: instagram.trim() || undefined,
      facebook: facebook.trim() || undefined,
      x: x.trim() || undefined,
      createdAt: Date.now(),
      status: 'ACTIVE',
      avatarSeed: selectedAvatarSeed
    };

    onRegister(newUser);
    navigate('/');
    alert('Iscrizione completata con successo!');
  };

  const getIcon = (type: InstrumentType) => {
    switch (type) {
      case InstrumentType.VOICE: return <Mic className="w-6 h-6" />;
      case InstrumentType.GUITAR: return <Guitar className="w-6 h-6" />;
      case InstrumentType.BASS: return <Guitar className="w-6 h-6" />;
      case InstrumentType.DRUMS: return <Drum className="w-6 h-6" />;
      case InstrumentType.KEYS: return <Piano className="w-6 h-6" />;
      case InstrumentType.OTHER: return <MoreHorizontal className="w-6 h-6" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700 my-8">
        
        <button 
          onClick={() => navigate('/')}
          className="flex items-center text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Torna alla Home
        </button>

        <h2 className="text-3xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-pink-400">
          Iscriviti alla Jam
        </h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Sezione Avatar */}
          <div className="space-y-4">
             <h3 className="text-lg font-semibold text-slate-300 border-b border-slate-700 pb-2">Scegli il tuo Avatar</h3>
             <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
               {AVATAR_OPTIONS.map((opt) => (
                 <div 
                   key={opt.id}
                   onClick={() => setSelectedAvatarSeed(opt.seed)}
                   className={`cursor-pointer rounded-full p-1 border-2 transition-all ${selectedAvatarSeed === opt.seed ? 'border-indigo-500 bg-indigo-500/20 scale-110' : 'border-transparent hover:bg-slate-700'}`}
                 >
                    <img 
                      src={`https://api.dicebear.com/9.x/adventurer/svg?seed=${opt.seed}`} 
                      alt={opt.label} 
                      className="w-full h-auto rounded-full bg-slate-700"
                    />
                 </div>
               ))}
             </div>
          </div>

          {/* Sezione Dati Personali */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-300 border-b border-slate-700 pb-2">Dati Personali</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Nome *</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  placeholder="Mario"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Cognome *</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  placeholder="Rossi"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Nome Utente (Stage Name) *</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                placeholder="Rocker99"
              />
            </div>
          </div>

          {/* Sezione Strumenti */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-300 border-b border-slate-700 pb-2">Strumenti *</h3>
            <p className="text-sm text-slate-400">Seleziona uno o più strumenti che vuoi suonare.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {INSTRUMENTS.map((inst) => {
                const isSelected = selectedInstruments.includes(inst.type);
                return (
                  <button
                    key={inst.type}
                    type="button"
                    onClick={() => toggleInstrument(inst.type)}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200 ${
                      isSelected
                        ? 'bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-500/30 scale-[1.02]'
                        : 'bg-slate-900 border-slate-700 hover:border-slate-500 hover:bg-slate-800'
                    }`}
                  >
                    <span className={`mb-2 ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                      {getIcon(inst.type)}
                    </span>
                    <span className="text-sm font-medium">{inst.label}</span>
                  </button>
                );
              })}
            </div>
            
            {selectedInstruments.includes(InstrumentType.OTHER) && (
              <div className="animate-fade-in mt-4">
                <label className="block text-sm font-medium text-slate-400 mb-1">Specifica Strumento "Altro"</label>
                <input
                  type="text"
                  value={customInstrument}
                  onChange={(e) => setCustomInstrument(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder="Es. Sax, Violino, Triangolo..."
                />
              </div>
            )}
          </div>

          {/* Sezione Contatti */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-300 border-b border-slate-700 pb-2">Contatti (Opzionali)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center text-sm font-medium text-slate-400 mb-1">
                  <Mail className="w-4 h-4 mr-2" /> Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="nome@esempio.com"
                />
              </div>
              <div>
                <label className="flex items-center text-sm font-medium text-slate-400 mb-1">
                  <Phone className="w-4 h-4 mr-2" /> Telefono
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="+39 333 ..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div>
                <label className="flex items-center text-sm font-medium text-slate-400 mb-1">
                  <Instagram className="w-4 h-4 mr-2" /> Instagram
                </label>
                <input
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="@username"
                />
              </div>
              <div>
                <label className="flex items-center text-sm font-medium text-slate-400 mb-1">
                  <Facebook className="w-4 h-4 mr-2" /> Facebook
                </label>
                <input
                  type="text"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Profile link/name"
                />
              </div>
              <div>
                <label className="flex items-center text-sm font-medium text-slate-400 mb-1">
                  <Twitter className="w-4 h-4 mr-2" /> X
                </label>
                <input
                  type="text"
                  value={x}
                  onChange={(e) => setX(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="@handle"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold py-4 rounded-xl shadow-lg transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center mt-8"
          >
            <span>Conferma Iscrizione</span>
            <Check className="w-5 h-5 ml-2" />
          </button>
        </form>
      </div>
    </div>
  );
};