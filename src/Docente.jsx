import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  setDoc,
  addDoc,
  serverTimestamp
} from "firebase/firestore";

const styles = {
  alertBadge: {
    fontSize: "10px",
    backgroundColor: "#1e293b",
    color: "#cbd5e1",
    padding: "2px 6px",
    borderRadius: "4px"
  },
  alertBox: {
    padding: "12px",
    borderRadius: "6px",
    border: "1px solid"
  },
  alertDesc: {
    fontSize: "11px",
    margin: "6px 0 0 0",
    lineHeight: "1.4",
    color: "#cbd5e1"
  },
  alertHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  alertTitleActive: {
    fontWeight: "bold",
    color: "#fb923c",
    fontSize: "12px"
  },
  alertTitleInactive: {
    color: "#64748b",
    fontSize: "12px"
  },
  alertsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },
  bannerBienvenidaInfo: {
    backgroundColor: "rgba(56, 189, 248, 0.1)",
    border: "1px solid #38bdf8",
    borderRadius: "8px",
    padding: "12px",
    fontSize: "12px",
    color: "#e2e8f0",
    lineHeight: "1.4",
    marginTop: "6px"
  },
  btnCancelDocente: {
    padding: "12px 20px",
    backgroundColor: "transparent",
    color: "#94a3b8",
    border: "1px solid #334155",
    borderRadius: "8px",
    fontSize: "12px",
    cursor: "pointer"
  },
  btnCloseModal: {
    background: "none",
    border: "none",
    fontSize: "22px",
    color: "#64748b",
    cursor: "pointer",
    padding: "0 4px"
  },
  btnPedagogicalPill: {
    padding: "6px 12px",
    borderRadius: "6px",
    border: "1px solid #38bdf8",
    backgroundColor: "rgba(56, 189, 248, 0.12)",
    color: "#38bdf8",
    fontSize: "12px",
    fontWeight: "bold",
    cursor: "pointer"
  },
  btnPrimaryIngreso: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#10b981",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "bold",
    fontSize: "13px",
    cursor: "pointer",
    marginTop: "10px"
  },
  btnSendToCiDi: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#8b5cf6",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "13px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px"
  },
  btnTableAction: {
    padding: "6px 12px",
    fontSize: "11px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#0284c7",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: "bold",
    boxShadow: "0 2px 6px rgba(2, 132, 199, 0.3)"
  },
  btnValoracionTop: {
    backgroundColor: "rgba(139, 92, 246, 0.2)",
    border: "1px solid #8b5cf6",
    color: "#c084fc",
    padding: "6px 12px",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "bold",
    cursor: "pointer"
  },
  btnGroupAnalysisTop: {
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    border: "1px solid #10b981",
    color: "#4ade80",
    padding: "6px 12px",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "bold",
    cursor: "pointer"
  },
  btnLogout: {
    backgroundColor: "transparent",
    border: "1px solid #334155",
    color: "#94a3b8",
    padding: "6px 12px",
    borderRadius: "6px",
    fontSize: "11px",
    cursor: "pointer"
  },
  cardBoxIngreso: {
    backgroundColor: "#0f172a",
    border: "2px solid #38bdf8",
    borderRadius: "14px",
    padding: "24px",
    maxWidth: "680px",
    margin: "30px auto"
  },
  cardSectionTitle: {
    fontSize: "13px",
    margin: "0 0 12px 0",
    color: "#38bdf8",
    textTransform: "uppercase"
  },
  dashboardCard: {
    backgroundColor: "rgba(7, 12, 34, 0.75)",
    borderRadius: "10px",
    padding: "16px",
    border: "1px solid #1e293b"
  },
  dashboardContainer: {
    maxWidth: "1150px",
    margin: "0 auto",
    padding: "20px",
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    backgroundColor: "#030712",
    color: "#f3f4f6",
    minHeight: "100vh"
  },
  dashboardGrid: {
    display: "grid",
    gridTemplateColumns: "1.4fr 1fr",
    gap: "20px"
  },
  dashboardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #1e293b",
    paddingBottom: "12px",
    marginBottom: "16px"
  },
  dashboardSubtitle: {
    fontSize: "12px",
    margin: "4px 0 0 0",
    color: "#64748b"
  },
  dashboardTeacherControlsCard: {
    backgroundColor: "rgba(7, 12, 34, 0.75)",
    border: "2px solid #8b5cf6",
    borderRadius: "10px",
    padding: "16px",
    marginBottom: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },
  dashboardTitle: {
    fontSize: "20px",
    margin: 0,
    color: "#38bdf8",
    fontWeight: "bold"
  },
  formGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "14px"
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "4px"
  },
  formInput: {
    padding: "10px",
    backgroundColor: "#02040e",
    border: "1px solid #334155",
    borderRadius: "6px",
    color: "#ffffff",
    fontSize: "13px"
  },
  formLabel: {
    fontSize: "12px",
    fontWeight: "bold",
    color: "#38bdf8"
  },
  formSelect: {
    padding: "10px",
    backgroundColor: "#02040e",
    border: "1px solid #334155",
    borderRadius: "6px",
    color: "#ffffff",
    fontSize: "13px"
  },
  formTextareaDocente: {
    padding: "10px",
    backgroundColor: "#02040e",
    border: "1px solid #334155",
    borderRadius: "6px",
    color: "#ffffff",
    fontSize: "14px"
  },
  instructions: {
    fontSize: "12px",
    color: "#94a3b8",
    lineHeight: "1.4",
    marginBottom: "12px"
  },
  kpiCard: {
    backgroundColor: "rgba(7, 12, 34, 0.75)",
    padding: "14px",
    borderRadius: "8px",
    border: "1px solid #1e293b"
  },
  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "16px",
    marginBottom: "20px"
  },
  kpiLabel: {
    fontSize: "10px",
    color: "#cbd5e1",
    margin: 0,
    fontWeight: "bold"
  },
  kpiSub: {
    fontSize: "10px",
    color: "#94a3b8",
    fontWeight: "600"
  },
  kpiValue: {
    fontSize: "30px",
    fontWeight: "bold",
    color: "#ffffff",
    margin: "4px 0"
  },
  leftColumn: {},
  modalBody: {},
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottom: "1px solid #1e293b",
    paddingBottom: "12px",
    marginBottom: "16px"
  },
  pedagogicalBody: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginTop: "12px"
  },
  pedagogicalBox: {
    backgroundColor: "rgba(56, 189, 248, 0.08)",
    border: "1px solid rgba(56, 189, 248, 0.2)",
    borderRadius: "8px",
    padding: "12px",
    fontSize: "13px",
    color: "#e2e8f0",
    lineHeight: "1.5"
  },
  profileSection: {
    backgroundColor: "#02040e",
    padding: "12px 16px",
    borderRadius: "8px",
    border: "1px solid #1e293b",
    fontSize: "12px",
    marginBottom: "16px"
  },
  radioGroup: {
    display: "flex",
    gap: "14px",
    flexWrap: "wrap"
  },
  radioOptionDocente: {
    fontSize: "14px",
    color: "#cbd5e1",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px"
  },
  rightColumn: {},
  sentNotification: {
    marginTop: "12px",
    padding: "10px",
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    border: "1px solid #10b981",
    borderRadius: "6px",
    color: "#4ade80",
    fontSize: "12px",
    fontWeight: "bold",
    textAlign: "center"
  },
  surveyLabelDocente: {
    fontSize: "15px",
    fontWeight: "bold",
    color: "#38bdf8",
    marginBottom: "#6px",
    display: "block"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse"
  },
  tableHeaderRow: {
    borderBottom: "1px solid #1e293b",
    textAlign: "left"
  },
  td: {
    padding: "8px",
    fontSize: "12px"
  },
  teacherBadge: {
    padding: "4px 10px",
    borderRadius: "12px",
    fontSize: "10px",
    fontWeight: "bold",
    backgroundColor: "rgba(56, 189, 248, 0.1)",
    color: "#38bdf8",
    border: "1px solid #38bdf8"
  },
  teacherDashboardInput: {
    flex: 1,
    padding: "10px 14px",
    backgroundColor: "#02040e",
    border: "1px solid #334155",
    borderRadius: "6px",
    color: "#cbd5e1",
    fontSize: "13px"
  },
  teacherDashboardSendBtn: {
    backgroundColor: "#8b5cf6",
    color: "#ffffff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "6px",
    fontWeight: "bold",
    fontSize: "12px",
    cursor: "pointer"
  },
  th: {
    padding: "8px",
    fontSize: "10px",
    color: "#64748b",
    textTransform: "uppercase"
  },
  toastCard: {
    position: "fixed",
    top: "20px",
    right: "20px",
    backgroundColor: "#10b981",
    color: "#ffffff",
    padding: "12px 20px",
    borderRadius: "8px",
    fontWeight: "bold",
    fontSize: "13px",
    boxShadow: "0 0 20px rgba(16, 185, 129, 0.5)",
    zIndex: 10000
  },
  topModalCard: {
    width: "90%",
    maxWidth: "680px",
    backgroundColor: "#080d24",
    padding: "24px",
    boxSizing: "border-box",
    borderRadius: "14px",
    border: "2px solid #38bdf8",
    boxShadow: "0 0 35px rgba(56, 189, 248, 0.35)",
    color: "#cbd5e1"
  },
  topModalCardWide: {
    backgroundColor: "#0f172a",
    border: "2px solid #38bdf8",
    borderRadius: "14px",
    padding: "20px",
    maxWidth: "760px",
    width: "95%",
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 0 30px rgba(56, 189, 248, 0.2)",
    position: "relative",
    color: "#f8fafc"
  },
  topModalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #1e293b",
    paddingBottom: "10px",
    marginBottom: "10px"
  },
  topModalOverlay: {
    position: "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(2, 3, 8, 0.85)",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    paddingTop: "20px",
    paddingBottom: "20px",
    zIndex: 10000,
    overflowY: "auto"
  },
  tr: {
    borderBottom: "1px solid #1e293b"
  }
};

