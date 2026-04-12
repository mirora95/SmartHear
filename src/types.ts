export type SoundEvent = {
  id: string;
  name: string;
  decibels: number;
  timestamp: number;
  type: 'safe' | 'warning' | 'danger';
};

export type AppState = {
  sensitivity: number;
  isSleepMode: boolean;
  isMonitoring: boolean;
  history: SoundEvent[];
};

export type SoundType = 'baby crying' | 'dog barking' | 'siren' | 'alarm' | 'door knock' | 'human speech' | 'loud noise' | 'quiet';
