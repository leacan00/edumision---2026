import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

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
    fontSize: "13px"
  },
  btnTableAction: {
    padding: "4px 8px",
    borderRadius: "4px",
    backgroundColor: "#0284c7",
    color: "#ffffff",
    border: "none",
    fontSize: "11px",
    cursor: "pointer"
  },
  cardBoxIngreso: {
    backgroundColor: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "16px",
    padding: "24px",
    maxWidth: "600px",
    margin: "30px auto"
  },
  cardSectionTitle: {
    color: "#38bdf8",
    fontSize: "14px",
    fontWeight: "bold",
    margin: "0 0 10px 0"
  },
  columnTitle: {
    color: "#cbd5e1",
    fontSize: "13px",
    fontWeight: "bold",
    margin: "0 0 12px 0"
  },
  container: {
    backgroundColor: "#030712",
    color: "#f8fafc",
    minHeight: "100vh",
    fontFamily: "system-ui, -apple-system, sans-serif",
    padding: "20px"
  },
  dashboardCard: {
    backgroundColor: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "12px",
    padding: "16px"
  },
  dashboardGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 340px",
    gap: "20px"
  },
  dashboardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    borderBottom: "1px solid #1e293b",
    paddingBottom: "16px"
  },
  dashboardSubtitle: {
    color: "#94a3b8",
    fontSize: "13px",
    margin: "4px 0 0 0"
  },
  dashboardTitle: {
    color: "#38bdf8",
    fontSize: "22px",
    fontWeight: "bold",
    margin: 0
  },
  detailGroup: {
    backgroundColor: "#020617",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #1e293b"
  },
  detailLabel: {
    color: "#64748b",
    fontSize: "11px",
    display: "block",
    marginBottom: "2px"
  },
  detailValue: {
    color: "#f8fafc",
    fontSize: "13px",
    fontWeight: "500"
  },
  detailsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
    marginBottom: "16px"
  },
  drawerBody: {
    padding: "20px"
  },
  drawerHeader: {
    padding: "16px 20px",
    borderBottom: "1px solid #1e293b",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  drawerOverlayCentered: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    backdropFilter: "blur(4px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    padding: "20px"
  },
  drawerPaperCentered: {
    width: "100%",
    maxWidth: "540px",
    maxHeight: "90vh",
    backgroundColor: "#0f172a",
    border: "1px solid #38bdf8",
    borderRadius: "16px",
    display: "flex",
    flexDirection: "column",
    overflowY: "auto"
  },
  drawerShip: {
    color: "#38bdf8",
    fontSize: "12px",
    margin: "2px 0 0 0"
  },
  drawerTitle: {
    color: "#f8fafc",
    fontSize: "18px",
    fontWeight: "bold",
    margin: 0
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
    borderRadius: "8px",
    border: "1px solid #334155",
    backgroundColor: "#020617",
    color: "#f8fafc",
    fontSize: "13px"
  },
  formLabel: {
    color: "#94a3b8",
    fontSize: "12px",
    fontWeight: "500"
  },
  instructions: {
    color: "#94a3b8",
    fontSize: "12px",
    lineHeight: "1.4",
    margin: "0 0 14px 0"
  },
  leftColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "20px"
  },
  metricCard: {
    backgroundColor: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "10px",
    padding: "12px 16px"
  },
  metricLabel: {
    color: "#64748b",
    fontSize: "11px",
    textTransform: "uppercase"
  },
  metricValue: {
    color: "#f8fafc",
    fontSize: "20px",
    fontWeight: "bold",
    marginTop: "2px"
  },
  metricsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "12px",
    marginBottom: "20px"
  },
  missionBadgeCompleted: {
    display: "inline-block",
    padding: "2px 6px",
    borderRadius: "4px",
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    color: "#10b981",
    fontSize: "11px",
    fontWeight: "bold",
    border: "1px solid #10b981"
  },
  missionBadgeLocked: {
    display: "inline-block",
    padding: "2px 6px",
    borderRadius: "4px",
    backgroundColor: "rgba(100, 116, 139, 0.15)",
    color: "#64748b",
    fontSize: "11px"
  },
  missionCell: {
    display: "flex",
    flexDirection: "column",
    gap: "2px"
  },
  rightColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "20px"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "12px"
  },
  tableContainer: {
    overflowX: "auto"
  },
  th: {
    textAlign: "left",
    padding: "10px",
    borderBottom: "1px solid #1e293b",
    color: "#64748b",
    fontWeight: "600"
  },
  td: {
    padding: "10px",
    borderBottom: "1px solid #0f172a"
  },
  toastCard: {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    backgroundColor: "#0284c7",
    color: "#ffffff",
    padding: "12px 20px",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
    zIndex: 2000,
    fontSize: "13px",
    fontWeight: "bold"
  }
};

