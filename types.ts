export enum InstrumentType {
  VOICE = 'Voce',
  GUITAR = 'Chitarra',
  BASS = 'Basso',
  DRUMS = 'Batteria',
  KEYS = 'Tastiera',
  OTHER = 'Altro'
}

export type UserStatus = 'ACTIVE' | 'PAUSED';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  instruments: InstrumentType[]; // Changed to array for multi-selection
  customInstrument?: string; // Used if OTHER is selected
  
  // Property used ONLY when the user is inside a Band to indicate what they are playing
  assignedRole?: InstrumentType;
  
  status: UserStatus; // New: Handle breaks without deleting
  avatarSeed?: string; // New: For gamification avatars

  // Contact Info
  email?: string;
  phoneNumber?: string;
  instagram?: string;
  facebook?: string;
  x?: string;

  createdAt: number;
}

export interface Band {
  id: string;
  name: string;
  members: User[];
  isManual: boolean;
  startTime?: string;
  endTime?: string;
  durationMinutes?: number; // Duration target for the timer
}

export interface Game {
  id: string;
  title: string;
  description: string;
  icon: string; // Lucide icon name
  color: string; // Tailwind color class for background/accent
}

export type ViewState = 'HOME' | 'REGISTER' | 'ADMIN' | 'PROJECTOR';

// For the algorithm
export interface BandFormationRules {
  minSize: number;
  maxSize: number;
  totalSlots: number;
}