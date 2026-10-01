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
    .replace(/^_+|_+$\g, "")
    .replace(/_+/g, "_");
}

// ==========================================
// 🛠️ HELPER EXPORTADOR A EXCEL / LIBREOFFICE (.CSV NATIVO)
// ==========================================
// ==========================================
// 🛠️ HELPER EXPORTADOR INTERACTIVO .XLS / HTML FORMATEADO PARA EXCEL
// ==========================================
const exportToFormattedExcel = (filename, docentes, alumnos) => {
  const bom = "\uFEFF";
  
  const totalAlumnos = alumnos.length;
  const asignadosCount = alumnos.filter((a) => a.docenteId).length;
  const conInsigniaCount = alumnos.filter((a) => a.badgeEarned).length;
  const totalXp = alumnos.reduce((acc, a) => acc + (a.xpTotal || 0), 0);
  const avgXp = totalAlumnos ? Math.round(totalXp / totalAlumnos) : 0;

  const htmlContent = `${bom}
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #ffffff; margin: 0; padding: 20px; }
    .header-title { font-size: 20px; font-weight: bold; color: #0284c7; margin-bottom: 4px; }
    .header-sub { font-size: 12px; color: #64748b; margin-bottom: 16px; }
    
    .kpi-table { border-collapse: collapse; margin-bottom: 20px; }
    .kpi-table td { border: 1px solid #cbd5e1; padding: 10px 16px; text-align: center; background-color: #f8fafc; }
    .kpi-label { font-size: 10px; color: #64748b; font-weight: bold; text-transform: uppercase; }
    .kpi-val { font-size: 18px; color: #0284c7; font-weight: bold; }
    
    .data-table { border-collapse: collapse; width: 100%; font-size: 12px; }
    .data-table th { background-color: #0284c7; color: #ffffff; font-weight: bold; padding: 10px; border: 1px solid #0369a1; text-align: left; }
    .data-table td { padding: 8px 10px; border: 1px solid #e2e8f0; vertical-align: middle; }
    .data-table tr:nth-child(even) { background-color: #f8fafc; }
    
    .tag-assigned { background-color: #dcfce7; color: #15803d; font-weight: bold; padding: 3px 8px; border-radius: 4px; border: 1px solid #86efac; }
    .tag-unassigned { background-color: #ffedd5; color: #c2410c; font-weight: bold; padding: 3px 8px; border-radius: 4px; border: 1px solid #fdba74; }
    .tag-badge { background-color: #fef3c7; color: #b45309; font-weight: bold; padding: 3px 8px; border-radius: 4px; border: 1px solid #fcd34d; }
    .tag-pending { background-color: #f1f5f9; color: #64748b; padding: 3px 8px; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="header-title">🏛️ EduMisión Córdoba — Reporte Consolidado Provincial</div>
  <div class="header-sub">Generado el: ${new Date().toLocaleDateString('es-AR')} ${new Date().toLocaleTimeString('es-AR')}</div>

  <table class="kpi-table">
    <tr>
      <td><div class="kpi-label">Total Alumnos</div><div class="kpi-val">${totalAlumnos}</div></td>
      <td><div class="kpi-label">Asignados a Docente</div><div class="kpi-val">${asignadosCount}</div></td>
      <td><div class="kpi-label">Insignias Otorgadas</div><div class="kpi-val">${conInsigniaCount}</div></td>
      <td><div class="kpi-label">Promedio XP</div><div class="kpi-val">${avgXp} XP</div></td>
    </tr>
  </table>

  <table class="data-table">
    <thead>
      <tr>
        <th>ID Alumno</th>
        <th>Nickname</th>
        <th>Escuela</th>
        <th>Curso</th>
        <th>Docente Asignado</th>
        <th>Código Profe</th>
        <th>XP Total</th>
        <th>Misiones Completadas</th>
        <th>% Avance</th>
        <th>Estado Insignia</th>
      </tr>
    </thead>
    <tbody>
      ${alumnos.map((a) => {
        const docAssigned = docentes.find((d) => d.id === a.docenteId);
        const completadas = Array.isArray(a.misionesCompletadas) ? a.misionesCompletadas : [];
        const mCount = completadas.length;
        const pctAvance = Math.round((mCount / 4) * 100);
        const misionesStr = mCount > 0 ? `${mCount}/4 (${completadas.join(", ").toUpperCase()})` : "0/4 (Sin iniciar)";
        const docenteStr = docAssigned ? docAssigned.nombre : "A designar (Sin asignar)";
        const codigoStr = docAssigned ? (docAssigned.codigoAcceso || "-") : "-";

        return `
          <tr>
            <td>${a.id}</td>
            <td><strong>${a.nickname || "Alumno"}</strong></td>
            <td>${a.escuela || "-"}</td>
            <td>${a.curso || "-"}</td>
            <td>${docAssigned ? `<span class="tag-assigned">👩‍🏫 ${docenteStr}</span>` : `<span class="tag-unassigned">⚡ ${docenteStr}</span>`}</td>
            <td><code>${codigoStr}</code></td>
            <td><strong>${a.xpTotal || 0} XP</strong></td>
            <td>${misionesStr}</td>
            <td><strong>${pctAvance}%</strong></td>
            <td>${a.badgeEarned ? `<span class="tag-badge">🏆 Otorgada</span>` : `<span class="tag-pending">En proceso</span>`}</td>
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


const exportToExcelCSV = (filename, headers, rows) => {
  const bom = "﻿";
  const csvContent =
    bom +
    [
      headers.map((h) => `"${String(h).replace(/"/g, '""')}"`).join(";"),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(";")
      )
    ].join("
");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default function App() {
  // 🔒 Estado de Autenticación con PIN (sessionStorage)
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem("cc_pin") === PIN_ACCESO;
  });
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);

  // Estados de Datos
  const [docentes, setDocentes] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [liveLogs, setLiveLogs] = useState([]);
  const [toast, setToast] = useState(null);

  // Estado de Conexión y Errores de Firebase
  const [firestoreError, setFirestoreError] = useState(null);
  const [dbStatus, setDbStatus] = useState("CONECTADO");

  // Selección de Alumnos a Designar (Checkboxes)
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);

  // Selección de Docente Destino (Un solo clic en la tarjeta)
  const [targetDocenteId, setTargetDocenteId] = useState(null);

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

  // 📡 Suscripciones en Tiempo Real a Firestore con Callback de Error
  useEffect(() => {
    if (!isAuthenticated || !db) return;

    // 1. Suscripción a Docentes
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
        console.error("Error en Snapshot Docentes:", err);
        setFirestoreError(`Error en lectura de 'docentes': ${err.message}`);
        setDbStatus(`DESCONECTADO / ERROR: ${err.message}`);
      }
    );

    // 2. Suscripción a Alumnos
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
        console.error("Error en Snapshot Alumnos:", err);
        setFirestoreError(`Error en lectura de 'alumnos': ${err.message}`);
        setDbStatus(`DESCONECTADO / ERROR: ${err.message}`);
      }
    );

    // 3. Suscripción a Bitácora (Telemetría xAPI con limit 100)
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
        setFirestoreError(null);
        setDbStatus("CONECTADO");
      },
      (err) => {
        console.error("Error en Snapshot Bitácora:", err);
        setFirestoreError(`Error en lectura de 'bitacora_alumnos': ${err.message}`);
        setDbStatus(`DESCONECTADO / ERROR: ${err.message}`);
      }
    );

    return () => {
      unsubDocentes();
      unsubAlumnos();
      unsubBitacora();
    };
  }, [isAuthenticated]);

  // 1. ALUMNOS A DESIGNAR: Sin docenteId O con docenteId que no existe en "docentes"
  const docentesIdsSet = new Set(docentes.map((d) => d.id));
  const alumnosADesignar = alumnos.filter(
    (a) => !a.docenteId || !docentesIdsSet.has(a.docenteId)
  );

  const getAlumnosCountForDocente = (docenteId) => {
    return alumnos.filter((a) => a.docenteId === docenteId).length;
  };

  // Detección de Docentes Duplicados (Mismo nombre, escuela y curso)
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

  // Selección individual o masiva de tildados
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

  // Acciones en Sector 1 & 2: Eliminar Ingreso Fallido e Historial en Bitácora
  const handleDeleteStudent = async (alumnoId, studentNick) => {
    if (!alumnoId || !db) return;
    const confirm = window.confirm(
      `¿Seguro que querés ELIMINAR definitivamente el registro de "${studentNick}"?

Esta acción borrará la cuenta del alumno en el servidor y TODO su historial en la bitácora.`
    );
    if (!confirm) return;

    try {
      // 1. Buscar todos los registros de la bitácora asociados a este alumnoId
      const qBitacoraAlumno = query(
        collection(db, "bitacora_alumnos"),
        where("alumnoId", "==", alumnoId)
      );
      const logsSnap = await getDocs(qBitacoraAlumno);

      // 2. Ejecutar borrado atómico en lote (Batch): el alumno en 'alumnos' y sus eventos en 'bitacora_alumnos'
      const batch = writeBatch(db);
      batch.delete(doc(db, "alumnos", alumnoId));

      logsSnap.forEach((logDoc) => {
        batch.delete(logDoc.ref);
      });

      await batch.commit();

      setSelectedStudentIds((prev) => prev.filter((id) => id !== alumnoId));
      showToast(`❌ Alumno "${studentNick}" e historial de bitácora borrados del servidor.`);
    } catch (err) {
      console.error("Error eliminando alumno e historial:", err);
      alert("No se pudo eliminar el registro del alumno.");
    }
  };

  // Acciones en Sector 2: Desvincular (vuelve a Alumnos a Designar)
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

  // Acciones en Sector 2: Asignar Tildados al Docente Destino
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

  // Acciones en Sector 2: Eliminar Profe con writeBatch
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

      // Poner docenteId: null a todos sus alumnos asignados
      const assignedStudents = alumnos.filter((a) => a.docenteId === docItem.id);
      assignedStudents.forEach((a) => {
        batch.update(doc(db, "alumnos", a.id), { docenteId: null });
      });

      // Borrar el documento del docente
      batch.delete(doc(db, "docentes", docItem.id));

      await batch.commit();

      // Limpiar selección de destino si era este docente
      if (targetDocenteId === docItem.id) {
        setTargetDocenteId(null);
      }

      showToast(`🗑️ ${assignedCount} alumnos volvieron a Alumnos a designar.`);
    } catch (err) {
      console.error("Error eliminando docente:", err);
      alert("No se pudo eliminar el docente.");
    }
  };

  // Exportación de Reporte Formateado (.XLS Excel) y CSV
  const handleExportData = () => {
    exportToFormattedExcel(`EduMision_ControlCentral_Reporte_${new Date().toISOString().slice(0, 10)}.xls`, docentes, alumnos);
    showToast("📊 Reporte Formateado (.xls) exportado con éxito para Excel.");
  };

  // 🔒 PANTALLA DE BLOQUEO POR PIN
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
        <div style={{ position: "fixed", bottom: "20px", right: "20px", backgroundColor: "#0284c7", color: "#fff", padding: "12px 20px", borderRadius: "10px", fontWeight: "bold", zIndex: 1000, boxShadow: "0 4px 12px rgba(0,0,0,0.4)" }}>
          {toast}
        </div>
      )}

      {/* BANNER ROJO DE ERROR DE FIREBASE */}
      {firestoreError && (
        <div style={{ backgroundColor: "#7f1d1d", border: "2px solid #ef4444", color: "#fca5a5", padding: "12px 20px", borderRadius: "10px", fontWeight: "bold", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>⚠️ {firestoreError}</span>
          <button onClick={() => window.location.reload()} style={{ backgroundColor: "#ef4444", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>
            Reintentar
          </button>
        </div>
      )}

      {/* ENCABEZADO */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #1e293b", paddingBottom: "16px", marginBottom: "20px" }}>
        <div>
          <h1 style={{ color: "#38bdf8", margin: 0, fontSize: "24px" }}>🏛️ EduMisión Córdoba · Control Central</h1>
          <p style={{ color: "#94a3b8", margin: "4px 0 0 0", fontSize: "13px" }}>
            Panel Unificado 360°: Gestión de Matrícula, Cursos y Telemetría en Tiempo Real
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={handleExportData} style={{ backgroundColor: "#8b5cf6", color: "#fff", border: "none", padding: "10px 16px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "13px" }}>
            📊 Exportar CSV
          </button>
          <button onClick={() => { sessionStorage.removeItem("cc_pin"); setIsAuthenticated(false); }} style={{ backgroundColor: "transparent", color: "#64748b", border: "1px solid #334155", padding: "10px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "12px" }}>
            🔒 Salir
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* SECTOR 1: ALUMNOS A DESIGNAR */}
      {/* ========================================================================= */}
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
                        ⚡ <strong>{a.xpTotal || 0} XP</strong> • Misiones: <span style={{ color: "#4ade80" }}>{misionesCount}/4</span>
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

      {/* ========================================================================= */}
      {/* SECTOR 2: PROFES Y SUS ALUMNOS ASIGNADOS */}
      {/* ========================================================================= */}
      <section style={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px", padding: "20px", marginBottom: "25px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "10px" }}>
          <h2 style={{ color: "#38bdf8", margin: 0, fontSize: "18px" }}>
            2️⃣ PROFES Y SUS ALUMNOS ASIGNADOS ({docentes.length} Tarjetas)
          </h2>

          {/* BOTÓN ASIGNAR TILDADOS */}
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
              
              // Alumnos asignados a este docente
              const assignedStudents = alumnos.filter((a) => a.docenteId === docItem.id);
              const assignedCount = assignedStudents.length;

              // Indicadores por tarjeta
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
                  {/* ETIQUETA AMARILLA DE DUPLICADO */}
                  {isDuplicated && (
                    <span style={{ position: "absolute", top: "10px", right: "10px", backgroundColor: "#f59e0b", color: "#000", fontSize: "10px", fontWeight: "bold", padding: "2px 6px", borderRadius: "4px" }}>
                      ⚠️ posible duplicado
                    </span>
                  )}

                  <div>
                    {/* DATOS DOCENTE */}
                    <div style={{ marginBottom: "8px" }}>
                      <strong style={{ color: isSelected ? "#4ade80" : "#38bdf8", fontSize: "15px" }}>
                        👩‍🏫 {docItem.nombre}
                      </strong>
                      <div style={{ color: "#94a3b8", fontSize: "12px", marginTop: "2px" }}>
                        {docItem.escuela} · {docItem.curso || "1° Año"}
                      </div>
                    </div>

                    {/* LÍNEA DE CÓDIGO Y ACCIÓN ELIMINAR PROFE */}
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

                    {/* CONTADORES SIMPLE KPI PER DOCENTE */}
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

                    {/* SUB-LISTA DE ALUMNOS ASIGNADOS */}
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
                                    ⚡ <strong style={{ color: "#f59e0b" }}>{al.xpTotal || 0} XP</strong> · Misiones: <span style={{ color: "#38bdf8" }}>{misionesStr}</span>
                                    {al.badgeEarned && <span style={{ color: "#c084fc", marginLeft: "4px" }}>🏆 Insignia</span>}
                                  </div>
                                </div>

                                <div style={{ display: "flex", gap: "4px" }}>
                                  {/* DESVINCULAR */}
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

                                  {/* ELIMINAR */}
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

      {/* ========================================================================= */}
      {/* SECTOR 3: TELEMETRÍA */}
      {/* ========================================================================= */}
      <section style={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px", padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <h2 style={{ color: "#c084fc", margin: 0, fontSize: "18px", display: "flex", alignItems: "center", gap: "10px" }}>
            3️⃣ TELEMETRÍA xAPI EN TIEMPO REAL ({liveLogs.length} Eventos)
          </h2>
          <span style={{ fontSize: "11px", backgroundColor: dbStatus === "CONECTADO" ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)", color: dbStatus === "CONECTADO" ? "#4ade80" : "#ef4444", border: `1px solid ${dbStatus === "CONECTADO" ? "#10b981" : "#ef4444"}`, padding: "4px 10px", borderRadius: "8px", fontWeight: "bold" }}>
            ● {dbStatus}
          </span>
        </div>
        <p style={{ color: "#94a3b8", fontSize: "12px", marginBottom: "15px" }}>
          Últimos 100 eventos xAPI registrados desde las cabinas de los alumnos:
        </p>

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
      </section>
    </div>
  );
}