const MISSION_PEDAGOGICAL_INFO = {
  m1: {
    title: "Misión 1: Reserva de Agua Vital",
    subtitle: "Suma de Fracciones con Igual Denominador",
    action: "Luego de un simulacro paso a paso con EduBot (con la ecuación 1/5 + 2/5 = 3/5 visible), los alumnos operan de forma autónoma seleccionando la respuesta entre 6 opciones.",
    objectives: "Comprender la suma homogénea: cuando las partes de la unidad son iguales (mismo denominador), la base se conserva intacta y solo se suman los numeradores de arriba (1 + 2 = 3).",
    evidence: "Evidencia que el estudiante distingue el rol del numerador (partes) y del denominador (base) sin incurrir en el desvío común de sumar denominadores directo (ERR_DIRECT)."
  },
  m2: {
    title: "Misión 2: Mezcla de Combustible",
    subtitle: "Suma con Denominadores Múltiples Simples",
    action: "Luego de un simulador de numerador con denominador común prefijado (1/3 + 1/6 = ?/6), los alumnos resuelven sumas heterogéneas con resultados irreducibles.",
    objectives: "Identificar y calcular el menor común denominador (LCM) para unificar las bases de medición antes de sumar.",
    evidence: "Evidencia si el estudiante logra realizar la conversión previa de fracciones equivalentes o si tiende a sumar en línea recta numeradores y denominadores."
  },
  m3: {
    title: "Misión 3: Acople de Víveres y Raciones",
    subtitle: "Suma y Simplificación a Fracción Irreducible",
    action: "Luego de un simulador conceptual de simplificación (3/6 → 1/2), los alumnos resuelven sumas donde cada resultado exige simplificarse obligatoriamente.",
    objectives: "Dominar la simplificación dividiendo numerador y denominador por factores comunes hasta obtener la versión irreducible.",
    evidence: "Evidencia la capacidad de llevar una suma a su expresión matemática estándar irreducible sin detenerse en el resultado intermedio."
  },
  m4: {
    title: "Misión 4: Travesía Integrada de Despegue",
    subtitle: "Suma Triple + Simplificación + Comparación y Justificación",
    action: "Secuencia integradora en 3 partes sin simulacro pasivo: Parte 1 (Suma triple), Parte 2 (Simplificación), Parte 3 (Comparación de magnitudes y justificación científica).",
    objectives: "Integrar el corpus completo de saberes desarrollados en el módulo aplicando razonamiento crítico para argumentar decisiones sobre recursos.",
    evidence: "Evidencia la capacidad de razonamiento científico y argumentativo (Maestría / Intuición), permitiendo acreditar la insignia final de Fusión Estelar."
  }
};

const SYSTEM_EXPERT_ALERTS = {
  ERR_DIRECT: "Error suma directa: 🛠️ Propuesta para el aula presencial: dinámica de doblado de tiras de papel para visualizar por qué el denominador nunca se suma.",
  ERR_PARTIAL: "Error suma parcial: 🍳 Actividad para el hogar: usen elementos divisibles en la mesa para representar la agregación de partes.",
  ERR_LCD: "Error cálculo denominador: 🧩 Actividad para el hogar: repasen juntos las tablas de multiplicar de los denominadores antes de operar.",
  ERR_SIMP: "Error simplificación: 📦 Actividad para el hogar: practiquen dividir numerador y denominador por el mismo divisor.",
  ERR_COMPARE: "Error comparación: 🥤 Actividad para el hogar: sirvan agua en vasos de diferente diámetro para ilustrar la necesidad de una base común."
};

const MISSION_CONFIG = {
  m1: { title: "Misión 1: Reserva de Agua", icon: "💧" },
  m2: { title: "Misión 2: Mezcla de Combustible", icon: "🧪" },
  m3: { title: "Misión 3: Acople de Víveres", icon: "📦" },
  m4: { title: "Misión 4: Travesía Integrada", icon: "🚀" }
};

const translateDesvio = (code) => {
  if (code === "ERR_DIRECT") return "Error suma directa (Sin unificar base)";
  if (code === "ERR_PARTIAL") return "Error suma parcial (Incompleta)";
  if (code === "ERR_LCD") return "Error cálculo denominador";
  if (code === "ERR_SIMP") return "Error simplificación";
  if (code === "ERR_COMPARE") return "Error comparación de magnitudes";
  if (code === "ERR_GENERIC") return "Desvío general de operación";
  return code || "Desvío general";
};

function slug(text) {
  if (!text) return "";
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_");
}

function renderMissionCell(student, mKey) {
  const mData = student?.missions?.[mKey] || {};
  const stats = student?.statsPorMision?.[mKey] || {};
  const isCompleted = (student?.misionesCompletadas || []).includes(mKey);
  const helps = mData.helps || stats.ayudas || 0;
  const errors = mData.errors || stats.errores || 0;
  const attempts = mData.attempts || stats.intentosDesafio || stats.intentos || 0;
  const hasActivity = isCompleted || attempts > 0 || (stats.intentosSimulacro || 0) > 0;

  let bgColor = "rgba(30, 41, 59, 0.3)";
  let borderColor = "#1e293b";
  let textColor = "#cbd5e1";

  if (isCompleted) {
    bgColor = "rgba(16, 185, 129, 0.15)";
    borderColor = "#10b981";
    textColor = "#4ade80";
  } else if (hasActivity) {
    bgColor = "rgba(251, 146, 60, 0.15)";
    borderColor = "#fb923c";
    textColor = "#fb923c";
  }

  if (!hasActivity) {
    return <span style={{ padding: "4px 8px", borderRadius: "4px", border: "1px dashed #1e293b", color: "#475569", fontSize: "11px" }}>—</span>;
  }

  return (
    <div style={{ padding: "4px 8px", borderRadius: "6px", border: `1px solid ${borderColor}`, backgroundColor: bgColor, color: textColor, display: "inline-flex", gap: "6px", fontSize: "11px", fontWeight: "bold" }}>
      <span>💡 {helps}</span>
      <span style={{ color: "#fb923c" }}>✖ {errors}</span>
    </div>
  );
}

