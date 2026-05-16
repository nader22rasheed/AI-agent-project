import "dotenv/config";
import express from "express";
import cors from "cors";
import { prisma } from "./prisma.js";
import { defaultInputData } from "./defaults.js";
import { mergeInputData } from "./merge.js";
import { calculateEstimates } from "./calculations.js";
import { generateArabicPdf, buildArabicReportHtml } from "./pdf.js";
import { SessionInputData } from "./types.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/sessions", async (req, res) => {
  const initial = mergeInputData(defaultInputData(), req.body?.inputData ?? {});
  const session = await prisma.session.create({
    data: { inputData: initial }
  });
  res.status(201).json(session);
});

app.get("/api/sessions/:id", async (req, res) => {
  const session = await prisma.session.findUnique({
    where: { id: req.params.id },
    include: {
      frozenEstimates: {
        orderBy: { createdAt: "desc" },
        take: 1
      }
    }
  });

  if (!session) {
    res.status(404).json({ message: "Session not found" });
    return;
  }

  res.json(session);
});

app.put("/api/sessions/:id", async (req, res) => {
  const session = await prisma.session.findUnique({ where: { id: req.params.id } });
  if (!session) {
    res.status(404).json({ message: "Session not found" });
    return;
  }

  const currentInput = session.inputData as SessionInputData;
  const nextInput = mergeInputData(currentInput, req.body?.inputData ?? {});

  const updated = await prisma.session.update({
    where: { id: req.params.id },
    data: { inputData: nextInput }
  });

  res.json(updated);
});

app.post("/api/sessions/:id/calculate", async (req, res) => {
  const session = await prisma.session.findUnique({ where: { id: req.params.id } });
  if (!session) {
    res.status(404).json({ message: "Session not found" });
    return;
  }

  const inputData = session.inputData as SessionInputData;
  const calculatedData = calculateEstimates(inputData);

  const updated = await prisma.session.update({
    where: { id: req.params.id },
    data: { calculatedData }
  });

  res.json(updated);
});

app.post("/api/sessions/:id/freeze", async (req, res) => {
  const session = await prisma.session.findUnique({ where: { id: req.params.id } });
  if (!session) {
    res.status(404).json({ message: "Session not found" });
    return;
  }

  const inputData = session.inputData as SessionInputData;
  const calculatedData = (session.calculatedData as ReturnType<typeof calculateEstimates> | null) ??
    calculateEstimates(inputData);

  await prisma.$transaction([
    prisma.session.update({
      where: { id: req.params.id },
      data: {
        isFrozen: true,
        calculatedData
      }
    }),
    prisma.frozenEstimate.create({
      data: {
        sessionId: req.params.id,
        snapshot: {
          inputData,
          calculatedData,
          timestamp: new Date().toISOString()
        }
      }
    })
  ]);

  const latest = await prisma.frozenEstimate.findFirst({
    where: { sessionId: req.params.id },
    orderBy: { createdAt: "desc" }
  });

  res.status(201).json(latest);
});

app.get("/api/sessions/:id/report.pdf", async (req, res) => {
  const frozen = await prisma.frozenEstimate.findFirst({
    where: { sessionId: req.params.id },
    orderBy: { createdAt: "desc" }
  });

  if (!frozen) {
    res.status(400).json({ message: "No frozen estimate found. Freeze first." });
    return;
  }

  const snapshot = frozen.snapshot as {
    inputData: SessionInputData;
    calculatedData: ReturnType<typeof calculateEstimates>;
    timestamp: string;
  };

  const html = buildArabicReportHtml(req.params.id, snapshot.inputData, snapshot.calculatedData, snapshot.timestamp);
  const pdf = await generateArabicPdf(html);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=estimate-${req.params.id}.pdf`);
  res.send(pdf);
});

const port = Number(process.env.PORT ?? 4000);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
