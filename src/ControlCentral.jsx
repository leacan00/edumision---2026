import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  serverTimestamp
} from "firebase/firestore";

// ==========================================
// 🛠️ HELPER EXPORTADOR A EXCEL / LIBREOFFICE (.CSV NATIVO)
// ==========================================
const exportToExcelCSV = (filename, headers, rows) => {
  const bom = "\uFEFF";
  const csvContent =
    bom +
    [
      headers.map((h) => `"${String(h).replace(/"/g, '""')}"`).join(";"),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(";")
      )
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

export default function App() {
  const [docentes, setDocentes] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [liveLogs, setLiveLogs] = useState([]);
  const [toast, setToast] = useState(null);

  // Estados para asignación rápida de flotantes
  const [selectedDocenteForAssign, setSelectedDocenteForAssign] = useState("");

  // Modal para alta de docentes
  const [showAddDocenteModal, setShowDocenteModal] = useState(false);
  const [newDocenteName, setNewDocenteName] = useState("");
  const [newEscuela, setNewEscuela] = useState("");
  const [newCurso, setNewCurso] = useState("");

  // Modo de filtro opcional (por defecto "todos" para ver todo en la misma página)
  const [viewFilter, setViewFilter] = useState("todos"); // "todos" | "vincular" | "docentes" | "alumnos" | "telemetria"

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  // 📡 Suscripciones en Tiempo Real a Firestore
  useEffect(() => {
    if (!db) return;

    // 1. Suscripción a Docentes
    const unsubDocentes = onSnapshot(collection(db, "docentes"), (snap) => {
      const list = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
      setDocentes(list);
      if (list.length > 0) {
        setSelectedDocenteForAssign((prev) => prev || list[0].id);
      }
    });

    // 2. Suscripción a Alumnos
    const unsubAlumnos = onSnapshot(collection(db, "alumnos"), (snap) => {
      const list = [];
      snap.forEach((a) => list.push({ id: a.id, ...a.data() }));
      setAlumnos(list);
    });

    // 3. Suscripción a Bitácora (Telemetría xAPI)
    const unsubBitacora = onSnapshot(collection(db, "bitacora_alumnos"), (snap) => {
      const logs = [];
      snap.forEach((b) => logs.push({ id: b.id, ...b.data() }));
      logs.sort((a, b) => (b.fecha?.seconds || 0) - (a.fecha?.seconds || 0));
      setLiveLogs(logs);
    });

    return () => {
      unsubDocentes();
      unsubAlumnos();
      unsubBitacora();
    };
  }, []);

  // Derivación de alumnos flotantes y asignados por docente
  const flotantes = alumnos.filter((a) => !a.docenteId);
  const getAlumnosDelDocente = (docenteId) =>
    alumnos.filter((a) => a.docenteId === docenteId);

  // 1. Asignar alumno flotante a un docente
  const handleAssignStudent = async (alumnoId, targetDocenteId) => {
    const docId = targetDocenteId || selectedDocenteForAssign;
    if (!alumnoId || !docId || !db) return;

    const docTarget = docentes.find((d) => d.id === docId);
    try {
      await updateDoc(doc(db, "alumnos", alumnoId), { docenteId: docId });
      showToast(`✅ Alumno asignado a ${docTarget ? docTarget.nombre : "Docente"}.`);
    } catch (err) {
      console.error("Error asignando alumno:", err);
      alert("No se pudo asignar el alumno.");
    }
  };

  // 2. Dar de baja del docente (pasa a flotante)
  const handleUnlinkStudent = async (alumnoId, studentNick) => {
    if (!alumnoId || !db) return;
    const confirm = window.confirm(
      `¿Seguro que querés dar de baja a "${studentNick}" de su docente?\n\n(El alumno pasará a la lista de flotantes sin perder su progreso ni su historial).`
    );
    if (!confirm) return;

    try {
      await updateDoc(doc(db, "alumnos", alumnoId), { docenteId: null });
      showToast(`ℹ️ "${studentNick}" ahora es un alumno flotante.`);
    } catch (err) {
      console.error("Error desvinculando alumno:", err);
      alert("No se pudo desvincular el alumno.");
    }
  };

  // 3. Reasignar a otro docente
  const handleReassignStudent = async (alumnoId, studentNick, newDocenteId) => {
    if (!alumnoId || !newDocenteId || !db) return;
    const docTarget = docentes.find((d) => d.id === newDocenteId);
    try {
      await updateDoc(doc(db, "alumnos", alumnoId), { docenteId: newDocenteId });
      showToast(`🔄 "${studentNick}" reasignado a ${docTarget ? docTarget.nombre : "nuevo docente"}.`);
    } catch (err) {
      console.error("Error reasignando alumno:", err);
      alert("No se pudo reasignar el alumno.");
    }
  };

  // 4. Eliminar/Deshabilitar alumno ficticio o fallido
  const handleDeleteStudent = async (alumnoId, studentNick) => {
    if (!alumnoId || !db) return;
    const confirm = window.confirm(
      `¿Seguro que deseas eliminar el registro de "${studentNick}"?\n\nEsta acción removerá la cuenta del alumno en caso de un ingreso fallido o ficticio.`
    );
    if (!confirm) return;

    try {
      await deleteDoc(doc(db, "alumnos", alumnoId));
      showToast(`❌ Alumno "${studentNick}" eliminado correctamente.`);
    } catch (err) {
      console.error("Error eliminando alumno:", err);
      alert("No se pudo eliminar el registro del alumno.");
    }
  };

  // 5. Crear Docente en Firestore
  const handleCreateDocente = async (e) => {
    e.preventDefault();
    if (!newDocenteName || !newEscuela || !newCurso || !db) return;

    const codigoAcceso = Math.floor(100000 + Math.random() * 900000).toString();

    try {
      const docRef = await addDoc(collection(db, "docentes"), {
        nombre: newDocenteName,
        escuela: newEscuela,
        curso: newCurso,
        codigoAcceso: codigoAcceso,
        activo: true,
        creadoEn: serverTimestamp()
      });

      setSelectedDocenteForAssign(docRef.id);
      showToast(`👩‍🏫 Docente "${newDocenteName}" creado. Código de acceso: ${codigoAcceso}`);
      setShowDocenteModal(false);
      setNewDocenteName("");
      setNewEscuela("");
      setNewCurso("");
    } catch (err) {
      console.error("Error creando docente:", err);
      alert("No se pudo crear el docente.");
    }
  };

  // 6. Exportar CSV
  const handleExportData = () => {
    const headers = [
      "ID Alumno",
      "Nickname",
      "Escuela",
      "Curso",
      "Docente Asignado",
      "Código Acceso Docente",
      "XP Total",
      "Misiones Completadas",
      "Insignia"
    ];

    const rows = alumnos.map((a) => {
      const docAssigned = docentes.find((d) => d.id === a.docenteId);
      const completadasStr = Array.isArray(a.misionesCompletadas)
        ? a.misionesCompletadas.join(", ").toUpperCase()
        : "Ninguna";
      const insigniaStr = a.badgeEarned ? "Otorgada" : "En proceso";

      return [
        a.id,
        a.nickname || "-",
        a.escuela || "-",
        a.curso || "-",
        docAssigned ? docAssigned.nombre : "Flotante (Sin Asignar)",
        docAssigned ? docAssigned.codigoAcceso || "-" : "-",
        a.xpTotal || 0,
        completadasStr,
        insigniaStr
      ];
    });

    exportToExcelCSV(
      `EduMision_ControlCentral_Reporte_${new Date().toISOString().slice(0, 10)}.csv`,
      headers,
      rows
    );
    showToast("📊 Reporte CSV exportado con éxito.");
  };

  return (
    <div style={{ backgroundColor: "#030712", color: "#f8fafc", minHeight: "100vh", fontFamily: "sans-serif", padding: "20px" }}>
      {toast && (
        <div style={{ position: "fixed", bottom: "20px", right: "20px", backgroundColor: "#0284c7", color: "#fff", padding: "12px 20px", borderRadius: "10px", fontWeight: "bold", zIndex: 1000, boxShadow: "0 4px 12px rgba(0,0,0,0.4)" }}>
          {toast}
        </div>
      )}

      {/* ENCABEZADO CONTROL CENTRAL */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #1e293b", paddingBottom: "16px", marginBottom: "20px" }}>
        <div>
          <h1 style={{ color: "#38bdf8", margin: 0, fontSize: "24px" }}>🏛️ EduMisión Córdoba · Panel de Control Central</h1>
          <p style={{ color: "#94a3b8", margin: "4px 0 0 0", fontSize: "13px" }}>
            Vista Unificada 360°: Vinculación, Alumnos Designados por Docente, Padrón General y Telemetría Firestore
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={() => setShowDocenteModal(true)} style={{ backgroundColor: "#10b981", color: "#fff", border: "none", padding: "10px 16px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "13px" }}>
            ➕ Crear / Habilitar Docente
          </button>
          <button onClick={handleExportData} style={{ backgroundColor: "#8b5cf6", color: "#fff", border: "none", padding: "10px 16px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "13px" }}>
            📊 Exportar Reporte CSV
          </button>
        </div>
      </header>

      {/* BARRA DE BOTONES DE ACCESO RÁPIDO Y FILTRADO */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
        <button
          onClick={() => setViewFilter("todos")}
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            border: viewFilter === "todos" ? "2px solid #38bdf8" : "1px solid #1e293b",
            backgroundColor: viewFilter === "todos" ? "rgba(56, 189, 248, 0.2)" : "#0f172a",
            color: "#fff",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: "13px"
          }}
        >
          👁️ Ver Todo en 1 Página ({alumnos.length} Alumnos · {docentes.length} Docentes)
        </button>
        <button
          onClick={() => setViewFilter("vincular")}
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            border: viewFilter === "vincular" ? "2px solid #fb923c" : "1px solid #1e293b",
            backgroundColor: viewFilter === "vincular" ? "rgba(251, 146, 60, 0.2)" : "#0f172a",
            color: "#fff",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: "13px"
          }}
        >
          ⚡ Solo Flotantes ({flotantes.length})
        </button>
        <button
          onClick={() => setViewFilter("docentes")}
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            border: viewFilter === "docentes" ? "2px solid #38bdf8" : "1px solid #1e293b",
            backgroundColor: viewFilter === "docentes" ? "rgba(56, 189, 248, 0.2)" : "#0f172a",
            color: "#fff",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: "13px"
          }}
        >
          👩‍🏫 Solo Grupos Docentes ({docentes.length})
        </button>
        <button
          onClick={() => setViewFilter("alumnos")}
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            border: viewFilter === "alumnos" ? "2px solid #10b981" : "1px solid #1e293b",
            backgroundColor: viewFilter === "alumnos" ? "rgba(16, 185, 129, 0.2)" : "#0f172a",
            color: "#fff",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: "13px"
          }}
        >
          👥 Solo Tabla General ({alumnos.length})
        </button>
        <button
          onClick={() => setViewFilter("telemetria")}
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            border: viewFilter === "telemetria" ? "2px solid #c084fc" : "1px solid #1e293b",
            backgroundColor: viewFilter === "telemetria" ? "rgba(192, 132, 252, 0.2)" : "#0f172a",
            color: "#fff",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: "13px"
          }}
        >
          📡 Solo Telemetría xAPI ({liveLogs.length})
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SECCIÓN 1: PANEL DE VINCULACIÓN Y GRUPOS DOCENTES (DOS COLUMNAS) */}
      {/* ========================================================================= */}
      {(viewFilter === "todos" || viewFilter === "vincular" || viewFilter === "docentes") && (
        <div style={{ marginBottom: "30px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "20px" }}>
            
            {/* COLUMNA IZQUIERDA: ALUMNOS FLOTANTES SIN DOCENTE */}
            <div style={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px", padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <h3 style={{ color: "#fb923c", margin: 0, fontSize: "16px" }}>
                  ⚡ Alumnos Flotantes Sin Asignar ({flotantes.length})
                </h3>
                <span style={{ fontSize: "11px", backgroundColor: "rgba(251, 146, 60, 0.15)", color: "#fb923c", padding: "2px 8px", borderRadius: "6px", fontWeight: "bold" }}>
                  Requieren Vinculación
                </span>
              </div>
              <p style={{ color: "#94a3b8", fontSize: "12px", marginBottom: "15px" }}>
                Alumnos ingresados de forma autónoma. Seleccioná el docente destino para vincularlos a su curso.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "420px", overflowY: "auto" }}>
                {flotantes.length === 0 ? (
                  <div style={{ color: "#64748b", fontStyle: "italic", textAlign: "center", padding: "20px", border: "1px dashed #1e293b", borderRadius: "8px" }}>
                    ✨ ¡No hay alumnos flotantes pendientes! Todos los estudiantes están vinculados a un docente.
                  </div>
                ) : (
                  flotantes.map((a) => (
                    <div key={a.id} style={{ backgroundColor: "#020617", border: "1px solid #334155", borderRadius: "8px", padding: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <strong style={{ color: "#f8fafc", fontSize: "14px" }}>{a.nickname || "Alumno"}</strong>
                          <div style={{ color: "#94a3b8", fontSize: "11px" }}>{a.escuela || "Sin escuela"} · {a.curso || "1° Año"}</div>
                          <div style={{ color: "#38bdf8", fontSize: "11px", marginTop: "2px" }}>
                            ⚡ <strong>{a.xpTotal || 0} XP</strong> • Misiones: <span style={{ color: "#4ade80" }}>{a.misionesCompletadas?.length || 0}/4</span>
                          </div>
                        </div>
                        <button onClick={() => handleDeleteStudent(a.id, a.nickname)} title="Eliminar ingreso ficticio" style={{ backgroundColor: "transparent", color: "#ef4444", border: "1px solid #ef4444", borderRadius: "4px", padding: "2px 6px", cursor: "pointer", fontSize: "10px" }}>
                          ❌
                        </button>
                      </div>

                      {/* Selector de docente individual por alumno */}
                      <div style={{ display: "flex", gap: "6px", alignItems: "center", marginTop: "4px" }}>
                        <select defaultValue="" onChange={(e) => { if (e.target.value) handleAssignStudent(a.id, e.target.value); }} style={{ flex: 1, padding: "6px", borderRadius: "6px", border: "1px solid #334155", backgroundColor: "#0f172a", color: "#fff", fontSize: "11px" }}>
                          <option value="" disabled>Seleccionar docente para asignar...</option>
                          {docentes.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.nombre} — {d.escuela} ({d.curso})
                            </option>
                          ))}
                        </select>
                        <button onClick={() => handleAssignStudent(a.id, selectedDocenteForAssign)} style={{ backgroundColor: "#0284c7", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", fontSize: "11px" }}>
                          Asignar ➔
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* COLUMNA DERECHA: DOCENTES Y SUS ALUMNOS DESIGNADOS / ASIGNADOS */}
            <div style={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px", padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <h3 style={{ color: "#38bdf8", margin: 0, fontSize: "16px" }}>
                  👩‍🏫 Docentes y sus Alumnos Designados ({docentes.length} Cursos)
                </h3>
                <span style={{ fontSize: "11px", backgroundColor: "rgba(56, 189, 248, 0.15)", color: "#38bdf8", padding: "2px 8px", borderRadius: "6px", fontWeight: "bold" }}>
                  Matrícula Activa por Docente
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "420px", overflowY: "auto" }}>
                {docentes.length === 0 ? (
                  <div style={{ color: "#64748b", fontStyle: "italic", textAlign: "center", padding: "20px", border: "1px dashed #1e293b", borderRadius: "8px" }}>
                    No hay docentes registrados aún. Hacé clic en "➕ Crear / Habilitar Docente" para agregar uno.
                  </div>
                ) : (
                  docentes.map((docItem) => {
                    const asignados = getAlumnosDelDocente(docItem.id);
                    return (
                      <div key={docItem.id} style={{ backgroundColor: "#020617", border: "1px solid #1e293b", borderRadius: "10px", padding: "12px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #1e293b", paddingBottom: "8px", marginBottom: "8px" }}>
                          <div>
                            <strong style={{ color: "#38bdf8", fontSize: "14px" }}>👩‍🏫 {docItem.nombre}</strong>
                            <div style={{ color: "#94a3b8", fontSize: "11px" }}>{docItem.escuela} · {docItem.curso || "1° Año"}</div>
                          </div>
                          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                            <span style={{ color: "#f59e0b", backgroundColor: "#0f172a", border: "1px solid #f59e0b", padding: "2px 6px", borderRadius: "4px", fontSize: "10px", fontFamily: "monospace" }}>
                              Código: {docItem.codigoAcceso || "------"}
                            </span>
                            <span style={{ backgroundColor: "rgba(16, 185, 129, 0.15)", color: "#10b981", padding: "2px 8px", borderRadius: "6px", fontWeight: "bold", fontSize: "11px" }}>
                              {asignados.length} Alumnos
                            </span>
                          </div>
                        </div>

                        {/* Lista de alumnos asignados a este docente */}
                        <div>
                          {asignados.length === 0 ? (
                            <div style={{ color: "#64748b", fontSize: "11px", fontStyle: "italic", padding: "4px 0" }}>
                              Sin alumnos asignados actualmente.
                            </div>
                          ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                              {asignados.map((al) => (
                                <div key={al.id} style={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "6px", padding: "6px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                  <div>
                                    <strong style={{ color: "#f8fafc", fontSize: "12px" }}>{al.nickname}</strong>
                                    <span style={{ color: "#38bdf8", fontSize: "11px", marginLeft: "8px" }}>⚡ {al.xpTotal || 0} XP</span>
                                    {al.badgeEarned && <span style={{ marginLeft: "6px", fontSize: "10px", color: "#f59e0b" }}>🏆 Insignia</span>}
                                  </div>

                                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                                    {/* Menu para reasignar */}
                                    <select defaultValue="" onChange={(e) => { if (e.target.value) handleReassignStudent(al.id, al.nickname, e.target.value); }} style={{ padding: "2px 4px", borderRadius: "4px", border: "1px solid #334155", backgroundColor: "#020617", color: "#94a3b8", fontSize: "10px" }}>
                                      <option value="" disabled>Reasignar...</option>
                                      {docentes.filter((d) => d.id !== docItem.id).map((otherDoc) => (
                                        <option key={otherDoc.id} value={otherDoc.id}>
                                          a {otherDoc.nombre} ({otherDoc.escuela})
                                        </option>
                                      ))}
                                    </select>

                                    <button onClick={() => handleUnlinkStudent(al.id, al.nickname)} title="Dar de baja de este docente (pasa a flotante)" style={{ backgroundColor: "transparent", color: "#ef4444", border: "1px solid #ef4444", borderRadius: "4px", padding: "2px 6px", cursor: "pointer", fontSize: "10px" }}>
                                      Baja ✖
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECCIÓN 2: TABLA GENERAL DE TODOS LOS ALUMNOS ACTIVOS + ELIMINACIÓN */}
      {/* ========================================================================= */}
      {(viewFilter === "todos" || viewFilter === "alumnos") && (
        <div style={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px", padding: "20px", marginBottom: "30px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
            <h3 style={{ color: "#38bdf8", margin: 0, fontSize: "18px" }}>
              👥 Matriz Provincial: Todos los Alumnos Registrados ({alumnos.length})
            </h3>
            <span style={{ fontSize: "11px", color: "#94a3b8" }}>
              Padrón unificado de estudiantes activos en Firestore
            </span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #1e293b", color: "#64748b", textAlign: "left" }}>
                  <th style={{ padding: "10px" }}>Nickname / ID</th>
                  <th style={{ padding: "10px" }}>Escuela · Curso</th>
                  <th style={{ padding: "10px" }}>Docente Vinculado</th>
                  <th style={{ padding: "10px" }}>XP Total</th>
                  <th style={{ padding: "10px" }}>Misiones</th>
                  <th style={{ padding: "10px" }}>Insignia</th>
                  <th style={{ padding: "10px", textAlign: "center" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {alumnos.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textStyle: "italic", color: "#64748b", padding: "20px", textAlign: "center" }}>
                      Esperando registro de alumnos en Firestore...
                    </td>
                  </tr>
                ) : (
                  alumnos.map((al) => {
                    const docAssigned = docentes.find((d) => d.id === al.docenteId);
                    return (
                      <tr key={al.id} style={{ borderBottom: "1px solid #020617" }}>
                        <td style={{ padding: "10px" }}>
                          <strong style={{ color: "#f8fafc" }}>{al.nickname || "Sin nombre"}</strong>
                          <div style={{ fontSize: "10px", color: "#64748b", fontFamily: "monospace" }}>{al.id}</div>
                        </td>
                        <td style={{ padding: "10px", color: "#cbd5e1" }}>
                          {al.escuela || "Sin escuela"}<br />
                          <span style={{ fontSize: "11px", color: "#64748b" }}>{al.curso || "1° Año"}</span>
                        </td>
                        <td style={{ padding: "10px" }}>
                          {docAssigned ? (
                            <span style={{ color: "#10b981", fontWeight: "bold" }}>
                              👩‍🏫 {docAssigned.nombre} ({docAssigned.escuela})
                            </span>
                          ) : (
                            <span style={{ color: "#fb923c", fontStyle: "italic" }}>
                              ⚡ Flotante (Sin docente)
                            </span>
                          )}
                        </td>
                        <td style={{ padding: "10px" }}>
                          <strong style={{ color: "#f59e0b" }}>⚡ {al.xpTotal || 0} XP</strong>
                        </td>
                        <td style={{ padding: "10px", color: "#4ade80" }}>
                          {Array.isArray(al.misionesCompletadas) && al.misionesCompletadas.length > 0
                            ? al.misionesCompletadas.join(", ").toUpperCase()
                            : "Ninguna"}
                        </td>
                        <td style={{ padding: "10px" }}>
                          {al.badgeEarned ? (
                            <span style={{ backgroundColor: "rgba(245, 158, 11, 0.15)", color: "#f59e0b", padding: "2px 8px", borderRadius: "4px", fontWeight: "bold", fontSize: "11px" }}>
                              🏆 Otorgada
                            </span>
                          ) : (
                            <span style={{ color: "#64748b", fontSize: "11px" }}>En proceso</span>
                          )}
                        </td>
                        <td style={{ padding: "10px", textAlign: "center" }}>
                          <button
                            onClick={() => handleDeleteStudent(al.id, al.nickname)}
                            title="Eliminar registro ficticio o fallido de Firestore"
                            style={{
                              backgroundColor: "rgba(239, 68, 68, 0.15)",
                              color: "#ef4444",
                              border: "1px solid #ef4444",
                              borderRadius: "6px",
                              padding: "4px 8px",
                              cursor: "pointer",
                              fontSize: "12px",
                              fontWeight: "bold"
                            }}
                          >
                            ❌ Eliminar
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
      )}

      {/* ========================================================================= */}
      {/* SECCIÓN 3: TELEMETRÍA XAPI EN TIEMPO REAL */}
      {/* ========================================================================= */}
      {(viewFilter === "todos" || viewFilter === "telemetria") && (
        <div style={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px", padding: "20px" }}>
          <h3 style={{ color: "#38bdf8", marginTop: 0, display: "flex", alignItems: "center", gap: "10px", fontSize: "18px" }}>
            📡 Telemetría xAPI Provincial en Tiempo Real
            <span style={{ fontSize: "11px", backgroundColor: "#10b981", color: "#fff", padding: "2px 8px", borderRadius: "10px", fontWeight: "bold" }}>
              ● FIRESTORE CONECTADO
            </span>
          </h3>
          <p style={{ color: "#94a3b8", fontSize: "12px", marginBottom: "15px" }}>
            Eventos xAPI recibidos en tiempo real desde la cabina de los estudiantes:
          </p>

          <div style={{ backgroundColor: "#020617", border: "1px solid #1e293b", borderRadius: "8px", padding: "15px", maxHeight: "350px", overflowY: "auto", fontFamily: "monospace", fontSize: "12px" }}>
            {liveLogs.length === 0 ? (
              <div style={{ color: "#64748b", fontStyle: "italic" }}>
                Esperando primeros eventos de alumnos en tiempo real...
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
        </div>
      )}

      {/* MODAL CREAR DOCENTE */}
      {showAddDocenteModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.75)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div style={{ backgroundColor: "#0f172a", border: "1px solid #38bdf8", borderRadius: "16px", padding: "25px", maxWidth: "450px", width: "100%" }}>
            <h3 style={{ color: "#38bdf8", marginTop: 0 }}>Habilitar Nuevo Docente / Escuela</h3>
            <form onSubmit={handleCreateDocente} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginBottom: "4px" }}>Nombre del Docente:</label>
                <input type="text" placeholder="Ej: Prof. María Eugenia" value={newDocenteName} onChange={(e) => setNewDocenteName(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #334155", backgroundColor: "#020617", color: "#fff" }} required />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginBottom: "4px" }}>Escuela / IPEM:</label>
                <input type="text" placeholder="Ej: IPEM 35 Ricardo Rojas" value={newEscuela} onChange={(e) => setNewEscuela(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #334155", backgroundColor: "#020617", color: "#fff" }} required />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginBottom: "4px" }}>Curso a cargo:</label>
                <input type="text" placeholder="Ej: 1° Año B" value={newCurso} onChange={(e) => setNewCurso(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #334155", backgroundColor: "#020617", color: "#fff" }} required />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button type="submit" style={{ flex: 1, padding: "10px", borderRadius: "8px", backgroundColor: "#10b981", color: "#fff", border: "none", fontWeight: "bold", cursor: "pointer" }}>
                  Habilitar
                </button>
                <button type="button" onClick={() => setShowDocenteModal(false)} style={{ padding: "10px 15px", borderRadius: "8px", backgroundColor: "transparent", color: "#94a3b8", border: "1px solid #334155", cursor: "pointer" }}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
