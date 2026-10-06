import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import {
  collection,
  getDocs,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  writeBatch
} from "firebase/firestore";

// ==========================================
// 🔒 CONFIGURACIÓN DE SEGURIDAD
// ==========================================
const PIN_ACCESO = "1234";

// ==========================================
// 🛠️ HELPER SLUG NORMALIZADO
// ==========================================
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

// ==========================================
// 📊 EXPORTADOR DE INFORME FORMATEADO EXCEL (.XLS HTML) VINCULADO CON VALORACIONES
// ==========================================
const exportToFormattedExcelWithSurveys = (filename, docentes, alumnos, valoraciones) => {
  const bom = "\uFEFF";
  const totalAlumnos = alumnos.length;
  const asignadosCount = alumnos.filter((a) => a.docenteId).length;
  const conInsigniaCount = alumnos.filter((a) => a.badgeEarned).length;
  const totalXp = alumnos.reduce((acc, a) => acc + (a.xpTotal || a.xp || 0), 0);
  const avgXp = totalAlumnos ? Math.round(totalXp / totalAlumnos) : 0;

  const htmlContent = `${bom}<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>EduMisión Córdoba - Reporte Consolidado Provincial</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; margin: 20px; background-color: #ffffff; color: #1e293b; }
    h1 { color: #0284c7; font-size: 22px; margin-bottom: 4px; }
    h2 { color: #0f172a; font-size: 16px; border-bottom: 2px solid #0284c7; padding-bottom: 6px; margin-top: 24px; }
    .kpi-table { border-collapse: collapse; margin-bottom: 20px; }
    .kpi-table td { border: 1px solid #cbd5e1; padding: 12px 20px; text-align: center; background-color: #f8fafc; }
    .kpi-title { font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: bold; }
    .kpi-val { font-size: 20px; font-weight: bold; color: #0284c7; }
    .data-table { border-collapse: collapse; width: 100%; font-size: 12px; margin-top: 10px; }
    .data-table th { background-color: #0284c7; color: #ffffff; padding: 10px; text-align: left; font-size: 11px; text-transform: uppercase; }
    .data-table td { padding: 8px 10px; border: 1px solid #e2e8f0; }
    .tag-assigned { background-color: #dcfce7; color: #15803d; font-weight: bold; padding: 3px 8px; border-radius: 4px; }
    .tag-unassigned { background-color: #ffedd5; color: #c2410c; font-weight: bold; padding: 3px 8px; border-radius: 4px; }
    .tag-badge { background-color: #fef3c7; color: #b45309; font-weight: bold; padding: 3px 8px; border-radius: 4px; }
  </style>
</head>
<body>
  <h1>🏛️ EduMisión Córdoba — Reporte Consolidado Provincial</h1>
  <p style="color:#64748b; font-size:12px;">Generado el: ${new Date().toLocaleString("es-AR")}</p>

  <table class="kpi-table">
    <tr>
      <td><div class="kpi-title">Total Alumnos</div><div class="kpi-val">${totalAlumnos}</div></td>
      <td><div class="kpi-title">Alumnos Asignados</div><div class="kpi-val">${asignadosCount}</div></td>
      <td><div class="kpi-title">Insignias Acreditadas</div><div class="kpi-val">${conInsigniaCount}</div></td>
      <td><div class="kpi-title">Promedio XP</div><div class="kpi-val">${avgXp} XP</div></td>
      <td><div class="kpi-title">Valoraciones Docentes</div><div class="kpi-val">${valoraciones.length}</div></td>
    </tr>
  </table>

  <h2>1️⃣ MATRÍCULA Y RENDIMIENTO DE ESTUDIANTES Y DOCENTES</h2>
  <table class="data-table">
    <thead>
      <tr>
        <th>ID Alumno</th>
        <th>Nickname</th>
        <th>Escuela</th>
        <th>Curso</th>
        <th>Docente Asignado</th>
        <th>Código Acceso Docente</th>
        <th>XP Acumulado</th>
        <th>Misiones Completadas</th>
        <th>Estado Insignia</th>
      </tr>
    </thead>
    <tbody>
      ${alumnos.map((a) => {
        const docAssigned = docentes.find((d) => d.id === a.docenteId);
        const completadasStr = Array.isArray(a.misionesCompletadas) && a.misionesCompletadas.length > 0
          ? `${a.misionesCompletadas.length}/4 (${a.misionesCompletadas.join(", ").toUpperCase()})`
          : "0/4";
        return `
          <tr>
            <td>${a.id}</td>
            <td><strong>${a.nickname || "Alumno"}</strong></td>
            <td>${a.escuela || "-"}</td>
            <td>${a.curso || "1° Año"}</td>
            <td>${docAssigned ? `<span class="tag-assigned">👩‍🏫 ${docAssigned.nombre}</span>` : `<span class="tag-unassigned">⚡ A Designar</span>`}</td>
            <td>${docAssigned ? docAssigned.codigoAcceso || "------" : "-"}</td>
            <td><strong>${a.xpTotal || a.xp || 0} XP</strong></td>
            <td>${completadasStr}</td>
            <td>${a.badgeEarned ? `<span class="tag-badge">🏆 Acreditada</span>` : `En proceso`}</td>
          </tr>
        `;
      }).join("")}
    </tbody>
  </table>

  <h2>2️⃣ VALORACIONES PEDAGÓGICAS Y SUGERENCIAS DE LOS DOCENTES (${valoraciones.length})</h2>
  <table class="data-table">
    <thead>
      <tr>
        <th>Docente</th>
        <th>Escuela / Curso</th>
        <th>Valor Pedagógico Misiones</th>
        <th>Dificultad Percibida</th>
        <th>Contacto Grupal</th>
        <th>Síntesis para Familias (CiDi)</th>
        <th>Propuestas y Sugerencias de Mejora</th>
      </tr>
    </thead>
    <tbody>
      ${valoraciones.length === 0 ? `
        <tr><td colSpan="7" style="font-style:italic; color:#64748b; text-align:center;">No hay valoraciones enviadas por docentes todavía.</td></tr>
      ` : valoraciones.map((v) => {
        const r = v.respuestas || {};
        return `
          <tr>
            <td><strong>👩‍🏫 ${v.nombreDocente || "Docente"}</strong></td>
            <td>${v.escuela || "-"} (${v.curso || "-"})</td>
            <td>${r.valorPedagogico || "-"}</td>
            <td>${r.nivelDificultad || "-"}</td>
            <td>${r.contactoGrupal || "-"}</td>
            <td>${r.sintesisFamilias || "-"}</td>
            <td>${r.sugerenciasMejora || "Sin comentarios"}</td>
          </tr>
        `;
      }).join("")}
    </tbody>
  </table>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: "application/vnd.ms-excel;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename.endsWith(".xls") ? filename : `${filename}.xls`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem("cc_pin") === PIN_ACCESO;
  });
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);

  // Estados de Datos
  const [docentes, setDocentes] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [valoraciones, setValoraciones] = useState([]); // 2.c FIX
  const [liveLogs, setLiveLogs] = useState([]);
  const [toast, setToast] = useState(null);

  const [firestoreError, setFirestoreError] = useState(null);
  const [dbStatus, setDbStatus] = useState("CONECTADO");

  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [targetDocenteId, setTargetDocenteId] = useState(null);
  const [telemetriaTab, setTelemetriaTab] = useState("RESUMEN"); // 2.a FIX

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleLoginPin = (e) => {
    e.preventDefault();
    if (pinInput === PIN_ACCESO) {
      sessionStorage.setItem("cc_pin", PIN_ACCESO);
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  // 📡 Suscripciones en Tiempo Real
  useEffect(() => {
    if (!isAuthenticated || !db) return;

    // 1. Docentes
    const unsubDocentes = onSnapshot(
      collection(db, "docentes"),
      (snap) => {
        const list = [];
        snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
        setDocentes(list);
        setFirestoreError(null);
        setDbStatus("CONECTADO");
      },
      (err) => {
        console.error("Error Snapshot Docentes:", err);
        setFirestoreError(`Error lectura docentes: ${err.message}`);
      }
    );

    // 2. Alumnos
    const unsubAlumnos = onSnapshot(
      collection(db, "alumnos"),
      (snap) => {
        const list = [];
        snap.forEach((a) => list.push({ id: a.id, ...a.data() }));
        setAlumnos(list);
        setFirestoreError(null);
        setDbStatus("CONECTADO");
      },
      (err) => {
        console.error("Error Snapshot Alumnos:", err);
        setFirestoreError(`Error lectura alumnos: ${err.message}`);
      }
    );

    // 3. Valoraciones de Docentes (2.c FIX)
    const unsubValoraciones = onSnapshot(
      collection(db, "valoraciones_docentes"),
      (snap) => {
        const list = [];
        snap.forEach((v) => list.push({ id: v.id, ...v.data() }));
        setValoraciones(list);
      },
      (err) => console.error("Error Snapshot Valoraciones:", err)
    );

    // 4. Bitácora xAPI
    const qBitacora = query(
      collection(db, "bitacora_alumnos"),
      orderBy("fecha", "desc"),
      limit(100)
    );
    const unsubBitacora = onSnapshot(
      qBitacora,
      (snap) => {
        const logs = [];
        snap.forEach((b) => logs.push({ id: b.id, ...b.data() }));
        setLiveLogs(logs);
      },
      (err) => console.error("Error Snapshot Bitácora:", err)
    );

    return () => {
      unsubDocentes();
      unsubAlumnos();
      unsubValoraciones();
      unsubBitacora();
    };
  }, [isAuthenticated]);

  const docentesIdsSet = new Set(docentes.map((d) => d.id));
  const alumnosADesignar = alumnos.filter(
    (a) => !a.docenteId || !docentesIdsSet.has(a.docenteId)
  );

  const getAlumnosCountForDocente = (docenteId) => {
    return alumnos.filter((a) => a.docenteId === docenteId).length;
  };

  const isDocenteDuplicado = (docItem) => {
    if (!docItem.nombre || !docItem.escuela || !docItem.curso) return false;
    const nameNorm = docItem.nombre.trim().toLowerCase();
    const escNorm = docItem.escuela.trim().toLowerCase();
    const curNorm = docItem.curso.trim().toLowerCase();

    return docentes.some(
      (other) =>
        other.id !== docItem.id &&
        (other.nombre || "").trim().toLowerCase() === nameNorm &&
        (other.escuela || "").trim().toLowerCase() === escNorm &&
        (other.curso || "").trim().toLowerCase() === curNorm
    );
  };

  const handleToggleSelectStudent = (studentId) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleToggleSelectAllDesignar = () => {
    if (selectedStudentIds.length === alumnosADesignar.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(alumnosADesignar.map((a) => a.id));
    }
  };

  const handleDeleteStudent = async (alumnoId, studentNick) => {
    if (!alumnoId || !db) return;
    const confirm = window.confirm(
      `¿Seguro que querés ELIMINAR definitivamente el registro de "${studentNick}"?

Esta acción borrará la cuenta del alumno en el servidor y TODO su historial en la bitácora.`
    );
    if (!confirm) return;

    try {
      const qBitacoraAlumno = query(
        collection(db, "bitacora_alumnos"),
        where("alumnoId", "==", alumnoId)
      );
      const logsSnap = await getDocs(qBitacoraAlumno);

      const batch = writeBatch(db);
      batch.delete(doc(db, "alumnos", alumnoId));

      logsSnap.forEach((logDoc) => {
        batch.delete(logDoc.ref);
      });

      await batch.commit();

      setSelectedStudentIds((prev) => prev.filter((id) => id !== alumnoId));
      showToast(`❌ Alumno "${studentNick}" e historial borrados del servidor.`);
    } catch (err) {
      console.error("Error eliminando alumno:", err);
      alert("No se pudo eliminar el registro del alumno.");
    }
  };

  const handleDesvincularStudent = async (alumnoId, studentNick) => {
    if (!alumnoId || !db) return;
    const confirm = window.confirm(
      `¿Seguro que querés desvincular a "${studentNick}" de su docente?

El alumno volverá a 'Alumnos a designar' conservando su progreso.`
    );
    if (!confirm) return;

    try {
      await updateDoc(doc(db, "alumnos", alumnoId), { docenteId: null });
      showToast(`↩ "${studentNick}" volvió a 'Alumnos a designar'.`);
    } catch (err) {
      console.error("Error desvinculando alumno:", err);
      alert("No se pudo desvincular al alumno.");
    }
  };

  const handleAssignSelectedStudents = async () => {
    if (!targetDocenteId || selectedStudentIds.length === 0 || !db) return;
    const targetDocente = docentes.find((d) => d.id === targetDocenteId);
    if (!targetDocente) return;

    try {
      const batch = writeBatch(db);
      selectedStudentIds.forEach((studentId) => {
        batch.update(doc(db, "alumnos", studentId), { docenteId: targetDocenteId });
      });
      await batch.commit();

      const count = selectedStudentIds.length;
      showToast(`✅ ${count} alumno(s) asignado(s) a ${targetDocente.nombre}.`);
      setSelectedStudentIds([]);
    } catch (err) {
      console.error("Error asignando alumnos tildados:", err);
      alert("No se pudieron asignar los alumnos tildados.");
    }
  };

  const handleDeleteDocente = async (docItem) => {
    if (!docItem || !db) return;
    const assignedCount = getAlumnosCountForDocente(docItem.id);
    const confirm = window.confirm(
      `¿Seguro que querés ELIMINAR a la docente "${docItem.nombre}" (${docItem.escuela})?

Sus ${assignedCount} alumno(s) asignado(s) volverán a 'Alumnos a designar'.`
    );
    if (!confirm) return;

    try {
      const batch = writeBatch(db);

      const assignedStudents = alumnos.filter((a) => a.docenteId === docItem.id);
      assignedStudents.forEach((a) => {
        batch.update(doc(db, "alumnos", a.id), { docenteId: null });
      });

      batch.delete(doc(db, "docentes", docItem.id));

      await batch.commit();

      if (targetDocenteId === docItem.id) {
        setTargetDocenteId(null);
      }

      showToast(`🗑️ ${assignedCount} alumnos volvieron a Alumnos a designar.`);
    } catch (err) {
      console.error("Error eliminando docente:", err);
      alert("No se pudo eliminar el docente.");
    }
  };

  // 2.c FIX: Exportar Reporte Consolidado (.XLS / Excel)
  const handleExportData = () => {
    exportToFormattedExcelWithSurveys(
      `EduMision_Córdoba_Reporte_Consolidado_${new Date().toISOString().slice(0, 10)}.xls`,
      docentes,
      alumnos,
      valoraciones
    );
    showToast("📊 Reporte Consolidado (.xls) con Valoraciones Docentes exportado con éxito.");
  };

  // 2.a FIX: Cálculo de Métricas Resumidas de Telemetría
  const telemetriaResumen = {
    totalEventos: liveLogs.length,
    completadas: liveLogs.filter((l) => (l.evento || "").includes("completada") || (l.evento || "").includes("Acierto")).length,
    desvios: liveLogs.filter((l) => (l.evento || "").includes("Desvío") || l.esErrorReal).length,
    pistas: liveLogs.filter((l) => (l.evento || "").includes("pista") || (l.evento || "").includes("equivocando")).length
  };

  if (!isAuthenticated) {
    return (
      <div style={{ backgroundColor: "#030712", color: "#f8fafc", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", fontFamily: "sans-serif", padding: "20px" }}>
        <form onSubmit={handleLoginPin} style={{ backgroundColor: "#0f172a", border: "1px solid #38bdf8", borderRadius: "16px", padding: "30px", maxWidth: "380px", width: "100%", textAlign: "center", boxShadow: "0 10px 25px rgba(0,0,0,0.5)" }}>
          <div style={{ fontSize: "40px", marginBottom: "10px" }}>🏛️</div>
          <h2 style={{ color: "#38bdf8", margin: "0 0 8px 0", fontSize: "20px" }}>Control Central Córdoba</h2>
          <p style={{ color: "#94a3b8", fontSize: "13px", marginBottom: "20px" }}>Ingresá el PIN de acceso provincial para gestionar el sistema.</p>

          <input
            type="password"
            placeholder="PIN de acceso..."
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            style={{ width: "100%", padding: "12px", borderRadius: "8px", border: pinError ? "2px solid #ef4444" : "1px solid #334155", backgroundColor: "#020617", color: "#fff", textAlign: "center", fontSize: "18px", letterSpacing: "4px", marginBottom: "15px" }}
            autoFocus
            required
          />

          {pinError && (
            <div style={{ color: "#ef4444", fontSize: "12px", marginBottom: "15px", fontWeight: "bold" }}>
              ⚠️ PIN incorrecto. Verificá la clave ingresada.
            </div>
          )}

          <button type="submit" style={{ width: "100%", padding: "12px", borderRadius: "8px", backgroundColor: "#0284c7", color: "#fff", border: "none", fontWeight: "bold", cursor: "pointer", fontSize: "14px" }}>
            Ingresar al Panel 🚀
          </button>
        </form>
      </div>
    );
  }

  const selectedTargetDocente = docentes.find((d) => d.id === targetDocenteId);

  return (
    <div style={{ backgroundColor: "#030712", color: "#f8fafc", minHeight: "100vh", fontFamily: "sans-serif", padding: "20px" }}>
      {toast && (
        <div style={{ position: "fixed", bottom: "20px", right: "20px", backgroundColor: "#0284c7", color: "#fff", padding: "12px 20px", borderRadius: "10px", fontWeight: "bold", zIndex: 10000, boxShadow: "0 4px 12px rgba(0,0,0,0.4)" }}>
          {toast}
        </div>
      )}

      {firestoreError && (
        <div style={{ backgroundColor: "#7f1d1d", border: "2px solid #ef4444", color: "#fca5a5", padding: "12px 20px", borderRadius: "10px", fontWeight: "bold", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>⚠️ {firestoreError}</span>
          <button onClick={() => window.location.reload()} style={{ backgroundColor: "#ef4444", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>
            Reintentar
          </button>
        </div>
      )}

      {/* ENCABEZADO SIN BOTÓN CREAR DOCENTE (2.b FIX) */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #1e293b", paddingBottom: "16px", marginBottom: "20px" }}>
        <div>
          <h1 style={{ color: "#38bdf8", margin: 0, fontSize: "24px" }}>🏛️ EduMisión Córdoba · Control Central</h1>
          <p style={{ color: "#94a3b8", margin: "4px 0 0 0", fontSize: "13px" }}>
            Panel Unificado 360°: Gestión de Matrícula, Cursos, Telemetría y Valoraciones Docentes
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={handleExportData} style={{ backgroundColor: "#8b5cf6", color: "#fff", border: "none", padding: "10px 16px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "13px" }}>
            📊 Exportar Reporte Consolidado (.XLS)
          </button>
          <button onClick={() => { sessionStorage.removeItem("cc_pin"); setIsAuthenticated(false); }} style={{ backgroundColor: "transparent", color: "#64748b", border: "1px solid #334155", padding: "10px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "12px" }}>
            🔒 Salir
          </button>
        </div>
      </header>

      {/* SECTOR 1: ALUMNOS A DESIGNAR */}
      <section style={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px", padding: "20px", marginBottom: "25px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <h2 style={{ color: "#fb923c", margin: 0, fontSize: "18px", display: "flex", alignItems: "center", gap: "8px" }}>
            1️⃣ ALUMNOS A DESIGNAR ({alumnosADesignar.length})
          </h2>
          {alumnosADesignar.length > 0 && (
            <button onClick={handleToggleSelectAllDesignar} style={{ backgroundColor: "#020617", color: "#94a3b8", border: "1px solid #334155", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", cursor: "pointer" }}>
              {selectedStudentIds.length === alumnosADesignar.length ? "Desmarcar todos" : "Tildar todos"}
            </button>
          )}
        </div>
        <p style={{ color: "#94a3b8", fontSize: "12px", marginBottom: "15px" }}>
          Alumnos ingresados de forma autónoma o cuyo docente ya no existe. Tildá los alumnos y seleccioná un docente destino abajo para asignarlos.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px", maxHeight: "350px", overflowY: "auto" }}>
          {alumnosADesignar.length === 0 ? (
            <div style={{ color: "#64748b", fontStyle: "italic", textAlign: "center", padding: "20px", border: "1px dashed #1e293b", borderRadius: "8px", gridColumn: "1 / -1" }}>
              ✨ ¡No hay alumnos a designar pendientes! Todos los estudiantes están vinculados a un docente activo.
            </div>
          ) : (
            alumnosADesignar.map((a) => {
              const isChecked = selectedStudentIds.includes(a.id);
              const misionesCount = Array.isArray(a.misionesCompletadas) ? a.misionesCompletadas.length : 0;
              return (
                <div key={a.id} style={{ backgroundColor: isChecked ? "rgba(56, 189, 248, 0.12)" : "#020617", border: isChecked ? "2px solid #38bdf8" : "1px solid #334155", borderRadius: "8px", padding: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleSelectStudent(a.id)}
                      style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: "#0284c7" }}
                    />
                    <div>
                      <strong style={{ color: "#f8fafc", fontSize: "14px" }}>{a.nickname || "Alumno"}</strong>
                      <div style={{ color: "#94a3b8", fontSize: "11px" }}>{a.escuela || "Sin escuela"} · {a.curso || "1° Año"}</div>
                      <div style={{ color: "#38bdf8", fontSize: "11px", marginTop: "2px" }}>
                        ⚡ <strong>{a.xpTotal || a.xp || 0} XP</strong> • Misiones: <span style={{ color: "#4ade80" }}>{misionesCount}/4</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteStudent(a.id, a.nickname)}
                    title="Eliminar ingreso ficticio o fallido"
                    style={{ backgroundColor: "rgba(239, 68, 68, 0.15)", color: "#ef4444", border: "1px solid #ef4444", borderRadius: "6px", padding: "6px 10px", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}
                  >
                    ✖
                  </button>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* SECTOR 2: PROFES Y SUS ALUMNOS ASIGNADOS */}
      <section style={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px", padding: "20px", marginBottom: "25px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "10px" }}>
          <h2 style={{ color: "#38bdf8", margin: 0, fontSize: "18px" }}>
            2️⃣ PROFES Y SUS ALUMNOS ASIGNADOS ({docentes.length} Tarjetas)
          </h2>

          <button
            onClick={handleAssignSelectedStudents}
            disabled={!targetDocenteId || selectedStudentIds.length === 0}
            style={{
              backgroundColor: (!targetDocenteId || selectedStudentIds.length === 0) ? "#1e293b" : "#10b981",
              color: (!targetDocenteId || selectedStudentIds.length === 0) ? "#64748b" : "#fff",
              border: "none",
              padding: "10px 18px",
              borderRadius: "8px",
              fontWeight: "bold",
              cursor: (!targetDocenteId || selectedStudentIds.length === 0) ? "not-allowed" : "pointer",
              fontSize: "13px"
            }}
          >
            {targetDocenteId
              ? `Asignar ${selectedStudentIds.length} tildado(s) a [${selectedTargetDocente?.nombre || "Destino"}] ➔`
              : "Elegí una tarjeta de profe como destino..."}
          </button>
        </div>

        <p style={{ color: "#94a3b8", fontSize: "12px", marginBottom: "15px" }}>
          Hacé clic sobre la tarjeta de un docente para seleccionarlo como <strong>docente destino</strong>. Cada tarjeta muestra sus indicadores de desempeño y la sub-lista de sus alumnos asignados.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "16px", maxHeight: "500px", overflowY: "auto" }}>
          {docentes.length === 0 ? (
            <div style={{ color: "#64748b", fontStyle: "italic", textAlign: "center", padding: "20px", border: "1px dashed #1e293b", borderRadius: "8px", gridColumn: "1 / -1" }}>
              No hay docentes creados. Se registrarán automáticamente cuando ingresen por primera vez a su panel.
            </div>
          ) : (
            docentes.map((docItem) => {
              const isSelected = targetDocenteId === docItem.id;
              const isDuplicated = isDocenteDuplicado(docItem);
              
              const assignedStudents = alumnos.filter((a) => a.docenteId === docItem.id);
              const assignedCount = assignedStudents.length;

              const atLeastOneCount = assignedStudents.filter(
                (a) => Array.isArray(a.misionesCompletadas) && a.misionesCompletadas.length > 0
              ).length;
              const badgeCount = assignedStudents.filter((a) => a.badgeEarned).length;

              const pctAtLeastOne = assignedCount > 0 ? Math.round((atLeastOneCount / assignedCount) * 100) : 0;
              const pctBadge = assignedCount > 0 ? Math.round((badgeCount / assignedCount) * 100) : 0;

              return (
                <div
                  key={docItem.id}
                  onClick={() => setTargetDocenteId(docItem.id)}
                  style={{
                    backgroundColor: isSelected ? "rgba(16, 185, 129, 0.12)" : "#020617",
                    border: isSelected ? "2px solid #10b981" : "1px solid #1e293b",
                    borderRadius: "10px",
                    padding: "14px",
                    cursor: "pointer",
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between"
                  }}
                >
                  {isDuplicated && (
                    <span style={{ position: "absolute", top: "10px", right: "10px", backgroundColor: "#f59e0b", color: "#000", fontSize: "10px", fontWeight: "bold", padding: "2px 6px", borderRadius: "4px" }}>
                      ⚠️ posible duplicado
                    </span>
                  )}

                  <div>
                    <div style={{ marginBottom: "8px" }}>
                      <strong style={{ color: isSelected ? "#4ade80" : "#38bdf8", fontSize: "15px" }}>
                        👩‍🏫 {docItem.nombre}
                      </strong>
                      <div style={{ color: "#94a3b8", fontSize: "12px", marginTop: "2px" }}>
                        {docItem.escuela} · {docItem.curso || "1° Año"}
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", backgroundColor: "#0f172a", padding: "6px 10px", borderRadius: "6px" }}>
                      <span style={{ fontSize: "11px", color: "#f59e0b", fontFamily: "monospace" }}>
                        Código: <strong>{docItem.codigoAcceso || "------"}</strong>
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDocente(docItem);
                        }}
                        title="Eliminar profe y liberar sus alumnos"
                        style={{ backgroundColor: "rgba(239, 68, 68, 0.15)", color: "#ef4444", border: "1px solid #ef4444", borderRadius: "6px", padding: "3px 8px", cursor: "pointer", fontSize: "11px", fontWeight: "bold" }}
                      >
                        🗑 Eliminar profe
                      </button>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginBottom: "12px" }}>
                      <div style={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", padding: "6px", borderRadius: "6px", textAlign: "center" }}>
                        <div style={{ fontSize: "10px", color: "#94a3b8" }}>≥1 Misión Completa</div>
                        <div style={{ fontSize: "14px", fontWeight: "bold", color: "#38bdf8" }}>{pctAtLeastOne}%</div>
                      </div>
                      <div style={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", padding: "6px", borderRadius: "6px", textAlign: "center" }}>
                        <div style={{ fontSize: "10px", color: "#94a3b8" }}>Con Insignia</div>
                        <div style={{ fontSize: "14px", fontWeight: "bold", color: "#c084fc" }}>{pctBadge}%</div>
                      </div>
                    </div>

                    <div style={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", padding: "10px" }}>
                      <div style={{ fontSize: "11px", fontWeight: "bold", color: "#cbd5e1", marginBottom: "6px", display: "flex", justifyContent: "space-between" }}>
                        <span>Alumnos Asignados:</span>
                        <span style={{ color: "#38bdf8" }}>{assignedCount} alumnos</span>
                      </div>

                      {assignedCount === 0 ? (
                        <div style={{ fontStyle: "italic", color: "#64748b", fontSize: "11px", padding: "6px 0" }}>
                          Sin alumnos asignados a este docente.
                        </div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "180px", overflowY: "auto" }}>
                          {assignedStudents.map((al) => {
                            const misionesStr = Array.isArray(al.misionesCompletadas) && al.misionesCompletadas.length > 0
                              ? `${al.misionesCompletadas.length}/4 (${al.misionesCompletadas.join(", ").toUpperCase()})`
                              : "0/4";

                            return (
                              <div
                                key={al.id}
                                style={{
                                  backgroundColor: "#020617",
                                  border: "1px solid #334155",
                                  borderRadius: "6px",
                                  padding: "6px 8px",
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  fontSize: "11px"
                                }}
                              >
                                <div>
                                  <strong style={{ color: "#f8fafc" }}>{al.nickname || "Alumno"}</strong>
                                  <div style={{ fontSize: "10px", color: "#94a3b8" }}>
                                    ⚡ <strong style={{ color: "#f59e0b" }}>{al.xpTotal || al.xp || 0} XP</strong> · Misiones: <span style={{ color: "#38bdf8" }}>{misionesStr}</span>
                                    {al.badgeEarned && <span style={{ color: "#c084fc", marginLeft: "4px" }}>🏆 Insignia</span>}
                                  </div>
                                </div>

                                <div style={{ display: "flex", gap: "4px" }}>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDesvincularStudent(al.id, al.nickname);
                                    }}
                                    title="Volver a la lista de alumnos a designar"
                                    style={{ backgroundColor: "rgba(251, 146, 60, 0.15)", color: "#fb923c", border: "1px solid #fb923c", padding: "2px 6px", borderRadius: "4px", fontWeight: "bold", cursor: "pointer", fontSize: "10px" }}
                                  >
                                    ↩ Desvincular
                                  </button>

                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteStudent(al.id, al.nickname);
                                    }}
                                    title="Eliminar ingreso ficticio"
                                    style={{ backgroundColor: "rgba(239, 68, 68, 0.15)", color: "#ef4444", border: "1px solid #ef4444", padding: "2px 6px", borderRadius: "4px", fontWeight: "bold", cursor: "pointer", fontSize: "10px" }}
                                  >
                                    ✖
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* 2.c FIX: SECTOR 3: VALORACIONES DE DOCENTES */}
      <section style={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px", padding: "20px", marginBottom: "25px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <h2 style={{ color: "#c084fc", margin: 0, fontSize: "18px" }}>
            3️⃣ VALORACIONES Y EVALUACIONES DE DOCENTES ({valoraciones.length})
          </h2>
          <span style={{ fontSize: "11px", color: "#94a3b8" }}>
            Respuestas recibidas desde el cuestionario de valoración pedagógica
          </span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #1e293b", color: "#64748b", textAlign: "left" }}>
                <th style={{ padding: "10px" }}>Docente / Escuela</th>
                <th style={{ padding: "10px" }}>Valor Misiones</th>
                <th style={{ padding: "10px" }}>Dificultad</th>
                <th style={{ padding: "10px" }}>Mensajes Vivo</th>
                <th style={{ padding: "10px" }}>Síntesis CiDi</th>
                <th style={{ padding: "10px" }}>Sugerencias y Comentarios</th>
              </tr>
            </thead>
            <tbody>
              {valoraciones.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ fontStyle: "italic", color: "#64748b", padding: "20px", textAlign: "center" }}>
                    Aún no hay valoraciones pedagógicas enviadas por docentes.
                  </td>
                </tr>
              ) : (
                valoraciones.map((v) => {
                  const r = v.respuestas || {};
                  return (
                    <tr key={v.id} style={{ borderBottom: "1px solid #020617" }}>
                      <td style={{ padding: "10px" }}>
                        <strong style={{ color: "#38bdf8" }}>👩‍🏫 {v.nombreDocente || "Docente"}</strong>
                        <div style={{ fontSize: "11px", color: "#94a3b8" }}>{v.escuela || "Escuela"} ({v.curso || "1° Año"})</div>
                      </td>
                      <td style={{ padding: "10px", color: "#4ade80", fontWeight: "bold" }}>{r.valorPedagogico || "-"}</td>
                      <td style={{ padding: "10px", color: "#cbd5e1" }}>{r.nivelDificultad || "-"}</td>
                      <td style={{ padding: "10px", color: "#c084fc" }}>{r.contactoGrupal || "-"}</td>
                      <td style={{ padding: "10px", color: "#fb923c" }}>{r.sintesisFamilias || "-"}</td>
                      <td style={{ padding: "10px", color: "#f8fafc", fontStyle: "italic", maxWidth: "250px" }}>
                        "{r.sugerenciasMejora || "Sin comentarios adicionales"}"
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 2.a FIX: SECTOR 4: TELEMETRÍA Y RESUMEN EJECUTIVO */}
      <section style={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px", padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "10px" }}>
          <h2 style={{ color: "#38bdf8", margin: 0, fontSize: "18px", display: "flex", alignItems: "center", gap: "10px" }}>
            4️⃣ TELEMETRÍA xAPI EN TIEMPO REAL ({liveLogs.length} Eventos)
          </h2>

          <div style={{ display: "flex", gap: "6px" }}>
            <button
              onClick={() => setTelemetriaTab("RESUMEN")}
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                border: telemetriaTab === "RESUMEN" ? "1px solid #38bdf8" : "1px solid #334155",
                backgroundColor: telemetriaTab === "RESUMEN" ? "rgba(56, 189, 248, 0.2)" : "#020617",
                color: telemetriaTab === "RESUMEN" ? "#38bdf8" : "#94a3b8",
                fontSize: "11px",
                fontWeight: "bold",
                cursor: "pointer"
              }}
            >
              📊 Resumen Ejecutivo
            </button>
            <button
              onClick={() => setTelemetriaTab("DETALLADO")}
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                border: telemetriaTab === "DETALLADO" ? "1px solid #38bdf8" : "1px solid #334155",
                backgroundColor: telemetriaTab === "DETALLADO" ? "rgba(56, 189, 248, 0.2)" : "#020617",
                color: telemetriaTab === "DETALLADO" ? "#38bdf8" : "#94a3b8",
                fontSize: "11px",
                fontWeight: "bold",
                cursor: "pointer"
              }}
            >
              📜 Registro Detallado (100)
            </button>
          </div>
        </div>

        {/* 2.a FIX: RESUMEN EJECUTIVO SINTÉTICO DE BITÁCORA */}
        {telemetriaTab === "RESUMEN" ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
            <div style={{ backgroundColor: "#020617", border: "1px solid #1e293b", padding: "12px", borderRadius: "8px", textAlign: "center" }}>
              <div style={{ fontSize: "11px", color: "#94a3b8" }}>Eventos xAPI Totales</div>
              <div style={{ fontSize: "22px", fontWeight: "bold", color: "#ffffff", margin: "4px 0" }}>{telemetriaResumen.totalEventos}</div>
              <div style={{ fontSize: "10px", color: "#38bdf8" }}>Telemetría en vivo</div>
            </div>

            <div style={{ backgroundColor: "#020617", border: "1px solid #1e293b", padding: "12px", borderRadius: "8px", textAlign: "center" }}>
              <div style={{ fontSize: "11px", color: "#94a3b8" }}>Acciones de Éxito / Aciertos</div>
              <div style={{ fontSize: "22px", fontWeight: "bold", color: "#4ade80", margin: "4px 0" }}>{telemetriaResumen.completadas}</div>
              <div style={{ fontSize: "10px", color: "#4ade80" }}>Misiones e hitos</div>
            </div>

            <div style={{ backgroundColor: "#020617", border: "1px solid #1e293b", padding: "12px", borderRadius: "8px", textAlign: "center" }}>
              <div style={{ fontSize: "11px", color: "#94a3b8" }}>Desvíos Registrados</div>
              <div style={{ fontSize: "22px", fontWeight: "bold", color: "#fb923c", margin: "4px 0" }}>{telemetriaResumen.desvios}</div>
              <div style={{ fontSize: "10px", color: "#fb923c" }}>Errores diagnósticos</div>
            </div>

            <div style={{ backgroundColor: "#020617", border: "1px solid #1e293b", padding: "12px", borderRadius: "8px", textAlign: "center" }}>
              <div style={{ fontSize: "11px", color: "#94a3b8" }}>Consultas de Pista / Andamiaje</div>
              <div style={{ fontSize: "22px", fontWeight: "bold", color: "#c084fc", margin: "4px 0" }}>{telemetriaResumen.pistas}</div>
              <div style={{ fontSize: "10px", color: "#c084fc" }}>Consultas a EduBot</div>
            </div>
          </div>
        ) : (
          <div style={{ backgroundColor: "#020617", border: "1px solid #1e293b", borderRadius: "8px", padding: "15px", maxHeight: "300px", overflowY: "auto", fontFamily: "monospace", fontSize: "12px" }}>
            {liveLogs.length === 0 ? (
              <div style={{ fontStyle: "italic", color: "#64748b" }}>
                Esperando eventos de telemetría en tiempo real...
              </div>
            ) : (
              liveLogs.map((log) => (
                <div key={log.id} style={{ marginBottom: "8px", borderBottom: "1px dashed #1e293b", paddingBottom: "6px", display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <span style={{ color: "#38bdf8", fontWeight: "bold" }}>[{log.alumno || log.alumnoId || "Alumno"}]</span> ({log.escuela || "Córdoba"}): <span style={{ color: "#f8fafc" }}>{log.evento}</span>
                  </div>
                  <span style={{ color: "#f59e0b" }}>{log.xp || 0} XP</span>
                </div>
              ))
            )}
          </div>
        )}
      </section>
    </div>
  );
}