const INITIAL_STUDENTS = [
  {
    id: 1, name: "Mateo G.", shipName: "Astro Córdoba", uuid: "f47ac10b-58cc-4372-a567-0e02b2c3d4e1",
    xp: 900, badgeEarned: true,
    missions: {
      m1: { status: "completado", attempts: 1, lastErrorName: null },
      m2: { status: "completado", attempts: 1, lastErrorName: null },
      m3: { status: "completado", attempts: 1, lastErrorName: null },
      m4: { status: "completado", attempts: 1, lastErrorName: null }
    }
  },
  {
    id: 2, name: "Sofia M.", shipName: "Sierras II", uuid: "a8b9c0d1-e2f3-4a5b-6c7d-8e9f0a1b2c3d",
    xp: 350, badgeEarned: false,
    missions: {
      m1: { status: "completado", attempts: 1, lastErrorName: null },
      m2: { status: "completado", attempts: 3, lastErrorName: "Error suma directa" },
      m3: { status: "bloqueada", attempts: 0, lastErrorName: null },
      m4: { status: "bloqueada", attempts: 0, lastErrorName: null }
    }
  }
];

// RECOMENDACIONES Y ALERTAS CON NOMBRES PEDAGÓGICOS COMPRENSIBLES
const SYSTEM_EXPERT_ALERTS = {
  "Error suma directa": "🛠️ Propuesta para el aula: dinámica de doblado de tiras de papel para visualizar por qué el denominador nunca se suma directamente.",
  "Error cálculo denominador": "🧩 Actividad para el hogar o clase: repasen juntos las tablas de multiplicar de los denominadores antes de operar.",
  "Error simplificación": "📐 Propuesta pedagógica: ejercitar la simplificación buscando divisores comunes arriba y abajo.",
  "Error suma parcial": "🍳 Actividad sugerida: usar elementos concretos para representar la suma completa de partes."
};

function renderMissionCell(student, mKey) {
  const m = student.missions[mKey];
  if (m.status === "completado" || m.status === "completada") {
    return (
      <div style={styles.missionCell}>
        <span style={styles.missionBadgeCompleted}>✔ {m.attempts} int.</span>
        {m.lastErrorName && (
          <span style={{ fontSize: "9px", color: "#fb923c" }}>[{m.lastErrorName}]</span>
        )}
      </div>
    );
  }
  return <span style={styles.missionBadgeLocked}>🔒 Bloqueada</span>;
}

