export interface SDLCPhase {
  name: string;
  completed: boolean;
}

export interface Release {
  id?: string;
  changeSummary: string;
  deploymentTime: Date;
  screenshotUrl?: string;
  sdlcPhases?: SDLCPhase[];
  createdAt?: Date;
  updatedAt?: Date;
}


