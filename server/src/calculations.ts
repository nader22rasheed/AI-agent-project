import { CalculatedData, SessionInputData } from "./types.js";

const FP_WEIGHTS = {
  EI: { low: 3, avg: 4, high: 6 },
  EO: { low: 4, avg: 5, high: 7 },
  EQ: { low: 3, avg: 4, high: 6 },
  ILF: { low: 7, avg: 10, high: 15 },
  EIF: { low: 5, avg: 7, high: 10 }
} as const;

const UCP_ACTOR_WEIGHTS = { simple: 1, avg: 2, complex: 3 } as const;
const UCP_USE_CASE_WEIGHTS = { simple: 5, avg: 10, complex: 15 } as const;

export const TCF_WEIGHTS = [2, 1, 1, 1, 1, 0.5, 0.5, 2, 1, 1, 1, 1, 1];
export const EF_WEIGHTS = [1.5, 0.5, 1, 0.5, 1, 2, -1, -1];

const round = (value: number) => Number(value.toFixed(2));

const classifySize = (value: number) => {
  if (value < 100) return "low";
  if (value < 300) return "medium";
  return "high";
};

export const calculateEstimates = (input: SessionInputData): CalculatedData => {
  const ufp =
    input.fp.counts.EI.low * FP_WEIGHTS.EI.low +
    input.fp.counts.EI.avg * FP_WEIGHTS.EI.avg +
    input.fp.counts.EI.high * FP_WEIGHTS.EI.high +
    input.fp.counts.EO.low * FP_WEIGHTS.EO.low +
    input.fp.counts.EO.avg * FP_WEIGHTS.EO.avg +
    input.fp.counts.EO.high * FP_WEIGHTS.EO.high +
    input.fp.counts.EQ.low * FP_WEIGHTS.EQ.low +
    input.fp.counts.EQ.avg * FP_WEIGHTS.EQ.avg +
    input.fp.counts.EQ.high * FP_WEIGHTS.EQ.high +
    input.fp.counts.ILF.low * FP_WEIGHTS.ILF.low +
    input.fp.counts.ILF.avg * FP_WEIGHTS.ILF.avg +
    input.fp.counts.ILF.high * FP_WEIGHTS.ILF.high +
    input.fp.counts.EIF.low * FP_WEIGHTS.EIF.low +
    input.fp.counts.EIF.avg * FP_WEIGHTS.EIF.avg +
    input.fp.counts.EIF.high * FP_WEIGHTS.EIF.high;

  const di = input.fp.gscRatings.reduce((sum, rating) => sum + rating, 0);
  const vaf = 0.65 + 0.01 * di;
  const afp = ufp * vaf;

  const uaw =
    input.ucp.actors.simple * UCP_ACTOR_WEIGHTS.simple +
    input.ucp.actors.avg * UCP_ACTOR_WEIGHTS.avg +
    input.ucp.actors.complex * UCP_ACTOR_WEIGHTS.complex;

  const uucw =
    input.ucp.useCases.simple * UCP_USE_CASE_WEIGHTS.simple +
    input.ucp.useCases.avg * UCP_USE_CASE_WEIGHTS.avg +
    input.ucp.useCases.complex * UCP_USE_CASE_WEIGHTS.complex;

  const uucp = uaw + uucw;
  const tcfFactor = input.ucp.tcfRatings.reduce(
    (sum, rating, index) => sum + rating * TCF_WEIGHTS[index],
    0
  );
  const efFactor = input.ucp.efRatings.reduce(
    (sum, rating, index) => sum + rating * EF_WEIGHTS[index],
    0
  );

  const tcf = 0.6 + 0.01 * tcfFactor;
  const ef = 1.4 + -0.03 * efFactor;
  const ucp = uucp * tcf * ef;

  const effortHoursFP = afp * input.economics.hoursPerFP;
  const effortHoursUCP = ucp * input.economics.hoursPerUCP;

  const personMonthsFP = effortHoursFP / input.economics.hoursPerPersonMonth;
  const personMonthsUCP = effortHoursUCP / input.economics.hoursPerPersonMonth;

  return {
    fp: {
      ufp: round(ufp),
      di: round(di),
      vaf: round(vaf),
      afp: round(afp)
    },
    ucp: {
      uaw: round(uaw),
      uucw: round(uucw),
      uucp: round(uucp),
      tcf: round(tcf),
      ef: round(ef),
      ucp: round(ucp)
    },
    effort: {
      effortHoursFP: round(effortHoursFP),
      effortHoursUCP: round(effortHoursUCP),
      costHourlyFP: round(effortHoursFP * input.economics.hourlyRate),
      costHourlyUCP: round(effortHoursUCP * input.economics.hourlyRate),
      personMonthsFP: round(personMonthsFP),
      personMonthsUCP: round(personMonthsUCP),
      costPersonMonthFP: round(personMonthsFP * input.economics.personMonthCost),
      costPersonMonthUCP: round(personMonthsUCP * input.economics.personMonthCost)
    },
    classifications: {
      fpSize: classifySize(afp),
      ucpSize: classifySize(ucp)
    }
  };
};
