import { describe, expect, it } from "vitest";
import { calculateEstimates } from "./calculations.js";
import { defaultInputData } from "./defaults.js";

describe("calculateEstimates", () => {
  it("computes FP and UCP values using required formulas", () => {
    const input = defaultInputData();
    input.fp.counts.EI = { low: 2, avg: 3, high: 1 };
    input.fp.counts.EO = { low: 1, avg: 2, high: 1 };
    input.fp.counts.EQ = { low: 1, avg: 1, high: 0 };
    input.fp.counts.ILF = { low: 1, avg: 1, high: 1 };
    input.fp.counts.EIF = { low: 2, avg: 0, high: 1 };
    input.fp.gscRatings = [3, 2, 4, 1, 2, 3, 1, 2, 4, 2, 1, 3, 2, 1];

    input.ucp.actors = { simple: 4, avg: 2, complex: 1 };
    input.ucp.useCases = { simple: 3, avg: 4, complex: 2 };
    input.ucp.tcfRatings = [3, 2, 1, 2, 4, 2, 1, 3, 2, 1, 2, 3, 1];
    input.ucp.efRatings = [2, 1, 3, 2, 4, 1, 2, 1];

    input.economics.hoursPerFP = 10;
    input.economics.hoursPerUCP = 18;
    input.economics.hourlyRate = 60;
    input.economics.personMonthCost = 9000;
    input.economics.hoursPerPersonMonth = 160;

    const result = calculateEstimates(input);

    expect(result.fp.ufp).toBe(104);
    expect(result.fp.di).toBe(31);
    expect(result.fp.vaf).toBe(0.96);
    expect(result.fp.afp).toBe(99.84);

    expect(result.ucp.uaw).toBe(11);
    expect(result.ucp.uucw).toBe(85);
    expect(result.ucp.uucp).toBe(96);
    expect(result.ucp.tcf).toBe(0.92);
    expect(result.ucp.ef).toBe(1.08);
    expect(result.ucp.ucp).toBe(95.31);

    expect(result.effort.effortHoursFP).toBe(998.4);
    expect(result.effort.effortHoursUCP).toBe(1715.52);
    expect(result.effort.costHourlyFP).toBe(59904);
    expect(result.effort.costHourlyUCP).toBe(102930.91);
    expect(result.effort.personMonthsFP).toBe(6.24);
    expect(result.effort.personMonthsUCP).toBe(10.72);
    expect(result.effort.costPersonMonthFP).toBe(56160);
    expect(result.effort.costPersonMonthUCP).toBe(96497.73);
  });
});
