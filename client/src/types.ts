export type ComplexityCounts = { low: number; avg: number; high: number };
export type UCPCounts = { simple: number; avg: number; complex: number };

export type SessionInputData = {
  project: {
    name: string;
    description: string;
    domain: string;
    targetUsers: string;
    platforms: string[];
    assumptions: string;
  };
  fp: {
    counts: {
      EI: ComplexityCounts;
      EO: ComplexityCounts;
      EQ: ComplexityCounts;
      ILF: ComplexityCounts;
      EIF: ComplexityCounts;
    };
    gscRatings: number[];
  };
  ucp: {
    actors: UCPCounts;
    useCases: UCPCounts;
    tcfRatings: number[];
    efRatings: number[];
  };
  economics: {
    currency: string;
    hourlyRate: number;
    personMonthCost: number;
    hoursPerFP: number;
    hoursPerUCP: number;
    hoursPerPersonMonth: number;
    teamSize?: number;
  };
};

export type CalculatedData = {
  fp: { ufp: number; di: number; vaf: number; afp: number };
  ucp: { uaw: number; uucw: number; uucp: number; tcf: number; ef: number; ucp: number };
  effort: {
    effortHoursFP: number;
    effortHoursUCP: number;
    costHourlyFP: number;
    costHourlyUCP: number;
    personMonthsFP: number;
    personMonthsUCP: number;
    costPersonMonthFP: number;
    costPersonMonthUCP: number;
  };
  classifications: { fpSize: string; ucpSize: string };
};

export type SessionDto = {
  id: string;
  inputData: SessionInputData;
  calculatedData?: CalculatedData;
  isFrozen: boolean;
};
