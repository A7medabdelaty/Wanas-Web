export interface Breakdown {
    cityMatch: boolean;
    ageCompatible: boolean;
    budgetCompatible: boolean;
    genderMatch: boolean;
    smokingCompatible: boolean;
    petsCompatible: boolean;
    sleepScheduleMatch: boolean;
    socialLevelMatch: boolean;
    noiseToleranceMatch: boolean;
}

export interface MatchResult {
    targetUserId: string;
    fullName: string;
    city: string;
    age: number;
    photo: string | null;
    score: number;
    percentage: number;
    gender:string;
    breakdown: Breakdown;
}