// ==========================================
// 📬 MODAL DE ANÁLISIS INDIVIDUAL DE TRAYECTORIA (1.a FIX)
// ==========================================
function DrawerWithSendButton({ student, onClose }) {
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!student) return null;

  const getStudentPrimaryDesvio = (s) => {
    try {
      if (s?.missions?.m4?.lastErrorCode) return s.missions.m4.lastErrorCode;
      if (s?.missions?.m3?.lastErrorCode) return s.missions.m3.lastErrorCode;
      if (s?.missions?.m2?.lastErrorCode) return s.missions.m2.lastErrorCode;
      if (s?.missions?.m1?.lastErrorCode) return s.missions.m1.lastErrorCode;
      if (s?.statsPorMision?.m4?.ultimoError) return s.statsPorMision.m4.ultimoError;
      if (s?.statsPorMision?.m3?.ultimoError) return s.statsPorMision.m3.ultimoError;
      if (s?.statsPorMision?.m2?.ultimoError) return s.statsPorMision.m2.ultimoError;
      if (s?.statsPorMision?.m1?.ultimoError) return s.statsPorMision.m1.ultimoError;
    } catch (e) {
      console.error("Error leyendo desvío primario:", e);
    }
    return null;
  };

  const primaryDesvio = getStudentPrimaryDesvio(student);
  let aulaAdvice = "";
  let padresAdvice = "";
  let performanceTitle = "Progreso Regular";
  let performanceColor = "#cbd5e1";

  if (student.badgeEarned) {
    if ((student.errorsCount || 0) === 0) {
      performanceTitle = "Dominio Perfecto (Sin Desvíos)";
      performanceColor = "#10b981";
      aulaAdvice = "El alumno alcanzó un dominio conceptual impecable. Proponer actividades de liderazgo o tutoría entre pares.";
      padresAdvice = "¡Felicitaciones! Su hijo/a completó el módulo de fracciones con precisión total y sin errores.";
    } else {
      performanceTitle = "Dominio Resiliente (Con Reintentos)";
      performanceColor = "#10b981";
      aulaAdvice = "El alumno logró consolidar el aprendizaje superando desvíos mediante el reintento autónomo.";
      padresAdvice = "Su hijo/a superó las 4 misiones demostrando perseverancia y aprendiendo de cada error.";
    }
  } else if (primaryDesvio) {
    performanceTitle = `Alerta de Desvío: ${translateDesvio(primaryDesvio)}`;
    performanceColor = "#fb923c";
    aulaAdvice = SYSTEM_EXPERT_ALERTS[primaryDesvio] || "Reforzar con guía personalizada en clase.";
    padresAdvice = "Acompañen a su hijo/a en casa revisando juntos los ejercicios con materiales concretos.";
  } else {
    aulaAdvice = "El alumno avanza activamente en las misiones iniciales.";
    padresAdvice = "Animen a su hijo/a a seguir completando los desafíos semanales.";
  }

  const handleSendToParents = () => {
    setEmailSent(true);
    setTimeout(() => setEmailSent(false), 4000);
  };

  const misionesList = ["m1", "m2", "m3", "m4"].map((mKey) => {
    const config = MISSION_CONFIG[mKey] || { title: `Misión ${mKey}`, icon: "🚀" };
    const mData = student?.missions?.[mKey] || {};
    const stats = student?.statsPorMision?.[mKey] || {};
    const isDone = (student?.misionesCompletadas || []).includes(mKey);
    const attempts = mData.attempts || stats.intentosDesafio || stats.intentos || 0;
    const helps = mData.helps || stats.ayudas || 0;
    const errors = mData.errors || stats.errores || 0;
    const lastErrorCode = mData.lastErrorCode || stats.ultimoError || null;
    const isInProgress = !isDone && (attempts > 0 || (stats.intentosSimulacro || 0) > 0);
    const status = isDone ? "completado" : (isInProgress ? "en_curso" : "sin_iniciar");

    return {
      key: mKey,
      title: config.title,
      icon: config.icon,
      status,
      attempts,
      helps,
      errors,
      lastErrorCode
    };
  });

  const completadasCount = (student?.misionesCompletadas || []).length;
  const studentXp = student?.xpTotal || student?.xp || 0;
  const xpPct = Math.min(100, Math.round((studentXp / 750) * 100));

  return (
    <div style={styles.topModalOverlay} onClick={onClose}>
      <div style={styles.topModalCardWide} onClick={(e) => e.stopPropagation()}>
        
        {/* CABECERA */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid #1e293b", paddingBottom: "12px", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "36px" }}>🧑‍🚀</span>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h2 style={{ margin: 0, color: "#f8fafc", fontSize: "20px", fontWeight: "bold" }}>
                  {student.name || student.nickname || "Alumno"}
                </h2>
                {student.badgeEarned && (
                  <span style={{ backgroundColor: "rgba(245, 158, 11, 0.2)", border: "1px solid #f59e0b", color: "#fbbf24", padding: "2px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: "bold" }}>
                    🏆 Insignia de Fusión
                  </span>
                )}
              </div>
              <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>
                {student.escuela || "Escuela"} · {student.curso || "1° Año"}
              </div>
            </div>
          </div>
          <button style={styles.btnCloseModal} onClick={onClose}>✕</button>
        </div>

        <div style={styles.modalBody}>
          
          {/* BARRA XP Y TARJETAS */}
          <div style={{ backgroundColor: "#020617", border: "1px solid #1e293b", borderRadius: "10px", padding: "14px", marginBottom: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <span style={{ fontSize: "12px", color: "#cbd5e1", fontWeight: "bold" }}>EXPERIENCIA ACUMULADA:</span>
              <strong style={{ fontSize: "18px", color: "#38bdf8" }}>{studentXp} / 750 XP</strong>
            </div>
            <div style={{ height: "12px", backgroundColor: "#0f172a", borderRadius: "6px", overflow: "hidden", border: "1px solid #334155", marginBottom: "12px" }}>
              <div style={{ height: "100%", width: `${xpPct}%`, background: "linear-gradient(90deg, #10b981, #38bdf8)", borderRadius: "6px", transition: "width 0.4s ease" }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
              <div style={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", padding: "8px", borderRadius: "6px", textAlign: "center" }}>
                <div style={{ fontSize: "10px", color: "#94a3b8" }}>Misiones Logradas</div>
                <div style={{ fontSize: "16px", fontWeight: "bold", color: "#4ade80" }}>{completadasCount} / 4</div>
              </div>
              <div style={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", padding: "8px", borderRadius: "6px", textAlign: "center" }}>
                <div style={{ fontSize: "10px", color: "#94a3b8" }}>Pistas Pedidas</div>
                <div style={{ fontSize: "16px", fontWeight: "bold", color: "#38bdf8" }}>💡 {student.helpsRequested || 0}</div>
              </div>
              <div style={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", padding: "8px", borderRadius: "6px", textAlign: "center" }}>
                <div style={{ fontSize: "10px", color: "#94a3b8" }}>Desvíos Registrados</div>
                <div style={{ fontSize: "16px", fontWeight: "bold", color: "#fb923c" }}>✖ {student.errorsCount || 0}</div>
              </div>
            </div>
          </div>

          {/* MISIONES */}
          <div style={{ backgroundColor: "#020617", border: "1px solid #1e293b", borderRadius: "10px", padding: "12px", marginBottom: "16px" }}>
            <h4 style={{ color: "#38bdf8", fontSize: "12px", margin: "0 0 10px 0", textTransform: "uppercase" }}>
              🗺️ Detalle por Misión
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {misionesList.map((m) => {
                const isDone = m.status === "completado";
                const isInProgress = m.status === "en_curso";

                const statusLabel = isDone ? "✔ Completada" : isInProgress ? "⚡ En curso" : "⏳ Sin iniciar";
                const statusBg = isDone ? "rgba(16, 185, 129, 0.15)" : isInProgress ? "rgba(251, 146, 60, 0.15)" : "rgba(100, 116, 139, 0.15)";
                const statusColor = isDone ? "#4ade80" : isInProgress ? "#fb923c" : "#64748b";
                const statusBorder = isDone ? "#10b981" : isInProgress ? "#fb923c" : "#334155";

                const errorTranslated = m.lastErrorCode ? translateDesvio(m.lastErrorCode) : (isDone ? "Sin desvíos actuales" : "Sin registro");

                return (
                  <div key={m.key} style={{ backgroundColor: "#0f172a", border: `1px solid ${statusBorder}`, borderRadius: "8px", padding: "8px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontSize: "18px" }}>{m.icon}</span>
                      <div>
                        <strong style={{ color: "#f8fafc", fontSize: "13px" }}>{m.title}</strong>
                        <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "1px" }}>
                          Diagnóstico: <span style={{ color: m.lastErrorCode ? "#fb923c" : "#94a3b8" }}>{errorTranslated}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ textAlign: "right", fontSize: "11px", color: "#cbd5e1" }}>
                        <div>Intentos: <strong>{m.attempts || 0}</strong></div>
                        <div style={{ fontSize: "10px", color: "#94a3b8" }}>💡 {m.helps || 0} · ✖ {m.errors || 0}</div>
                      </div>
                      <span style={{ backgroundColor: statusBg, color: statusColor, border: `1px solid ${statusBorder}`, padding: "3px 8px", borderRadius: "6px", fontSize: "10px", fontWeight: "bold" }}>
                        {statusLabel}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ORIENTACIÓN DIDÁCTICA */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
            <div style={{ borderLeft: "4px solid #10b981", backgroundColor: "rgba(16, 185, 129, 0.05)", padding: "12px", borderRadius: "6px" }}>
              <h4 style={{ margin: "0 0 6px 0", color: "#10b981", fontSize: "12px", textTransform: "uppercase" }}>👩‍🏫 Orientación para el Aula</h4>
              <p style={{ fontSize: "12px", margin: 0, lineHeight: "1.5", color: "#cbd5e1" }}>{aulaAdvice}</p>
            </div>

            <div style={{ borderLeft: "4px solid #8b5cf6", backgroundColor: "rgba(139, 92, 246, 0.05)", padding: "12px", borderRadius: "6px" }}>
              <h4 style={{ margin: "0 0 6px 0", color: "#8b5cf6", fontSize: "12px", textTransform: "uppercase" }}>🏠 Consejos para el Hogar (CiDi)</h4>
              <p style={{ fontSize: "12px", margin: 0, lineHeight: "1.5", color: "#cbd5e1" }}>{padresAdvice}</p>
            </div>
          </div>

          <button onClick={handleSendToParents} style={styles.btnSendToCiDi}>
            ✉️ Enviar consejos directo a la familia (Domicilio Electrónico CiDi)
          </button>

          {emailSent && (
            <div style={styles.sentNotification}>
              ✨ ¡Enviado! Los consejos pedagógicos fueron notificados al Domicilio Electrónico de los padres en Ciudadano Digital (CiDi).
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 📊 MODAL DE ANÁLISIS GRUPAL 360° (1.e FIX)
// ==========================================
function GroupAnalysisModal({ students, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const total = students.length;
  const active = students.filter((s) => (s.xpTotal || s.xp || 0) > 0 || (s.misionesCompletadas || []).length > 0).length;
  const completedOne = students.filter((s) => (s.misionesCompletadas || []).length >= 1).length;
  const completedAll = students.filter((s) => (s.misionesCompletadas || []).length === 4).length;
  const withBadge = students.filter((s) => s.badgeEarned).length;
  const totalXp = students.reduce((acc, s) => acc + (s.xpTotal || s.xp || 0), 0);
  const avgXp = total ? Math.round(totalXp / total) : 0;

  const pctCompletedOne = total ? Math.round((completedOne / total) * 100) : 0;
  const pctCompletedAll = total ? Math.round((completedAll / total) * 100) : 0;
  const pctBadge = total ? Math.round((withBadge / total) * 100) : 0;

  // Conteo de desvíos por tipo
  const desviosSummary = {
    ERR_DIRECT: [],
    ERR_LCD: [],
    ERR_SIMP: [],
    ERR_COMPARE: []
  };

  students.forEach((s) => {
    const nick = s.name || s.nickname || "Alumno";
    ["m1", "m2", "m3", "m4"].forEach((mKey) => {
      const err = s.missions?.[mKey]?.lastErrorCode || s.statsPorMision?.[mKey]?.ultimoError;
      if (err && desviosSummary[err]) {
        if (!desviosSummary[err].includes(nick)) {
          desviosSummary[err].push(nick);
        }
      }
    });
  });

  return (
    <div style={styles.topModalOverlay} onClick={onClose}>
      <div style={styles.topModalCardWide} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #1e293b", paddingBottom: "12px", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "28px" }}>📊</span>
            <div>
              <h2 style={{ margin: 0, color: "#38bdf8", fontSize: "18px", fontWeight: "bold" }}>
                Análisis Grupal 360° · Diagnóstico del Curso
              </h2>
              <span style={{ fontSize: "12px", color: "#94a3b8" }}>Resumen estadístico y pedagógico colectivo</span>
            </div>
          </div>
          <button style={styles.btnCloseModal} onClick={onClose}>✕</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginBottom: "16px" }}>
          <div style={{ backgroundColor: "#020617", border: "1px solid #1e293b", padding: "10px", borderRadius: "8px", textAlign: "center" }}>
            <div style={{ fontSize: "10px", color: "#94a3b8" }}>Total Alumnos</div>
            <div style={{ fontSize: "20px", fontWeight: "bold", color: "#ffffff" }}>{total}</div>
            <div style={{ fontSize: "10px", color: "#38bdf8" }}>{active} activos</div>
          </div>
          <div style={{ backgroundColor: "#020617", border: "1px solid #1e293b", padding: "10px", borderRadius: "8px", textAlign: "center" }}>
            <div style={{ fontSize: "10px", color: "#94a3b8" }}>≥1 Misión Completa</div>
            <div style={{ fontSize: "20px", fontWeight: "bold", color: "#38bdf8" }}>{pctCompletedOne}%</div>
            <div style={{ fontSize: "10px", color: "#94a3b8" }}>{completedOne} alumnos</div>
          </div>
          <div style={{ backgroundColor: "#020617", border: "1px solid #1e293b", padding: "10px", borderRadius: "8px", textAlign: "center" }}>
            <div style={{ fontSize: "10px", color: "#94a3b8" }}>4 Misiones Logradas</div>
            <div style={{ fontSize: "20px", fontWeight: "bold", color: "#4ade80" }}>{pctCompletedAll}%</div>
            <div style={{ fontSize: "10px", color: "#94a3b8" }}>{completedAll} alumnos</div>
          </div>
          <div style={{ backgroundColor: "#020617", border: "1px solid #1e293b", padding: "10px", borderRadius: "8px", textAlign: "center" }}>
            <div style={{ fontSize: "10px", color: "#94a3b8" }}>Insignias Acreditadas</div>
            <div style={{ fontSize: "20px", fontWeight: "bold", color: "#c084fc" }}>{pctBadge}%</div>
            <div style={{ fontSize: "10px", color: "#94a3b8" }}>{withBadge} insignias</div>
          </div>
        </div>

        {/* DESGLOSE DE DESVÍOS DIDÁCTICOS */}
        <div style={{ backgroundColor: "#020617", border: "1px solid #1e293b", borderRadius: "10px", padding: "14px", marginBottom: "16px" }}>
          <h4 style={{ color: "#fb923c", fontSize: "12px", margin: "0 0 10px 0", textTransform: "uppercase" }}>
            ⚠️ Detección Colectiva de Desvíos Didácticos (Sistema Experto)
          </h4>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[
              { code: "ERR_DIRECT", label: "Error Suma Directa (Sin unificar base)", advice: SYSTEM_EXPERT_ALERTS.ERR_DIRECT },
              { code: "ERR_LCD", label: "Error Cálculo Denominador Común", advice: SYSTEM_EXPERT_ALERTS.ERR_LCD },
              { code: "ERR_SIMP", label: "Error Simplificación de Fracción", advice: SYSTEM_EXPERT_ALERTS.ERR_SIMP },
              { code: "ERR_COMPARE", label: "Error Comparación de Magnitudes", advice: SYSTEM_EXPERT_ALERTS.ERR_COMPARE }
            ].map((item) => {
              const affectedList = desviosSummary[item.code] || [];
              const count = affectedList.length;

              return (
                <div key={item.code} style={{ backgroundColor: "#0f172a", border: `1px solid ${count > 0 ? "#fb923c" : "#1e293b"}`, borderRadius: "8px", padding: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <strong style={{ color: count > 0 ? "#fb923c" : "#64748b", fontSize: "12px" }}>{item.label}</strong>
                    <span style={{ backgroundColor: "#1e293b", color: count > 0 ? "#fb923c" : "#94a3b8", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold" }}>
                      {count} Alumnos
                    </span>
                  </div>
                  {count > 0 && (
                    <>
                      <div style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "4px" }}>
                        Alumnos afectados: <strong style={{ color: "#f8fafc" }}>{affectedList.join(", ")}</strong>
                      </div>
                      <p style={{ margin: 0, fontSize: "11px", color: "#cbd5e1", lineHeight: "1.4" }}>
                        {item.advice}
                      </p>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <button onClick={onClose} style={styles.btnPrimaryIngreso}>
          ➔ CERRAR ANÁLISIS GRUPAL
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [docenteId, setDocenteId] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("edumision_docente_id") || null;
    }
    return null;
  });

  const [faseDocente, setFaseDocente] = useState(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("edumision_docente_id")) {
      return "panel";
    }
    return "ingreso";
  });
  
  const [perfilDocente, setPerfilDocente] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("edumision_docente_profile");
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return {
      nombre: "",
      escuela: "IPEM",
      curso: "1° Año"
    };
  });
  const [tipoEscuela, setTipoEscuela] = useState("IPEM");
  const [escuelaOtra, setEscuelaOtra] = useState("");

  const [encuestaDocente, setEncuestaDocente] = useState({
    valorPedagogico: "Muy valiosa",
    nivelDificultad: "Adecuada",
    contactoGrupal: "Muy útil",
    sintesisFamilias: "Alto valor para involucrar a los padres",
    sugerenciasMejora: ""
  });

  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showGroupAnalysis, setShowGroupAnalysis] = useState(false); // 1.e FIX
  const [tableFilter, setTipoFilter] = useState("TODOS"); // 1.c FIX

  const [teacherMessage, setTeacherMessage] = useState("¡Buen viaje espacial, tripulantes! Lean con atención cada consigna.");
  const [inputMsg, setInputMsg] = useState(teacherMessage);
  const [pedagogicalPopup, setPedagogicalPopup] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  // 🔒 1.b FIX: Escuchar 'alumnos' filtrados estrictamente por docenteId
  useEffect(() => {
    if (!db || !docenteId) {
      setStudents([]);
      return;
    }

    const qAlumnos = query(
      collection(db, "alumnos"),
      where("docenteId", "==", docenteId)
    );

    const unsubAlumnos = onSnapshot(
      qAlumnos,
      (snapshot) => {
        const list = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const completadas = data.misionesCompletadas || [];
          const stats = data.statsPorMision || {};

          let totalHelps = 0;
          let totalErrors = 0;
          ["m1", "m2", "m3", "m4"].forEach((mKey) => {
            if (stats[mKey]) {
              totalHelps += stats[mKey].ayudas || 0;
              totalErrors += stats[mKey].errores || 0;
            }
          });

          list.push({
            alumnoId: docSnap.id,
            id: docSnap.id,
            name: data.nickname || "Alumno",
            nickname: data.nickname || "Alumno",
            escuela: data.escuela || "Escuela",
            curso: data.curso || "1° Año",
            docenteId: data.docenteId || null,
            xp: data.xpTotal || 0,
            xpTotal: data.xpTotal || 0,
            badgeEarned: !!data.badgeEarned,
            misionesCompletadas: completadas,
            misionesConError: data.misionesConError || [],
            helpsRequested: totalHelps,
            errorsCount: totalErrors,
            statsPorMision: stats,
            missions: {
              m1: { status: completadas.includes("m1") ? "completado" : "bloqueada", attempts: stats.m1?.intentos || 0, helps: stats.m1?.ayudas || 0, errors: stats.m1?.errores || 0, lastErrorCode: stats.m1?.ultimoError },
              m2: { status: completadas.includes("m2") ? "completado" : "bloqueada", attempts: stats.m2?.intentos || 0, helps: stats.m2?.ayudas || 0, errors: stats.m2?.errores || 0, lastErrorCode: stats.m2?.ultimoError },
              m3: { status: completadas.includes("m3") ? "completado" : "bloqueada", attempts: stats.m3?.intentos || 0, helps: stats.m3?.ayudas || 0, errors: stats.m3?.errores || 0, lastErrorCode: stats.m3?.ultimoError },
              m4: { status: completadas.includes("m4") ? "completado" : "bloqueada", attempts: stats.m4?.intentos || 0, helps: stats.m4?.ayudas || 0, errors: stats.m4?.errores || 0, lastErrorCode: stats.m4?.ultimoError }
            }
          });
        });
        setStudents(list);
      },
      (err) => console.error("Error al escuchar alumnos:", err)
    );

    return () => unsubAlumnos();
  }, [docenteId]);

  // Sincronización del perfil docente si existe en Firestore
  useEffect(() => {
    if (!db || !docenteId) return;

    const unsubDocenteDoc = onSnapshot(
      doc(db, "docentes", docenteId),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data.nombre || data.escuela || data.curso) {
            setPerfilDocente((prev) => ({
              nombre: data.nombre || prev.nombre,
              escuela: data.escuela || prev.escuela,
              curso: data.curso || prev.curso
            }));
          }
          if (data.mensajeActual) {
            setTeacherMessage(data.mensajeActual);
          }
        }
      },
      (err) => console.error("Error al escuchar documento docente:", err)
    );

    return () => unsubDocenteDoc();
  }, [docenteId]);

  const totalStudents = students.length;
  const atLeastOneCompleted = students.filter(
    (s) => Array.isArray(s.misionesCompletadas) && s.misionesCompletadas.length > 0
  ).length;
  const allFourCompleted = students.filter(
    (s) => Array.isArray(s.misionesCompletadas) && s.misionesCompletadas.length === 4
  ).length;
  const badgesAwarded = students.filter((s) => s.badgeEarned).length;

  const atLeastOnePercentage = totalStudents ? Math.round((atLeastOneCompleted / totalStudents) * 100) : 0;
  const allFourPercentage = totalStudents ? Math.round((allFourCompleted / totalStudents) * 100) : 0;
  const badgePercentage = totalStudents ? Math.round((badgesAwarded / totalStudents) * 100) : 0;

  const errorsCount = {
    ERR_DIRECT: students.filter((s) => s.missions?.m1?.lastErrorCode === "ERR_DIRECT" || s.missions?.m2?.lastErrorCode === "ERR_DIRECT" || s.statsPorMision?.m1?.ultimoError === "ERR_DIRECT" || s.statsPorMision?.m2?.ultimoError === "ERR_DIRECT").length,
    ERR_PARTIAL: students.filter((s) => s.missions?.m2?.lastErrorCode === "ERR_PARTIAL" || s.missions?.m1?.lastErrorCode === "ERR_PARTIAL" || s.statsPorMision?.m2?.ultimoError === "ERR_PARTIAL").length,
    ERR_LCD: students.filter((s) => s.missions?.m3?.lastErrorCode === "ERR_LCD" || s.missions?.m4?.lastErrorCode === "ERR_LCD" || s.statsPorMision?.m3?.ultimoError === "ERR_LCD" || s.statsPorMision?.m4?.ultimoError === "ERR_LCD").length,
    ERR_COMPARE: students.filter((s) => s.missions?.m4?.lastErrorCode === "ERR_COMPARE" || s.statsPorMision?.m4?.ultimoError === "ERR_COMPARE").length
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("edumision_docente_id");
      sessionStorage.removeItem("edumision_docente_profile");
    }
    setDocenteId(null);
    setStudents([]);
    setPerfilDocente({ nombre: "", escuela: "IPEM", curso: "1° Año" });
    setFaseDocente("ingreso");
    showToast("🔒 Sesión de docente cerrada. Podés ingresar con otra cuenta.");
  };

  const handleGuardarPerfilDocente = async (e) => {
    e.preventDefault();
    const finalEscuela = tipoEscuela === "Otra" ? escuelaOtra.trim() : tipoEscuela;
    if (!perfilDocente.nombre || !finalEscuela) {
      alert("Por favor completa tu Nombre y Escuela.");
      return;
    }

    const updatedProfile = {
      nombre: perfilDocente.nombre.trim(),
      escuela: finalEscuela,
      curso: perfilDocente.curso || "1° Año"
    };

    const dId = `${slug(updatedProfile.nombre)}__${slug(updatedProfile.escuela)}__${slug(updatedProfile.curso)}`;

    if (db) {
      try {
        const snap = await getDoc(doc(db, "docentes", dId));
        if (snap.exists()) {
          const data = snap.data();
          updatedProfile.nombre = data.nombre || updatedProfile.nombre;
          updatedProfile.escuela = data.escuela || updatedProfile.escuela;
          updatedProfile.curso = data.curso || updatedProfile.curso;
        } else {
          await setDoc(doc(db, "docentes", dId), {
            nombre: updatedProfile.nombre,
            escuela: updatedProfile.escuela,
            curso: updatedProfile.curso,
            codigoAcceso: Math.floor(100000 + Math.random() * 900000).toString(),
            activo: true,
            creadoEn: serverTimestamp()
          });
        }
      } catch (err) {
        console.error("Error al autenticar docente:", err);
      }
    }

    setPerfilDocente(updatedProfile);
    setDocenteId(dId);
    sessionStorage.setItem("edumision_docente_id", dId);
    sessionStorage.setItem("edumision_docente_profile", JSON.stringify(updatedProfile));
    setFaseDocente("panel");
    showToast(`👩‍🏫 Bienvenida/o ${updatedProfile.nombre} (${finalEscuela})`);
  };

  // 1.f FIX: Guardar valoración del docente en Firestore en collection("valoraciones_docentes")
  const handleEnviarEncuestaDocente = async (e) => {
    e.preventDefault();
    if (db) {
      try {
        await addDoc(collection(db, "valoraciones_docentes"), {
          docenteId: docenteId || null,
          nombreDocente: perfilDocente.nombre || "Docente",
          escuela: perfilDocente.escuela || "",
          curso: perfilDocente.curso || "",
          respuestas: encuestaDocente,
          fecha: serverTimestamp()
        });

        if (docenteId) {
          await setDoc(
            doc(db, "docentes", docenteId),
            { encuestaCompletada: true, ultimaValoracion: encuestaDocente },
            { merge: true }
          );
        }
        showToast("✉️ ¡Gracias Profe! Tu valoración fue guardada en Firebase y enviada a Control Central.");
      } catch (err) {
        console.error("Error al enviar valoración docente:", err);
        showToast("⚠️ No se pudo guardar la valoración, verificá tu conexión.");
      }
    }
    setFaseDocente("panel");
  };

  // 1.d FIX: Transmitir mensaje grupal a la cabina de los alumnos
  const handleSendMessage = async () => {
    if (!docenteId || !db) {
      alert("No se pudo identificar la cuenta del docente.");
      return;
    }
    try {
      await setDoc(
        doc(db, "docentes", docenteId),
        {
          mensajeActual: inputMsg,
          mensajeActualizadoEn: serverTimestamp()
        },
        { merge: true }
      );
      setTeacherMessage(inputMsg);
      showToast(`📢 Transmisión enviada a las cabinas: "${inputMsg}"`);
    } catch (err) {
      console.error("Error al transmitir mensaje:", err);
      alert("No se pudo transmitir el mensaje.");
    }
  };

  // 1.c FIX: Filtrado rápido de estudiantes para visualización inmediata
  const filteredStudents = students.filter((s) => {
    const len = (s.misionesCompletadas || []).length;
    if (tableFilter === "COMPLETOS") return len === 4;
    if (tableFilter === "EN_CURSO") return len > 0 && len < 4;
    if (tableFilter === "DESVIOS") return (s.errorsCount || 0) > 0;
    if (tableFilter === "SIN_INICIAR") return len === 0;
    return true;
  });

  return (
    <div style={styles.dashboardContainer}>
      {toastMsg && <div style={styles.toastCard}>{toastMsg}</div>}

      {/* 1. FORMULARIO DE INGRESO Y BIENVENIDA DOCENTE */}
      {faseDocente === "ingreso" && (
        <div style={styles.cardBoxIngreso}>
          <div style={{ fontSize: "52px", marginBottom: "8px", textAlign: "center" }}>🪐</div>
          <h2 style={{ color: "#38bdf8", margin: "0 0 8px 0", textAlign: "center" }}>
            ¡Bienvenida/o a EduMisión Córdoba!
          </h2>
          <p style={{ color: "#cbd5e1", fontSize: "14px", lineHeight: "1.5", marginBottom: "20px", textAlign: "center" }}>
            Muchas gracias por formar parte de esta experiencia. Este es un <strong>proyecto piloto experimental</strong> diseñado para acompañar el aprendizaje de la matemática en el aula.
          </p>

          <form onSubmit={handleGuardarPerfilDocente} style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Nombre y Apellido del Docente:</label>
              <input
                type="text"
                placeholder="Ej: Profe Laura, Prof. Carlos Martínez"
                value={perfilDocente.nombre}
                onChange={(e) => setPerfilDocente({ ...perfilDocente, nombre: e.target.value })}
                style={styles.formInput}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Escuela / Institución:</label>
              <select
                value={tipoEscuela}
                onChange={(e) => {
                  const val = e.target.value;
                  setTipoEscuela(val);
                  const finalEscuela = val === "Otra" ? escuelaOtra : val;
                  setPerfilDocente({ ...perfilDocente, escuela: finalEscuela });
                }}
                style={styles.formSelect}
              >
                <option value="IPEM">IPEM</option>
                <option value="IPET">IPET</option>
                <option value="CENMA">CENMA</option>
                <option value="PROA">PROA</option>
                <option value="Privada">Privada</option>
                <option value="Otra">Otra</option>
              </select>
              {tipoEscuela === "Otra" && (
                <input
                  type="text"
                  placeholder="Escribí el nombre de tu escuela"
                  value={escuelaOtra}
                  onChange={(e) => {
                    setEscuelaOtra(e.target.value);
                    setPerfilDocente({ ...perfilDocente, escuela: e.target.value });
                  }}
                  style={{ ...styles.formInput, marginTop: "8px" }}
                  required
                />
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Curso / Año a Cargo:</label>
              <select
                value={perfilDocente.curso}
                onChange={(e) => setPerfilDocente({ ...perfilDocente, curso: e.target.value })}
                style={styles.formSelect}
              >
                <option value="1° Año">1° Año</option>
                <option value="2° Año">2° Año</option>
                <option value="3° Año">3° Año</option>
              </select>
            </div>

            <div style={styles.bannerBienvenidaInfo}>
              📢 <strong>¿Qué vas a poder ver y hacer en tu panel?</strong><br />
              <ul style={{ margin: "8px 0 8px 18px", padding: 0, fontSize: "13px", color: "#e2e8f0" }}>
                <li style={{ marginBottom: "6px" }}><strong>Monitorear el avance del grupo:</strong> Seguimiento visual del progreso de tus estudiantes en las 4 misiones de fracciones.</li>
                <li style={{ marginBottom: "6px" }}><strong>Diagnóstico automático de desvíos:</strong> Detección de patrones comunes con alertas didácticas inmediatas para la clase presencial.</li>
                <li style={{ marginBottom: "6px" }}><strong>Comunicación colectiva:</strong> Envío de consejos o consignas breves directamente a las pantallas de juego de tus alumnos.</li>
                <li style={{ marginBottom: "6px" }}><strong>Acompañamiento familiar:</strong> Síntesis pedagógicas automáticas para compartir con los padres vía Ciudadano Digital (CiDi).</li>
              </ul>
            </div>

            <button type="submit" style={styles.btnPrimaryIngreso}>
              🚀 INGRESAR A MI CONSOLA DOCENTE
            </button>
          </form>
        </div>
      )}

      {/* 2. PANEL PRINCIPAL DOCENTE */}
      {faseDocente === "panel" && (
        <>
          <header style={styles.dashboardHeader}>
            <div>
              <h1 style={styles.dashboardTitle}>Consola de Monitoreo Docente</h1>
              <p style={styles.dashboardSubtitle}>
                {perfilDocente.nombre || "Profe"} · {perfilDocente.escuela || "Escuela"} ({perfilDocente.curso || "1° Año"})
              </p>
            </div>

            <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
              <button onClick={() => setShowGroupAnalysis(true)} style={styles.btnGroupAnalysisTop}>
                📊 ANÁLISIS GRUPAL 360°
              </button>

              <button onClick={() => setFaseDocente("evaluacion")} style={styles.btnValoracionTop}>
                📝 VALORAR CONSOLA
              </button>

              <button onClick={handleLogout} style={styles.btnLogout} title="Cerrar sesión e ingresar con otra cuenta">
                🔒 Salir
              </button>

              <span style={styles.teacherBadge}>👩‍🏫 DOCENTE AUTENTICADA</span>
            </div>
          </header>

          {/* FICHA POPUP PEDAGÓGICA AL HACER CLICK EN CADA MISIÓN */}
          {pedagogicalPopup && MISSION_PEDAGOGICAL_INFO[pedagogicalPopup] && (
            <div style={styles.topModalOverlay} onClick={() => setPedagogicalPopup(null)}>
              <div style={styles.topModalCardWide} onClick={(e) => e.stopPropagation()}>
                <div style={styles.topModalHeader}>
                  <h3 style={{ margin: 0, color: "#38bdf8", fontSize: "16px" }}>
                    ℹ️ Ficha Pedagógica: {MISSION_PEDAGOGICAL_INFO[pedagogicalPopup].title}
                  </h3>
                  <button style={styles.btnCloseModal} onClick={() => setPedagogicalPopup(null)}>×</button>
                </div>
                <div style={styles.pedagogicalBody}>
                  <p style={{ margin: "0 0 10px 0", fontSize: "13px", color: "#c084fc", fontWeight: "bold" }}>
                    Subtema: {MISSION_PEDAGOGICAL_INFO[pedagogicalPopup].subtitle}
                  </p>
                  <div style={styles.pedagogicalBox}>
                    <strong>🎮 Dinámica en Pantalla Alumno:</strong> {MISSION_PEDAGOGICAL_INFO[pedagogicalPopup].action}
                  </div>
                  <div style={styles.pedagogicalBox}>
                    <strong>🎯 Objetivo & Aprendizaje Buscado:</strong> {MISSION_PEDAGOGICAL_INFO[pedagogicalPopup].objectives}
                  </div>
                  <div style={styles.pedagogicalBox}>
                    <strong>📊 Evidencia de Conocimiento:</strong> {MISSION_PEDAGOGICAL_INFO[pedagogicalPopup].evidence}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3 TARJETAS KPI */}
          <div style={styles.kpiGrid}>
            <div style={{ ...styles.kpiCard, borderLeft: "4px solid #38bdf8" }}>
              <p style={styles.kpiLabel}>🔵 % AVANCE (AL MENOS 1 MISIÓN)</p>
              <p style={{ ...styles.kpiValue, color: "#38bdf8" }}>{atLeastOnePercentage}%</p>
              <div style={styles.kpiSub}>{atLeastOneCompleted} de {totalStudents} alumnos con avance</div>
            </div>
            <div style={{ ...styles.kpiCard, borderLeft: "4px solid #10b981" }}>
              <p style={styles.kpiLabel}>🟢 % COMPLETITUD (4 MISIONES)</p>
              <p style={{ ...styles.kpiValue, color: "#4ade80" }}>{allFourPercentage}%</p>
              <div style={styles.kpiSub}>{allFourCompleted} de {totalStudents} alumnos completaron las 4</div>
            </div>
            <div style={{ ...styles.kpiCard, borderLeft: "4px solid #c084fc" }}>
              <p style={styles.kpiLabel}>🟣 % DOMINANTES (INSIGNIA)</p>
              <p style={{ ...styles.kpiValue, color: "#c084fc" }}>{badgePercentage}%</p>
              <div style={styles.kpiSub}>{badgesAwarded} de {totalStudents} alumnos acreditados</div>
            </div>
          </div>

          {/* 1.d FIX: CONTROLES DE TRANSMISIÓN GRUPAL EN TIEMPO REAL */}
          <div style={styles.dashboardTeacherControlsCard}>
            <h3 style={{ ...styles.cardSectionTitle, color: "#c084fc", margin: 0 }}>
              📢 Enviar Consejos Colectivos a las Cabinas en Vivo
            </h3>
            <p style={{ ...styles.instructions, margin: 0 }}>
              Escribí un aviso o sugerencia de aula. Aparecerá inmediatamente en las pantallas de todos los estudiantes asignados a tu cuenta.
            </p>
            <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
              <input
                type="text"
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                placeholder="Ej: ¡Tripulantes, recuerden usar lápiz y papel antes de responder!"
                style={styles.teacherDashboardInput}
              />
              <button onClick={handleSendMessage} style={styles.teacherDashboardSendBtn}>
                Transmitir Consejo
              </button>
            </div>
          </div>

          <div style={styles.dashboardGrid}>
            <div style={styles.leftColumn}>
              <div style={styles.dashboardCard}>
                
                {/* 1.c FIX: FILTROS DE VISUALIZACIÓN RÁPIDA DE ALUMNOS */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
                  <h3 style={{ ...styles.cardSectionTitle, margin: 0 }}>Listado General de Alumnos ({filteredStudents.length})</h3>
                  <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                    {[
                      { key: "TODOS", label: "Todos" },
                      { key: "COMPLETOS", label: "🟢 4 Misiones" },
                      { key: "EN_CURSO", label: "⚡ En Curso" },
                      { key: "DESVIOS", label: "⚠️ Con Desvíos" },
                      { key: "SIN_INICIAR", label: "⏳ Sin Iniciar" }
                    ].map((f) => (
                      <button
                        key={f.key}
                        onClick={() => setTipoFilter(f.key)}
                        style={{
                          padding: "3px 8px",
                          borderRadius: "4px",
                          border: tableFilter === f.key ? "1px solid #38bdf8" : "1px solid #334155",
                          backgroundColor: tableFilter === f.key ? "rgba(56, 189, 248, 0.2)" : "#020617",
                          color: tableFilter === f.key ? "#38bdf8" : "#94a3b8",
                          fontSize: "10px",
                          fontWeight: "bold",
                          cursor: "pointer"
                        }}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                <table style={styles.table}>
                  <thead>
                    <tr style={styles.tableHeaderRow}>
                      <th style={styles.th}>Alumno (Nave)</th>
                      <th style={styles.th}>
                        <button onClick={() => setPedagogicalPopup("m1")} style={styles.btnPedagogicalPill}>
                          M1 ℹ️
                        </button>
                      </th>
                      <th style={styles.th}>
                        <button onClick={() => setPedagogicalPopup("m2")} style={styles.btnPedagogicalPill}>
                          M2 ℹ️
                        </button>
                      </th>
                      <th style={styles.th}>
                        <button onClick={() => setPedagogicalPopup("m3")} style={styles.btnPedagogicalPill}>
                          M3 ℹ️
                        </button>
                      </th>
                      <th style={styles.th}>
                        <button onClick={() => setPedagogicalPopup("m4")} style={styles.btnPedagogicalPill}>
                          M4 ℹ️
                        </button>
                      </th>
                      <th style={styles.th}>Avance / XP</th>
                      <th style={styles.th}>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* 1.b FIX: SI NO TIENE ALUMNOS ASIGNADOS MUESTRA PANTALLA LIMPIA */}
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ fontStyle: "italic", color: "#64748b", padding: "24px", textAlign: "center", lineHeight: "1.6" }}>
                          {students.length === 0
                            ? "Todavía no tenés alumnos asignados. Pedile al Control Central que los vincule a tu cuenta."
                            : "No hay alumnos que coincidan con el filtro seleccionado."}
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((student) => {
                        const completadasCount = (student.misionesCompletadas || []).length;
                        return (
                          <tr key={student.id} style={styles.tr}>
                            <td style={{ ...styles.td, fontWeight: "bold", color: "#ffffff" }}>
                              {student.name || student.nickname || "Alumno"} <br />
                              <span style={{ fontSize: "10px", color: "#94a3b8" }}>{student.escuela || "Escuela"}</span>
                            </td>
                            <td style={styles.td}>{renderMissionCell(student, "m1")}</td>
                            <td style={styles.td}>{renderMissionCell(student, "m2")}</td>
                            <td style={styles.td}>{renderMissionCell(student, "m3")}</td>
                            <td style={styles.td}>{renderMissionCell(student, "m4")}</td>
                            <td style={styles.td}>
                              <div style={{ fontSize: "11px", fontWeight: "bold", color: "#38bdf8" }}>
                                {student.xpTotal || student.xp || 0} XP
                              </div>
                              <div style={{ fontSize: "10px", color: completadasCount === 4 ? "#4ade80" : "#94a3b8" }}>
                                {completadasCount === 4 ? "🏆 Insignia" : `${completadasCount}/4 Logradas`}
                              </div>
                            </td>
                            <td style={styles.td}>
                              {/* 1.a FIX: BOTÓN ANALIZAR CON RENDERIZADO SEGURO */}
                              <button onClick={() => setSelectedStudent(student)} style={styles.btnTableAction}>
                                Analizar
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* COLUMNA DERECHA: DIAGNÓSTICO COLECTIVO DEL SISTEMA EXPERTO */}
            <div style={styles.rightColumn}>
              <div style={styles.dashboardCard}>
                <h3 style={styles.cardSectionTitle}>Diagnóstico Colectivo (Sistema Experto)</h3>
                <p style={styles.instructions}>
                  El motor agrupa los desvíos detectados para facilitar la intervención presencial del docente en la clase.
                </p>

                <div style={styles.alertsContainer}>
                  <div style={{
                    ...styles.alertBox,
                    borderColor: errorsCount.ERR_DIRECT > 0 ? "#fb923c" : "#1e293b",
                    backgroundColor: errorsCount.ERR_DIRECT > 0 ? "rgba(251,146,60,0.05)" : "transparent"
                  }}>
                    <div style={styles.alertHeader}>
                      <span style={errorsCount.ERR_DIRECT > 0 ? styles.alertTitleActive : styles.alertTitleInactive}>
                        ⚠ Error Suma Directa (Sin unificar base)
                      </span>
                      <span style={styles.alertBadge}>{errorsCount.ERR_DIRECT} Alumnos</span>
                    </div>
                    {errorsCount.ERR_DIRECT > 0 && (
                      <p style={styles.alertDesc}>{SYSTEM_EXPERT_ALERTS.ERR_DIRECT}</p>
                    )}
                  </div>

                  <div style={{
                    ...styles.alertBox,
                    borderColor: errorsCount.ERR_LCD > 0 ? "#fb923c" : "#1e293b",
                    backgroundColor: errorsCount.ERR_LCD > 0 ? "rgba(251,146,60,0.05)" : "transparent"
                  }}>
                    <div style={styles.alertHeader}>
                      <span style={errorsCount.ERR_LCD > 0 ? styles.alertTitleActive : styles.alertTitleInactive}>
                        🧩 Error Cálculo Denominador Común
                      </span>
                      <span style={styles.alertBadge}>{errorsCount.ERR_LCD} Alumnos</span>
                    </div>
                    {errorsCount.ERR_LCD > 0 && (
                      <p style={styles.alertDesc}>{SYSTEM_EXPERT_ALERTS.ERR_LCD}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 1.a FIX: MODAL DE ANÁLISIS INDIVIDUAL CON FALLBACKS SEGUROS */}
          {selectedStudent && (
            <DrawerWithSendButton
              student={selectedStudent}
              onClose={() => setSelectedStudent(null)}
            />
          )}

          {/* 1.e FIX: MODAL DE ANÁLISIS GRUPAL 360° */}
          {showGroupAnalysis && (
            <GroupAnalysisModal
              students={students}
              onClose={() => setShowGroupAnalysis(false)}
            />
          )}
        </>
      )}

      {/* 3. CUESTIONARIO FINAL DE VALORACIÓN Y EVALUACIÓN DOCENTE (1.f FIX) */}
      {faseDocente === "evaluacion" && (
        <div style={styles.cardBoxIngreso}>
          <div style={{ fontSize: "52px", marginBottom: "8px", textAlign: "center" }}>📝</div>
          <h2 style={{ color: "#38bdf8", margin: "0 0 8px 0", textAlign: "center" }}>
            Valoración Pedagógica del Piloto (Docente)
          </h2>
          <p style={{ color: "#cbd5e1", fontSize: "14px", lineHeight: "1.5", marginBottom: "20px", textAlign: "center" }}>
            Tu retroalimentación se guarda automáticamente en Firebase y es consultable por Control Central.
          </p>

          <form onSubmit={handleEnviarEncuestaDocente} style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.surveyLabelDocente}>
                1. Valor Pedagógico de las Misiones: ¿Cómo evaluás la propuesta de las 4 misiones de fracciones?
              </label>
              <div style={styles.radioGroup}>
                {["Muy valiosa", "Valiosa", "Poco valiosa", "No aporta al aula"].map((opt) => (
                  <label key={opt} style={styles.radioOptionDocente}>
                    <input
                      type="radio"
                      name="valorPedagogico"
                      value={opt}
                      checked={encuestaDocente.valorPedagogico === opt}
                      onChange={(e) => setEncuestaDocente({ ...encuestaDocente, valorPedagogico: e.target.value })}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.surveyLabelDocente}>
                2. Nivel de Dificultad: ¿Cómo percibiste la dificultad de los desafíos para tus alumnos?
              </label>
              <div style={styles.radioGroup}>
                {["Adecuada", "Muy alta", "Muy baja", "Desigual según la misión"].map((opt) => (
                  <label key={opt} style={styles.radioOptionDocente}>
                    <input
                      type="radio"
                      name="nivelDificultad"
                      value={opt}
                      checked={encuestaDocente.nivelDificultad === opt}
                      onChange={(e) => setEncuestaDocente({ ...encuestaDocente, nivelDificultad: e.target.value })}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.surveyLabelDocente}>
                3. Contacto Grupal (Mensajes a Cabinas): ¿Qué tan útil te resultó transmitir avisos colectivos en vivo?
              </label>
              <div style={styles.radioGroup}>
                {["Muy útil", "Útil", "Poco útil", "No la utilicé"].map((opt) => (
                  <label key={opt} style={styles.radioOptionDocente}>
                    <input
                      type="radio"
                      name="contactoGrupal"
                      value={opt}
                      checked={encuestaDocente.contactoGrupal === opt}
                      onChange={(e) => setEncuestaDocente({ ...encuestaDocente, contactoGrupal: e.target.value })}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.surveyLabelDocente}>
                4. Síntesis para Familias (vía CiDi): ¿Qué valor le encontrás a compartir sugerencias pedagógicas con el hogar?
              </label>
              <div style={styles.radioGroup}>
                {["Alto valor para involucrar a los padres", "Moderado", "Escaso", "Prefiero comunicación tradicional"].map((opt) => (
                  <label key={opt} style={styles.radioOptionDocente}>
                    <input
                      type="radio"
                      name="sintesisFamilias"
                      value={opt}
                      checked={encuestaDocente.sintesisFamilias === opt}
                      onChange={(e) => setEncuestaDocente({ ...encuestaDocente, sintesisFamilias: e.target.value })}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.surveyLabelDocente}>
                5. Propuestas de Mejora: ¿Qué cambios o sugerencias nos dejás para perfeccionar este panel?
              </label>
              <textarea
                placeholder="Escribí aquí tus comentarios, ideas o sugerencias de mejora..."
                value={encuestaDocente.sugerenciasMejora}
                onChange={(e) => setEncuestaDocente({ ...encuestaDocente, sugerenciasMejora: e.target.value })}
                style={styles.formTextareaDocente}
                rows="4"
              />
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
              <button type="submit" style={styles.btnPrimaryIngreso}>
                ✉️ GUARDAR Y ENVIAR VALORACIÓN A CONTROL CENTRAL
              </button>
              <button
                type="button"
                onClick={() => setFaseDocente("panel")}
                style={styles.btnCancelDocente}
              >
                Cancelar y Volver al Panel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
