import React, { useMemo, useState } from "react";
import {
  Plus,
  Trash2,
  Copy,
  FileText,
  Calculator,
  Users,
  Printer,
  SlidersHorizontal,
} from "lucide-react";
import { motion } from "framer-motion";

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

const initialDifficulties = [
  { id: "dif-1", code: "1", name: "Simple", factor: 0.75 },
  { id: "dif-2", code: "2", name: "Normal", factor: 1.0 },
  { id: "dif-3", code: "3", name: "Compleja", factor: 1.5 },
  { id: "dif-4", code: "4", name: "Muy compleja", factor: 2.0 },
];

const initialRows = [
  {
    id: createId(),
    name: "Registro de usuarios",
    points: 8,
    difficultyId: "dif-2",
  },
  {
    id: createId(),
    name: "Gestión de proyectos",
    points: 13,
    difficultyId: "dif-3",
  },
  {
    id: createId(),
    name: "Generación de reportes",
    points: 10,
    difficultyId: "dif-3",
  },
];

function round(value, decimals = 2) {
  if (!Number.isFinite(value)) return 0;
  return Number(value.toFixed(decimals));
}

function positiveNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : fallback;
}

function positiveRequired(value, fallback = 1) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : fallback;
}

function formatMoney(value) {
  return Number(value || 0).toLocaleString("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function App() {
  const [projectName, setProjectName] = useState(
    "Sistema de gestión del proyecto",
  );
  const [clientName, setClientName] = useState("Cliente / área solicitante");
  const [difficulties, setDifficulties] = useState(initialDifficulties);
  const [rows, setRows] = useState(initialRows);
  const [productivity, setProductivity] = useState(20);
  const [availablePeople, setAvailablePeople] = useState(3);
  const [targetMonths, setTargetMonths] = useState(4);
  const [monthlyCostPerPerson, setMonthlyCostPerPerson] = useState(2500);
  const [marginPercent, setMarginPercent] = useState(30);
  const [copied, setCopied] = useState(false);

  const calculations = useMemo(() => {
    const safeProductivity = positiveRequired(productivity, 20);
    const safePeople = positiveRequired(availablePeople, 1);
    const safeTargetMonths = positiveRequired(targetMonths, 1);
    const safeMonthlyCost = positiveNumber(monthlyCostPerPerson, 0);
    const safeMargin = positiveNumber(marginPercent, 0);

    const totalFunctionPoints = rows.reduce(
      (acc, row) => acc + positiveNumber(row.points, 0),
      0,
    );

    const totalAdjustedPoints = rows.reduce((acc, row) => {
      const selectedDifficulty = difficulties.find(
        (difficulty) => difficulty.id === row.difficultyId,
      );
      const factor = positiveRequired(selectedDifficulty?.factor, 1);
      return acc + positiveNumber(row.points, 0) * factor;
    }, 0);

    const personMonths = totalAdjustedPoints / safeProductivity;
    const durationWithTeam = personMonths / safePeople;
    const requiredPeople = Math.ceil(personMonths / safeTargetMonths);
    const baseDevelopmentCost = safePeople * durationWithTeam * safeMonthlyCost;
    const suggestedCharge = baseDevelopmentCost * (1 + safeMargin / 100);

    return {
      totalFunctionPoints: round(totalFunctionPoints),
      totalAdjustedPoints: round(totalAdjustedPoints),
      personMonths: round(personMonths),
      durationWithTeam: round(durationWithTeam),
      requiredPeople,
      baseDevelopmentCost: round(baseDevelopmentCost),
      suggestedCharge: round(suggestedCharge),
    };
  }, [
    rows,
    difficulties,
    productivity,
    availablePeople,
    targetMonths,
    monthlyCostPerPerson,
    marginPercent,
  ]);

  const reportText = useMemo(() => {
    const NL = String.fromCharCode(10);

    const difficultyList = difficulties
      .map(
        (difficulty) =>
          `Dificultad ${difficulty.code}: ${difficulty.name}, factor ${difficulty.factor}.`,
      )
      .join(NL);

    const functionList = rows
      .map((row, index) => {
        const selectedDifficulty = difficulties.find(
          (difficulty) => difficulty.id === row.difficultyId,
        );
        const difficultyName = selectedDifficulty
          ? `Dificultad ${selectedDifficulty.code} - ${selectedDifficulty.name}`
          : "Dificultad no definida";
        const factor = positiveRequired(selectedDifficulty?.factor, 1);
        const adjusted = positiveNumber(row.points, 0) * factor;
        return `${index + 1}. ${row.name || "Función sin nombre"}: ${row.points || 0} puntos, ${difficultyName} (factor ${factor}), puntos ajustados ${round(adjusted)}.`;
      })
      .join(NL);

    return [
      "DOCUMENTO DE ESTIMACIÓN DE ESFUERZO DE TRABAJO",
      "",
      `Proyecto: ${projectName}`,
      `Solicitante: ${clientName}`,
      `Fecha: ${new Date().toLocaleDateString()}`,
      "",
      "1. Objetivo",
      "El presente documento tiene como finalidad estimar el esfuerzo de desarrollo del proyecto a partir de los puntos por función, el nivel de dificultad de cada función y la productividad estimada del equipo de trabajo.",
      "",
      "2. Parámetros de dificultad definidos",
      difficultyList || "No se registraron dificultades.",
      "",
      "3. Datos considerados",
      `Productividad estimada: ${productivity} puntos ajustados por persona-mes.`,
      `Personal disponible: ${availablePeople} personas.`,
      `Plazo objetivo: ${targetMonths} meses.`,
      `Costo mensual estimado por persona: S/ ${formatMoney(monthlyCostPerPerson)}.`,
      `Margen de gestión/utilidad: ${marginPercent}%.`,
      "",
      "4. Funciones evaluadas",
      functionList || "No se registraron funciones.",
      "",
      "5. Cálculo del esfuerzo",
      `Puntos por función totales: ${calculations.totalFunctionPoints}.`,
      `Puntos ajustados por dificultad: ${calculations.totalAdjustedPoints}.`,
      `Esfuerzo estimado: ${calculations.personMonths} persona-mes.`,
      `Duración estimada con ${availablePeople} personas: ${calculations.durationWithTeam} meses calendario.`,
      `Personal requerido para cumplir el plazo de ${targetMonths} meses: ${calculations.requiredPeople} personas.`,
      `Costo base estimado de desarrollo: S/ ${formatMoney(calculations.baseDevelopmentCost)}.`,
      `Monto sugerido a cobrar: S/ ${formatMoney(calculations.suggestedCharge)}.`,
      "",
      "6. Resultado final",
      `El proyecto requiere aproximadamente ${calculations.personMonths} persona-mes de esfuerzo. Con un equipo de ${availablePeople} personas, el desarrollo tendría una duración aproximada de ${calculations.durationWithTeam} meses. Para cumplir un plazo de ${targetMonths} meses, se recomienda asignar como mínimo ${calculations.requiredPeople} personas al proyecto. Considerando un costo mensual de S/ ${formatMoney(monthlyCostPerPerson)} por persona y un margen de ${marginPercent}%, el monto aproximado sugerido a cobrar es de S/ ${formatMoney(calculations.suggestedCharge)}.`,
      "",
      "7. Recomendación",
      "Se recomienda validar los puntos por función con el equipo técnico, revisar los módulos de mayor dificultad y considerar un margen adicional para pruebas, correcciones, documentación, despliegue y gestión del proyecto.",
    ].join(NL);
  }, [
    rows,
    difficulties,
    projectName,
    clientName,
    productivity,
    availablePeople,
    targetMonths,
    monthlyCostPerPerson,
    marginPercent,
    calculations,
  ]);

  function addRow() {
    setRows((current) => [
      ...current,
      {
        id: createId(),
        name: "Nueva función",
        points: 5,
        difficultyId: difficulties[0]?.id || "",
      },
    ]);
  }

  function updateRow(id, field, value) {
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    );
  }

  function removeRow(id) {
    setRows((current) => current.filter((row) => row.id !== id));
  }

  function addDifficulty() {
    const nextNumber = difficulties.length + 1;
    setDifficulties((current) => [
      ...current,
      {
        id: createId(),
        code: String(nextNumber),
        name: `Dificultad ${nextNumber}`,
        factor: 1,
      },
    ]);
  }

  function updateDifficulty(id, field, value) {
    setDifficulties((current) =>
      current.map((difficulty) =>
        difficulty.id === id ? { ...difficulty, [field]: value } : difficulty,
      ),
    );
  }

  function removeDifficulty(id) {
    if (difficulties.length <= 1) return;
    const remaining = difficulties.filter((difficulty) => difficulty.id !== id);
    const replacementId = remaining[0]?.id || "";
    setDifficulties(remaining);
    setRows((current) =>
      current.map((row) =>
        row.difficultyId === id ? { ...row, difficultyId: replacementId } : row,
      ),
    );
  }

  async function copyReport() {
    await navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                <Calculator size={16} /> Estimador de esfuerzo por funciones
              </div>
              <h1 className="text-2xl font-bold md:text-4xl">
                Documento de esfuerzo de trabajo
              </h1>
              <p className="mt-2 max-w-3xl text-slate-600">
                Define tus propias dificultades, registra las funciones del
                proyecto y calcula esfuerzo, duración, personal requerido y
                monto aproximado a cobrar.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={copyReport}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
              >
                <Copy size={16} /> {copied ? "Copiado" : "Copiar documento"}
              </button>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-slate-300 hover:bg-slate-100"
              >
                <Printer size={16} /> Imprimir / guardar PDF
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
                <FileText size={20} /> Datos generales
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">
                    Nombre del proyecto
                  </span>
                  <input
                    value={projectName}
                    onChange={(event) => setProjectName(event.target.value)}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">
                    Cliente o área solicitante
                  </span>
                  <input
                    value={clientName}
                    onChange={(event) => setClientName(event.target.value)}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                  />
                </label>
              </div>
            </section>

            <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 text-lg font-bold">
                  <SlidersHorizontal size={20} /> Dificultades predefinidas
                </h2>
                <button
                  onClick={addDifficulty}
                  className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  <Plus size={16} /> Agregar dificultad
                </button>
              </div>

              <div className="space-y-3">
                {difficulties.map((difficulty) => (
                  <div
                    key={difficulty.id}
                    className="grid gap-3 rounded-2xl border border-slate-200 p-3 md:grid-cols-[90px_1fr_140px_44px] md:items-center"
                  >
                    <label className="space-y-1">
                      <span className="text-xs font-semibold text-slate-500">
                        N°
                      </span>
                      <input
                        value={difficulty.code}
                        onChange={(event) =>
                          updateDifficulty(
                            difficulty.id,
                            "code",
                            event.target.value,
                          )
                        }
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-xs font-semibold text-slate-500">
                        Nombre de dificultad
                      </span>
                      <input
                        value={difficulty.name}
                        onChange={(event) =>
                          updateDifficulty(
                            difficulty.id,
                            "name",
                            event.target.value,
                          )
                        }
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-xs font-semibold text-slate-500">
                        Factor
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={difficulty.factor}
                        onChange={(event) =>
                          updateDifficulty(
                            difficulty.id,
                            "factor",
                            Number(event.target.value),
                          )
                        }
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
                      />
                    </label>
                    <button
                      onClick={() => removeDifficulty(difficulty.id)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 ring-1 ring-slate-200 hover:bg-slate-100 hover:text-red-600"
                      aria-label="Eliminar dificultad"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold">Funciones del proyecto</h2>
                <button
                  onClick={addRow}
                  className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  <Plus size={16} /> Agregar función
                </button>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <div className="hidden grid-cols-[1fr_120px_190px_120px_52px] gap-2 bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700 md:grid">
                  <span>Función</span>
                  <span>Puntos</span>
                  <span>Dificultad</span>
                  <span>Ajustado</span>
                  <span></span>
                </div>
                <div className="divide-y divide-slate-200">
                  {rows.map((row) => {
                    const selectedDifficulty = difficulties.find(
                      (difficulty) => difficulty.id === row.difficultyId,
                    );
                    const factor = positiveRequired(
                      selectedDifficulty?.factor,
                      1,
                    );
                    const adjusted = positiveNumber(row.points, 0) * factor;
                    return (
                      <div
                        key={row.id}
                        className="grid gap-3 p-4 md:grid-cols-[1fr_120px_190px_120px_52px] md:items-center"
                      >
                        <input
                          value={row.name}
                          onChange={(event) =>
                            updateRow(row.id, "name", event.target.value)
                          }
                          className="rounded-2xl border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
                        />
                        <input
                          type="number"
                          min="0"
                          value={row.points}
                          onChange={(event) =>
                            updateRow(
                              row.id,
                              "points",
                              Number(event.target.value),
                            )
                          }
                          className="rounded-2xl border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
                        />
                        <select
                          value={row.difficultyId}
                          onChange={(event) =>
                            updateRow(
                              row.id,
                              "difficultyId",
                              event.target.value,
                            )
                          }
                          className="rounded-2xl border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
                        >
                          {difficulties.map((difficulty) => (
                            <option key={difficulty.id} value={difficulty.id}>
                              {difficulty.code} - {difficulty.name} x
                              {difficulty.factor}
                            </option>
                          ))}
                        </select>
                        <div className="rounded-2xl bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700">
                          {round(adjusted)} pts
                        </div>
                        <button
                          onClick={() => removeRow(row.id)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl text-slate-500 ring-1 ring-slate-200 hover:bg-slate-100 hover:text-red-600"
                          aria-label="Eliminar función"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
                <Users size={20} /> Parámetros de estimación y costos
              </h2>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">
                    Productividad
                  </span>
                  <input
                    type="number"
                    min="1"
                    value={productivity}
                    onChange={(event) =>
                      setProductivity(Number(event.target.value))
                    }
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                  />
                  <span className="block text-xs text-slate-500">
                    Puntos ajustados por persona-mes
                  </span>
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">
                    Personal disponible
                  </span>
                  <input
                    type="number"
                    min="1"
                    value={availablePeople}
                    onChange={(event) =>
                      setAvailablePeople(Number(event.target.value))
                    }
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                  />
                  <span className="block text-xs text-slate-500">
                    Equipo asignado
                  </span>
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">
                    Plazo objetivo
                  </span>
                  <input
                    type="number"
                    min="1"
                    value={targetMonths}
                    onChange={(event) =>
                      setTargetMonths(Number(event.target.value))
                    }
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                  />
                  <span className="block text-xs text-slate-500">
                    Meses deseados
                  </span>
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">
                    Costo mensual por persona
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={monthlyCostPerPerson}
                    onChange={(event) =>
                      setMonthlyCostPerPerson(Number(event.target.value))
                    }
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                  />
                  <span className="block text-xs text-slate-500">
                    Soles por persona-mes
                  </span>
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">
                    Margen / utilidad
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={marginPercent}
                    onChange={(event) =>
                      setMarginPercent(Number(event.target.value))
                    }
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                  />
                  <span className="block text-xs text-slate-500">
                    Porcentaje adicional
                  </span>
                </label>
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-3xl bg-slate-900 p-5 text-white shadow-sm">
              <h2 className="mb-4 text-lg font-bold">Resultados</h2>
              <div className="grid gap-3">
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-sm text-white/70">Puntos por función</p>
                  <p className="text-3xl font-bold">
                    {calculations.totalFunctionPoints}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-sm text-white/70">
                    Puntos ajustados por dificultad
                  </p>
                  <p className="text-3xl font-bold">
                    {calculations.totalAdjustedPoints}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-sm text-white/70">Esfuerzo estimado</p>
                  <p className="text-3xl font-bold">
                    {calculations.personMonths} persona-mes
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-sm text-white/70">
                    Duración con {availablePeople} personas
                  </p>
                  <p className="text-3xl font-bold">
                    {calculations.durationWithTeam} meses
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-sm text-white/70">
                    Personal requerido para {targetMonths} meses
                  </p>
                  <p className="text-3xl font-bold">
                    {calculations.requiredPeople} personas
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-sm text-white/70">
                    Costo base de desarrollo
                  </p>
                  <p className="text-3xl font-bold">
                    S/ {formatMoney(calculations.baseDevelopmentCost)}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/20">
                  <p className="text-sm text-white/70">
                    Monto sugerido a cobrar
                  </p>
                  <p className="text-3xl font-bold">
                    S/ {formatMoney(calculations.suggestedCharge)}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 print:shadow-none">
              <h2 className="mb-4 text-lg font-bold">Documento generado</h2>
              <pre className="max-h-[650px] overflow-auto whitespace-pre-wrap rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-800 ring-1 ring-slate-200">
                {reportText}
              </pre>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
