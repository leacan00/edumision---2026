import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp
} from "firebase/firestore";

// ==========================================
// 🎨 ESTILOS UNIFICADOS DE "MENSAJES DOCENTES"
// ==========================================
const styles = {
  container: {
    backgroundColor: "#0f172a",
    color: "#f8fafc",
    borderRadius: "12px",
    padding: "20px",
    border: "1px solid #334155",
    fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    maxWidth: "900px",
    margin: "0 auto",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)"
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid #334155",
    paddingBottom: "14px",
    marginBottom: "20px"
  },
  title: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#38bdf8",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    margin: 0
  },
  subtitle: {
    fontSize: "12px",
    color: "#94a3b8",
    marginTop: "4px"
  },
  gridTwoCols: {
    display: "grid",
    gridTemplateColumns: "1fr 1.2fr",
    gap: "20px"
  },
  card: {
    backgroundColor: "#1e293b",
    borderRadius: "10px",
    padding: "16px",
    border: "1px solid #334155"
  },
  cardTitle: {
    fontSize: "14px",
    fontWeight: "bold",
    color: "#f1f5f9",
    marginBottom: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
  },
  fieldGroup: {
    marginBottom: "12px"
  },
  label: {
    display: "block",
    fontSize: "11px",
    fontWeight: "bold",
    color: "#94a3b8",
    marginBottom: "4px",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    backgroundColor: "#0f172a",
    border: "1px solid #334155",
    borderRadius: "6px",
    color: "#f8fafc",
    fontSize: "13px",
    outline: "none",
    boxSizing: "border-box"
  },
  select: {
    width: "100%",
    padding: "10px 12px",
    backgroundColor: "#0f172a",
    border: "1px solid #334155",
    borderRadius: "6px",
    color: "#f8fafc",
    fontSize: "13px",
    outline: "none",
    boxSizing: "border-box",
    cursor: "pointer"
  },
  textarea: {
    width: "100%",
    padding: "10px 12px",
    backgroundColor: "#0f172a",
    border: "1px solid #334155",
    borderRadius: "6px",
    color: "#f8fafc",
    fontSize: "13px",
    outline: "none",
    minHeight: "100px",
    resize: "vertical",
    boxSizing: "border-box",
    fontFamily: "inherit"
  },
  btnSend: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#0284c7",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "bold",
    fontSize: "13px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    transition: "all 0.2s ease"
  },
  badgePending: {
    backgroundColor: "rgba(245, 158, 11, 0.2)",
    color: "#fbbf24",
    border: "1px solid #f59e0b",
    padding: "2px 8px",
    borderRadius: "12px",
    fontSize: "10px",
    fontWeight: "bold"
  },
  badgeResponded: {
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    color: "#34d399",
    border: "1px solid #10b981",
    padding: "2px 8px",
    borderRadius: "12px",
    fontSize: "10px",
    fontWeight: "bold"
  },
  badgeInProcess: {
    backgroundColor: "rgba(56, 189, 248, 0.2)",
    color: "#38bdf8",
    border: "1px solid #0284c7",
    padding: "2px 8px",
    borderRadius: "12px",
    fontSize: "10px",
    fontWeight: "bold"
  },
  messageItem: {
    backgroundColor: "#0f172a",
    border: "1px solid #334155",
    borderRadius: "8px",
    padding: "12px",
    marginBottom: "10px",
    transition: "border-color 0.2s ease"
  },
  replyBox: {
    marginTop: "10px",
    backgroundColor: "rgba(2, 132, 199, 0.1)",
    borderLeft: "3px solid #38bdf8",
    padding: "10px 12px",
    borderRadius: "0 6px 6px 0",
    fontSize: "12px"
  },
  toastSuccess: {
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    border: "1px solid #10b981",
    color: "#34d399",
    padding: "10px",
    borderRadius: "6px",
    fontSize: "12px",
    marginBottom: "12px",
    textAlign: "center"
  },
  filterTab: {
    padding: "6px 12px",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "bold",
    cursor: "pointer",
    border: "1px solid #334155",
    backgroundColor: "#0f172a",
    color: "#94a3b8"
  },
  filterTabActive: {
    backgroundColor: "#0284c7",
    color: "#ffffff",
    borderColor: "#38bdf8"
  }
};

