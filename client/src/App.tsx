import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import "./App.css";
import type { SessionDto, SessionInputData } from "./types";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:4000";
const SESSION_KEY = "estimation-session-id";

const fpTypes = ["EI", "EO", "EQ", "ILF", "EIF"] as const;
const stepCount = 10;

const inputNumber = (value: number, onChange: (v: number) => void, min = 0, max?: number) => (
  <input
    type="number"
    min={min}
    max={max}
    value={value}
    onChange={(e) => onChange(Number(e.target.value || 0))}
  />
);

function App() {
  const { t, i18n } = useTranslation();
  const [session, setSession] = useState<SessionDto | null>(null);
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [frozenNotice, setFrozenNotice] = useState("");

  const isArabic = i18n.language === "ar";

  const steps = t("steps", { returnObjects: true }) as string[];
  const prompts = t("prompts", { returnObjects: true }) as string[];

  useEffect(() => {
    const init = async () => {
      const existingId = localStorage.getItem(SESSION_KEY);
      if (existingId) {
        const fetched = await fetch(`${API}/api/sessions/${existingId}`);
        if (fetched.ok) {
          setSession(await fetched.json());
          return;
        }
      }

      const created = await fetch(`${API}/api/sessions`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
      const createdSession = await created.json();
      localStorage.setItem(SESSION_KEY, createdSession.id);
      setSession(createdSession);
    };

    init().catch(console.error);
  }, []);

  const inputData = session?.inputData as SessionInputData | undefined;

  const patchInput = (updater: (draft: SessionInputData) => void) => {
    if (!session || !inputData) return;
    const clone: SessionInputData = JSON.parse(JSON.stringify(inputData));
    updater(clone);
    setSession({ ...session, inputData: clone });
  };

  const save = async () => {
    if (!session) return;
    setBusy(true);
    try {
      const response = await fetch(`${API}/api/sessions/${session.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputData: session.inputData })
      });
      setSession(await response.json());
    } finally {
      setBusy(false);
    }
  };

  const calculate = async () => {
    if (!session) return;
    setBusy(true);
    try {
      await save();
      const response = await fetch(`${API}/api/sessions/${session.id}/calculate`, { method: "POST" });
      setSession(await response.json());
    } finally {
      setBusy(false);
    }
  };

  const freeze = async () => {
    if (!session) return;
    setBusy(true);
    try {
      await save();
      await fetch(`${API}/api/sessions/${session.id}/freeze`, { method: "POST" });
      const refreshed = await fetch(`${API}/api/sessions/${session.id}`);
      setSession(await refreshed.json());
      setFrozenNotice(t("frozen"));
    } finally {
      setBusy(false);
    }
  };

  const rowsForResults = useMemo(() => {
    if (!session?.calculatedData) return [] as Array<[string, number | string]>;
    const c = session.calculatedData;
    return [
      ["AFP", c.fp.afp],
      ["UCP", c.ucp.ucp],
      ["EffortHours FP", c.effort.effortHoursFP],
      ["EffortHours UCP", c.effort.effortHoursUCP],
      ["CostHourly FP", c.effort.costHourlyFP],
      ["CostHourly UCP", c.effort.costHourlyUCP],
      ["CostPersonMonth FP", c.effort.costPersonMonthFP],
      ["CostPersonMonth UCP", c.effort.costPersonMonthUCP],
      ["FP Size", c.classifications.fpSize],
      ["UCP Size", c.classifications.ucpSize]
    ];
  }, [session?.calculatedData]);

  if (!session || !inputData) return <div className="container">Loading...</div>;

  return (
    <div className={`container ${isArabic ? "rtl" : ""}`}>
      <header>
        <h1>{t("appTitle")}</h1>
        <label>
          {t("language")}
          <select value={i18n.language} onChange={(e) => i18n.changeLanguage(e.target.value)}>
            <option value="en">English</option>
            <option value="ar">العربية</option>
          </select>
        </label>
      </header>

      <div className="chat">
        <div className="assistant-bubble">
          <strong>{t("assistant")}: </strong>
          {prompts[step]}
        </div>
        <div className="step-name">{steps[step]}</div>
      </div>

      <section className="card">
        {step === 0 && (
          <div className="grid2">
            <label>{t("projectName")}<input value={inputData.project.name} onChange={(e) => patchInput((d) => { d.project.name = e.target.value; })} /></label>
            <label>{t("domain")}<input value={inputData.project.domain} onChange={(e) => patchInput((d) => { d.project.domain = e.target.value; })} /></label>
            <label>{t("description")}<textarea value={inputData.project.description} onChange={(e) => patchInput((d) => { d.project.description = e.target.value; })} /></label>
            <label>{t("targetUsers")}<input value={inputData.project.targetUsers} onChange={(e) => patchInput((d) => { d.project.targetUsers = e.target.value; })} /></label>
            <label>{t("platforms")}<input value={inputData.project.platforms.join(", ")} onChange={(e) => patchInput((d) => { d.project.platforms = e.target.value.split(",").map((x) => x.trim()).filter(Boolean); })} /></label>
            <label>{t("assumptions")}<textarea value={inputData.project.assumptions} onChange={(e) => patchInput((d) => { d.project.assumptions = e.target.value; })} /></label>
          </div>
        )}

        {step === 1 && (
          <table>
            <thead><tr><th>Type</th><th>{t("low")}</th><th>{t("avg")}</th><th>{t("high")}</th></tr></thead>
            <tbody>
              {fpTypes.map((type) => (
                <tr key={type}>
                  <td>{type}</td>
                  <td>{inputNumber(inputData.fp.counts[type].low, (v) => patchInput((d) => { d.fp.counts[type].low = v; }))}</td>
                  <td>{inputNumber(inputData.fp.counts[type].avg, (v) => patchInput((d) => { d.fp.counts[type].avg = v; }))}</td>
                  <td>{inputNumber(inputData.fp.counts[type].high, (v) => patchInput((d) => { d.fp.counts[type].high = v; }))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {step === 2 && (
          <div className="ratings">
            {inputData.fp.gscRatings.map((value, i) => (
              <label key={i}>GSC {i + 1}{inputNumber(value, (v) => patchInput((d) => { d.fp.gscRatings[i] = v; }), 0, 5)}</label>
            ))}
          </div>
        )}

        {step === 3 && (
          <div className="grid2">
            <h3>Actors</h3>
            <div className="inline3">
              <label>{t("simple")}{inputNumber(inputData.ucp.actors.simple, (v) => patchInput((d) => { d.ucp.actors.simple = v; }))}</label>
              <label>{t("avg")}{inputNumber(inputData.ucp.actors.avg, (v) => patchInput((d) => { d.ucp.actors.avg = v; }))}</label>
              <label>{t("complex")}{inputNumber(inputData.ucp.actors.complex, (v) => patchInput((d) => { d.ucp.actors.complex = v; }))}</label>
            </div>
            <h3>Use Cases</h3>
            <div className="inline3">
              <label>{t("simple")}{inputNumber(inputData.ucp.useCases.simple, (v) => patchInput((d) => { d.ucp.useCases.simple = v; }))}</label>
              <label>{t("avg")}{inputNumber(inputData.ucp.useCases.avg, (v) => patchInput((d) => { d.ucp.useCases.avg = v; }))}</label>
              <label>{t("complex")}{inputNumber(inputData.ucp.useCases.complex, (v) => patchInput((d) => { d.ucp.useCases.complex = v; }))}</label>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="ratings">
            {inputData.ucp.tcfRatings.map((value, i) => (
              <label key={i}>TCF {i + 1}{inputNumber(value, (v) => patchInput((d) => { d.ucp.tcfRatings[i] = v; }), 0, 5)}</label>
            ))}
          </div>
        )}

        {step === 5 && (
          <div className="ratings">
            {inputData.ucp.efRatings.map((value, i) => (
              <label key={i}>EF {i + 1}{inputNumber(value, (v) => patchInput((d) => { d.ucp.efRatings[i] = v; }), 0, 5)}</label>
            ))}
          </div>
        )}

        {step === 6 && (
          <div className="grid2">
            <label>{t("currency")}<input value={inputData.economics.currency} onChange={(e) => patchInput((d) => { d.economics.currency = e.target.value || "USD"; })} /></label>
            <label>{t("hourlyRate")}{inputNumber(inputData.economics.hourlyRate, (v) => patchInput((d) => { d.economics.hourlyRate = v; }))}</label>
            <label>{t("personMonthCost")}{inputNumber(inputData.economics.personMonthCost, (v) => patchInput((d) => { d.economics.personMonthCost = v; }))}</label>
            <label>{t("hoursPerFP")}{inputNumber(inputData.economics.hoursPerFP, (v) => patchInput((d) => { d.economics.hoursPerFP = v; }))}</label>
            <label>{t("hoursPerUCP")}{inputNumber(inputData.economics.hoursPerUCP, (v) => patchInput((d) => { d.economics.hoursPerUCP = v; }))}</label>
            <label>{t("hoursPerPersonMonth")}{inputNumber(inputData.economics.hoursPerPersonMonth, (v) => patchInput((d) => { d.economics.hoursPerPersonMonth = v; }), 1)}</label>
            <label>{t("teamSize")}{inputNumber(inputData.economics.teamSize ?? 0, (v) => patchInput((d) => { d.economics.teamSize = v; }))}</label>
          </div>
        )}

        {step === 7 && (
          <div>
            <button onClick={calculate} disabled={busy}>{t("calculate")}</button>
            <table>
              <tbody>
                {rowsForResults.map(([label, value]) => <tr key={label}><th>{label}</th><td>{value}</td></tr>)}
              </tbody>
            </table>
          </div>
        )}

        {step === 8 && (
          <div>
            <button onClick={freeze} disabled={busy}>{t("freeze")}</button>
            {frozenNotice && <p>{frozenNotice}</p>}
          </div>
        )}

        {step === 9 && (
          <a href={`${API}/api/sessions/${session.id}/report.pdf`} target="_blank" rel="noreferrer">
            <button>{t("download")}</button>
          </a>
        )}
      </section>

      <footer>
        <button disabled={step === 0 || busy} onClick={() => setStep((s) => Math.max(0, s - 1))}>{t("back")}</button>
        <button onClick={save} disabled={busy}>{t("save")}</button>
        <button disabled={step === stepCount - 1 || busy} onClick={() => setStep((s) => Math.min(stepCount - 1, s + 1))}>{t("next")}</button>
      </footer>
    </div>
  );
}

export default App;