function DrawerWithSendButton({ student, onClose }) {
  const [emailSent, setEmailSent] = useState(false);

  const handleSendCiDi = () => {
    setEmailSent(true);
    setTimeout(() => {
      setEmailSent(false);
      onClose();
    }, 2500);
  };

  return (
    <div style={styles.drawerOverlayCentered} onClick={onClose}>
      <div style={styles.drawerPaperCentered} onClick={(e) => e.stopPropagation()}>
        <div style={styles.drawerHeader}>
          <div>
            <h3 style={styles.drawerTitle}>{student.name}</h3>
            <p style={styles.drawerShip}>{student.shipName} · UUID: {student.uuid.substring(0, 8)}...</p>
          </div>
          <button onClick={onClose} style={styles.btnCloseModal}>×</button>
        </div>

        <div style={styles.drawerBody}>
          <div style={styles.detailsGrid}>
            <div style={styles.detailGroup}>
              <span style={styles.detailLabel}>EXPERIENCIA (XP)</span>
              <span style={styles.detailValue}>{student.xp} XP</span>
            </div>
            <div style={styles.detailGroup}>
              <span style={styles.detailLabel}>ESTADO DE MAESTRÍA</span>
              <span style={styles.detailValue}>{student.badgeEarned ? "🏆 Otorgada" : "En progreso"}</span>
            </div>
          </div>

          <button onClick={handleSendCiDi} disabled={emailSent} style={styles.btnSendToCiDi}>
            {emailSent ? "✨ Notificación Enviada" : "📩 Notificar Orientación Pedagógica al Tutor (CiDi)"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [faseDocente, setFaseDocente] = useState("ingreso");
  const [perfilDocente, setPerfilDocente] = useState({
    nombre: "Profe Laura",
    escuela: "Escuela IPEM 268",
    curso: "1° Año B"
  });

  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [liveLogs, setLiveLogs] = useState([]);

  // ESCUCHADOR EN TIEMPO REAL DE FIREBASE FIRESTORE
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

        if (logs.length > 0) {
          setStudents((prev) => {
            const updated = [...prev];
            logs.forEach((log) => {
              if (!log.alumno) return;
              let student = updated.find(s => s.name.toLowerCase().includes(log.alumno.toLowerCase()) || log.alumno.toLowerCase().includes(s.name.toLowerCase()));
              
              const mComp = log.misionesCompletadas || [];

              if (!student) {
                student = {
                  id: Date.now() + Math.random(),
                  name: log.alumno,
                  shipName: "Nave " + (log.escuela || "Córdoba"),
                  uuid: log.id || "uuid-demo",
                  xp: log.xp || 150,
                  badgeEarned: (log.xp >= 750),
                  missions: {
                    m1: { status: mComp.includes("m1") ? "completado" : "bloqueada", attempts: 1, lastErrorName: log.tipoErrorLabel },
                    m2: { status: mComp.includes("m2") ? "completado" : "bloqueada", attempts: 1, lastErrorName: null },
                    m3: { status: mComp.includes("m3") ? "completado" : "bloqueada", attempts: 1, lastErrorName: null },
                    m4: { status: mComp.includes("m4") ? "completado" : "bloqueada", attempts: 1, lastErrorName: null }
                  }
                };
                updated.unshift(student);
              } else {
                if (log.xp && log.xp > student.xp) student.xp = log.xp;
                mComp.forEach(mKey => {
                  if (student.missions[mKey]) student.missions[mKey].status = "completado";
                });
                if (log.esErrorReal && log.tipoErrorLabel && log.mision) {
                  if (student.missions[log.mision]) {
                    student.missions[log.mision].lastErrorName = log.tipoErrorLabel;
                  }
                }
              }
            });
            return updated;
          });
        }
      }, (err) => console.error("Firestore error:", err));
    } catch (e) {
      console.error("Error al configurar onSnapshot:", e);
    }

    return () => unsubscribe();
  }, []);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  const totalStudents = students.length;
  const activeStudents = students.filter((s) => s.xp > 0).length;
  const partPercentage = Math.round((activeStudents / totalStudents) * 100);

  // ERRORES DESGLOSADOS POR NOMBRES COMPRENSIBLES EN MISIÓN REAL
  const errorsCount = {
    "Error suma directa": students.filter((s) => s.missions.m1.lastErrorName === "Error suma directa" || s.missions.m2.lastErrorName === "Error suma directa").length,
    "Error cálculo denominador": students.filter((s) => s.missions.m3.lastErrorName === "Error cálculo denominador" || s.missions.m4.lastErrorName === "Error cálculo denominador").length,
    "Error simplificación": students.filter((s) => s.missions.m4.lastErrorName === "Error simplificación").length
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleGuardarPerfilDocente = (e) => {
    e.preventDefault();
    setFaseDocente("panel");
    showToast(`👩‍🏫 Bienvenida ${perfilDocente.nombre} a la Consola de Monitoreo (${perfilDocente.escuela})`);
  };

  return (
    <div style={styles.container}>
      {toastMsg && <div style={styles.toastCard}>{toastMsg}</div>}

      {faseDocente === "ingreso" && (
        <div style={styles.cardBoxIngreso}>
          <div style={{ fontSize: "52px", marginBottom: "8px", textAlign: "center" }}>🪐</div>
          <h2 style={{ color: "#38bdf8", margin: "0 0 8px 0", textAlign: "center" }}>
            ¡Bienvenida/o a EduMisión Córdoba!
          </h2>
          <p style={{ color: "#cbd5e1", fontSize: "14px", lineHeight: "1.5", marginBottom: "20px", textAlign: "center" }}>
            Consola Docente de Monitoreo en Tiempo Real
          </p>

          <form onSubmit={handleGuardarPerfilDocente} style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Nombre y Apellido del Docente:</label>
              <input type="text" value={perfilDocente.nombre} onChange={(e) => setPerfilDocente({ ...perfilDocente, nombre: e.target.value })} style={styles.formInput} required />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Escuela Secundaria / IPEM:</label>
              <input type="text" value={perfilDocente.escuela} onChange={(e) => setPerfilDocente({ ...perfilDocente, escuela: e.target.value })} style={styles.formInput} required />
            </div>
            <button type="submit" style={styles.btnPrimaryIngreso}>
              🚀 INGRESAR A MI CONSOLA DOCENTE
            </button>
          </form>
        </div>
      )}

      {faseDocente === "panel" && (
        <>
          <header style={styles.dashboardHeader}>
            <div>
              <h1 style={styles.dashboardTitle}>Consola de Monitoreo Docente</h1>
              <p style={styles.dashboardSubtitle}>
                {perfilDocente.nombre} · {perfilDocente.escuela} ({perfilDocente.curso})
              </p>
            </div>
          </header>

          <div style={styles.metricsRow}>
            <div style={styles.metricCard}>
              <div style={styles.metricLabel}>Total Grupo</div>
              <div style={styles.metricValue}>{totalStudents} Alumnos</div>
            </div>
            <div style={styles.metricCard}>
              <div style={styles.metricLabel}>Participación</div>
              <div style={{ ...styles.metricValue, color: "#10b981" }}>{partPercentage}%</div>
            </div>
            <div style={styles.metricCard}>
              <div style={styles.metricLabel}>Desvíos Reales Activos</div>
              <div style={{ ...styles.metricValue, color: "#fb923c" }}>
                {errorsCount["Error suma directa"] + errorsCount["Error cálculo denominador"]}
              </div>
            </div>
          </div>

          <div style={styles.dashboardGrid}>
            <div style={styles.leftColumn}>
              <div style={styles.dashboardCard}>
                <h3 style={styles.columnTitle}>Avance por Misiones de la Clase (Verde = Completada)</h3>
                <div style={styles.tableContainer}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Estudiante</th>
                        <th style={styles.th}>M1</th>
                        <th style={styles.th}>M2</th>
                        <th style={styles.th}>M3</th>
                        <th style={styles.th}>M4</th>
                        <th style={styles.th}>XP</th>
                        <th style={styles.th}>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => (
                        <tr key={student.id}>
                          <td style={styles.td}>
                            <strong>{student.name}</strong>
                          </td>
                          <td style={styles.td}>{renderMissionCell(student, "m1")}</td>
                          <td style={styles.td}>{renderMissionCell(student, "m2")}</td>
                          <td style={styles.td}>{renderMissionCell(student, "m3")}</td>
                          <td style={styles.td}>{renderMissionCell(student, "m4")}</td>
                          <td style={styles.td}>
                            <strong style={{ color: "#38bdf8" }}>{student.xp} XP</strong>
                          </td>
                          <td style={styles.td}>
                            <button onClick={() => setSelectedStudent(student)} style={styles.btnTableAction}>
                              Analizar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* TELEMETRÍA EN TIEMPO REAL FIRESTORE */}
              <div style={{ backgroundColor: "#020617", padding: "16px", borderRadius: "12px", border: "1px solid #1e293b" }}>
                <h4 style={{ color: "#38bdf8", margin: "0 0 10px 0" }}>
                  📡 Telemetría xAPI en Vivo desde Firestore
                </h4>
                <div style={{ maxHeight: "180px", overflowY: "auto", fontSize: "12px", fontFamily: "monospace", color: "#94a3b8" }}>
                  {liveLogs.map((log) => (
                    <div key={log.id} style={{ marginBottom: "6px", borderBottom: "1px dashed #1e293b", paddingBottom: "4px" }}>
                      <strong style={{ color: "#38bdf8" }}>{log.alumno || "Alumno"}</strong>: <span style={{ color: "#f8fafc" }}>{log.evento}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={styles.rightColumn}>
              <div style={styles.dashboardCard}>
                <h3 style={styles.cardSectionTitle}>Diagnóstico Colectivo (Sistema Experto)</h3>
                <div style={styles.alertsContainer}>
                  <div style={{ ...styles.alertBox, borderColor: errorsCount["Error suma directa"] > 0 ? "#fb923c" : "#1e293b" }}>
                    <div style={styles.alertHeader}>
                      <span style={errorsCount["Error suma directa"] > 0 ? styles.alertTitleActive : styles.alertTitleInactive}>
                        ⚠ Error suma directa
                      </span>
                      <span style={styles.alertBadge}>{errorsCount["Error suma directa"]} Alumnos</span>
                    </div>
                    {errorsCount["Error suma directa"] > 0 && (
                      <p style={styles.alertDesc}>{SYSTEM_EXPERT_ALERTS["Error suma directa"]}</p>
                    )}
                  </div>

                  <div style={{ ...styles.alertBox, borderColor: errorsCount["Error cálculo denominador"] > 0 ? "#fb923c" : "#1e293b" }}>
                    <div style={styles.alertHeader}>
                      <span style={errorsCount["Error cálculo denominador"] > 0 ? styles.alertTitleActive : styles.alertTitleInactive}>
                        🧩 Error cálculo denominador
                      </span>
                      <span style={styles.alertBadge}>{errorsCount["Error cálculo denominador"]} Alumnos</span>
                    </div>
                    {errorsCount["Error cálculo denominador"] > 0 && (
                      <p style={styles.alertDesc}>{SYSTEM_EXPERT_ALERTS["Error cálculo denominador"]}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {selectedStudent && (
            <DrawerWithSendButton student={selectedStudent} onClose={() => setSelectedStudent(null)} />
          )}
        </>
      )}
    </div>
  );
}
