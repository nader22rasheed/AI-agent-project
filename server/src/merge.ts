import { SessionInputData } from "./types.js";

const clampRating = (value: number) => Math.max(0, Math.min(5, value));
const nonNegative = (value: number) => Math.max(0, Number.isFinite(value) ? value : 0);

export const mergeInputData = (
  current: SessionInputData,
  patch: Partial<SessionInputData>
): SessionInputData => {
  const merged: SessionInputData = {
    ...current,
    ...patch,
    project: {
      ...current.project,
      ...patch.project,
      platforms: patch.project?.platforms ?? current.project.platforms
    },
    fp: {
      counts: {
        EI: { ...current.fp.counts.EI, ...patch.fp?.counts?.EI },
        EO: { ...current.fp.counts.EO, ...patch.fp?.counts?.EO },
        EQ: { ...current.fp.counts.EQ, ...patch.fp?.counts?.EQ },
        ILF: { ...current.fp.counts.ILF, ...patch.fp?.counts?.ILF },
        EIF: { ...current.fp.counts.EIF, ...patch.fp?.counts?.EIF }
      },
      gscRatings: patch.fp?.gscRatings ?? current.fp.gscRatings
    },
    ucp: {
      actors: { ...current.ucp.actors, ...patch.ucp?.actors },
      useCases: { ...current.ucp.useCases, ...patch.ucp?.useCases },
      tcfRatings: patch.ucp?.tcfRatings ?? current.ucp.tcfRatings,
      efRatings: patch.ucp?.efRatings ?? current.ucp.efRatings
    },
    economics: {
      ...current.economics,
      ...patch.economics
    }
  };

  for (const type of ["EI", "EO", "EQ", "ILF", "EIF"] as const) {
    merged.fp.counts[type].low = nonNegative(merged.fp.counts[type].low);
    merged.fp.counts[type].avg = nonNegative(merged.fp.counts[type].avg);
    merged.fp.counts[type].high = nonNegative(merged.fp.counts[type].high);
  }

  merged.fp.gscRatings = merged.fp.gscRatings.slice(0, 14).map(clampRating);
  while (merged.fp.gscRatings.length < 14) merged.fp.gscRatings.push(0);

  for (const key of ["simple", "avg", "complex"] as const) {
    merged.ucp.actors[key] = nonNegative(merged.ucp.actors[key]);
    merged.ucp.useCases[key] = nonNegative(merged.ucp.useCases[key]);
  }

  merged.ucp.tcfRatings = merged.ucp.tcfRatings.slice(0, 13).map(clampRating);
  while (merged.ucp.tcfRatings.length < 13) merged.ucp.tcfRatings.push(0);

  merged.ucp.efRatings = merged.ucp.efRatings.slice(0, 8).map(clampRating);
  while (merged.ucp.efRatings.length < 8) merged.ucp.efRatings.push(0);

  merged.economics.hourlyRate = nonNegative(merged.economics.hourlyRate);
  merged.economics.personMonthCost = nonNegative(merged.economics.personMonthCost);
  merged.economics.hoursPerFP = nonNegative(merged.economics.hoursPerFP);
  merged.economics.hoursPerUCP = nonNegative(merged.economics.hoursPerUCP);
  merged.economics.hoursPerPersonMonth = Math.max(
    1,
    nonNegative(merged.economics.hoursPerPersonMonth)
  );

  if (merged.economics.teamSize !== undefined) {
    merged.economics.teamSize = nonNegative(merged.economics.teamSize);
  }

  return merged;
};
