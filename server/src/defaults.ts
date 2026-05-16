import { SessionInputData } from "./types.js";

const emptyComplexity = { low: 0, avg: 0, high: 0 };

export const defaultInputData = (): SessionInputData => ({
  project: {
    name: "",
    description: "",
    domain: "",
    targetUsers: "",
    platforms: [],
    assumptions: ""
  },
  fp: {
    counts: {
      EI: { ...emptyComplexity },
      EO: { ...emptyComplexity },
      EQ: { ...emptyComplexity },
      ILF: { ...emptyComplexity },
      EIF: { ...emptyComplexity }
    },
    gscRatings: Array.from({ length: 14 }, () => 0)
  },
  ucp: {
    actors: { simple: 0, avg: 0, complex: 0 },
    useCases: { simple: 0, avg: 0, complex: 0 },
    tcfRatings: Array.from({ length: 13 }, () => 0),
    efRatings: Array.from({ length: 8 }, () => 0)
  },
  economics: {
    currency: "USD",
    hourlyRate: 50,
    personMonthCost: 8000,
    hoursPerFP: 12,
    hoursPerUCP: 20,
    hoursPerPersonMonth: 160,
    teamSize: 5
  }
});
