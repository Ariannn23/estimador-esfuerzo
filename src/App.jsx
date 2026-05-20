import React, { useMemo, useState } from "react";
import {
  Plus,
  Trash2,
  Copy,
  FileText,
  Calculator,
  Users,
  Printer,
} from "lucide-react";
import { motion } from "framer-motion";

const difficultyOptions = [
  { label: "Baja", value: 0.75 },
  { label: "Media", value: 1.0 },
  { label: "Alta", value: 1.5 },
  { label: "Muy alta", value: 2.0 },
];

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

const initialRows = [
  { id: createId(), name: "Registro de usuarios", points: 8, difficulty: 1.0 },
  { id: createId(), name: "Gestión de proyectos", points: 13, difficulty: 1.5 },
  {
    id: createId(),
    name: "Generación de reportes",
    points: 10,
    difficulty: 1.5,
  },
];

function round(value, decimals = 2) {
  if (!Number.isFinite(value)) return 0;
  return Number(value.toFixed(decimals));
}

function clampPositive(value, fallback = 1) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : fallback;
}

export default function App() {
  const [projectName, setProjectName] = useState(
    "Sistema de gestión del proyecto",
  );
  const [clientName, setClientName] = useState("Cliente / área solicitante");
  const [rows, setRows] = useState(initialRows);
  const [productivity, setProductivity] = useState(20);
  const [availablePeople, setAvailablePeople] = useState(3);
  const [targetMonths, setTargetMonths] = useState(4);
  const [monthlyCostPerPerson, setMonthlyCostPerPerson] = useState(2500);
  const [marginPercent, setMarginPercent] = useState(30);
  const [copied, setCopied] = useState(false);

  const calculations = useMemo(() => {
    const totalFunctionPoints = rows.reduce(
      (acc, row) => acc + clampPositive(row.points, 0),
      0,
    );
    const totalAdjustedPoints = rows.reduce(
      (acc, row) =>
        acc + clampPositive(row.points, 0) * clampPositive(row.difficulty, 1),
      0,
    );
    const safeProductivity = clampPositive(productivity, 20);
    const personMonths = totalAdjustedPoints / safeProductivity;
    const durationWithTeam = personMonths / clampPositive(availablePeople, 1);
    const requiredPeople = Math.ceil(
      personMonths / clampPositive(targetMonths, 1),
    );
    const safeMonthlyCost = Math.max(0, Number(monthlyCostPerPerson) || 0);
    const safeMargin = Math.max(0, Number(marginPercent) || 0);
    const baseDevelopmentCost = personMonths * safeMonthlyCost;
    const suggestedCharge = baseDevelopmentCost * (1 + safeMargin / 100);
    const averageDifficulty = rows.length
      ? rows.reduce((acc, row) => acc + clampPositive(row.difficulty, 1), 0) /
        rows.length
      : 0;

    return {
      totalFunctionPoints: round(totalFunctionPoints),
      totalAdjustedPoints: round(totalAdjustedPoints),
      personMonths: round(personMonths),
      durationWithTeam: round(durationWithTeam),
      requiredPeople,
      baseDevelopmentCost: round(baseDevelopmentCost),
      suggestedCharge: round(suggestedCharge),
      averageDifficulty: round(averageDifficulty),
    };
  }, [rows, productivity, availablePeople, targetMonths]);

  const reportText = useMemo(() => {
    const functionList = rows
      .map((row, index) => {
        const difficultyLabel =
          difficultyOptions.find(
            (option) => Number(option.value) === Number(row.difficulty),
          )?.label || "Personalizada";
        const adjusted =
          clampPositive(row.points, 0) * clampPositive(row.difficulty, 1);
        return `${index + 1}. ${row.name || "Función sin nombre"}: ${row.points || 0} puntos, dificultad ${difficultyLabel} (factor ${row.difficulty}), puntos ajustados ${round(adjusted)}.`;
      })
      .join("\n");

    return `DOCUMENTO DE ESTIMACIÓN DE ESFUERZO DE TRABAJO\n\nProyecto: ${projectName}\nSolicitante: ${clientName}\nFecha: ${new Date().toLocaleDateString()}\n\n1. Objetivo\nEl presente documento tiene como finalidad estimar el esfuerzo de desarrollo del proyecto a partir de los puntos por función, el nivel de dificultad de cada función y la productividad estimada del equipo de trabajo.\n\n2. Datos considerados\nProductividad estimada: ${productivity} puntos ajustados por persona-mes.\nPersonal disponible: ${availablePeople} personas.\nPlazo objetivo: ${targetMonths} meses.\nCosto mensual estimado por persona: S/ ${Number(monthlyCostPerPerson || 0).toLocaleString("es-PE")}.\nMargen de gestión/utilidad: ${marginPercent}%.\n\n3. Funciones evaluadas\n${functionList || "No se registraron funciones."}\n\n4. Cálculo del esfuerzo\nPuntos por función totales: ${calculations.totalFunctionPoints}.\nPuntos ajustados por dificultad: ${calculations.totalAdjustedPoints}.\nEsfuerzo estimado: ${calculations.personMonths} persona-mes.\nDuración estimada con ${availablePeople} personas: ${calculations.durationWithTeam} meses calendario.\nPersonal requerido para cumplir el plazo de ${targetMonths} meses: ${calculations.requiredPeople} personas.\nCosto base estimado de desarrollo: S/ ${calculations.baseDevelopmentCost.toLocaleString("es-PE")}.\nMonto sugerido a cobrar: S/ ${calculations.suggestedCharge.toLocaleString("es-PE")}.\n\n5. Resultado final\nEl proyecto requiere aproximadamente ${calculations.personMonths} persona-mes de esfuerzo. Con un equipo de ${availablePeople} personas, el desarrollo tendría una duración aproximada de ${calculations.durationWithTeam} meses. Para cumplir un plazo de ${targetMonths} meses, se recomienda asignar como mínimo ${calculations.requiredPeople} personas al proyecto. Considerando un costo mensual de S/ ${Number(monthlyCostPerPerson || 0).toLocaleString("es-PE")} por persona y un margen de ${marginPercent}%, el monto aproximado sugerido a cobrar es de S/ ${calculations.suggestedCharge.toLocaleString("es-PE")}.\n\n6. Recomendación\nSe recomienda validar los puntos por función con el equipo técnico, revisar los módulos de mayor dificultad y considerar un margen adicional para pruebas, correcciones, documentación, despliegue y gestión del proyecto.`;
  }, [
    rows,
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
      { id: createId(), name: "Nueva función", points: 5, difficulty: 1.0 },
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
                Ingresa las funciones del proyecto, sus puntos y dificultad. La
                app calcula puntos ajustados, esfuerzo en persona-mes, duración
                estimada y personal requerido.
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
                <h2 className="text-lg font-bold">Funciones del proyecto</h2>
                <button
                  onClick={addRow}
                  className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  <Plus size={16} /> Agregar función
                </button>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <div className="hidden grid-cols-[1fr_120px_150px_120px_52px] gap-2 bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700 md:grid">
                  <span>Función</span>
                  <span>Puntos</span>
                  <span>Dificultad</span>
                  <span>Ajustado</span>
                  <span></span>
                </div>
                <div className="divide-y divide-slate-200">
                  {rows.map((row) => {
                    const adjusted =
                      clampPositive(row.points, 0) *
                      clampPositive(row.difficulty, 1);
                    return (
                      <div
                        key={row.id}
                        className="grid gap-3 p-4 md:grid-cols-[1fr_120px_150px_120px_52px] md:items-center"
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
                          value={row.difficulty}
                          onChange={(event) =>
                            updateRow(
                              row.id,
                              "difficulty",
                              Number(event.target.value),
                            )
                          }
                          className="rounded-2xl border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
                        >
                          {difficultyOptions.map((option) => (
                            <option key={option.label} value={option.value}>
                              {option.label} x{option.value}
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
                <Users size={20} /> Parámetros de estimación
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
                    Para calcular duración calendario
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
                    Meses deseados para terminar
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
                    Porcentaje adicional al costo base
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
                    S/{" "}
                    {calculations.baseDevelopmentCost.toLocaleString("es-PE")}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/20">
                  <p className="text-sm text-white/70">
                    Monto sugerido a cobrar
                  </p>
                  <p className="text-3xl font-bold">
                    S/ {calculations.suggestedCharge.toLocaleString("es-PE")}
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
