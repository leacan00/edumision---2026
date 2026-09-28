import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

const exportToExcelCSV = (filename, headers, rows) => {
  const bom = "\uFEFF";
  const csvContent = bom + [
    headers.map(h => `"${h}"`).join(";"),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(";"))
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

const INITIAL_DOCENTES = [
  { id: "d1", name: "Profe Laura", escuela: "Escuela IPEM 268", curso: "1° Año B", cursoId: "curso-268-1b", alumnosCount: 4 },
  { id: "d2", name: "Profe Carlos", escuela: "Colegio Manuel Belgrano", curso: "1° Año A", cursoId: "curso-mb-1a", alumnosCount: 3 }
];

const INITIAL_UNLINKED = [
  { uuid: "u-101", nickname: "Nico_Space", escuela: "IPEM 268 (Sin grupo)", curso: "1° B", xp: 100, lastActive: "Hace instantes" },
  { uuid: "u-102", nickname: "Valen_2026", escuela: "Manuel Belgrano (Sin grupo)", curso: "1° A", xp: 250, lastActive: "Hace 5 min" }
];

const INITIAL_LINKED = [
  { uuid: "7a3b2c1d-4e5f-6a7b", nickname: "Martín G.", docenteId: "d1", escuela: "Escuela IPEM 268", curso: "1° Año B", xp: 750, badgeEarned: true },
  { uuid: "8b4c3d2e-5f6a-7b8c", nickname: "Sofía V.", docenteId: "d1", escuela: "Escuela IPEM 268", curso: "1° Año B", xp: 250, badgeEarned: false }
];

export default function App() {
  const [docentes, setDocentes] = useState(INITIAL_DOCENTES);
  const [unlinked, setUnlinked] = useState(INITIAL_UNLINKED);
  const [linked, setLinked] = useState(INITIAL_LINKED);
  const [activeTab, setActiveTab] = useState("vincular");
  const [toast, setToast] = useState(null);
  const [selectedDocenteForAssign, setSelectedDocenteForAssign] = useState(INITIAL_DOCENTES[0]?.id || "");

  const [showAddDocenteModal, setShowDocenteModal] = useState(false);
  const [newDocenteName, setNewDocenteName] = useState("");
  const [newEscuela, setNewEscuela] = useState("");
  const [newCurso, setNewCurso] = useState("");

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

        if (logs.length > 0) {
          logs.forEach((log) => {
            if (log.alumno && !linked.some((s) => s.nickname.toLowerCase() === log.alumno.toLowerCase())) {
              setUnlinked((prev) => {
                if (prev.some((u) => u.nickname.toLowerCase() === log.alumno.toLowerCase())) return prev;
                return [
                  {
                    uuid: log.id || `u-${Date.now()}`,
                    nickname: log.alumno,
                    escuela: log.escuela || "Escuela Piloto",
                    curso: log.curso || "1° Año",
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
  }, [linked]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleAssignStudent = (studentUuid) => {
    const targetStudent = unlinked.find((s) => s.uuid === studentUuid);
    const targetDocente = docentes.find((d) => d.id === selectedDocenteForAssign);
    if (!targetStudent || !targetDocente) return;

    const newLinkedStudent = {
      uuid: targetStudent.uuid,
      nickname: targetStudent.nickname,
      docenteId: targetDocente.id,
      escuela: targetDocente.escuela,
      curso: targetDocente.curso,
      xp: targetStudent.xp,
      badgeEarned: targetStudent.xp >= 500
    };

    setLinked((prev) => [newLinkedStudent, ...prev]);
    setUnlinked((prev) => prev.filter((s) => s.uuid !== studentUuid));
    setDocentes((prev) =>
      prev.map((d) => (d.id === targetDocente.id ? { ...d, alumnosCount: d.alumnosCount + 1 } : d))
    );

    showToast(`✅ Alumno "${targetStudent.nickname}" asignado a ${targetDocente.name}.`);
  };

  const handleCreateDocente = (e) => {
    e.preventDefault();
    if (!newDocenteName || !newEscuela) return;

    const newDoc = {
      id: `d-${Date.now()}`,
      name: newDocenteName,
      escuela: newEscuela,
      curso: newCurso || "1° Año",
      cursoId: `curso-${Date.now().toString().slice(-4)}`,
      alumnosCount: 0
    };

    setDocentes((prev) => [...prev, newDoc]);
    setSelectedDocenteForAssign(newDoc.id);
    setShowDocenteModal(false);
    setNewDocenteName("");
    setNewEscuela("");
    setNewCurso("");

    showToast(`👩‍🏫 Docente "${newDoc.name}" habilitado/a para recibir alumnos.`);
  };

  const handleExportData = () => {
    const headers = ["UUID Alumno", "Nickname", "Escuela", "Curso", "Docente Asignado", "Puntos XP", "Insignia"];
    const rows = linked.map((s) => {
      const doc = docentes.find((d) => d.id === s.docenteId);
      return [
        s.uuid,
        s.nickname,
        s.escuela,
        s.curso,
        doc ? doc.name : "Sin Asignar",
        s.xp,
        s.badgeEarned ? "Otorgada" : "En Progreso"
      ];
    });

    exportToExcelCSV("EduMision_Reporte_Control_Central_2026.csv", headers, rows);
    showToast("📊 Reporte CSV descargado con éxito.");
  };

  return (
    <div style={{ backgroundColor: "#030712", color: "#f8fafc", minHeight: "100vh", fontFamily: "sans-serif", padding: "20px" }}>
      {toast && (
        <div style={{ position: "fixed", bottom: "20px", right: "20px", backgroundColor: "#0284c7", color: "#fff", padding: "12px 20px", borderRadius: "10px", fontWeight: "bold", zIndex: 1000 }}>
          {toast}
        </div>
      )}

      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #1e293b", paddingBottom: "16px", marginBottom: "20px" }}>
        <div>
          <h1 style={{ color: "#38bdf8", margin: 0, fontSize: "24px" }}>🏛️ EduMisión Córdoba · Panel de Control Central</h1>
          <p style={{ color: "#94a3b8", margin: "4px 0 0 0", fontSize: "13px" }}>Asignación de Alumnos, Gestión de Docentes y Monitoreo Provincial en Tiempo Real</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={() => setShowDocenteModal(true)} style={{ backgroundColor: "#10b981", color: "#fff", border: "none", padding: "10px 16px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>
            ➕ Crear Docente
          </button>
          <button onClick={handleExportData} style={{ backgroundColor: "#8b5cf6", color: "#fff", border: "none", padding: "10px 16px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>
            📊 Exportar Reporte CSV
          </button>
        </div>
      </header>

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button onClick={() => setActiveTab("vincular")} style={{ padding: "10px 20px", borderRadius: "8px", border: activeTab === "vincular" ? "2px solid #38bdf8" : "1px solid #1e293b", backgroundColor: activeTab === "vincular" ? "rgba(56, 189, 248, 0.15)" : "#0f172a", color: "#fff", fontWeight: "bold", cursor: "pointer" }}>
          🔗 Vincular Alumnos ({unlinked.length} Flotantes)
        </button>
        <button onClick={() => setActiveTab("telemetria")} style={{ padding: "10px 20px", borderRadius: "8px", border: activeTab === "telemetria" ? "2px solid #38bdf8" : "1px solid #1e293b", backgroundColor: activeTab === "telemetria" ? "rgba(56, 189, 248, 0.15)" : "#0f172a", color: "#fff", fontWeight: "bold", cursor: "pointer" }}>
          📡 Telemetría en Vivo ({liveLogs.length} Eventos)
        </button>
      </div>

      {activeTab === "vincular" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <div style={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px", padding: "16px" }}>
            <h3 style={{ color: "#fb923c", margin: "0 0 10px 0" }}>⚡ Alumnos Flotantes ({unlinked.length})</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {unlinked.map((u) => (
                <div key={u.uuid} style={{ backgroundColor: "#020617", border: "1px solid #334155", borderRadius: "8px", padding: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: "bold", color: "#f8fafc" }}>{u.nickname}</div>
                    <div style={{ color: "#94a3b8", fontSize: "12px" }}>{u.escuela} · {u.curso}</div>
                  </div>
                  <button onClick={() => handleAssignStudent(u.uuid)} style={{ backgroundColor: "#0284c7", color: "#fff", border: "none", padding: "8px 12px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>
                    Asignar ➔
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div style={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px", padding: "16px" }}>
            <h3 style={{ color: "#38bdf8", margin: "0 0 10px 0" }}>🎯 Docente Destino</h3>
            <select value={selectedDocenteForAssign} onChange={(e) => setSelectedDocenteForAssign(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #334155", backgroundColor: "#020617", color: "#fff", fontWeight: "bold" }}>
              {docentes.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} — {d.escuela} ({d.curso})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {activeTab === "telemetria" && (
        <div style={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px", padding: "20px" }}>
          <h3 style={{ color: "#38bdf8", marginTop: 0 }}>📡 Telemetría xAPI Provincial en Tiempo Real</h3>
          <div style={{ backgroundColor: "#020617", border: "1px solid #1e293b", borderRadius: "8px", padding: "15px", maxHeight: "400px", overflowY: "auto", fontFamily: "monospace", fontSize: "12px" }}>
            {liveLogs.map((log) => (
              <div key={log.id} style={{ marginBottom: "8px", borderBottom: "1px dashed #1e293b", paddingBottom: "6px" }}>
                <strong style={{ color: "#38bdf8" }}>[{log.alumno || "Alumno"}]</strong> ({log.escuela || "Córdoba"}): {log.evento}
              </div>
            ))}
          </div>
        </div>
      )}

      {showAddDocenteModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.75)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div style={{ backgroundColor: "#0f172a", border: "1px solid #38bdf8", borderRadius: "16px", padding: "25px", maxWidth: "450px", width: "100%" }}>
            <h3 style={{ color: "#38bdf8", marginTop: 0 }}>Habilitar Nuevo Docente</h3>
            <form onSubmit={handleCreateDocente} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <input type="text" placeholder="Nombre del Docente" value={newDocenteName} onChange={(e) => setNewDocenteName(e.target.value)} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #334155", backgroundColor: "#020617", color: "#fff" }} required />
              <input type="text" placeholder="Escuela / IPEM" value={newEscuela} onChange={(e) => setNewEscuela(e.target.value)} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #334155", backgroundColor: "#020617", color: "#fff" }} required />
              <button type="submit" style={{ padding: "10px", borderRadius: "8px", backgroundColor: "#10b981", color: "#fff", border: "none", fontWeight: "bold", cursor: "pointer" }}>
                Habilitar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