// =========================================================================
// 1️⃣ COMPONENTE: VISTA DOCENTE (Consola Docente)
// =========================================================================
export const MensajesDocentesVistaDocente = ({ perfilDocente = {} }) => {
  const [asunto, setAsunto] = useState("");
  const [categoria, setCategoria] = useState("Soporte Técnico");
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState(false);
  const [misMensajes, setMisMensajes] = useState([]);
  const [cargando, setCargando] = useState(true);

  const docenteId = perfilDocente.id || perfilDocente.docenteId || "DOC_DEMO";
  const docenteNombre = perfilDocente.nombre || "Docente EduMisión";
  const escuela = perfilDocente.escuela || perfilDocente.tipoEscuela || "Escuela Piloto Córdoba";
  const curso = perfilDocente.curso || "1° Año";

  // Sincronización en tiempo real con Firestore
  useEffect(() => {
    if (!docenteId) return;

    const q = query(
      collection(db, "mensajes_docentes"),
      where("docenteId", "==", docenteId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const msgs = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data()
        }));
        // Ordenar por fecha localmente
        msgs.sort((a, b) => {
          const tA = a.fechaEnvio?.seconds || 0;
          const tB = b.fechaEnvio?.seconds || 0;
          return tB - tA;
        });
        setMisMensajes(msgs);
        setCargando(false);
      },
      (error) => {
        console.error("Error al cargar mensajes docentes:", error);
        setCargando(false);
      }
    );

    return () => unsubscribe();
  }, [docenteId]);

  const handleEnviarMensaje = async (e) => {
    e.preventDefault();
    if (!asunto.trim() || !mensaje.trim()) return;

    setEnviando(true);
    try {
      await addDoc(collection(db, "mensajes_docentes"), {
        docenteId,
        docenteNombre,
        escuela,
        curso,
        categoria,
        asunto: asunto.trim(),
        mensaje: mensaje.trim(),
        fechaEnvio: serverTimestamp(),
        estado: "pendiente", // 'pendiente' | 'en_proceso' | 'respondido'
        respuestaAdmin: "",
        fechaRespuesta: null,
        adminNombre: "",
        leidoPorDocente: true
      });

      setAsunto("");
      setMensaje("");
      setMensajeExito(true);
      setTimeout(() => setMensajeExito(false), 4000);
    } catch (err) {
      console.error("Error al enviar mensaje:", err);
      alert("No se pudo enviar el mensaje. Verifique su conexión.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>
            💬 Mensajes Docentes — Canal Directo con Control Central
          </h2>
          <p style={styles.subtitle}>
            Soporte técnico, consultas pedagógicas y registro de experiencia del piloto en tiempo real.
          </p>
        </div>
        <div style={{ textAlign: "right", fontSize: "11px", color: "#94a3b8" }}>
          <div><strong>{docenteNombre}</strong></div>
          <div>{escuela} · {curso}</div>
        </div>
      </div>

      <div style={styles.gridTwoCols}>
        {/* FORMULARIO DE ENVÍO */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>
            <span>✏️ Redactar Consulta / Feedback</span>
          </div>

          {mensajeExito && (
            <div style={styles.toastSuccess}>
              ✅ ¡Mensaje enviado con éxito a Control Central! Te responderemos a la brevedad.
            </div>
          )}

          <form onSubmit={handleEnviarMensaje}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Categoría</label>
              <select
                style={styles.select}
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
              >
                <option value="Soporte Técnico">🛠️ Soporte Técnico / Error en App</option>
                <option value="Sugerencia Pedagógica">💡 Sugerencia Pedagógica / Contenido</option>
                <option value="Duda de Uso">❓ Duda de Uso / Consola Docente</option>
                <option value="Comentario General">📝 Comentario del Piloto</option>
              </select>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Asunto / Título Breve</label>
              <input
                type="text"
                style={styles.input}
                placeholder="Ej: Duda sobre la Misión 2 en el aula"
                value={asunto}
                onChange={(e) => setAsunto(e.target.value)}
                required
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Mensaje o Observación</label>
              <textarea
                style={styles.textarea}
                placeholder="Escriba aquí los detalles de su consulta, experiencia con los alumnos o inconveniente..."
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              style={{
                ...styles.btnSend,
                opacity: enviando || !asunto.trim() || !mensaje.trim() ? 0.6 : 1,
                cursor: enviando ? "wait" : "pointer"
              }}
              disabled={enviando || !asunto.trim() || !mensaje.trim()}
            >
              {enviando ? "Enviando a Control Central..." : "🚀 Enviar Mensaje a CC"}
            </button>
          </form>
        </div>

        {/* HISTORIAL Y RESPUESTAS */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>
            <span>📋 Mis Mensajes e Historial ({misMensajes.length})</span>
          </div>

          {cargando ? (
            <div style={{ textAlign: "center", color: "#64748b", padding: "20px" }}>
              Cargando mensajes...
            </div>
          ) : misMensajes.length === 0 ? (
            <div style={{ textAlign: "center", color: "#64748b", padding: "30px 10px", fontSize: "12px" }}>
              📭 Aún no ha enviado mensajes a Control Central.<br />
              Utilice el formulario de la izquierda para comunicarse con el equipo.
            </div>
          ) : (
            <div style={{ maxHeight: "400px", overflowY: "auto", paddingRight: "4px" }}>
              {misMensajes.map((m) => {
                const fecha = m.fechaEnvio?.seconds
                  ? new Date(m.fechaEnvio.seconds * 1000).toLocaleString("es-AR", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit"
                    })
                  : "Reciente";

                return (
                  <div key={m.id} style={styles.messageItem}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                      <span style={{ fontSize: "11px", color: "#38bdf8", fontWeight: "bold" }}>
                        [{m.categoria}]
                      </span>
                      {m.estado === "respondido" ? (
                        <span style={styles.badgeResponded}>🟢 Respondido</span>
                      ) : m.estado === "en_proceso" ? (
                        <span style={styles.badgeInProcess}>🔵 En Revisión</span>
                      ) : (
                        <span style={styles.badgePending}>🟡 Pendiente</span>
                      )}
                    </div>

                    <div style={{ fontSize: "13px", fontWeight: "bold", color: "#f1f5f9", marginBottom: "4px" }}>
                      {m.asunto}
                    </div>

                    <div style={{ fontSize: "12px", color: "#cbd5e1", lineHeight: "1.4", whiteSpace: "pre-wrap" }}>
                      {m.mensaje}
                    </div>

                    <div style={{ fontSize: "10px", color: "#64748b", marginTop: "6px", textAlign: "right" }}>
                      Enviado: {fecha}
                    </div>

                    {/* RESPUESTA DEL ADMINISTRADOR DE CONTROL CENTRAL */}
                    {m.respuestaAdmin && (
                      <div style={styles.replyBox}>
                        <div style={{ fontWeight: "bold", color: "#38bdf8", marginBottom: "4px", fontSize: "11px" }}>
                          🏛️ Respuesta de Control Central ({m.adminNombre || "Equipo EduMisión"}):
                        </div>
                        <div style={{ color: "#e2e8f0", lineHeight: "1.4", whiteSpace: "pre-wrap" }}>
                          {m.respuestaAdmin}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// 2️⃣ COMPONENTE: VISTA ADMINISTRADOR (Control Central)
// =========================================================================
export const MensajesDocentesVistaAdmin = () => {
  const [todosMensajes, setTodosMensajes] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState("TODOS"); // 'TODOS' | 'PENDIENTES' | 'RESPONDIDOS'
  const [mensajeSeleccionado, setMensajeSeleccionado] = useState(null);
  const [textoRespuesta, setTextoRespuesta] = useState("");
  const [respondiendo, setRespondiendo] = useState(false);
  const [cargando, setCargando] = useState(true);

  // Sincronización global con la colección 'mensajes_docentes'
  useEffect(() => {
    const q = collection(db, "mensajes_docentes");

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const msgs = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data()
        }));
        msgs.sort((a, b) => {
          const tA = a.fechaEnvio?.seconds || 0;
          const tB = b.fechaEnvio?.seconds || 0;
          return tB - tA;
        });
        setTodosMensajes(msgs);
        setCargando(false);
      },
      (error) => {
        console.error("Error al cargar lista global de mensajes docentes:", error);
        setCargando(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const pendientesCount = todosMensajes.filter((m) => m.estado === "pendiente").length;
  const respondidosCount = todosMensajes.filter((m) => m.estado === "respondido").length;

  const mensajesFiltrados = todosMensajes.filter((m) => {
    if (filtroEstado === "PENDIENTES") return m.estado === "pendiente";
    if (filtroEstado === "RESPONDIDOS") return m.estado === "respondido";
    return true;
  });

  const handleResponder = async (e) => {
    e.preventDefault();
    if (!mensajeSeleccionado || !textoRespuesta.trim()) return;

    setRespondiendo(true);
    try {
      const docRef = doc(db, "mensajes_docentes", mensajeSeleccionado.id);
      await updateDoc(docRef, {
        respuestaAdmin: textoRespuesta.trim(),
        estado: "respondido",
        fechaRespuesta: serverTimestamp(),
        adminNombre: "Control Central EduMisión",
        leidoPorDocente: false
      });

      setTextoRespuesta("");
      setMensajeSeleccionado(null);
    } catch (err) {
      console.error("Error al responder mensaje docente:", err);
      alert("No se pudo enviar la respuesta.");
    } finally {
      setRespondiendo(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>
            🏛️ Control Central — Bandeja de Mensajes Docentes
          </h2>
          <p style={styles.subtitle}>
            Monitoreo y respuesta en tiempo real a las consultas de los docentes del piloto.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <div style={{ backgroundColor: "#1e293b", padding: "6px 12px", borderRadius: "8px", border: "1px solid #334155", textAlign: "center" }}>
            <div style={{ fontSize: "10px", color: "#94a3b8", fontWeight: "bold" }}>PENDIENTES</div>
            <div style={{ fontSize: "16px", fontWeight: "bold", color: "#fbbf24" }}>{pendientesCount}</div>
          </div>
          <div style={{ backgroundColor: "#1e293b", padding: "6px 12px", borderRadius: "8px", border: "1px solid #334155", textAlign: "center" }}>
            <div style={{ fontSize: "10px", color: "#94a3b8", fontWeight: "bold" }}>RESPONDIDOS</div>
            <div style={{ fontSize: "16px", fontWeight: "bold", color: "#34d399" }}>{respondidosCount}</div>
          </div>
        </div>
      </div>

      {/* FILTROS DE ESTADO */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        <button
          style={{ ...styles.filterTab, ...(filtroEstado === "TODOS" ? styles.filterTabActive : {}) }}
          onClick={() => setFiltroEstado("TODOS")}
        >
          Todos ({todosMensajes.length})
        </button>
        <button
          style={{ ...styles.filterTab, ...(filtroEstado === "PENDIENTES" ? styles.filterTabActive : {}) }}
          onClick={() => setFiltroEstado("PENDIENTES")}
        >
          🟡 Pendientes ({pendientesCount})
        </button>
        <button
          style={{ ...styles.filterTab, ...(filtroEstado === "RESPONDIDOS" ? styles.filterTabActive : {}) }}
          onClick={() => setFiltroEstado("RESPONDIDOS")}
        >
          🟢 Respondidos ({respondidosCount})
        </button>
      </div>

      <div style={styles.gridTwoCols}>
        {/* LISTA DE MENSAJES */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>
            <span>📥 Mensajes Recibidos ({mensajesFiltrados.length})</span>
          </div>

          {cargando ? (
            <div style={{ textAlign: "center", color: "#64748b", padding: "20px" }}>
              Cargando mensajes...
            </div>
          ) : mensajesFiltrados.length === 0 ? (
            <div style={{ textAlign: "center", color: "#64748b", padding: "30px 10px", fontSize: "12px" }}>
              No hay mensajes en esta categoría.
            </div>
          ) : (
            <div style={{ maxHeight: "480px", overflowY: "auto", paddingRight: "4px" }}>
              {mensajesFiltrados.map((m) => {
                const isSelected = mensajeSeleccionado?.id === m.id;
                const fecha = m.fechaEnvio?.seconds
                  ? new Date(m.fechaEnvio.seconds * 1000).toLocaleString("es-AR", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit"
                    })
                  : "Reciente";

                return (
                  <div
                    key={m.id}
                    style={{
                      ...styles.messageItem,
                      borderColor: isSelected ? "#38bdf8" : "#334155",
                      backgroundColor: isSelected ? "rgba(56, 189, 248, 0.08)" : "#0f172a",
                      cursor: "pointer"
                    }}
                    onClick={() => {
                      setMensajeSeleccionado(m);
                      setTextoRespuesta(m.respuestaAdmin || "");
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                      <span style={{ fontSize: "12px", fontWeight: "bold", color: "#f8fafc" }}>
                        {m.docenteNombre}
                      </span>
                      {m.estado === "respondido" ? (
                        <span style={styles.badgeResponded}>🟢 Respondido</span>
                      ) : (
                        <span style={styles.badgePending}>🟡 Pendiente</span>
                      )}
                    </div>

                    <div style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "4px" }}>
                      {m.escuela} · {m.curso}
                    </div>

                    <div style={{ fontSize: "12px", fontWeight: "bold", color: "#38bdf8", marginBottom: "2px" }}>
                      [{m.categoria}] {m.asunto}
                    </div>

                    <div style={{ fontSize: "11px", color: "#cbd5e1", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                      {m.mensaje}
                    </div>

                    <div style={{ fontSize: "10px", color: "#64748b", marginTop: "4px", textAlign: "right" }}>
                      {fecha}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* DETALLE Y PANEL DE RESPUESTA */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>
            <span>✍️ Detalle y Respuesta</span>
          </div>

          {!mensajeSeleccionado ? (
            <div style={{ textAlign: "center", color: "#64748b", padding: "50px 20px", fontSize: "12px" }}>
              👈 Seleccione un mensaje del listado de la izquierda para ver el detalle y responder.
            </div>
          ) : (
            <div>
              <div style={{ backgroundColor: "#0f172a", padding: "12px", borderRadius: "8px", border: "1px solid #334155", marginBottom: "16px" }}>
                <div style={{ fontSize: "11px", color: "#38bdf8", fontWeight: "bold" }}>
                  {mensajeSeleccionado.categoria}
                </div>
                <div style={{ fontSize: "14px", fontWeight: "bold", color: "#f8fafc", margin: "4px 0" }}>
                  {mensajeSeleccionado.asunto}
                </div>
                <div style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "8px" }}>
                  De: <strong>{mensajeSeleccionado.docenteNombre}</strong> ({mensajeSeleccionado.escuela} - {mensajeSeleccionado.curso})
                </div>
                <div style={{ fontSize: "12px", color: "#e2e8f0", lineHeight: "1.4", whiteSpace: "pre-wrap", borderTop: "1px solid #1e293b", paddingTop: "8px" }}>
                  {mensajeSeleccionado.mensaje}
                </div>
              </div>

              <form onSubmit={handleResponder}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Respuesta de Control Central</label>
                  <textarea
                    style={{ ...styles.textarea, minHeight: "120px" }}
                    placeholder="Escriba aquí la respuesta oficial o indicación técnica para el docente..."
                    value={textoRespuesta}
                    onChange={(e) => setTextoRespuesta(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    ...styles.btnSend,
                    backgroundColor: "#10b981",
                    opacity: respondiendo || !textoRespuesta.trim() ? 0.6 : 1,
                    cursor: respondiendo ? "wait" : "pointer"
                  }}
                  disabled={respondiendo || !textoRespuesta.trim()}
                >
                  {respondiendo ? "Guardando Respuesta..." : "🟢 Enviar Respuesta al Docente"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MensajesDocentesVistaDocente;
