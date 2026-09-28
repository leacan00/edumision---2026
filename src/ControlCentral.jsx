import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import React, { useState, useEffect } from "react";

// ==========================================
// 🛠️ HELPER EXPORTADOR A EXCEL / LIBREOFFICE (.CSV NATIVO)
// ==========================================
// Utiliza BOM UTF-8 (﻿) y punto y coma (;) como separador oficial
// para abrir directamente en Excel/LibreOffice sin ventanas de configuración.
const exportToExcelCSV = (filename, headers, rows) => {
  const bom = "\uFEFF";
  const csvContent = bom + [
    headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(";"),
    ...rows.map(row => row.map(cell => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(";"))
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// ==========================================
// 🛠️ DATOS SEMILLA DE CONTROL CENTRAL (CC)
// ==========================================
const INITIAL_DOCENTES = [
  { id: "d1", name: "Profe Laura", escuela: "Escuela IPEM 268", curso: "1° Año B", cursoId: "curso-268-1b", alumnosCount: 4 },
  { id: "d2", name: "Profe Carlos", escuela: "Colegio Manuel Belgrano", curso: "1° Año A", cursoId: "curso-mb-1a", alumnosCount: 3 },
  { id: "d3", name: "Profe Mariana", escuela: "IPEM 198 Martín Fierro", curso: "1° Año C", cursoId: "curso-198-1c", alumnosCount: 1 }
];

const INITIAL_UNLINKED = [
  { uuid: "u-101", nickname: "Nico_Space", edad: "13", curso: "1° B", escuela: "IPEM 268", xp: 100, lastActive: "16:42:10" },
  { uuid: "u-102", nickname: "Valen_2026", edad: "12", curso: "1° A", escuela: "Manuel Belgrano", xp: 250, lastActive: "16:40:05" },
  { uuid: "u-103", nickname: "Gabi_R", edad: "13", curso: "1° B", escuela: "IPEM 268", xp: 0, lastActive: "16:38:19" },
  { uuid: "u-104", nickname: "Lia_Star", edad: "12", curso: "1° C", escuela: "IPEM 198", xp: 450, lastActive: "16:35:00" }
];

const INITIAL_LINKED = [
  {
    uuid: "7a3b2c1d-4e5f-6a7b-8c9d-0e1f2a3b4c5d",
    nickname: "Martín G.",
    edad: "13",
    docenteId: "d1",
    escuela: "Escuela IPEM 268",
    curso: "1° Año B",
    xp: 500,
    badgeEarned: true,
    interestFase2: true,
    helpsCount: 1,
    errorsCount: 1,
    justification: "Master",
    missions: {
      m1: { status: "completada", attempts: 1, helps: 0, errors: 0, lastError: null },
      m2: { status: "completada", attempts: 1, helps: 0, errors: 0, lastError: null },
      m3: { status: "completada", attempts: 2, helps: 1, errors: 1, lastError: "ERR_LCD" },
      m4: { status: "completada", attempts: 1, helps: 0, errors: 0, lastError: null }
    }
  },
  {
    uuid: "8b4c3d2e-5f6a-7b8c-9d0e-1f2a3b4c5d6e",
    nickname: "Sofía V.",
    edad: "12",
    docenteId: "d1",
    escuela: "Escuela IPEM 268",
    curso: "1° Año B",
    xp: 250,
    badgeEarned: false,
    interestFase2: true,
    helpsCount: 2,
    errorsCount: 4,
    justification: null,
    missions: {
      m1: { status: "completada", attempts: 2, helps: 1, errors: 1, lastError: "ERR_DIRECT" },
      m2: { status: "en_curso", attempts: 3, helps: 1, errors: 3, lastError: "ERR_DIRECT" },
      m3: { status: "bloqueada", attempts: 0, helps: 0, errors: 0, lastError: null },
      m4: { status: "bloqueada", attempts: 0, helps: 0, errors: 0, lastError: null }
    }
  },
  {
    uuid: "9c5d4e3f-6a7b-8c9d-0e1f-2a3b4c5d6e7f",
    nickname: "Facundo S.",
    edad: "13",
    docenteId: "d1",
    escuela: "Escuela IPEM 268",
    curso: "1° Año B",
    xp: 450,
    badgeEarned: false,
    interestFase2: false,
    helpsCount: 3,
    errorsCount: 3,
    justification: null,
    missions: {
      m1: { status: "completada", attempts: 1, helps: 0, errors: 0, lastError: null },
      m2: { status: "completada", attempts: 2, helps: 1, errors: 1, lastError: "ERR_PARTIAL" },
      m3: { status: "completada", attempts: 3, helps: 2, errors: 2, lastError: "ERR_LCD" },
      m4: { status: "bloqueada", attempts: 0, helps: 0, errors: 0, lastError: null }
    }
  },
  {
    uuid: "1d2e3f4a-5b6c-7d8e-9f0a-1b2c3d4e5f6a",
    nickname: "Valentina R.",
    edad: "13",
    docenteId: "d1",
    escuela: "Escuela IPEM 268",
    curso: "1° Año B",
    xp: 500,
    badgeEarned: true,
    interestFase2: true,
    helpsCount: 0,
    errorsCount: 0,
    justification: "Master",
    missions: {
      m1: { status: "completada", attempts: 1, helps: 0, errors: 0, lastError: null },
      m2: { status: "completada", attempts: 1, helps: 0, errors: 0, lastError: null },
      m3: { status: "completada", attempts: 1, helps: 0, errors: 0, lastError: null },
      m4: { status: "completada", attempts: 1, helps: 0, errors: 0, lastError: null }
    }
  },
  {
    uuid: "2e3f4a5b-6c7d-8e9f-0a1b-2c3d4e5f6a7b",
    nickname: "Tomás B.",
    edad: "12",
    docenteId: "d2",
    escuela: "Colegio Manuel Belgrano",
    curso: "1° Año A",
    xp: 100,
    badgeEarned: false,
    interestFase2: false,
    helpsCount: 2,
    errorsCount: 2,
    justification: null,
    missions: {
      m1: { status: "completada", attempts: 3, helps: 2, errors: 2, lastError: "ERR_PARTIAL" },
      m2: { status: "bloqueada", attempts: 0, helps: 0, errors: 0, lastError: null },
      m3: { status: "bloqueada", attempts: 0, helps: 0, errors: 0, lastError: null },
      m4: { status: "bloqueada", attempts: 0, helps: 0, errors: 0, lastError: null }
    }
  },
  {
    uuid: "3f4a5b6c-7d8e-9f0a-1b2c-3d4e5f6a7b8c",
    nickname: "Camila O.",
    edad: "13",
    docenteId: "d2",
    escuela: "Colegio Manuel Belgrano",
    curso: "1° Año A",
    xp: 450,
    badgeEarned: false,
    interestFase2: true,
    helpsCount: 1,
    errorsCount: 3,
    justification: null,
    missions: {
      m1: { status: "completada", attempts: 1, helps: 0, errors: 0, lastError: null },
      m2: { status: "completada", attempts: 1, helps: 0, errors: 0, lastError: null },
      m3: { status: "completada", attempts: 4, helps: 1, errors: 3, lastError: "ERR_LCD" },
      m4: { status: "bloqueada", attempts: 0, helps: 0, errors: 0, lastError: null }
    }
  },
  {
    uuid: "4a5b6c7d-8e9f-0a1b-2c3d-4e5f6a7b8c9d",
    nickname: "Bautista L.",
    edad: "13",
    docenteId: "d2",
    escuela: "Colegio Manuel Belgrano",
    curso: "1° Año A",
    xp: 500,
    badgeEarned: true,
    interestFase2: true,
    helpsCount: 2,
    errorsCount: 2,
    justification: "Intuitive",
    missions: {
      m1: { status: "completada", attempts: 2, helps: 1, errors: 1, lastError: "ERR_DIRECT" },
      m2: { status: "completada", attempts: 1, helps: 0, errors: 0, lastError: null },
      m3: { status: "completada", attempts: 2, helps: 1, errors: 1, lastError: "ERR_COMPARE" },
      m4: { status: "completada", attempts: 1, helps: 0, errors: 0, lastError: null }
    }
  },
  {
    uuid: "5b6c7d8e-9f0a-1b2c-3d4e-5f6a7b8c9d0e",
    nickname: "Delfina P.",
    edad: "12",
    docenteId: "d3",
    escuela: "IPEM 198 Martín Fierro",
    curso: "1° Año C",
    xp: 0,
    badgeEarned: false,
    interestFase2: false,
    helpsCount: 0,
    errorsCount: 0,
    justification: null,
    missions: {
      m1: { status: "bloqueada", attempts: 0, helps: 0, errors: 0, lastError: null },
      m2: { status: "bloqueada", attempts: 0, helps: 0, errors: 0, lastError: null },
      m3: { status: "bloqueada", attempts: 0, helps: 0, errors: 0, lastError: null },
      m4: { status: "bloqueada", attempts: 0, helps: 0, errors: 0, lastError: null }
    }
  }
];

const MOCK_XAPI_LOGS = [
  { time: "2026-09-10 16:42:10", uuid: "u-101", actor: "Nico_Space", verb: "CONECTÓ", object: "Inicio de sesión autónomo", details: "Ingreso sin vinculación" },
  { time: "2026-09-10 16:30:15", uuid: "7a3b2c1d-4e5f-6a7b", actor: "Martín G.", verb: "COMPLETÓ", object: "M4_TRAYECTORIA_FINAL", details: "Insignia ganada + 300 XP" },
  { time: "2026-09-10 16:25:02", uuid: "7a3b2c1d-4e5f-6a7b", actor: "Martín G.", verb: "JUSTIFICÓ", object: "M4_PASO_FINAL", details: "Razonamiento Científico (Master)" },
  { time: "2026-09-10 16:18:44", uuid: "8b4c3d2e-5f6a-7b8c", actor: "Sofía V.", verb: "CONSULTÓ", object: "REGLAS_MATEMATICAS_M2", details: "Pista solicitada a EduBot" },
  { time: "2026-09-10 16:15:20", uuid: "8b4c3d2e-5f6a-7b8c", actor: "Sofía V.", verb: "DESVÍO", object: "M2_CARGA_COMBUSTIBLE", details: "ERR_DIRECT (Suma directa)" },
  { time: "2026-09-10 16:10:00", uuid: "1d2e3f4a-5b6c-7d8e", actor: "Valentina R.", verb: "COMPLETÓ", object: "M4_TRAYECTORIA_FINAL", details: "Insignia ganada sin errores" }
];

export default function App() {
  const [docentes, setDocentes] = useState(INITIAL_DOCENTES);
  const [unlinked, setUnlinked] = useState(INITIAL_UNLINKED);
  const [linked, setLinked] = useState(INITIAL_LINKED);
  const [activeTab, setActiveTab] = useState("vincular"); // "vincular" | "metricas" | "excel"
  const [toast, setToast] = useState(null);

  // Estados para vinculación rápida
  const [selectedDocenteForAssign, setSelectedDocenteForAssign] = useState(INITIAL_DOCENTES[0].id);

  // Estados para modal de alta docente
  const [showAddDocenteModal, setShowDocenteModal] = useState(false);
  const [newDocenteName, setNewDocenteName] = useState("");
  const [newEscuela, setNewEscuela] = useState("");
  const [newCurso, setNewCurso] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Telemetría y Detección de Alumnos Flotantes en Tiempo Real desde Firestore
  const [liveLogs, setLiveLogs] = useState([]);

  useEffect(() => {
    let unsubscribe = () => {};
    try {
      const q = query(collection(db, "bitacora_alumnos"), orderBy("fecha", "desc"));
      unsubscribe = onSnapshot(q, (snapshot) => {
        const logs = [];
        snapshot.forEach((doc) => {
          logs.push({ id: doc.id, ...doc.data() });
        });
        setLiveLogs(logs);

        // Ingesta automática de nuevos alumnos no vinculados
        if (logs.length > 0) {
          logs.forEach((log) => {
            if (log.alumno) {
              setUnlinked((prev) => {
                if (prev.some((u) => u.nickname.toLowerCase() === log.alumno.toLowerCase())) return prev;
                return [
                  {
                    uuid: log.id || `u-${Date.now()}`,
                    nickname: log.alumno,
                    edad: "12",
                    curso: log.curso || "1° Año",
                    escuela: log.escuela || "Escuela Piloto",
                    xp: log.xp || 150,
                    lastActive: "En vivo (Firestore)"
                  },
                  ...prev
                ];
              });
            }
          });
        }
      }, (err) => console.error("Firestore error:", err));
    } catch (e) {
      console.error("Firestore no disponible:", e);
    }
    return () => unsubscribe();
  }, []);



  // 1. Vinculación de Alumno desde Unlinked a Linked
  const handleAssignStudent = (studentUuid) => {
    const targetStudent = unlinked.find((s) => s.uuid === studentUuid);
    const targetDocente = docentes.find((d) => d.id === selectedDocenteForAssign);

    if (!targetStudent || !targetDocente) return;

    // Crear nuevo alumno vinculado
    const newLinkedStudent = {
      uuid: targetStudent.uuid,
      nickname: targetStudent.nickname,
      edad: targetStudent.edad,
      docenteId: targetDocente.id,
      escuela: targetDocente.escuela,
      curso: targetDocente.curso,
      xp: targetStudent.xp,
      badgeEarned: targetStudent.xp >= 500,
      interestFase2: false,
      helpsCount: 0,
      errorsCount: 0,
      justification: null,
      missions: {
        m1: { status: targetStudent.xp >= 100 ? "completada" : "en_curso", attempts: 1, helps: 0, errors: 0, lastError: null },
        m2: { status: "bloqueada", attempts: 0, helps: 0, errors: 0, lastError: null },
        m3: { status: "bloqueada", attempts: 0, helps: 0, errors: 0, lastError: null },
        m4: { status: "bloqueada", attempts: 0, helps: 0, errors: 0, lastError: null }
      }
    };

    setLinked((prev) => [newLinkedStudent, ...prev]);
    setUnlinked((prev) => prev.filter((s) => s.uuid !== studentUuid));
    setDocentes((prev) =>
      prev.map((d) => (d.id === targetDocente.id ? { ...d, alumnosCount: d.alumnosCount + 1 } : d))
    );

    showToast(`✅ Alumno "${targetStudent.nickname}" vinculado con éxito a ${targetDocente.name} (${targetDocente.curso})`);
  };

  // 2. Desvincular / Quitar Alumno
  const handleRemoveLinkedStudent = (studentUuid) => {
    const target = linked.find((s) => s.uuid === studentUuid);
    if (!target) return;

    if (window.confirm(`¿Confirmás quitar al alumno "${target.nickname}" de la lista vinculada?`)) {
      setLinked((prev) => prev.filter((s) => s.uuid !== studentUuid));
      setDocentes((prev) =>
        prev.map((d) => (d.id === target.docenteId ? { ...d, alumnosCount: Math.max(0, d.alumnosCount - 1) } : d))
      );
      showToast(`🗑️ Alumno "${target.nickname}" quitado de la matriz.`);
    }
  };

  // 3. Quitar Docente
  const handleRemoveDocente = (docenteId) => {
    const targetDocente = docentes.find((d) => d.id === docenteId);
    if (!targetDocente) return;

    if (window.confirm(`¿Eliminar al docente ${targetDocente.name} (${targetDocente.escuela})? Los alumnos vinculados pasarán a estado pendiente.`)) {
      // Mover sus alumnos vinculados de vuelta a unlinked o desvincularlos
      const studentsToUnlink = linked.filter((s) => s.docenteId === docenteId);
      const newUnlinked = studentsToUnlink.map((s) => ({
        uuid: s.uuid,
        nickname: s.nickname,
        edad: s.edad,
        curso: s.curso,
        escuela: s.escuela,
        xp: s.xp,
        lastActive: "Reciente"
      }));

      setUnlinked((prev) => [...newUnlinked, ...prev]);
      setLinked((prev) => prev.filter((s) => s.docenteId !== docenteId));
      setDocentes((prev) => prev.filter((d) => d.id !== docenteId));

      showToast(`🗑️ Docente ${targetDocente.name} eliminado. Alumnos reubicados en cola de espera.`);
    }
  };

  // 4. Agregar Docente
  const handleAddDocenteSubmit = (e) => {
    e.preventDefault();
    if (!newDocenteName || !newEscuela || !newCurso) return;

    const newDoc = {
      id: `d-${Date.now()}`,
      name: newDocenteName,
      escuela: newEscuela,
      curso: newCurso,
      cursoId: `curso-${Date.now()}`,
      alumnosCount: 0
    };

    setDocentes((prev) => [...prev, newDoc]);
    setShowDocenteModal(false);
    setNewDocenteName("");
    setNewEscuela("");
    setNewCurso("");
    showToast(`✨ Docente ${newDoc.name} habilitado/a para ${newDoc.escuela} (${newDoc.curso})`);
  };

  // 📊 CÁLCULOS DE MÉTRICAS DEL PILOTÍN PARA CC
  const totalRoster = linked.length;
  const m1Completados = linked.filter((s) => s.missions.m1.status === "completada").length;
  const m2Completados = linked.filter((s) => s.missions.m2.status === "completada").length;
  const m3Completados = linked.filter((s) => s.missions.m3.status === "completada").length;
  const m4Completados = linked.filter((s) => s.missions.m4.status === "completada").length;

  const totalInsignias = linked.filter((s) => s.badgeEarned).length;
  const totalInteresFase2 = linked.filter((s) => s.interestFase2).length;

  const totalDesviosDirect = linked.filter((s) => Object.values(s.missions).some((m) => m.lastError === "ERR_DIRECT")).length;
  const totalDesviosLcd = linked.filter((s) => Object.values(s.missions).some((m) => m.lastError === "ERR_LCD")).length;
  const totalDesviosPartial = linked.filter((s) => Object.values(s.missions).some((m) => m.lastError === "ERR_PARTIAL")).length;
  const totalDesviosCompare = linked.filter((s) => Object.values(s.missions).some((m) => m.lastError === "ERR_COMPARE")).length;

  // 📥 EXPORTACIONES A EXCEL (.CSV FORMATO DIRECTO)
  const handleExportConsolidadoExcel = () => {
    const headers = [
      "UUID Alumno",
      "Nick / Apodo",
      "Edad",
      "Escuela",
      "Curso",
      "Docente Asignado",
      "XP Total",
      "Insignia Acreditada (M4)",
      "Interés Fase 2 Interdisciplinaria",
      "Justificación M4",
      "Consultas EduBot (Pistas)",
      "Errores Totales",
      "Estado M1",
      "Estado M2",
      "Estado M3",
      "Estado M4"
    ];

    const rows = linked.map((s) => {
      const doc = docentes.find((d) => d.id === s.docenteId);
      return [
        s.uuid,
        s.nickname,
        s.edad,
        s.escuela,
        s.curso,
        doc ? doc.name : "Sin Docente",
        s.xp,
        s.badgeEarned ? "SÍ (Ingeniero Fusión)" : "NO",
        s.interestFase2 ? "SÍ (Solicitó Continuar)" : "NO",
        s.justification === "Master" ? "Científica (Master)" : s.justification === "Intuitive" ? "Intuitiva" : "Sin Justificar",
        s.helpsCount,
        s.errorsCount,
        s.missions.m1.status,
        s.missions.m2.status,
        s.missions.m3.status,
        s.missions.m4.status
      ];
    });

    exportToExcelCSV(`EduMision_ControlCentral_Consolidado_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
    showToast("📊 Reporte Consolidado generado para Excel / LibreOffice.");
  };

  const handleExportXapiLogsExcel = () => {
    const headers = ["Fecha / Hora", "UUID Alumno", "Nick / Actor", "Acción / Verbo", "Misión / Objeto", "Detalles / Parámetros"];
    const rows = MOCK_XAPI_LOGS.map((log) => [
      log.time,
      log.uuid,
      log.actor,
      log.verb,
      log.object,
      log.details
    ]);

    exportToExcelCSV(`EduMision_Telemetria_xAPI_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
    showToast("📜 Matriz de Telemetría xAPI exportada a Excel.");
  };

  return (
    <div style={styles.appContainer}>
      {/* TOAST DE NOTIFICACIONES */}
      {toast && <div style={styles.toastCard}>{toast}</div>}

      {/* HEADER PRINCIPAL */}
      <header style={styles.header}>
        <div style={styles.headerTitleGroup}>
          <div style={styles.logoBadge}>CC</div>
          <div>
            <h1 style={styles.headerTitle}>EduMisión Córdoba — Control Central (CC)</h1>
            <p style={styles.headerSub}>
              Gestión de Matrículas, Vinculación Autónoma y Evaluación Integrada del Pilotín
            </p>
          </div>
        </div>
        <div style={styles.headerRightInfo}>
          <span style={styles.serverPill}>🟢 Servidor LRS: /api/lrs En Línea</span>
          <span style={styles.rolePill}>🕹️ Operador de Control Central</span>
        </div>
      </header>

      {/* PESTAÑAS DE NAVEGACIÓN CC */}
      <nav style={styles.tabNav}>
        <button
          onClick={() => setActiveTab("vincular")}
          style={activeTab === "vincular" ? styles.tabBtnActive : styles.tabBtnInactive}
        >
          🔗 Matrícula y Vinculación ({unlinked.length} Pendientes)
        </button>
        <button
          onClick={() => setActiveTab("metricas")}
          style={activeTab === "metricas" ? styles.tabBtnActive : styles.tabBtnInactive}
        >
          📊 Evaluación del Pilotín (Métricas CC)
        </button>
        <button
          onClick={() => setActiveTab("excel")}
          style={activeTab === "excel" ? styles.tabBtnActive : styles.tabBtnInactive}
        >
          📥 Descargas Excel (.CSV Directo)
        </button>
      </nav>

      {/* CONTENIDO 1: MATRÍCULA Y VINCULACIÓN */}
      {activeTab === "vincular" && (
        <div style={styles.tabContent}>
          <div style={styles.twinGrid}>
            
            {/* PANEL IZQUIERDO: ALUMNOS SIN VINCULAR (COLA DE ESPERA) */}
            <div style={styles.panelCard}>
              <div style={styles.panelHeader}>
                <h2 style={styles.panelTitle}>📥 Alumnos Ingresados (Pendientes de Vinculación)</h2>
                <span style={styles.counterBadge}>{unlinked.length} en espera</span>
              </div>
              <p style={styles.panelDesc}>
                Alumnos que descargaron la app o entraron por el link libre. Al vincularlos con un docente, se reflejan automáticamente en el panel de la escuela.
              </p>

              {unlinked.length === 0 ? (
                <div style={styles.emptyState}>
                  ✨ No hay alumnos pendientes en la cola de ingreso.
                </div>
              ) : (
                <div style={styles.unlinkedList}>
                  {unlinked.map((st) => (
                    <div key={st.uuid} style={styles.unlinkedCard}>
                      <div>
                        <div style={styles.studentName}>
                          👤 <strong>{st.nickname}</strong> <span style={styles.edadPill}>{st.edad} años</span>
                        </div>
                        <div style={styles.studentDetails}>
                          Escuela declarada: <strong>{st.escuela}</strong> ({st.curso})<br />
                          Progreso autónomo: <strong style={{ color: "#38bdf8" }}>{st.xp} XP</strong> · Actividad: {st.lastActive}
                        </div>
                      </div>

                      <div style={styles.assignActionGroup}>
                        <select
                          value={selectedDocenteForAssign}
                          onChange={(e) => setSelectedDocenteForAssign(e.target.value)}
                          style={styles.selectDocente}
                        >
                          {docentes.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.name} — {d.escuela} ({d.curso})
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleAssignStudent(st.uuid)}
                          style={styles.btnAssign}
                        >
                          ➕ Vincular
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* PANEL DERECHO: DOCENTES Y MATRÍCULA ASIGNADA */}
            <div style={styles.panelCard}>
              <div style={styles.panelHeader}>
                <h2 style={styles.panelTitle}>👩‍🏫 Docentes y Cursos Habilitados</h2>
                <button
                  onClick={() => setShowDocenteModal(true)}
                  style={styles.btnAddDocente}
                >
                  ➕ Registrar Nuevo Docente
                </button>
              </div>
              <p style={styles.panelDesc}>
                Aulas registradas en el sistema. Al eliminar un docente, sus alumnos vuelven a la cola de vinculación.
              </p>

              <div style={styles.docentesList}>
                {docentes.map((d) => (
                  <div key={d.id} style={styles.docenteCard}>
                    <div style={styles.docenteInfo}>
                      <div style={styles.docenteName}>👩‍🏫 {d.name}</div>
                      <div style={styles.docenteSub}>
                        {d.escuela} · <strong>{d.curso}</strong>
                      </div>
                    </div>
                    <div style={styles.docenteMeta}>
                      <span style={styles.studentCountPill}>{d.alumnosCount} Alumnos</span>
                      <button
                        onClick={() => handleRemoveDocente(d.id)}
                        style={styles.btnRemoveDocente}
                        title="Eliminar docente y reubicar alumnos"
                      >
                        ❌ Quitar
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* LISTA RESUMIDA DE ALUMNOS VINCULADOS */}
              <div style={{ marginTop: "24px" }}>
                <h3 style={{ ...styles.sectionTitle, color: "#4ade80" }}>
                  📋 Alumnos Vinculados en Matriz ({linked.length})
                </h3>
                <div style={styles.linkedTableWrapper}>
                  <table style={styles.table}>
                    <thead>
                      <tr style={styles.tableHeadRow}>
                        <th style={styles.th}>Nick / Alumno</th>
                        <th style={styles.th}>Escuela / Curso</th>
                        <th style={styles.th}>Docente</th>
                        <th style={styles.th}>XP</th>
                        <th style={styles.th}>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {linked.map((s) => {
                        const doc = docentes.find((d) => d.id === s.docenteId);
                        return (
                          <tr key={s.uuid} style={styles.tableRow}>
                            <td style={styles.td}>
                              <strong>{s.nickname}</strong>
                            </td>
                            <td style={styles.td}>{s.escuela} ({s.curso})</td>
                            <td style={styles.td}>{doc ? doc.name : "—"}</td>
                            <td style={styles.td}>
                              <strong style={{ color: "#38bdf8" }}>{s.xp} XP</strong>
                            </td>
                            <td style={styles.td}>
                              <button
                                onClick={() => handleRemoveLinkedStudent(s.uuid)}
                                style={styles.btnRemoveStudent}
                              >
                                ❌ Desvincular
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* CONTENIDO 2: MÉTRICAS DE EVALUACIÓN DEL PILOTÍN */}
      {activeTab === "metricas" && (
        <div style={styles.tabContent}>
          <div style={styles.kpiGridCC}>
            <div style={{ ...styles.kpiCardCC, borderLeft: "4px solid #38bdf8" }}>
              <div style={styles.kpiLabelCC}>POBLACIÓN DEL PILOTÍN</div>
              <div style={styles.kpiValueCC}>{totalRoster} Alumnos</div>
              <div style={styles.kpiSubCC}>{unlinked.length} adicionales en cola de espera</div>
            </div>

            <div style={{ ...styles.kpiCardCC, borderLeft: "4px solid #10b981" }}>
              <div style={styles.kpiLabelCC}>TASA DE ACREDITACIÓN (M4)</div>
              <div style={styles.kpiValueCC}>{totalRoster ? Math.round((totalInsignias / totalRoster) * 100) : 0}%</div>
              <div style={styles.kpiSubCC}>{totalInsignias} lograron la insignia de Fusión Estelar</div>
            </div>

            <div style={{ ...styles.kpiCardCC, borderLeft: "4px solid #c084fc" }}>
              <div style={styles.kpiLabelCC}>INTERÉS FASE 2 INTERDISCIPLINARIA</div>
              <div style={styles.kpiValueCC}>{totalRoster ? Math.round((totalInteresFase2 / totalRoster) * 100) : 0}%</div>
              <div style={styles.kpiSubCC}>{totalInteresFase2} solicitaron continuar a "El Día 1"</div>
            </div>
          </div>

          <div style={styles.twinGrid}>
            
            {/* FUNNEL DE PROGRESIÓN M1 A M4 */}
            <div style={styles.panelCard}>
              <h2 style={styles.panelTitle}>📉 Funnel de Progresión y Retención (M1 a M4)</h2>
              <p style={styles.panelDesc}>
                Comportamiento de completitud a través del árbol de misiones. Muestra la persistencia del grupo.
              </p>

              <div style={styles.funnelContainer}>
                {[
                  { name: "M1: Radar de Señales", count: m1Completados, xp: "100 XP" },
                  { name: "M2: Carga de Combustible", count: m2Completados, xp: "150 XP" },
                  { name: "M3: Empalme de Órbitas", count: m3Completados, xp: "200 XP" },
                  { name: "M4: Trayectoria Final (Cierre)", count: m4Completados, xp: "250 XP" }
                ].map((step, idx) => {
                  const pct = totalRoster ? Math.round((step.count / totalRoster) * 100) : 0;
                  return (
                    <div key={idx} style={styles.funnelRow}>
                      <div style={styles.funnelLabel}>
                        <strong>{step.name}</strong> <span style={{ color: "#94a3b8" }}>({step.xp})</span>
                      </div>
                      <div style={styles.funnelBarBg}>
                        <div style={{ ...styles.funnelBarFill, width: `${pct}%` }} />
                      </div>
                      <div style={styles.funnelStat}>
                        {step.count}/{totalRoster} ({pct}%)
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* MAPA DE CALOR DE DESVÍOS DIDÁCTICOS */}
            <div style={styles.panelCard}>
              <h2 style={styles.panelTitle}>🧩 Distribución de Desvíos Didácticos</h2>
              <p style={styles.panelDesc}>
                Conteo de errores diagnosticados por el Sistema Experto sin IA.
              </p>

              <div style={styles.desviosGrid}>
                <div style={styles.desvioCard}>
                  <div style={styles.desvioTitle}>⚠ ERR_DIRECT (Suma Directa)</div>
                  <div style={styles.desvioCount}>{totalDesviosDirect} Alumnos</div>
                  <div style={styles.desvioDesc}>Sumaron numeradores y denominadores de forma lineal sin unificar base.</div>
                </div>

                <div style={styles.desvioCard}>
                  <div style={styles.desvioTitle}>🧩 ERR_LCD (Denominador Común)</div>
                  <div style={styles.desvioCount}>{totalDesviosLcd} Alumnos</div>
                  <div style={styles.desvioDesc}>Dificultad para hallar el mínimo común múltiplo o amplificar numeradores.</div>
                </div>

                <div style={styles.desvioCard}>
                  <div style={styles.desvioTitle}>🖐️ ERR_PARTIAL (Suma Incompleta)</div>
                  <div style={styles.desvioCount}>{totalDesviosPartial} Alumnos</div>
                  <div style={styles.desvioDesc}>Sumaron solo una de las fracciones expresadas en la ecuación.</div>
                </div>

                <div style={styles.desvioCard}>
                  <div style={styles.desvioTitle}>⚖️ ERR_COMPARE (Comparación)</div>
                  <div style={styles.desvioCount}>{totalDesviosCompare} Alumnos</div>
                  <div style={styles.desvioDesc}>Compararon magnitudes fraccionarias sin llevarlas a un denominador común.</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* CONTENIDO 3: CENTRO DE EXPORTACIÓN A EXCEL */}
      {activeTab === "excel" && (
        <div style={styles.tabContent}>
          <div style={styles.panelCard}>
            <h2 style={styles.panelTitle}>📥 Centro de Exportación de Informes y Datos Crudos (.CSV Excel)</h2>
            <p style={styles.panelDesc}>
              Generación de planillas compatibles con Microsoft Excel y LibreOffice. Los archivos incluyen el identificador de ordenamiento `﻿` (UTF-8 BOM) y separador `;` para evitar ventanas de confirmación o caracteres extraños.
            </p>

            <div style={styles.exportGrid}>
              
              <div style={styles.exportBox}>
                <div style={styles.exportIcon}>📊</div>
                <h3 style={styles.exportTitle}>Reporte Global Consolidado</h3>
                <p style={styles.exportDesc}>
                  Exportación completa del roster de alumnos vinculados, escuelas, docentes asignados, XP acumulado, insignias M4, desvíos y registros de interés en la Fase 2 Interdisciplinaria.
                </p>
                <button onClick={handleExportConsolidadoExcel} style={styles.btnExportMain}>
                  📊 Descargar Consolidado (Excel / CSV)
                </button>
              </div>

              <div style={styles.exportBox}>
                <div style={styles.exportIcon}>📜</div>
                <h3 style={styles.exportTitle}>Matriz xAPI / Telemetría Cruda</h3>
                <p style={styles.exportDesc}>
                  Historial de eventos en tiempo real anonimizados por UUID (fechas, horas, verbos, misiones, errores e interacciones con el copiloto EduBot).
                </p>
                <button onClick={handleExportXapiLogsExcel} style={styles.btnExportSecondary}>
                  📜 Descargar Telemetría xAPI (Excel / CSV)
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* MODAL PARA AGREGAR NUEVO DOCENTE */}
      {showAddDocenteModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <h3 style={styles.modalTitle}>👩‍🏫 Registrar Nuevo Docente en Control Central</h3>
            <form onSubmit={handleAddDocenteSubmit} style={styles.modalForm}>
              <div>
                <label style={styles.label}>Nombre del Docente / Profesor:</label>
                <input
                  type="text"
                  value={newDocenteName}
                  onChange={(e) => setNewDocenteName(e.target.value)}
                  placeholder="Ej: Profe Roberto"
                  required
                  style={styles.input}
                />
              </div>

              <div>
                <label style={styles.label}>Escuela / Institución Educativa:</label>
                <input
                  type="text"
                  value={newEscuela}
                  onChange={(e) => setNewEscuela(e.target.value)}
                  placeholder="Ej: IPEM 35 Ricardo Rojas"
                  required
                  style={styles.input}
                />
              </div>

              <div>
                <label style={styles.label}>Año y Curso Asignado:</label>
                <input
                  type="text"
                  value={newCurso}
                  onChange={(e) => setNewCurso(e.target.value)}
                  placeholder="Ej: 1° Año B"
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.modalBtnRow}>
                <button
                  type="button"
                  onClick={() => setShowDocenteModal(false)}
                  style={styles.btnCancel}
                >
                  Cancelar
                </button>
                <button type="submit" style={styles.btnSave}>
                  Habilitar Docente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// ==========================================
// 🎨 ESTILOS DEL CONTROL CENTRAL
// ==========================================
const styles = {
  appContainer: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "20px 15px",
    fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    backgroundColor: "#020308",
    color: "#cbd5e1",
    minHeight: "100vh"
  },
  toastCard: {
    position: "fixed",
    top: "20px",
    right: "20px",
    backgroundColor: "#10b981",
    color: "#021715",
    padding: "12px 20px",
    borderRadius: "8px",
    fontWeight: "900",
    fontSize: "13px",
    boxShadow: "0 0 20px rgba(16, 185, 129, 0.6)",
    zIndex: 10000
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#080d24",
    padding: "16px 20px",
    borderRadius: "12px",
    border: "1px solid #1e293b",
    marginBottom: "20px",
    flexWrap: "wrap",
    gap: "12px"
  },
  headerTitleGroup: {
    display: "flex",
    alignItems: "center",
    gap: "14px"
  },
  logoBadge: {
    backgroundColor: "#38bdf8",
    color: "#020308",
    fontWeight: "900",
    fontSize: "18px",
    padding: "8px 12px",
    borderRadius: "8px"
  },
  headerTitle: {
    fontSize: "20px",
    fontWeight: "bold",
    margin: 0,
    color: "#ffffff"
  },
  headerSub: {
    fontSize: "12px",
    color: "#94a3b8",
    margin: "2px 0 0 0"
  },
  headerRightInfo: {
    display: "flex",
    gap: "10px",
    alignItems: "center"
  },
  serverPill: {
    fontSize: "11px",
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    color: "#4ade80",
    border: "1px solid #10b981",
    padding: "4px 10px",
    borderRadius: "12px",
    fontWeight: "bold"
  },
  rolePill: {
    fontSize: "11px",
    backgroundColor: "rgba(56, 189, 248, 0.15)",
    color: "#38bdf8",
    border: "1px solid #38bdf8",
    padding: "4px 10px",
    borderRadius: "12px",
    fontWeight: "bold"
  },
  tabNav: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
    borderBottom: "1px solid #1e293b",
    paddingBottom: "10px"
  },
  tabBtnActive: {
    backgroundColor: "#1e3a8a",
    color: "#38bdf8",
    border: "1px solid #38bdf8",
    padding: "10px 18px",
    borderRadius: "8px",
    fontWeight: "bold",
    fontSize: "13px",
    cursor: "pointer"
  },
  tabBtnInactive: {
    backgroundColor: "transparent",
    color: "#64748b",
    border: "1px solid #1e293b",
    padding: "10px 18px",
    borderRadius: "8px",
    fontWeight: "bold",
    fontSize: "13px",
    cursor: "pointer"
  },
  tabContent: {
    display: "flex",
    flexDirection: "column",
    gap: "20px"
  },
  twinGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px"
  },
  panelCard: {
    backgroundColor: "rgba(7, 12, 34, 0.8)",
    border: "1px solid #1e293b",
    borderRadius: "12px",
    padding: "20px"
  },
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "6px"
  },
  panelTitle: {
    fontSize: "15px",
    color: "#38bdf8",
    fontWeight: "bold",
    margin: 0
  },
  counterBadge: {
    fontSize: "11px",
    backgroundColor: "rgba(251, 146, 60, 0.15)",
    color: "#fb923c",
    border: "1px solid #fb923c",
    padding: "2px 8px",
    borderRadius: "10px",
    fontWeight: "bold"
  },
  panelDesc: {
    fontSize: "12px",
    color: "#94a3b8",
    lineHeight: "1.4",
    marginBottom: "16px"
  },
  emptyState: {
    backgroundColor: "#02040e",
    border: "1px dashed #1e293b",
    padding: "20px",
    borderRadius: "8px",
    textAlign: "center",
    color: "#64748b",
    fontSize: "13px"
  },
  unlinkedList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },
  unlinkedCard: {
    backgroundColor: "#02040e",
    border: "1px solid #1e293b",
    borderRadius: "8px",
    padding: "12px 14px",
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },
  studentName: {
    fontSize: "14px",
    color: "#ffffff"
  },
  edadPill: {
    fontSize: "10px",
    backgroundColor: "#1e293b",
    color: "#94a3b8",
    padding: "2px 6px",
    borderRadius: "4px",
    marginLeft: "6px"
  },
  studentDetails: {
    fontSize: "11px",
    color: "#94a3b8",
    marginTop: "4px"
  },
  assignActionGroup: {
    display: "flex",
    gap: "8px",
    alignItems: "center"
  },
  selectDocente: {
    flex: 1,
    padding: "8px",
    backgroundColor: "#080d24",
    border: "1px solid #334155",
    color: "#cbd5e1",
    borderRadius: "6px",
    fontSize: "11px"
  },
  btnAssign: {
    backgroundColor: "#10b981",
    color: "#ffffff",
    border: "none",
    padding: "8px 14px",
    borderRadius: "6px",
    fontWeight: "bold",
    fontSize: "11px",
    cursor: "pointer"
  },
  btnAddDocente: {
    backgroundColor: "rgba(139, 92, 246, 0.2)",
    color: "#c084fc",
    border: "1px solid #8b5cf6",
    padding: "6px 12px",
    borderRadius: "6px",
    fontWeight: "bold",
    fontSize: "11px",
    cursor: "pointer"
  },
  docentesList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },
  docenteCard: {
    backgroundColor: "#02040e",
    border: "1px solid #1e293b",
    borderRadius: "8px",
    padding: "12px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  docenteInfo: {},
  docenteName: {
    fontSize: "13px",
    fontWeight: "bold",
    color: "#ffffff"
  },
  docenteSub: {
    fontSize: "11px",
    color: "#94a3b8"
  },
  docenteMeta: {
    display: "flex",
    gap: "8px",
    alignItems: "center"
  },
  studentCountPill: {
    fontSize: "11px",
    backgroundColor: "#1e293b",
    color: "#38bdf8",
    padding: "3px 8px",
    borderRadius: "6px",
    fontWeight: "bold"
  },
  btnRemoveDocente: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    color: "#fca5a5",
    border: "1px solid #ef4444",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "10px",
    fontWeight: "bold",
    cursor: "pointer"
  },
  sectionTitle: {
    fontSize: "13px",
    fontWeight: "bold",
    marginBottom: "10px",
    textTransform: "uppercase"
  },
  linkedTableWrapper: {
    maxHeight: "220px",
    overflowY: "auto",
    border: "1px solid #1e293b",
    borderRadius: "8px"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "12px"
  },
  tableHeadRow: {
    backgroundColor: "#02040e",
    borderBottom: "1px solid #1e293b",
    textAlign: "left"
  },
  th: {
    padding: "8px",
    color: "#64748b",
    fontSize: "10px",
    textTransform: "uppercase"
  },
  tableRow: {
    borderBottom: "1px solid #1e293b"
  },
  td: {
    padding: "8px"
  },
  btnRemoveStudent: {
    backgroundColor: "transparent",
    color: "#fca5a5",
    border: "none",
    cursor: "pointer",
    fontSize: "11px"
  },
  kpiGridCC: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "16px"
  },
  kpiCardCC: {
    backgroundColor: "rgba(7, 12, 34, 0.8)",
    padding: "16px",
    borderRadius: "10px",
    border: "1px solid #1e293b"
  },
  kpiLabelCC: {
    fontSize: "10px",
    fontWeight: "900",
    color: "#64748b",
    letterSpacing: "0.5px"
  },
  kpiValueCC: {
    fontSize: "26px",
    fontWeight: "900",
    color: "#ffffff",
    margin: "6px 0"
  },
  kpiSubCC: {
    fontSize: "11px",
    color: "#94a3b8"
  },
  funnelContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    marginTop: "10px"
  },
  funnelRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },
  funnelLabel: {
    width: "220px",
    fontSize: "12px",
    color: "#cbd5e1"
  },
  funnelBarBg: {
    flex: 1,
    height: "18px",
    backgroundColor: "#02040e",
    borderRadius: "9px",
    overflow: "hidden",
    border: "1px solid #1e293b"
  },
  funnelBarFill: {
    height: "100%",
    backgroundColor: "#38bdf8",
    borderRadius: "9px",
    transition: "width 0.4s ease"
  },
  funnelStat: {
    width: "110px",
    fontSize: "12px",
    fontWeight: "bold",
    color: "#4ade80",
    textAlign: "right"
  },
  desviosGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginTop: "10px"
  },
  desvioCard: {
    backgroundColor: "#02040e",
    border: "1px solid #1e293b",
    borderRadius: "8px",
    padding: "12px"
  },
  desvioTitle: {
    fontSize: "12px",
    fontWeight: "bold",
    color: "#fb923c"
  },
  desvioCount: {
    fontSize: "20px",
    fontWeight: "900",
    color: "#ffffff",
    margin: "4px 0"
  },
  desvioDesc: {
    fontSize: "10px",
    color: "#94a3b8",
    lineHeight: "1.3"
  },
  exportGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
    marginTop: "10px"
  },
  exportBox: {
    backgroundColor: "#02040e",
    border: "1px solid #1e293b",
    borderRadius: "10px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center"
  },
  exportIcon: {
    fontSize: "36px",
    marginBottom: "10px"
  },
  exportTitle: {
    fontSize: "16px",
    color: "#38bdf8",
    margin: "0 0 8px 0"
  },
  exportDesc: {
    fontSize: "12px",
    color: "#94a3b8",
    lineHeight: "1.5",
    marginBottom: "18px",
    flex: 1
  },
  btnExportMain: {
    backgroundColor: "#10b981",
    color: "#ffffff",
    border: "none",
    padding: "12px 20px",
    borderRadius: "8px",
    fontWeight: "bold",
    fontSize: "12px",
    cursor: "pointer",
    boxShadow: "0 0 15px rgba(16, 185, 129, 0.4)"
  },
  btnExportSecondary: {
    backgroundColor: "#8b5cf6",
    color: "#ffffff",
    border: "none",
    padding: "12px 20px",
    borderRadius: "8px",
    fontWeight: "bold",
    fontSize: "12px",
    cursor: "pointer",
    boxShadow: "0 0 15px rgba(139, 92, 246, 0.4)"
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(2, 3, 8, 0.85)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999
  },
  modalCard: {
    width: "100%",
    maxWidth: "420px",
    backgroundColor: "#080d24",
    border: "2px solid #8b5cf6",
    borderRadius: "12px",
    padding: "24px",
    boxShadow: "0 0 30px rgba(139, 92, 246, 0.4)"
  },
  modalTitle: {
    fontSize: "15px",
    color: "#c084fc",
    margin: "0 0 16px 0",
    fontWeight: "bold"
  },
  modalForm: {
    display: "flex",
    flexDirection: "column",
    gap: "14px"
  },
  label: {
    fontSize: "11px",
    color: "#94a3b8",
    display: "block",
    marginBottom: "4px"
  },
  input: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#02040e",
    border: "1px solid #334155",
    borderRadius: "6px",
    color: "#ffffff",
    fontSize: "12px",
    boxSizing: "border-box"
  },
  modalBtnRow: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "10px"
  },
  btnCancel: {
    backgroundColor: "transparent",
    color: "#94a3b8",
    border: "1px solid #334155",
    padding: "8px 14px",
    borderRadius: "6px",
    fontSize: "12px",
    cursor: "pointer"
  },
  btnSave: {
    backgroundColor: "#8b5cf6",
    color: "#ffffff",
    border: "none",
    padding: "8px 16px",
    borderRadius: "6px",
    fontWeight: "bold",
    fontSize: "12px",
    cursor: "pointer"
  }
};
