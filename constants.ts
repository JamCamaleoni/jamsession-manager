import { InstrumentType, Game } from './types';

export const INSTRUMENTS = [
  { type: InstrumentType.VOICE, label: 'Voce', icon: 'mic' },
  { type: InstrumentType.GUITAR, label: 'Chitarra', icon: 'guitar' },
  { type: InstrumentType.BASS, label: 'Basso', icon: 'guitar' },
  { type: InstrumentType.DRUMS, label: 'Batteria', icon: 'drum' },
  { type: InstrumentType.KEYS, label: 'Tastiera', icon: 'piano' },
  { type: InstrumentType.OTHER, label: 'Altro', icon: 'more' },
];

export const ADMIN_CREDENTIALS = {
  firstName: 'admin',
  lastName: 'password'
};

export const AVATAR_OPTIONS = [
  { id: 'av-1', seed: 'Felix', label: 'Rocker' },
  { id: 'av-2', seed: 'Aneka', label: 'Jazz' },
  { id: 'av-3', seed: 'Simba', label: 'Punk' },
  { id: 'av-4', seed: 'Jack', label: 'Metal' },
  { id: 'av-5', seed: 'Molly', label: 'Indie' },
  { id: 'av-6', seed: 'Bella', label: 'Pop' },
  { id: 'av-7', seed: 'Buster', label: 'Blues' },
  { id: 'av-8', seed: 'Sam', label: 'Folk' },
  { id: 'av-9', seed: 'Oliver', label: 'Soul' },
  { id: 'av-10', seed: 'Sophie', label: 'Grunge' },
  { id: 'av-11', seed: 'Lola', label: 'Classic' },
  { id: 'av-12', seed: 'Leo', label: 'Funk' },
];

export const BAND_NAMES = [
  "La Corazzata Pentatonica",
  "O Famo in Do?",
  "Supercazzola in Si Bemolle",
  "Ajeje Bandzorf",
  "Non ci resta che Plettrare",
  "Vieni avanti col Solo",
  "Febbre da Palco",
  "Attila Flagello del Jazz",
  "Totò, Peppino e la Melodia",
  "I Ragazzi della 3ª Corda",
  "A Qualcuno Piace Calante",
  "Frankensuon Junior",
  "The Blues Blathers",
  "Scemo & Più Stonato",
  "Monty Plettro",
  "Full Metal Jazz",
  "Ritorno al Ritornello",
  "Pulp Fiction & Tonic",
  "Forrest Funk",
  "Le Iene Ridens",
  "Aspettando il Bassista",
  "Molto Rumore per Nulla",
  "L'Importanza di essere Accordati",
  "Buona la Prima (Magari)",
  "I Soliti Accordi",
  "Accordi e Disaccordi",
  "Il Malato Immaginario del Rock",
  "Tutto quello che avreste voluto sapere sul Jazz",
  "Rumori Fuori Scena",
  "Birra Gratis"
];

export const GAMES: Game[] = [
  {
    id: 'game-hand',
    title: 'UNA MANO SOLA',
    description: 'Tutti i musicisti devono suonare utilizzando esclusivamente una mano (sinistra o destra a scelta).',
    icon: 'hand',
    color: 'from-pink-600 to-rose-600'
  },
  {
    id: 'game-foot',
    title: 'SU UN PIEDE SOLO',
    description: 'Bisogna suonare rimanendo in equilibrio su una gamba sola. Se tocchi terra, smetti di suonare per 5 secondi!',
    icon: 'footprints',
    color: 'from-amber-500 to-orange-600'
  }
];