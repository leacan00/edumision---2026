import React, { useState, useEffect, useRef, useCallback } from "react";
import { db } from "./firebase";
import { collection, addDoc, doc, setDoc, getDoc, updateDoc, onSnapshot, serverTimestamp } from "firebase/firestore";


// ==========================================
// 🔊 WEB AUDIO API SYNTHESIZER & HAPTICS (0 KB)
// ==========================================
const soundEffects = {
  ctx: null,
  init() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  },
  playTap() {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(850, this.ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch (e) {}
  },
  playSuccess() {
    try {
      this.init();
      if (!this.ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startTime = this.ctx.currentTime + idx * 0.08;
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.18, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.28);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.28);
      });
    } catch (e) {}
  },
  playWarning() {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(160, this.ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.10, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.18);
    } catch (e) {}
  }
};

const triggerHaptic = (ms = 30) => {
  if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
    try { window.navigator.vibrate(ms); } catch (e) {}
  }
};

// ==========================================
// 🪖 SISTEMA DE AVATAR Y EQUIPAMIENTO EVOLUTIVO
// ==========================================

// ==========================================
// 🎮 FASE 3: CONTROLES MECÁNICOS TÁCTILES Y HUDS POR MISIÓN
// ==========================================

// M1: TANQUE DE PRESURIZACIÓN LÍQUIDA GRADUADO (AGUA)
const M1WaterTankHUD = ({ equation = "1/5 + 2/5 = ?" }) => {
  // Extract numerators/denominators if available
  const match = equation.match(/(\d+)\/(\d+)\s*\+\s*(\d+)\/(\d+)/);
  const num1 = match ? parseInt(match[1]) : 1;
  const num2 = match ? parseInt(match[3]) : 2;
  const den = match ? parseInt(match[2]) : 5;
  const totalNum = num1 + num2;
  const pct = Math.min(100, Math.round((totalNum / den) * 100));

  return (
    <div style={{ backgroundColor: "#030712", border: "1px solid #1e293b", borderRadius: "12px", padding: "12px", marginBottom: "14px", boxShadow: "0 4px 12px rgba(0,0,0,0.4)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <span style={{ fontSize: "11px", fontWeight: "bold", color: "#38bdf8", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          🚰 CONTROL DE PRESURIZACIÓN LÍQUIDA · M1
        </span>
        <span style={{ fontSize: "10px", backgroundColor: "rgba(16, 185, 129, 0.2)", border: "1px solid #10b981", color: "#4ade80", padding: "2px 8px", borderRadius: "10px", fontWeight: "bold" }}>
          DENOMINADOR BASE {den} (IGUAL)
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr", gap: "10px", alignItems: "center" }}>
        {/* Contenedor Entrada A */}
        <div style={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "8px", padding: "8px", textAlign: "center" }}>
          <div style={{ fontSize: "10px", color: "#94a3b8" }}>Bidón Alfa</div>
          <div style={{ fontSize: "15px", fontWeight: "bold", color: "#38bdf8", margin: "2px 0" }}>{num1}/{den}</div>
          <div style={{ height: "6px", backgroundColor: "#1e293b", borderRadius: "3px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(num1/den)*100}%`, backgroundColor: "#38bdf8", transition: "width 0.5s ease" }} />
          </div>
        </div>

        {/* Tanque Central Graduado */}
        <div style={{ backgroundColor: "#090d16", border: "1px solid #0284c7", borderRadius: "10px", padding: "8px 12px", position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#cbd5e1", marginBottom: "4px" }}>
            <span>Nivel de Carga Combinada</span>
            <strong style={{ color: "#38bdf8" }}>{num1}+{num2} = {totalNum}/{den}</strong>
          </div>
          <div style={{ height: "14px", backgroundColor: "#020617", borderRadius: "7px", border: "1px solid #1e293b", overflow: "hidden", position: "relative" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg, #0284c7, #38bdf8)", borderRadius: "6px", transition: "width 0.6s ease" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9px", color: "#64748b", marginTop: "2px" }}>
            <span>0/{den}</span>
            <span>{(den/2).toFixed(1)}/{den}</span>
            <span>{den}/{den}</span>
          </div>
        </div>

        {/* Contenedor Entrada B */}
        <div style={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "8px", padding: "8px", textAlign: "center" }}>
          <div style={{ fontSize: "10px", color: "#94a3b8" }}>Bidón Beta</div>
          <div style={{ fontSize: "15px", fontWeight: "bold", color: "#38bdf8", margin: "2px 0" }}>{num2}/{den}</div>
          <div style={{ height: "6px", backgroundColor: "#1e293b", borderRadius: "3px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(num2/den)*100}%`, backgroundColor: "#38bdf8", transition: "width 0.5s ease" }} />
          </div>
        </div>
      </div>
    </div>
  );
};

// M2: DIAL DE SINTONIZACIÓN DE FRECUENCIA DE COMBUSTIBLE
const M2FrequencyDialHUD = ({ equation = "1/3 + 1/6 = ?" }) => {
  const match = equation.match(/(\d+)\/(\d+)\s*\+\s*(\d+)\/(\d+)/);
  const den1 = match ? parseInt(match[2]) : 3;
  const den2 = match ? parseInt(match[4]) : 6;
  const targetDen = Math.max(den1, den2);

  return (
    <div style={{ backgroundColor: "#030712", border: "1px solid #1e293b", borderRadius: "12px", padding: "12px", marginBottom: "14px", boxShadow: "0 4px 12px rgba(0,0,0,0.4)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <span style={{ fontSize: "11px", fontWeight: "bold", color: "#fb923c", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          🧪 DIAL DE SINTONIZACIÓN DE FRECUENCIA DE COMBUSTIBLE · M2
        </span>
        <span style={{ fontSize: "10px", backgroundColor: "rgba(251, 146, 60, 0.2)", border: "1px solid #fb923c", color: "#fdba74", padding: "2px 8px", borderRadius: "10px", fontWeight: "bold" }}>
          DENOMINADOR COMÚN OBJETIVO: {targetDen}
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", alignItems: "center" }}>
        <div style={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "8px", padding: "8px", display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ fontSize: "22px" }}>🎛️</div>
          <div>
            <div style={{ fontSize: "10px", color: "#94a3b8" }}>Reactor A (Base {den1})</div>
            <div style={{ fontSize: "12px", color: "#fb923c", fontWeight: "bold" }}>
              Convertir {den1} ➔ {targetDen} (x{targetDen/den1})
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "8px", padding: "8px", display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ fontSize: "22px" }}>⚡</div>
          <div>
            <div style={{ fontSize: "10px", color: "#94a3b8" }}>Reactor B (Base {den2})</div>
            <div style={{ fontSize: "12px", color: "#4ade80", fontWeight: "bold" }}>
              {den2 === targetDen ? "Base Común Lista (x1)" : `Ajustar a Base ${targetDen}`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// M3: MATRIZ DE COMPRESIÓN Y REDUCCIÓN DE CARGA DE VÍVERES
const M3CargoCompressorHUD = ({ equation = "2/3 + 1/6 = ?" }) => {
  return (
    <div style={{ backgroundColor: "#030712", border: "1px solid #1e293b", borderRadius: "12px", padding: "12px", marginBottom: "14px", boxShadow: "0 4px 12px rgba(0,0,0,0.4)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <span style={{ fontSize: "11px", fontWeight: "bold", color: "#a855f7", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          📦 MATRIZ DE COMPRESIÓN Y REDUCCIÓN DE CARGA · M3
        </span>
        <span style={{ fontSize: "10px", backgroundColor: "rgba(168, 85, 247, 0.2)", border: "1px solid #a855f7", color: "#c084fc", padding: "2px 8px", borderRadius: "10px", fontWeight: "bold" }}>
          BUSCANDO FRACCIÓN IRREDUCTIBLE
        </span>
      </div>

      <div style={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "8px", padding: "8px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "20px" }}>🗜️</span>
          <div>
            <div style={{ fontSize: "11px", color: "#f8fafc", fontWeight: "bold" }}>Suma + Simplificación de Carga</div>
            <div style={{ fontSize: "10px", color: "#94a3b8" }}>Si el resultado se puede dividir arriba y abajo por un mismo número, reducí a la mínima expresión.</div>
          </div>
        </div>
        <div style={{ fontSize: "11px", backgroundColor: "#1e1b4b", border: "1px solid #6366f1", color: "#a5b4fc", padding: "4px 10px", borderRadius: "6px", fontWeight: "bold" }}>
          Factor Simplificador ⚙️
        </div>
      </div>
    </div>
  );
};

// M4: CONSOLA DE LANZAMIENTO CON INTERRUPTORES TÁCTICOS
const M4LaunchConsoleHUD = ({ m4StepIndex = 1 }) => {
  return (
    <div style={{ backgroundColor: "#030712", border: "1px solid #0284c7", borderRadius: "12px", padding: "12px", marginBottom: "14px", boxShadow: "0 4px 12px rgba(2, 132, 199, 0.2)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <span style={{ fontSize: "11px", fontWeight: "bold", color: "#38bdf8", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          🚀 CONSOLA DE LANZAMIENTO Y FUSIÓN ESTELAR · M4
        </span>
        <span style={{ fontSize: "10px", backgroundColor: "rgba(56, 189, 248, 0.2)", border: "1px solid #38bdf8", color: "#38bdf8", padding: "2px 8px", borderRadius: "10px", fontWeight: "bold" }}>
          SECUENCIA PASO {m4StepIndex} / 3
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
        <div style={{ backgroundColor: m4StepIndex >= 1 ? "rgba(16, 185, 129, 0.15)" : "#0f172a", border: m4StepIndex >= 1 ? "1px solid #10b981" : "1px solid #334155", borderRadius: "8px", padding: "8px", textAlign: "center" }}>
          <div style={{ fontSize: "10px", color: m4StepIndex >= 1 ? "#4ade80" : "#94a3b8", fontWeight: "bold" }}>1. Base Común</div>
          <div style={{ fontSize: "12px", marginTop: "2px" }}>{m4StepIndex > 1 ? "✔ LISTO" : m4StepIndex === 1 ? "⚡ EN CURSO" : "⏳ ESPERA"}</div>
        </div>

        <div style={{ backgroundColor: m4StepIndex >= 2 ? "rgba(16, 185, 129, 0.15)" : "#0f172a", border: m4StepIndex >= 2 ? "1px solid #10b981" : "1px solid #334155", borderRadius: "8px", padding: "8px", textAlign: "center" }}>
          <div style={{ fontSize: "10px", color: m4StepIndex >= 2 ? "#4ade80" : "#94a3b8", fontWeight: "bold" }}>2. Suma Triple</div>
          <div style={{ fontSize: "12px", marginTop: "2px" }}>{m4StepIndex > 2 ? "✔ LISTO" : m4StepIndex === 2 ? "⚡ EN CURSO" : "⏳ ESPERA"}</div>
        </div>

        <div style={{ backgroundColor: m4StepIndex >= 3 ? "rgba(16, 185, 129, 0.15)" : "#0f172a", border: m4StepIndex >= 3 ? "1px solid #10b981" : "1px solid #334155", borderRadius: "8px", padding: "8px", textAlign: "center" }}>
          <div style={{ fontSize: "10px", color: m4StepIndex >= 3 ? "#4ade80" : "#94a3b8", fontWeight: "bold" }}>3. Simplificación</div>
          <div style={{ fontSize: "12px", marginTop: "2px" }}>{m4StepIndex === 3 ? "⚡ EN CURSO" : "⏳ ESPERA"}</div>
        </div>
      </div>
    </div>
  );
};

const getEquipamientoEvolutivo = (completadasCount) => {
  if (completadasCount >= 4) {
    return {
      avatarIcon: "👨‍🚀🚀",
      rango: "Ingeniero/a de Fusión Estelar",
      casco: "Equipo Lunar Completo & Visor Cuántico 🔮",
      naveMejora: "Reactor de Fusión Estelar Activo",
      badgeColor: "#a855f7"
    };
  }
  if (completadasCount === 3) {
    return {
      avatarIcon: "👨‍🚀",
      rango: "Comandante Orbital",
      casco: "Traje Orbital de Alta Presión",
      naveMejora: "Módulo de Acople y Soporte Vital 📦",
      badgeColor: "#38bdf8"
    };
  }
  if (completadasCount === 2) {
    return {
      avatarIcon: "🪖✨",
      rango: "Piloto de Altura",
      casco: "Casco para Atmósfera Superior",
      naveMejora: "Turbina Re-calibrada 🧪",
      badgeColor: "#eab308"
    };
  }
  if (completadasCount === 1) {
    return {
      avatarIcon: "🪖",
      rango: "Cadete Supersónico",
      casco: "Casco para Vuelos Supersónicos",
      naveMejora: "Válvula de Agua Estabilizada 💧",
      badgeColor: "#10b981"
    };
  }
  return {
    avatarIcon: "🧑‍🚀",
    rango: "Cadete de Cabina",
    casco: "Traje de Entrenamiento Inicial",
    naveMejora: "Propulsores Convencionales",
    badgeColor: "#64748b"
  };
};


// ==========================================
// 🛠️ MOTOR DE GENERACIÓN MATEMÁTICA Y OPCIONES (M1 - M4)
// ==========================================
function prepareOptions(optionsList) {
  const letters = ["A", "B", "C", "D", "E", "F"];
  const copy = [...optionsList];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, 6).map((opt, idx) => ({ ...opt, id: letters[idx] || `${idx + 1}` }));
}

const MathGenerator = {
  // M1: Igual denominador (re-randomización garantizada)
  generateM1(lastEq = "") {
    const pool = [
      { n1: 1, n2: 2, D: 5, sum: 3 },
      { n1: 2, n2: 3, D: 6, sum: 5 },
      { n1: 1, n2: 3, D: 7, sum: 4 },
      { n1: 2, n2: 4, D: 8, sum: 6 },
      { n1: 3, n2: 2, D: 9, sum: 5 },
      { n1: 2, n2: 5, D: 10, sum: 7 }
    ];
    let selected = pool[Math.floor(Math.random() * pool.length)];
    while (`${selected.n1}/${selected.D} + ${selected.n2}/${selected.D} = ?` === lastEq && pool.length > 1) {
      selected = pool[Math.floor(Math.random() * pool.length)];
    }

    const { n1, n2, D, sum } = selected;
    const raw = [
      { value: `${sum}/${D}`, correct: true, fb: `¡Excelente! Como el denominador es el mismo (${D}), sumamos directamente numeradores: ${n1} + ${n2} = ${sum}.` },
      { value: `${sum}/${D + D}`, correct: false, errorCode: "ERR_DIRECT", fb: `⚠️ ¡Atención! Sumaste los denominadores (${D} + ${D} = ${D + D}). En el mismo canal, el denominador no cambia.` },
      { value: `${n1}/${D}`, correct: false, errorCode: "ERR_PARTIAL", fb: "Solo tomaste el primer bidón. Recordá sumar el segundo." },
      { value: `${n2}/${D}`, correct: false, errorCode: "ERR_PARTIAL", fb: "Solo tomaste el segundo bidón. Recordá juntar ambos." },
      { value: `${Math.abs(n1 - n2)}/${D}`, correct: false, errorCode: "ERR_GENERIC", fb: "Restaste los numeradores en lugar de sumarlos." },
      { value: `${sum + 1}/${D}`, correct: false, errorCode: "ERR_GENERIC", fb: "Cálculo desviado por un número en el numerador." }
    ];

    return {
      id: `m1-${Date.now()}-${Math.random()}`,
      title: "Misión 1: Reserva de Agua Vital",
      concept: "Suma con Denominadores Iguales",
      b1: `${n1}/${D}`,
      b2: `${n2}/${D}`,
      equation: `${n1}/${D} + ${n2}/${D} = ?`,
      equationResolved: `${n1}/${D} + ${n2}/${D} = ${sum}/${D}`,
      correctVal: `${sum}/${D}`,
      options: prepareOptions(raw)
    };
  },

  // M2: Denominadores múltiplos simples (Resultados irreducibles)
  generateM2(lastEq = "") {
    const pool = [
      {
        n1: 1, n2: 1, d1: 4, d2: 8, lcm: 8, sumStr: "3/8",
        raw: [
          { value: "3/8", correct: true, fb: "¡Válvula calibrada! 1/4 equivale a 2/8. Sumando 2/8 + 1/8 = 3/8." },
          { value: "2/12", correct: false, errorCode: "ERR_DIRECT", fb: "Sumaste numeradores y denominadores directo (1+1 / 4+8)." },
          { value: "1/4", correct: false, errorCode: "ERR_PARTIAL", fb: "Solo consideraste el primer tanque (1/4)." },
          { value: "1/8", correct: false, errorCode: "ERR_PARTIAL", fb: "Solo consideraste el depósito auxiliar (1/8)." },
          { value: "6/8", correct: false, errorCode: "ERR_LCD", fb: "Error en la conversión a octavos." },
          { value: "5/8", correct: false, errorCode: "ERR_GENERIC", fb: "Cálculo desviado en el numerador." }
        ]
      },
      {
        n1: 1, n2: 2, d1: 3, d2: 9, lcm: 9, sumStr: "5/9",
        raw: [
          { value: "5/9", correct: true, fb: "¡Válvula calibrada! 1/3 equivale a 3/9. Sumando 3/9 + 2/9 = 5/9." },
          { value: "3/12", correct: false, errorCode: "ERR_DIRECT", fb: "Sumaste numeradores y denominadores directo (1+2 / 3+9)." },
          { value: "1/3", correct: false, errorCode: "ERR_PARTIAL", fb: "Solo consideraste el primer tanque (1/3)." },
          { value: "2/9", correct: false, errorCode: "ERR_PARTIAL", fb: "Solo consideraste el depósito auxiliar (2/9)." },
          { value: "4/9", correct: false, errorCode: "ERR_LCD", fb: "Error en la conversión del numerador al unificar base 9." },
          { value: "7/9", correct: false, errorCode: "ERR_GENERIC", fb: "Cálculo aproximado pero no exacto." }
        ]
      },
      {
        n1: 1, n2: 1, d1: 5, d2: 10, lcm: 10, sumStr: "3/10",
        raw: [
          { value: "3/10", correct: true, fb: "¡Válvula calibrada! 1/5 equivale a 2/10. Sumando 2/10 + 1/10 = 3/10." },
          { value: "2/15", correct: false, errorCode: "ERR_DIRECT", fb: "Sumaste numeradores y denominadores directo (1+1 / 5+10)." },
          { value: "1/5", correct: false, errorCode: "ERR_PARTIAL", fb: "Solo consideraste el primer tanque (1/5)." },
          { value: "1/10", correct: false, errorCode: "ERR_PARTIAL", fb: "Solo consideraste el depósito auxiliar (1/10)." },
          { value: "4/10", correct: false, errorCode: "ERR_LCD", fb: "Convertiste la base a 10 pero erraste al amplificar el numerador." },
          { value: "7/10", correct: false, errorCode: "ERR_GENERIC", fb: "Cálculo sobredimensionado." }
        ]
      },
      {
        n1: 3, n2: 1, d1: 5, d2: 10, lcm: 10, sumStr: "7/10",
        raw: [
          { value: "7/10", correct: true, fb: "¡Válvula calibrada! 3/5 equivale a 6/10. Sumando 6/10 + 1/10 = 7/10." },
          { value: "4/15", correct: false, errorCode: "ERR_DIRECT", fb: "Sumaste numeradores y denominadores directo (3+1 / 5+10)." },
          { value: "3/5", correct: false, errorCode: "ERR_PARTIAL", fb: "Solo consideraste el primer tanque (3/5)." },
          { value: "1/10", correct: false, errorCode: "ERR_PARTIAL", fb: "Solo consideraste el depósito auxiliar (1/10)." },
          { value: "5/10", correct: false, errorCode: "ERR_LCD", fb: "Olvidaste amplificar 3/5 a 6/10 antes de sumar." },
          { value: "8/10", correct: false, errorCode: "ERR_GENERIC", fb: "Cálculo aproximado pero incorrecto." }
        ]
      },
      {
        n1: 1, n2: 5, d1: 6, d2: 12, lcm: 12, sumStr: "7/12",
        raw: [
          { value: "7/12", correct: true, fb: "¡Válvula calibrada! 1/6 equivale a 2/12. Sumando 2/12 + 5/12 = 7/12." },
          { value: "6/18", correct: false, errorCode: "ERR_DIRECT", fb: "Sumaste numeradores y denominadores directo (1+5 / 6+12)." },
          { value: "1/6", correct: false, errorCode: "ERR_PARTIAL", fb: "Solo consideraste el primer tanque (1/6)." },
          { value: "5/12", correct: false, errorCode: "ERR_PARTIAL", fb: "Solo consideraste el depósito auxiliar (5/12)." },
          { value: "3/12", correct: false, errorCode: "ERR_LCD", fb: "Olvidaste amplificar 1/6 a 2/12 antes de sumar." },
          { value: "11/12", correct: false, errorCode: "ERR_GENERIC", fb: "Cálculo sobredimensionado." }
        ]
      }
    ];

    let selected = pool[Math.floor(Math.random() * pool.length)];
    while (`${selected.n1}/${selected.d1} + ${selected.n2}/${selected.d2} = ?` === lastEq && pool.length > 1) {
      selected = pool[Math.floor(Math.random() * pool.length)];
    }

    return {
      id: `m2-${Date.now()}-${Math.random()}`,
      title: "Misión 2: Mezcla de Combustible",
      concept: "Denominador Múltiplo Simple",
      equation: `${selected.n1}/${selected.d1} + ${selected.n2}/${selected.d2} = ?`,
      correctVal: selected.sumStr,
      options: prepareOptions(selected.raw)
    };
  },

  // M3: Denominadores que EXIGEN simplificación obligatoria (Sin opciones duplicadas)
  generateM3(lastEq = "") {
    const pool = [
      { n1: 1, n2: 1, d1: 3, d2: 6, sumRaw: "3/6", simp: "1/2", dist: "1/3" },
      { n1: 1, n2: 5, d1: 4, d2: 12, sumRaw: "8/12", simp: "2/3", dist: "1/4" },
      { n1: 1, n2: 1, d1: 2, d2: 10, sumRaw: "6/10", simp: "3/5", dist: "1/4" },
      { n1: 1, n2: 1, d1: 6, d2: 12, sumRaw: "3/12", simp: "1/4", dist: "1/3" }
    ];
    let selected = pool[Math.floor(Math.random() * pool.length)];
    while (`${selected.n1}/${selected.d1} + ${selected.n2}/${selected.d2} = ?` === lastEq && pool.length > 1) {
      selected = pool[Math.floor(Math.random() * pool.length)];
    }

    const { n1, n2, d1, d2, sumRaw, simp, dist } = selected;
    const raw = [
      { value: simp, correct: true, fb: `¡Acople perfecto! La suma da ${sumRaw}, que al simplificar dividiendo por el divisor común queda en la expresión irreducible ${simp}.` },
      { value: sumRaw, correct: false, errorCode: "ERR_SIMP", fb: `La suma da ${sumRaw}, pero la Misión 3 exige simplificar a la fracción irreducible.` },
      { value: `${n1 + n2}/${d1 + d2}`, correct: false, errorCode: "ERR_DIRECT", fb: "Sumaste directo numeradores y denominadores. Buscá primero unificar las bases." },
      { value: dist, correct: false, errorCode: "ERR_SIMP", fb: "Simplificación errónea de la fracción." },
      { value: "2/5", correct: false, errorCode: "ERR_GENERIC", fb: "Cálculo aproximado pero no exacto." },
      { value: "3/4", correct: false, errorCode: "ERR_GENERIC", fb: "La proporción no corresponde a la suma de raciones." }
    ];

    return {
      id: `m3-${Date.now()}-${Math.random()}`,
      title: "Misión 3: Acople de Víveres y Raciones",
      concept: "Simplificación a Fracción Irreducible",
      equation: `${n1}/${d1} + ${n2}/${d2} = ?`,
      correctVal: simp,
      options: prepareOptions(raw)
    };
  },

  // M4: Travesía Integrada (3 pasos secuenciales)
  generateM4(lastId = "") {
    const variants = [
      {
        id: "var-1",
        title: "Misión 4: Travesía Integrada de Despegue",
        concept: "Integración de Saberes (Suma Triple + Simplificación + Evaluación)",
        equationStr: "Tanque A (1/4) + Tanque B (1/6) + Tanque C (1/3)",
        part1: {
          prompt: "Parte 1: Convertí los 3 tanques al mínimo común denominador (/12) y sumalos: 1/4 + 1/6 + 1/3 = ?",
          rawOptions: [
            { value: "9/12", correct: true, fb: "¡Excelente! 1/4=3/12, 1/6=2/12, 1/3=4/12. Sumados dan 9/12." },
            { value: "3/13", correct: false, errorCode: "ERR_DIRECT", fb: "Sumaste los números en línea (1+1+1 sobre 4+6+3)." },
            { value: "7/12", correct: false, errorCode: "ERR_PARTIAL", fb: "Te faltó sumar uno de los tres tanques." },
            { value: "12/12", correct: false, errorCode: "ERR_GENERIC", fb: "Te pasaste de la capacidad total disponible." },
            { value: "5/12", correct: false, errorCode: "ERR_LCD", fb: "Error al convertir las fracciones a doceavos." },
            { value: "1/2", correct: false, errorCode: "ERR_GENERIC", fb: "La suma acumulada es mayor a 1/2." }
          ]
        },
        part2: {
          prompt: "Parte 2: Simplificá el resultado obtenido (9/12) a su fracción irreducible:",
          rawOptions: [
            { value: "3/4", correct: true, fb: "¡Correcto! 9/12 simplificado a su fracción irreducible es 3/4." },
            { value: "9/12", correct: false, errorCode: "ERR_SIMP", fb: "Esa es la fracción sin simplificar. Buscá la expresión irreducible dividiendo numerador y denominador." },
            { value: "1/3", correct: false, errorCode: "ERR_SIMP", fb: "Simplificación incorrecta." },
            { value: "2/3", correct: false, errorCode: "ERR_SIMP", fb: "Cálculo aproximado pero incorrecto." },
            { value: "1/4", correct: false, errorCode: "ERR_SIMP", fb: "Verificá la simplificación de 9/12." },
            { value: "4/3", correct: false, errorCode: "ERR_SIMP", fb: "Invertiste numerador y denominador." }
          ]
        },
        part3: {
          prompt: "Parte 3 (Evaluación de Capacidad): Para el despegue se requiere un mínimo de 2/3 de carga. Disponemos de 3/4 (que equivale a 9/12). Evaluá la situación y elegí la conclusión matemática correcta:",
          rawOptions: [
            { value: "Alcanza para el despegue, porque 3/4 (9/12) es mayor que el mínimo de 2/3 (8/12).", correct: true, fb: "¡Excelente fundamentación! Comparaste ambas fracciones sobre la misma base de doceavos." },
            { value: "Alcanza para el despegue, por estimación directa de la carga disponible.", correct: false, errorCode: "ERR_COMPARE", fb: "⚠️ Para fundamentar la decisión se requiere comparar formalmente las fracciones convertidas a la misma base (9/12 frente a 8/12)." },
            { value: "No alcanza, porque 3/4 es menor que 2/3.", correct: false, errorCode: "ERR_COMPARE", fb: "Convertí ambas a doceavos: 3/4 = 9/12 y 2/3 = 8/12 (9/12 es mayor)." },
            { value: "No alcanza, porque se necesita llenar el tanque completo.", correct: false, errorCode: "ERR_COMPARE", fb: "El mínimo requerido era 2/3, no el tanque lleno." },
            { value: "Son exactamente iguales.", correct: false, errorCode: "ERR_COMPARE", fb: "9/12 no es igual a 8/12." },
            { value: "No se puede determinar sin medir el volumen.", correct: false, errorCode: "ERR_GENERIC", fb: "Con el mismo denominador se comparan directamente los numeradores." }
          ]
        }
      },
      {
        id: "var-2",
        title: "Misión 4: Travesía Integrada de Despegue",
        concept: "Integración de Saberes (Suma Triple + Simplificación + Evaluación)",
        equationStr: "Tanque A (1/2) + Tanque B (1/6) + Tanque C (1/6)",
        part1: {
          prompt: "Parte 1: Convertí los 3 tanques a sextos (/6) y sumalos: 1/2 + 1/6 + 1/6 = ?",
          rawOptions: [
            { value: "5/6", correct: true, fb: "¡Excelente! 1/2=3/6. Sumando: 3/6 + 1/6 + 1/6 = 5/6." },
            { value: "3/14", correct: false, errorCode: "ERR_DIRECT", fb: "Sumaste numeradores y denominadores directo (1+1+1 / 2+6+6)." },
            { value: "4/6", correct: false, errorCode: "ERR_PARTIAL", fb: "Te faltó sumar uno de los tanques de 1/6." },
            { value: "6/6", correct: false, errorCode: "ERR_GENERIC", fb: "Te pasaste del cálculo real." },
            { value: "2/6", correct: false, errorCode: "ERR_PARTIAL", fb: "Solo sumaste los dos auxiliares." },
            { value: "3/6", correct: false, errorCode: "ERR_PARTIAL", fb: "Ese es solo el primer tanque convertido." }
          ]
        },
        part2: {
          prompt: "Parte 2: ¿Se puede simplificar la fracción 5/6?",
          rawOptions: [
            { value: "No, 5/6 ya es la fracción irreducible (5 y 6 no tienen divisores comunes).", correct: true, fb: "¡Correcto! 5 y 6 no comparten divisores comunes mayores que 1." },
            { value: "Sí, equivale a 1/2.", correct: false, errorCode: "ERR_SIMP", fb: "1/2 es 3/6, no 5/6." },
            { value: "Sí, equivale a 2/3.", correct: false, errorCode: "ERR_SIMP", fb: "2/3 es 4/6, no 5/6." },
            { value: "Sí, equivale a 1/3.", correct: false, errorCode: "ERR_SIMP", fb: "1/3 es 2/6." },
            { value: "Sí, dividiendo por 2.", correct: false, errorCode: "ERR_SIMP", fb: "5 no es divisible exactamente por 2." },
            { value: "Sí, dividiendo por 5.", correct: false, errorCode: "ERR_SIMP", fb: "6 no es divisible exactamente por 5." }
          ]
        },
        part3: {
          prompt: "Parte 3 (Evaluación de Capacidad): Para el despegue se requiere un mínimo de 2/3 (4/6) de carga. Tenemos 5/6. Evaluá la situación y elegí la conclusión matemática correcta:",
          rawOptions: [
            { value: "Alcanza para el despegue, porque tenemos 5/6 y el mínimo 2/3 equivale a 4/6 (5/6 > 4/6).", correct: true, fb: "¡Excelente fundamentación! Comparando sobre sextos: 5/6 es mayor que 4/6." },
            { value: "Alcanza para el despegue, por cálculo estimado de la reserva.", correct: false, errorCode: "ERR_COMPARE", fb: "⚠️ Para fundamentar la decisión se requiere comparar formalmente las fracciones convertidas a la misma base (5/6 frente a 4/6)." },
            { value: "No alcanza, porque 5/6 es menor que 4/6.", correct: false, errorCode: "ERR_COMPARE", fb: "5 es mayor que 4 sobre el mismo denominador 6." },
            { value: "No alcanza, porque falta 1/6.", correct: false, errorCode: "ERR_GENERIC", fb: "El mínimo era 4/6, no 6/6." },
            { value: "Son iguales.", correct: false, errorCode: "ERR_COMPARE", fb: "5/6 es mayor que 4/6." },
            { value: "No se puede comparar.", correct: false, errorCode: "ERR_GENERIC", fb: "Con el mismo denominador se comparan directamente los numeradores." }
          ]
        }
      }
    ];

    let choice = variants[Math.floor(Math.random() * variants.length)];
    while (choice.id === lastId && variants.length > 1) {
      choice = variants[Math.floor(Math.random() * variants.length)];
    }

    return {
      id: choice.id,
      title: choice.title,
      concept: choice.concept,
      equationStr: choice.equationStr,
      part1: { ...choice.part1, options: prepareOptions(choice.part1.rawOptions) },
      part2: { ...choice.part2, options: prepareOptions(choice.part2.rawOptions) },
      part3: { ...choice.part3, options: prepareOptions(choice.part3.rawOptions) }
    };
  }
};

// ==========================================
// 🌌 COMPONENTE SALTO A HIPERESPACIO
// ==========================================
function HyperspaceJump() {
  const [stars, setStars] = useState([]);
  useEffect(() => {
    const generated = Array.from({ length: 24 }).map((_, i) => ({
      id: i,
      top: `${5 + Math.random() * 90}%`,
      width: `${100 + Math.random() * 200}px`,
      height: `${1.5 + Math.random() * 2}px`,
      duration: `${0.35 + Math.random() * 0.5}s`,
      delay: `${Math.random() * 0.2}s`
    }));
    setStars(generated);
  }, []);

  return (
    <div style={hyperspaceStyles.overlay}>
      
      {stars.map((star) => (
        <div
          key={star.id}
          style={{
            position: "absolute",
            top: star.top,
            left: "0px",
            width: star.width,
            height: star.height,
            background: "linear-gradient(90deg, transparent, #38bdf8, #ffffff, #c084fc, transparent)",
            boxShadow: "0 0 10px rgba(56, 189, 248, 0.9)",
            opacity: 0.9,
            animation: `streak ${star.duration} linear infinite`,
            animationDelay: star.delay
          }}
        />
      ))}
      <div style={hyperspaceStyles.hudText}>⚡ SALTO HIPERESPACIAL EN CURSO... ⚡</div>
    </div>
  );
}

const hyperspaceStyles = {
  overlay: {
    position: "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(2, 3, 8, 0.85)",
    zIndex: 9000,
    overflow: "hidden",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    animation: "glowFlash 1.2s ease-in-out infinite"
  },
  hudText: {
    fontSize: "18px",
    fontWeight: "900",
    color: "#38bdf8",
    letterSpacing: "2px",
    textShadow: "0 0 15px #38bdf8",
    backgroundColor: "rgba(2, 3, 8, 0.9)",
    padding: "12px 28px",
    borderRadius: "20px",
    border: "2px solid #38bdf8"
  }
};

// ==========================================
// 🤖 EDUBOT (COPILOTO ROBOT)
// ==========================================
function EduBotCopilot({ mood, message, onClickHelp, onClickQueMeEquivoque, errorWarning }) {
  return (
    <div style={botStyles.container}>
      <div style={botStyles.header}>
        <div style={botStyles.robotBody}>
          <div style={botStyles.antenna}>
            <div style={botStyles.antennaLight(mood)} />
          </div>
          <div style={botStyles.head(mood)}>
            <div style={botStyles.screen}>
              {mood === "happy" && <span style={botStyles.eyesHappy}>^ ‿ ^</span>}
              {mood === "shocked" && <span style={botStyles.eyesShock}>O ⍜ O</span>}
              {mood === "thinking" && <span style={botStyles.eyesThink}>o _ O</span>}
              {mood === "idle" && <span style={botStyles.eyesIdle}>• _ •</span>}
            </div>
          </div>
        </div>

        <div style={botStyles.titleBlock}>
          <div style={botStyles.copilotName}>🤖 EDUBOT (Copiloto)</div>
          <div style={botStyles.copilotSub}>IA de Asistencia a Bordo</div>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "4px" }}>
            <button onClick={onClickHelp} style={botStyles.hintBtn} type="button">
              💡 Pedir pista
            </button>
            <button onClick={onClickQueMeEquivoque} style={botStyles.errorBtn} type="button">
              🤔 ¿En qué me estoy equivocando?
            </button>
          </div>
        </div>
      </div>

      <div style={botStyles.speechBubble}>
        <div style={botStyles.copilotText}>{message}</div>
      </div>

      {errorWarning && (
        <div style={botStyles.errorAlertBox}>
          <span style={{ fontSize: "20px" }}>📝⚠️</span>
          <div style={{ fontSize: "12px", color: "#fca5a5", lineHeight: "1.4" }}>
            <strong style={{ color: "#ffffff" }}>¡ALERTA DE EDUBOT!</strong><br />
            {errorWarning}
          </div>
        </div>
      )}
    </div>
  );
}

const botStyles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    backgroundColor: "rgba(139, 92, 246, 0.12)",
    border: "2px solid #8b5cf6",
    borderRadius: "14px",
    padding: "16px",
    marginBottom: "16px",
    boxShadow: "0 0 20px rgba(139, 92, 246, 0.25)"
  },
  header: { display: "flex", alignItems: "center", gap: "12px" },
  robotBody: { display: "flex", flexDirection: "column", alignItems: "center" },
  antenna: { width: "4px", height: "10px", backgroundColor: "#64748b", position: "relative" },
  antennaLight: (mood) => ({
    width: "10px", height: "10px", borderRadius: "50%",
    backgroundColor: mood === "shocked" ? "#ef4444" : mood === "happy" ? "#10b981" : "#38bdf8",
    position: "absolute", top: "-8px", left: "-3px",
    boxShadow: `0 0 8px ${mood === "shocked" ? "#ef4444" : mood === "happy" ? "#10b981" : "#38bdf8"}`
  }),
  head: (mood) => ({
    width: "64px", height: "50px", backgroundColor: "#1e293b",
    borderRadius: "10px",
    border: `2px solid ${mood === "shocked" ? "#ef4444" : mood === "happy" ? "#10b981" : "#38bdf8"}`,
    display: "flex", alignItems: "center", justifyContent: "center", padding: "3px"
  }),
  screen: {
    width: "100%", height: "100%", backgroundColor: "#03040b",
    borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center"
  },
  eyesHappy: { fontFamily: "monospace", fontWeight: "900", fontSize: "15px", color: "#10b981" },
  eyesShock: { fontFamily: "monospace", fontWeight: "900", fontSize: "15px", color: "#ef4444" },
  eyesThink: { fontFamily: "monospace", fontWeight: "900", fontSize: "15px", color: "#fb923c" },
  eyesIdle: { fontFamily: "monospace", fontWeight: "900", fontSize: "15px", color: "#38bdf8" },
  titleBlock: { flex: 1 },
  copilotName: { fontSize: "14px", fontWeight: "900", color: "#c084fc", letterSpacing: "0.5px" },
  copilotSub: { fontSize: "11px", color: "#94a3b8", marginBottom: "6px" },
  hintBtn: {
    padding: "6px 10px", backgroundColor: "rgba(139, 92, 246, 0.2)",
    border: "1px solid #8b5cf6", color: "#c084fc", borderRadius: "6px",
    fontSize: "11px", fontWeight: "bold", cursor: "pointer"
  },
  errorBtn: {
    padding: "6px 10px", backgroundColor: "rgba(251, 146, 60, 0.2)",
    border: "1px solid #fb923c", color: "#fb923c", borderRadius: "6px",
    fontSize: "11px", fontWeight: "bold", cursor: "pointer"
  },
  speechBubble: { backgroundColor: "#02040e", border: "1px solid #1e293b", borderRadius: "8px", padding: "10px 12px" },
  copilotText: { fontSize: "13px", fontWeight: "bold", color: "#ffffff", lineHeight: "1.4" },
  errorAlertBox: {
    backgroundColor: "rgba(239, 68, 68, 0.15)", border: "2px solid #ef4444",
    borderRadius: "8px", padding: "10px", display: "flex", alignItems: "center", gap: "10px"
  }
};

// ==========================================
// 🚀 COMPONENTE PRINCIPAL (APP ALUMNO V7)
// ==========================================

// ==========================================
// 🛠️ HELPER SLUG UNIFICADO (MODELO DE DATOS FIRESTORE)
// ==========================================
function slug(text) {
  if (!text) return "";
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_");
}

// ==========================================
// 🛠️ HELPER SLUG Y GENERADOR DE ID DE ALUMNO
// ==========================================
function generarAlumnoId(nickname, escuela) {
  return `${slug(nickname)}__${slug(escuela)}`;
}

export default function App() {
  // Estado Global del Flujo
  const [faseGlobal, setFaseGlobal] = useState("ingreso");
  // Estado de Identificación y Sincronización en Firestore
  const [alumnoId, setAlumnoId] = useState(null);
  const [perfilCargado, setPerfilCargado] = useState(false);
 // 'ingreso', 'bienvenida', 'juego', 'cierre'

  // Cuestionario de Ingreso
  const [perfilAlumno, setPerfilAlumno] = useState({
    nickname: "",
    curso: "1° Año",
    escuela: "IPEM",
    edad: "12"
  });
  const [tipoEscuela, setTipoEscuela] = useState("IPEM");
  const [escuelaOtra, setEscuelaOtra] = useState("");

  // Cuestionario de Cierre
  const [encuestaCierre, setPerfilCierre] = useState({
    conocimientoPrevio: "Más o menos",
    utilidadSimulacros: "Sí",
    recibirInformacion: "Sí",
    recomendarEduMision: "Sí",
    sugerenciasMejora: ""
  });

  // Navegación de Misiones
  const [misionActual, setMisionActual] = useState("m1"); // 'm1', 'm2', 'm3', 'm4'
  const [faseMision, setFaseMision] = useState("inicio");
  // 🛢️ ESTADO DE FÍSICA DE TAMBORES EN MISION 2
  const [m2StackState, setM2StackState] = useState("idle"); // "idle", "wobble", "fall", "docked"
  const [m2SelectedBarrel, setM2SelectedBarrel] = useState(null);
 // 'inicio', 'simulacro', 'transicion', 'desafio', 'exito'
  const [pasoDemo, setPasoDemo] = useState(1);
  const [m4StepIndex, setM4StepIndex] = useState(1); // 1, 2, 3

  // Estado del Jugador y Puntos
  const [tituloExplorador, setTituloExplorador] = useState("Explorador/a Novato/a");
  
  const [docenteId, setDocenteId] = useState(null);
  const [tiempoSesionTotalSegundos, setTiempoSesionTotalSegundos] = useState(0);
  const [misionTimerRef, setMisionTimerRef] = useState(0);
  const [showQueMeEquivoqueModal, setShowQueMeEquivoqueModal] = useState(false);
  const [queMeEquivoqueTexto, setQueMeEquivoqueTexto] = useState("");

  const [statsPorMision, setStatsPorMision] = useState({
    m1: { intentosSimulacro: 0, intentosDesafio: 0, errores: 0, ayudas: 0, consultasQueMeEquivoque: 0, segundosResolucion: 0, ultimoError: null },
    m2: { intentosSimulacro: 0, intentosDesafio: 0, errores: 0, ayudas: 0, consultasQueMeEquivoque: 0, segundosResolucion: 0, ultimoError: null },
    m3: { intentosSimulacro: 0, intentosDesafio: 0, errores: 0, ayudas: 0, consultasQueMeEquivoque: 0, segundosResolucion: 0, ultimoError: null },
    m4: { intentosSimulacro: 0, intentosDesafio: 0, errores: 0, ayudas: 0, consultasQueMeEquivoque: 0, segundosResolucion: 0, ultimoError: null }
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTiempoSesionTotalSegundos((prev) => prev + 1);
      setMisionTimerRef((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const [xpTotal, setXpTotal] = useState(0);
  const [misionesCompletadas, setMisionesCompletadas] = useState([]);
  const [misionesConError, setMisionesConError] = useState([]);
  const [badgeEarned, setBadgeEarned] = useState(false);
  const [habilidadDesbloqueada, setHabilidadDesbloqueada] = useState(null);
  const m4TimeoutRef = useRef(null);

  // Datos Dinámicos de Misión
  const [dataM1, setDataM1] = useState(() => MathGenerator.generateM1());
  const [dataM2, setDataM2] = useState(() => MathGenerator.generateM2());
  const [dataM3, setDataM3] = useState(() => MathGenerator.generateM3());
  const [dataM4, setDataM4] = useState(() => MathGenerator.generateM4());

  // Simuladores
  const [m2SimulacroNum, setM2SimulacroNum] = useState(null);
  const [m3SimulacroAns, setM3SimulacroAns] = useState(null);

  // Estados de Interacción
  const [opcionSeleccionada, setOpcionSeleccionada] = useState(null);
  const [m3RejectId, setM3RejectId] = useState(null);
  const [m3WobbleId, setM3WobbleId] = useState(null);
  const [m2FallingId, setM2FallingId] = useState(null);
  const [m2WobbleId, setM2WobbleId] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [copilotMood, setCopilotMood] = useState("idle");
  const [copilotMsg, setCopilotMsg] = useState("¡Bienvenido/a a la travesía! Hacé las cuentas en papel antes de responder.");
  const [errorWarning, setErrorWarning] = useState(null);
  const [transitioning, setTransitioning] = useState(false);

  // Mensaje de la Profe (Transmisión colectiva)
  const [teacherMessage, setTeacherMessage] = useState("¡Tripulantes de 1er año! Recuerden usar hoja y lápiz para verificar la base antes de responder en los mandos.");

  // Bitácora xAPI
  const [bitacora, setBitacora] = useState([
    { id: 1, timestamp: new Date().toLocaleTimeString("es-AR"), text: "🧭 Sesión iniciada." }
  ]);

  
    // 📜 Registro xAPI en 'bitacora_alumnos'
  const addBitacora = (textEvent, esErrorReal = false, tipoErrorCodigo = null, misionOpt = null, xpOpt = null) => {
    const currentMision = misionOpt !== null ? misionOpt : misionActual;
    const currentXp = xpOpt !== null ? xpOpt : xpTotal;
    const currentAlumnoId = alumnoId || (perfilAlumno.nickname && perfilAlumno.escuela ? generarAlumnoId(perfilAlumno.nickname, perfilAlumno.escuela) : null);

    setBitacora((prev) => [
      { id: Date.now(), timestamp: new Date().toLocaleTimeString("es-AR"), text: textEvent },
      ...prev
    ]);

    if (db && currentAlumnoId) {
      try {
        addDoc(collection(db, "bitacora_alumnos"), {
          alumnoId: currentAlumnoId,
          alumno: perfilAlumno.nickname || "Alumno Explorador",
          escuela: perfilAlumno.escuela || "Sin Escuela",
          curso: perfilAlumno.curso || "1er Año",
          mision: currentMision,
          evento: textEvent,
          esErrorReal: !!esErrorReal,
          tipoErrorCodigo: tipoErrorCodigo || null,
          xp: currentXp,
          fecha: serverTimestamp()
        }).catch((err) => console.error("Error enviando a bitacora_alumnos:", err));
      } catch (e) {
        console.error("Firestore no disponible:", e);
      }
    }
  };


    // Cuestionario 1: Guardar Perfil y Cargar desde Firestore
  const handleGuardarPerfilIngreso = async (e) => {
    e.preventDefault();
    const finalEscuela = tipoEscuela === "Otra" ? escuelaOtra.trim() : tipoEscuela;
    if (!perfilAlumno.nickname || !finalEscuela) {
      alert("Por favor completa tu Nickname y la Escuela.");
      return;
    }
    perfilAlumno.escuela = finalEscuela;

    if (!db) {
      alert("No pudimos conectar con la base de datos. Revisá tu internet e intentá de nuevo.");
      return;
    }

    const aid = generarAlumnoId(perfilAlumno.nickname, perfilAlumno.escuela);

    try {
      const snap = await getDoc(doc(db, "alumnos", aid));

      if (snap.exists()) {
        const data = snap.data();
        const loadedXp = data.xpTotal || 0;
        const completadas = data.misionesCompletadas || [];
        const conError = data.misionesConError || [];
        const badge = !!data.badgeEarned;

        setXpTotal(loadedXp);
        setMisionesCompletadas(completadas);
        setMisionesConError(conError);
        setBadgeEarned(badge);
        if (data.docenteId !== undefined) {
          setDocenteId(data.docenteId || null);
        }
        if (data.statsPorMision) {
          setStatsPorMision(data.statsPorMision);
        }

        // Recalcular título explorador y habilidad
        const len = completadas.length;
        if (len === 0) setTituloExplorador("Explorador/a Novato/a");
        else if (len === 1) setTituloExplorador("Explorador/a de la Base");
        else if (len === 2) setTituloExplorador("Explorador/a de Válvulas");
        else if (len === 3) setTituloExplorador("Explorador/a de Órbitas");
        else if (len >= 4) setTituloExplorador("Explorador/a de Fusión Estelar 🚀");

        if (badge) {
          setHabilidadDesbloqueada("Visor de Fusión Cuántica 🔮");
        }

        setAlumnoId(aid);
        setPerfilCargado(true);

        addBitacora(`👤 Perfil reingresado, XP acumulado: ${loadedXp}`, false, null, "m1", loadedXp);
      } else {
        const initialDoc = {
          nickname: perfilAlumno.nickname,
          escuela: perfilAlumno.escuela,
          curso: perfilAlumno.curso || "1er Año",
          edad: perfilAlumno.edad || "12",
          docenteId: null,
          xpTotal: 0,
          misionesCompletadas: [],
          misionesConError: [],
          badgeEarned: false,
          tiempoSesionTotalSegundos: 0,
          statsPorMision: {
            m1: { intentosSimulacro: 0, intentosDesafio: 0, errores: 0, ayudas: 0, consultasQueMeEquivoque: 0, segundosResolucion: 0, ultimoError: null },
            m2: { intentosSimulacro: 0, intentosDesafio: 0, errores: 0, ayudas: 0, consultasQueMeEquivoque: 0, segundosResolucion: 0, ultimoError: null },
            m3: { intentosSimulacro: 0, intentosDesafio: 0, errores: 0, ayudas: 0, consultasQueMeEquivoque: 0, segundosResolucion: 0, ultimoError: null },
            m4: { intentosSimulacro: 0, intentosDesafio: 0, errores: 0, ayudas: 0, consultasQueMeEquivoque: 0, segundosResolucion: 0, ultimoError: null }
          },
          creadoEn: serverTimestamp(),
          actualizadoEn: serverTimestamp()
        };

        await setDoc(doc(db, "alumnos", aid), initialDoc);

        setXpTotal(0);
        setMisionesCompletadas([]);
        setMisionesConError([]);
        setBadgeEarned(false);
        setTituloExplorador("Explorador/a Novato/a");

        setAlumnoId(aid);
        setPerfilCargado(true);

        addBitacora(`👤 Nuevo perfil registrado: ${perfilAlumno.nickname} (${perfilAlumno.curso} - ${perfilAlumno.escuela})`, false, null, "m1", 0);
      }

      setFaseGlobal("bienvenida");
    } catch (err) {
      console.error("Error al conectar con Firestore:", err);
      alert("No pudimos conectar, revisá tu internet e intentá de nuevo.");
      // NO cambiamos de fase si falla
    }
  };

  // 📡 Único useEffect para sincronizar progreso a Firestore cuando perfilCargado === true
  useEffect(() => {
    if (!perfilCargado || !alumnoId || !db) return;

    const syncProgreso = async () => {
      try {
        await updateDoc(doc(db, "alumnos", alumnoId), {
          xpTotal,
          misionesCompletadas,
          misionesConError,
          badgeEarned,
          statsPorMision,
          tiempoSesionTotalSegundos,
          actualizadoEn: serverTimestamp()
        });
      } catch (err) {
        console.error("Error actualizando progreso en Firestore:", err);
        setPerfilCargado(false);
        setAlumnoId(null);
        alert("Tu registro fue eliminado por Control Central. Volvé a ingresar.");
        setFaseGlobal("ingreso");
      }
    };

    syncProgreso();
  }, [perfilCargado, alumnoId, xpTotal, misionesCompletadas, misionesConError, badgeEarned, statsPorMision, tiempoSesionTotalSegundos]);

  // 📡 1. Escuchar cambios en alumnos/{alumnoId} para mantener docenteId actualizado
  useEffect(() => {
    if (!perfilCargado || !alumnoId || !db) return;

    const unsubAlumno = onSnapshot(
      doc(db, "alumnos", alumnoId),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setDocenteId(data.docenteId || null);
        }
      },
      (err) => console.error("Error escuchando alumno:", err)
    );

    return () => unsubAlumno();
  }, [perfilCargado, alumnoId]);

  // 📡 2. Si hay docenteId, escuchar docentes/{docenteId} para "Transmisión de tu Profe en Vivo"
  useEffect(() => {
    if (!docenteId || !db) {
      setTeacherMessage("¡Tripulantes de 1er año! Recuerden usar hoja y lápiz para verificar la base antes de responder en los mandos.");
      return;
    }

    const unsubDocente = onSnapshot(
      doc(db, "docentes", docenteId),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setTeacherMessage(
            data.mensajeActual ||
            data.mensaje ||
            "¡Tripulantes de 1er año! Recuerden usar hoja y lápiz para verificar la base antes de responder en los mandos."
          );
        }
      },
      (err) => console.error("Error escuchando docente:", err)
    );

    return () => unsubDocente();
  }, [docenteId]);


  const handleEnviarEncuestaCierre = async (e) => {
    e.preventDefault();
    if (!db) {
      alert("No hay conexión con la base de datos.");
      return;
    }

    try {
      await addDoc(collection(db, "encuestas"), {
        tipo: "alumno_cierre",
        alumnoId: alumnoId || null,
        docenteId: docenteId || null,
        respuestas: encuestaCierre,
        fecha: serverTimestamp()
      });

      addBitacora("📜 Cuestionario de Cierre enviado con éxito a Control Central.");
      alert("🎉 ¡Muchas gracias! Tu opinión y resultados fueron registrados en Control Central.");
      setFaseGlobal("juego");
    } catch (err) {
      console.error("Error guardando encuesta de cierre:", err);
      alert("No se pudo enviar la encuesta, revisá tu conexión e intentá de nuevo.");
    }
  };

  // Cambiar de Misión con Salto Hiperespacial
  const cambiarMision = (mId) => {
    soundEffects.playTap();
    triggerHaptic(30);
    setTransitioning(true);
    setTimeout(() => {
      setMisionActual(mId);
      setFaseMision("inicio");
      setPasoDemo(1);
      setM4StepIndex(1);
      setMisionTimerRef(0);
      setOpcionSeleccionada(null);
    setM2FallingId(null);
    setM2WobbleId(null);
    setM3RejectId(null);
    setM3WobbleId(null);
      setFeedback(null);
      setCopilotMood("idle");
      setM2SimulacroNum(null);
    setM2StackState("idle");
    setM2SelectedBarrel(null);
      setM3SimulacroAns(null);
      setTransitioning(false);
      addBitacora(`🚀 Ingreso a la ${mId.toUpperCase()}`);
    }, 800);
  };

  const handlePasarSiguienteMision = () => {
    if (misionActual === "m1") cambiarMision("m2");
    else if (misionActual === "m2") cambiarMision("m3");
    else if (misionActual === "m3") cambiarMision("m4");
    else cambiarMision("m1");
  };

  // Re-generación de Datos
  const handleGenerarNuevas = () => {
    setOpcionSeleccionada(null);
    setM2FallingId(null);
    setM2WobbleId(null);
    setM3RejectId(null);
    setM3WobbleId(null);
    setFeedback(null);
    setM2SimulacroNum(null);
    setM2StackState("idle");
    setM2SelectedBarrel(null);
    setM3SimulacroAns(null);
    setM4StepIndex(1);

    if (misionActual === "m1") setDataM1(MathGenerator.generateM1(dataM1.equation));
    if (misionActual === "m2") setDataM2(MathGenerator.generateM2(dataM2.equation));
    if (misionActual === "m3") setDataM3(MathGenerator.generateM3(dataM3.equation));
    if (misionActual === "m4") setDataM4(MathGenerator.generateM4(dataM4.id));

    addBitacora(`🔄 Nuevas operaciones generadas para ${misionActual.toUpperCase()}.`);
  };

  // Otorgar XP con Caps Fijos (Máximo 750 XP)
  const otorgarXP = (mId) => {
    const timeSpent = misionTimerRef;
    setStatsPorMision((prev) => {
      const current = prev[mId] || { intentosSimulacro: 0, intentosDesafio: 0, errores: 0, ayudas: 0, consultasQueMeEquivoque: 0, segundosResolucion: 0, ultimoError: null };
      return {
        ...prev,
        [mId]: {
          ...current,
          segundosResolucion: current.segundosResolucion > 0 ? current.segundosResolucion : timeSpent
        }
      };
    });

    if (!misionesCompletadas.includes(mId)) {
      const nuevasCompletadas = [...misionesCompletadas, mId];
      setMisionesCompletadas(nuevasCompletadas);

      let sumaXP = 0;
      if (nuevasCompletadas.includes("m1")) sumaXP += 100;
      if (nuevasCompletadas.includes("m2")) sumaXP += 150;
      if (nuevasCompletadas.includes("m3")) sumaXP += 200;
      if (nuevasCompletadas.includes("m4")) sumaXP += 300;

      setXpTotal(sumaXP);

      addBitacora(`🏆 Misión ${mId.toUpperCase()} completada con éxito en ${timeSpent}s. (+${mId === "m1" ? 100 : mId === "m2" ? 150 : mId === "m3" ? 200 : 300} XP)`, false, null, mId, sumaXP);

      if (nuevasCompletadas.length === 1) setTituloExplorador("Explorador/a de la Base");
      if (nuevasCompletadas.length === 2) setTituloExplorador("Explorador/a de Válvulas");
      if (nuevasCompletadas.length === 3) setTituloExplorador("Explorador/a de Órbitas");
      if (nuevasCompletadas.length === 4) {
        setTituloExplorador("Explorador/a de Fusión Estelar 🚀");
        setBadgeEarned(true);
        setHabilidadDesbloqueada("Visor de Fusión Cuántica 🔮");
        addBitacora("🔮 ¡NUEVA HABILIDAD DESBLOQUEADA: Visor de Fusión Cuántica habilitado para futuras misiones!");
      }
    }
  };

  // Avanzar Paso en M4
  const avanzarPasoM4 = useCallback(() => {
    if (m4TimeoutRef.current) {
      clearTimeout(m4TimeoutRef.current);
      m4TimeoutRef.current = null;
    }
    if (m4StepIndex < 3) {
      setM4StepIndex((prev) => prev + 1);
      setOpcionSeleccionada(null);
    setM2FallingId(null);
    setM2WobbleId(null);
    setM3RejectId(null);
    setM3WobbleId(null);
      setFeedback(null);
      setCopilotMood("idle");
      setCopilotMsg(`Paso ${m4StepIndex + 1} de M4 activo. Resolvé con atención.`);
      addBitacora(`➔ Avanzando a la Parte ${m4StepIndex + 1} de M4.`);
    } else {
      setFaseMision("exito");
      otorgarXP("m4");
    }
  }, [m4StepIndex]);

  // Manejo de Respuestas en el Desafío
  const handleSeleccionarOpcion = (opt) => {
    if (opcionSeleccionada !== null) return;
    setOpcionSeleccionada(opt.value);
    setFeedback(opt);

    // Incremento de intentos y registro de error/ultimoError (CÓDIGO)
    setStatsPorMision((prev) => {
      const current = prev[misionActual] || { intentosSimulacro: 0, intentosDesafio: 0, errores: 0, ayudas: 0, consultasQueMeEquivoque: 0, segundosResolucion: 0, ultimoError: null };
      if (opt.correct) {
        return {
          ...prev,
          [misionActual]: {
            ...current,
            intentosDesafio: (current.intentosDesafio || 0) + 1
          }
        };
      } else {
        const errCode = opt.errorCode || "ERR_GENERIC";
        return {
          ...prev,
          [misionActual]: {
            ...current,
            intentosDesafio: (current.intentosDesafio || 0) + 1,
            errores: (current.errores || 0) + 1,
            ultimoError: errCode
          }
        };
      }
    });

    if (opt.correct) {
      soundEffects.playSuccess();
      triggerHaptic(40);
      setCopilotMood("happy");
      setCopilotMsg("🎉 ¡Excelente deducción! Los cálculos son correctos.");
      setErrorWarning(null);
      addBitacora(`✅ Acierto en ${misionActual.toUpperCase()}: ${opt.value}`, false, null);

      if (misionActual === "m4" && m4StepIndex === 3) {
        addBitacora(`✅ Acierto en M4 Parte 3: ${opt.value}`);
      }

      if (misionActual !== "m4") {
        setFaseMision("exito");
        otorgarXP(misionActual);
        setFloatingXP({ text: "+100 XP", key: Date.now() });
        setTimeout(() => setFloatingXP(null), 2200);
      } else {
        // En M4 avanzamos por los 3 pasos secuenciales
        if (m4StepIndex < 3) {
          if (m4TimeoutRef.current) clearTimeout(m4TimeoutRef.current);
          m4TimeoutRef.current = setTimeout(() => {
            avanzarPasoM4();
          }, 2200);
        } else {
          setFaseMision("exito");
          otorgarXP("m4");
        }
      }
    } else {
      soundEffects.playWarning();
      triggerHaptic(60);
      setCopilotMood("shocked");
      setCopilotMsg("⚠️ Desvío detectado. Revisá tu cálculo con lápiz y papel.");
      setErrorWarning("Sin calculadoras. Usá hoja y lápiz para verificar los denominadores.");
      
      if (misionActual === "m2" && !opt.correct) {
        setM2WobbleId(opt.id);
        setTimeout(() => setM2FallingId(opt.id), 200);
        setTimeout(() => {
          setM2FallingId(null);
          setM2WobbleId(null);
        }, 1800);
      }
      if (misionActual === "m3" && !opt.correct) {
        setM3WobbleId(opt.id);
        setTimeout(() => setM3RejectId(opt.id), 200);
        setTimeout(() => {
          setM3RejectId(null);
          setM3WobbleId(null);
        }, 1800);
      }
      if (!misionesConError.includes(misionActual)) {
        setMisionesConError((prev) => [...prev, misionActual]);
      }
      addBitacora(`⚠️ Desvío en ${misionActual.toUpperCase()}: ${opt.value}`, true, opt.errorCode || "ERR_GENERIC");

      // Re-ordenar opciones para evitar memorización de posición
      setTimeout(() => {
        if (misionActual === "m1") setDataM1((prev) => ({ ...prev, options: prepareOptions(prev.options) }));
        if (misionActual === "m2") setDataM2((prev) => ({ ...prev, options: prepareOptions(prev.options) }));
        if (misionActual === "m3") setDataM3((prev) => ({ ...prev, options: prepareOptions(prev.options) }));
        if (misionActual === "m4") {
          setDataM4((prev) => {
            const stepKey = `part${m4StepIndex}`;
            return {
              ...prev,
              [stepKey]: { ...prev[stepKey], options: prepareOptions(prev[stepKey].options) }
            };
          });
        }
        setOpcionSeleccionada(null);
    setM2FallingId(null);
    setM2WobbleId(null);
    setM3RejectId(null);
    setM3WobbleId(null);
      }, 2200);
    }
  };

  const handlePedirPista = () => {
    soundEffects.playTap();
    triggerHaptic(30);
    // Sumar 1 a ayudas de la misión actual en statsPorMision
    setStatsPorMision((prev) => {
      const current = prev[misionActual] || { intentosSimulacro: 0, intentosDesafio: 0, errores: 0, ayudas: 0, consultasQueMeEquivoque: 0, segundosResolucion: 0, ultimoError: null };
      return {
        ...prev,
        [misionActual]: {
          ...current,
          ayudas: (current.ayudas || 0) + 1
        }
      };
    });

    setCopilotMood("thinking");
    let hint = "Usá lápiz y papel para dibujar las partes del entero.";
    if (misionActual === "m1") hint = "💡 Pista M1: Con el mismo denominador, solo sumá los números de arriba y mantené la misma base.";
    if (misionActual === "m2") hint = "💡 Pista M2: Encontrá el común denominador buscando el menor múltiplo que comparen ambas fracciones.";
    if (misionActual === "m3") hint = "💡 Pista M3: Al sumar, dividí el numerador y denominador por el mismo número para simplificar.";
    if (misionActual === "m4") hint = "💡 Pista M4: Convertí todas las fracciones a doceavos para sumar y comparar la capacidad total.";

    setCopilotMsg(hint);
    addBitacora(`💡 Consultó pista en ${misionActual.toUpperCase()}`, false, null);
  };

  const handleConsultarQueMeEquivoque = () => {
    soundEffects.playTap();
    triggerHaptic(30);
    const currentStats = statsPorMision[misionActual] || {};
    const lastErr = currentStats.ultimoError;

    setStatsPorMision((prev) => {
      const current = prev[misionActual] || { intentosSimulacro: 0, intentosDesafio: 0, errores: 0, ayudas: 0, consultasQueMeEquivoque: 0, segundosResolucion: 0, ultimoError: null };
      return {
        ...prev,
        [misionActual]: {
          ...current,
          consultasQueMeEquivoque: (current.consultasQueMeEquivoque || 0) + 1
        }
      };
    });

    let explicacion = "";
    if (!lastErr) {
      explicacion = "¡Tus mandos están limpios, Explorador/a! No detecté desvíos en tus cálculos actuales. Hacé la cuenta en papel y elegí tu respuesta con confianza.";
    } else if (lastErr === "ERR_DIRECT") {
      explicacion = "Detecté que sumaste los números de abajo. Pensalo con una pizza 🍕: si comés 1 porción de 6 y luego 2 de 6, comiste 3 porciones de 6 (3/6). ¡La pizza entera no se convirtió en 12 porciones! El denominador indica el tamaño de la porción y no se suma.";
    } else if (lastErr === "ERR_LCD") {
      explicacion = "Detecté un desvío al cambiar de base. Ejemplo 🥤: Para sumar 1/2 con 1/4, convertimos 1/2 a cuartos. Si multiplicás el 2 de abajo por 2 para llegar a 4, obligatoriamente debés multiplicar el 1 de arriba por 2 (1/2 = 2/4). ¡No te olvides de transformar también el número de arriba!";
    } else if (lastErr === "ERR_SIMP") {
      explicacion = "Tu suma es correcta, pero la nave exige la fracción irreducible. Ejemplo 📦: Si obtenés 4/8, ambos números se pueden dividir por 4, quedando en 1/2. Buscá un número que divida exactamente arriba y abajo.";
    } else if (lastErr === "ERR_COMPARE") {
      explicacion = "¡Atención tripulante! No podemos comparar fracciones si sus partes están cortadas en tamaños distintos. 📱 Ejemplo Batería: Si tu batería está en 1/2 y la de tu amigo en 3/4, dividimos en cuartos: 1/2 son 2/4 (2 rayitas de 4) y 3/4 son 3 rayitas de 4. ¡Al tener el mismo número abajo (4), se ve claro que 3 es mayor que 2! 🍫 Ejemplo Chocolates: Si comés 1 pedazo de 2 (1/2), en una barra de 6 pedazos serían 3/6. Si otro comió 4/6, ¡comió más porque 4 pedazos de 6 es más que 3 de 6! 🎯 En tu misión: Llevá las dos fracciones al mismo número de abajo para poder comparar los números de arriba directamente.";
    } else {
      explicacion = "Detecté un desvío general de cálculo. Revisá la operación paso a paso con lápiz y papel antes de responder.";
    }

    setQueMeEquivoqueTexto(explicacion);
    setShowQueMeEquivoqueModal(true);
    setCopilotMood("thinking");
    addBitacora(`🤔 Consultó '¿En qué me estoy equivocando?' en Misión ${misionActual.toUpperCase()}`, false, null);
  };

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes barrelWobble {
          0% { transform: rotate(0deg) scale(1); }
          15% { transform: rotate(-12deg) translateX(-6px) scale(1.05); }
          30% { transform: rotate(12deg) translateX(6px) scale(1.05); }
          45% { transform: rotate(-10deg) translateX(-4px); }
          60% { transform: rotate(10deg) translateX(4px); }
          75% { transform: rotate(-6deg) translateX(-2px); }
          100% { transform: rotate(0deg) scale(1); }
        }
        @keyframes barrelFall {
          0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; filter: drop-shadow(0 0 0 transparent); }
          20% { transform: translateY(18px) rotate(25deg) scale(1.05); filter: drop-shadow(0 0 12px #ef4444); }
          50% { transform: translateY(70px) rotate(110deg) scale(0.9); opacity: 0.85; }
          80% { transform: translateY(120px) rotate(210deg) scale(0.7); opacity: 0.5; filter: drop-shadow(0 0 20px #dc2626); }
          100% { transform: translateY(170px) rotate(320deg) scale(0.3); opacity: 0; filter: blur(4px); }
        }
        @keyframes screenShake {
          0% { transform: translate(0, 0); }
          20% { transform: translate(-8px, 5px); }
          40% { transform: translate(8px, -5px); }
          60% { transform: translate(-5px, 3px); }
          80% { transform: translate(5px, -3px); }
          100% { transform: translate(0, 0); }
        }
        @keyframes boxWobble {
          0% { transform: scale(1) rotate(0deg); }
          20% { transform: scale(1.06) rotate(-8deg); }
          40% { transform: scale(0.95) rotate(8deg); }
          60% { transform: scale(1.04) rotate(-5deg); }
          80% { transform: scale(0.98) rotate(5deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes cargoEject {
          0% { transform: translateY(0) scale(1) rotate(0deg); opacity: 1; filter: drop-shadow(0 0 0 transparent); }
          25% { transform: translateY(-12px) scale(1.1) rotate(-12deg); filter: drop-shadow(0 0 16px #ec4899); }
          50% { transform: translateY(50px) scale(0.8) rotate(35deg); opacity: 0.8; }
          75% { transform: translateY(110px) scale(0.5) rotate(90deg); opacity: 0.4; filter: drop-shadow(0 0 20px #ef4444); }
          100% { transform: translateY(180px) scale(0.1) rotate(160deg); opacity: 0; filter: blur(6px); }
        }
        @keyframes boxCompressDock {
          0% { transform: scale(1) translateY(0); filter: brightness(1); }
          50% { transform: scale(1.12) translateY(-10px); filter: brightness(1.5) drop-shadow(0 0 25px #10b981); }
          100% { transform: scale(1.05) translateY(-6px); filter: brightness(1.3) drop-shadow(0 0 20px #34d399); }
        }
        @keyframes drumDock {
          0% { transform: scale(1) translateY(0); filter: brightness(1); }
          50% { transform: scale(1.12) translateY(-12px); filter: brightness(1.5) drop-shadow(0 0 25px #10b981); }
          100% { transform: scale(1.08) translateY(-8px); filter: brightness(1.3) drop-shadow(0 0 20px #34d399); }
        }
        @keyframes redAlertFlash {
          0% { background-color: rgba(239, 68, 68, 0.15); border-color: #ef4444; }
          100% { background-color: rgba(239, 68, 68, 0.35); border-color: #f87171; box-shadow: 0 0 15px rgba(239, 68, 68, 0.5); }
        }
        @keyframes floatXPAnim {
          0% { transform: translate(-50%, 0) scale(0.8); opacity: 0; }
          20% { transform: translate(-50%, -20px) scale(1.3); opacity: 1; filter: drop-shadow(0 0 12px #eab308); }
          80% { transform: translate(-50%, -50px) scale(1.1); opacity: 1; filter: drop-shadow(0 0 20px #eab308); }
          100% { transform: translate(-50%, -80px) scale(0.9); opacity: 0; }
        }
        @keyframes antennaPulse {
          0% { box-shadow: 0 0 4px #38bdf8; transform: scale(1); }
          50% { box-shadow: 0 0 16px #38bdf8, 0 0 24px #38bdf8; transform: scale(1.25); }
          100% { box-shadow: 0 0 4px #38bdf8; transform: scale(1); }
        }
        button { transition: transform 0.12s ease, box-shadow 0.2s ease, filter 0.2s ease !important; }
        button:active { transform: scale(0.95) !important; filter: brightness(1.2); }
        button:hover { filter: brightness(1.1); box-shadow: 0 0 12px rgba(56, 189, 248, 0.4); }
        @keyframes streak { 0% { transform: translateX(-150vw); } 100% { transform: translateX(150vw); } }
        @keyframes glowFlash { 0% { background-color: rgba(3, 8, 24, 0.4); } 50% { background-color: rgba(56, 189, 248, 0.25); } 100% { background-color: rgba(3, 8, 24, 0.8); } }
      `}</style>
      {transitioning && <HyperspaceJump />}

      {/* ────────────────────────────────────────────────────────── */}
      {/* 1. CUESTIONARIO DE INGRESO (AL INICIAR)                   */}
      {/* ────────────────────────────────────────────────────────── */}
      {faseGlobal === "ingreso" && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={{ fontSize: "40px", textAlign: "center", marginBottom: "8px" }}>🛸</div>
            <h2 style={{ fontSize: "20px", color: "#38bdf8", textAlign: "center", margin: "0 0 6px 0" }}>
              EduMisión Córdoba · Cuestionario de Ingreso
            </h2>
            <p style={{ fontSize: "13px", color: "#94a3b8", textAlign: "center", marginBottom: "20px" }}>
              Ingresá tus datos de estudiante para registrar tu cabina espacial.
            </p>

            <form onSubmit={handleGuardarPerfilIngreso} style={styles.formGrid}>
              <div>
                <label style={styles.fieldLabel}>Nick / Apodo del Alumno/a:</label>
                <input
                  type="text"
                  placeholder="Ej: Nico_Space, Valen_2026"
                  value={perfilAlumno.nickname}
                  onChange={(e) => setPerfilAlumno({ ...perfilAlumno, nickname: e.target.value })}
                  style={styles.formInput}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={styles.fieldLabel}>Año / Curso:</label>
                  <select
                    value={perfilAlumno.curso}
                    onChange={(e) => setPerfilAlumno({ ...perfilAlumno, curso: e.target.value })}
                    style={styles.formSelect}
                  >
                    <option value="1° Año">1° Año</option>
                    <option value="2° Año">2° Año</option>
                    <option value="3° Año">3° Año</option>
                  </select>
                </div>
                <div>
                  <label style={styles.fieldLabel}>Edad:</label>
                  <input
                    type="number"
                    value={perfilAlumno.edad}
                    onChange={(e) => setPerfilAlumno({ ...perfilAlumno, edad: e.target.value })}
                    style={styles.formInput}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={styles.fieldLabel}>Escuela / Institución:</label>
                <select
                  value={tipoEscuela}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTipoEscuela(val);
                    const finalEscuela = val === "Otra" ? escuelaOtra : val;
                    setPerfilAlumno({ ...perfilAlumno, escuela: finalEscuela });
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
              </div>

              {tipoEscuela === "Otra" && (
                <div style={{ marginTop: "10px" }}>
                  <label style={styles.fieldLabel}>Nombre de la Escuela:</label>
                  <input
                    type="text"
                    placeholder="Ej: Colegio Manuel Belgrano"
                    value={escuelaOtra}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEscuelaOtra(val);
                      setPerfilAlumno({ ...perfilAlumno, escuela: val });
                    }}
                    style={styles.formInput}
                    required
                  />
                </div>
              )}

              <button type="submit" style={styles.btnFormSubmit}>
                🚀 REGISTRAR CABINA E INICIAR
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* 2. CARTEL DE BIENVENIDA Y REGLAS (SIN PENALIZACIÓN DE XP)  */}
      {/* ────────────────────────────────────────────────────────── */}
      {faseGlobal === "bienvenida" && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={{ fontSize: "40px", textAlign: "center", marginBottom: "8px" }}>🪐</div>
            <h2 style={{ fontSize: "20px", color: "#38bdf8", textAlign: "center", margin: "0 0 6px 0" }}>
              ¡Hola, {perfilAlumno.nickname}!
            </h2>
            <p style={{ fontSize: "13px", color: "#cbd5e1", textAlign: "center", marginBottom: "20px" }}>
              Te damos la bienvenida a <strong>EduMisión Córdoba</strong>.
            </p>

            <div style={styles.rulesList}>
              <div style={styles.ruleItem}>
                <span style={{ fontSize: "22px" }}>📝</span>
                <div>
                  <strong style={{ color: "#38bdf8" }}>Lápiz y Papel:</strong> Hacé las cuentas a mano en tu cuaderno antes de responder.
                </div>
              </div>
              <div style={styles.ruleItem}>
                <span style={{ fontSize: "22px" }}>🚫</span>
                <div>
                  <strong style={{ color: "#f87171" }}>Sin Calculadoras:</strong> Ejercitá tu propio razonamiento matemático.
                </div>
              </div>
              <div style={styles.ruleItem}>
                <span style={{ fontSize: "22px" }}>⚡</span>
                <div>
                  <strong style={{ color: "#4ade80" }}>XP Resiliente:</strong> Los errores NO te restan puntos. Cada reintento suma experiencia.
                </div>
              </div>
            </div>

            <button
              onClick={() => setFaseGlobal("juego")}
              style={styles.btnFormSubmit}
            >
              🎮 ABRIR TABLERO DE MISIONES
            </button>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* 3. PANTALLA PRINCIPAL DE JUEGO (LAYOUT COMPLETO REQUERIDO)  */}
      {/* ────────────────────────────────────────────────────────── */}
      {faseGlobal === "juego" && (
        <>
          {/* CABECERA DE PERFIL DEL ALUMNO */}
          <header style={styles.topHeader}>
            {(() => {
              const gear = getEquipamientoEvolutivo(misionesCompletadas.length);
              return (
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "34px", filter: "drop-shadow(0 0 8px rgba(56,189,248,0.5))" }}>{gear.avatarIcon}</span>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "16px", fontWeight: "bold", color: "#38bdf8" }}>
                        {perfilAlumno.nickname || "Explorador/a"}
                      </span>
                      <span style={{ backgroundColor: "rgba(15, 23, 42, 0.8)", border: `1px solid ${gear.badgeColor}`, color: gear.badgeColor, fontSize: "10px", padding: "2px 8px", borderRadius: "10px", fontWeight: "bold" }}>
                        {gear.rango}
                      </span>
                    </div>
                    <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "2px" }}>
                      🪖 {gear.casco} · {perfilAlumno.escuela} ({perfilAlumno.curso})
                    </div>
                  </div>
                </div>
              );
            })()}

            {misionesCompletadas.length === 4 && (
              <button
                onClick={() => setFaseGlobal("cierre")}
                style={styles.btnCuestionarioCierreTop}
              >
                📝 COMPLETAR CUESTIONARIO DE CIERRE
              </button>
            )}
          </header>

          {/* LÍNEA BARRA XP */}
          <div style={styles.xpCardFullWidth}>
            <div style={styles.xpHeaderRow}>
              <span style={{ fontSize: "13px", fontWeight: "bold", color: "#cbd5e1" }}>
                EXPERIENCIA GANADA EN MISIONES LOGRADAS:
              </span>
              <span style={{ fontSize: "24px", fontWeight: "900", color: "#38bdf8" }}>
                {xpTotal} / 750 XP
              </span>
            </div>

            <div style={styles.progressBarBg}>
              <div style={{ ...styles.progressBarFill, width: `${Math.min(100, (xpTotal / 750) * 100)}%` }} />
            </div>

            {/* VISTA DE EQUIPAMIENTO EVOLUTIVO DESBLOQUEADO */}
            <div style={{ marginTop: "12px", paddingTop: "10px", borderTop: "1px solid #1e293b", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
              {(() => {
                const gear = getEquipamientoEvolutivo(misionesCompletadas.length);
                return (
                  <>
                    <div style={{ fontSize: "11px", color: "#cbd5e1", fontWeight: "bold", display: "flex", alignItems: "center", gap: "6px" }}>
                      <span>🚀 NAVE Y MEJORAS ACTIVAS:</span>
                      <span style={{ color: "#38bdf8", fontStyle: "italic" }}>{gear.naveMejora}</span>
                    </div>
                    <div style={{ fontSize: "11px", color: gear.badgeColor, fontWeight: "bold" }}>
                      🪖 EQUIPO: {gear.casco}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          {/* ÁRBOL DE MISIONES (DONDE SE NOTEN LAS MISIONES COMPLETADAS) */}
          <div style={styles.arbolMisionesCard}>
            <div style={{ fontSize: "12px", fontWeight: "bold", color: "#38bdf8", marginBottom: "10px", letterSpacing: "1px" }}>
              🗺️ ÁRBOL DE MISIONES Y TRAYECTORIA ORBITAL
            </div>

            <div style={styles.tacticalGrid4}>
              {[
                { id: "m1", label: "M1: Reserva de Agua", xp: "100 XP" },
                { id: "m2", label: "M2: Combustible", xp: "150 XP" },
                { id: "m3", label: "M3: Víveres", xp: "200 XP" },
                { id: "m4", label: "M4: Travesía Integrada", xp: "300 XP" }
              ].map((m) => {
                const esCompletada = misionesCompletadas.includes(m.id);
                const esActiva = misionActual === m.id;

                let borderStyle = "1px solid #1e293b";
                let bgStyle = "rgba(2, 4, 14, 0.7)";
                let statusLabel = "🔒 BLOQUEADA";
                let statusColor = "#64748b";

                if (esCompletada) {
                  borderStyle = "2px solid #10b981";
                  bgStyle = "rgba(16, 185, 129, 0.2)";
                  statusLabel = "✔ COMPLETADA";
                  statusColor = "#4ade80";
                } else if (esActiva) {
                  borderStyle = "2px solid #38bdf8";
                  bgStyle = "rgba(56, 189, 248, 0.2)";
                  statusLabel = "⚡ EN CURSO";
                  statusColor = "#38bdf8";
                } else if (m.id === "m1" || misionesCompletadas.includes("m1") && m.id === "m2" || misionesCompletadas.includes("m2") && m.id === "m3" || misionesCompletadas.includes("m3") && m.id === "m4") {
                  statusLabel = "🚀 DISPONIBLE";
                  statusColor = "#fef08a";
                }

                return (
                  <button
                    key={m.id}
                    onClick={() => cambiarMision(m.id)}
                    disabled={statusLabel === "🔒 BLOQUEADA"}
                    style={{
                      padding: "12px",
                      borderRadius: "10px",
                      border: borderStyle,
                      backgroundColor: bgStyle,
                      textAlign: "left",
                      cursor: "pointer",
                      boxShadow: esActiva ? "0 0 15px rgba(56, 189, 248, 0.3)" : "none"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: "bold" }}>
                      <span style={{ color: statusColor }}>{statusLabel}</span>
                      <span style={{ color: "#eab308" }}>{m.xp}</span>
                    </div>
                    <div style={{ fontSize: "14px", fontWeight: "bold", color: "#ffffff", marginTop: "6px" }}>
                      {m.label}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* GRID PRINCIPAL: DEBAJO IZQ MISIONES, DEBAJO DER EDUBOT Y BITÁCORA */}
          <div style={styles.mainTwoColumnLayout}>
            
            {/* COLUMNA IZQUIERDA: LAS MISIONES */}
            <div style={styles.leftMissionColumn}>
              <div style={styles.cardBox}>
                
                {/* ────────────────────────────────────── */}
                {/* FASE: INICIO DE MISIÓN                */}
                {/* ────────────────────────────────────── */}
                {faseMision === "inicio" && (
                  <div>
                    <div style={{ fontSize: "40px", textAlign: "center", marginBottom: "8px" }}>🤖</div>
                    <h2 style={{ fontSize: "18px", color: "#ffffff", textAlign: "center", margin: "0 0 12px 0" }}>
                      {misionActual === "m1" && dataM1.title}
                      {misionActual === "m2" && dataM2.title}
                      {misionActual === "m3" && dataM3.title}
                      {misionActual === "m4" && dataM4.title}
                    </h2>

                    <div style={styles.bannerContexto}>
                      📢 <strong>INFORMACIÓN DE LA MISIÓN:</strong><br />
                      {misionActual === "m1" && "Ahora vamos a sumar fracciones con el MISMO DENOMINADOR. Mantenemos la base y sumamos los números de arriba."}
                      {misionActual === "m2" && "Ahora vamos a sumar fracciones con DIFERENTE DENOMINADOR (múltiplo simple). ¡Atención a la base común!"}
                      {misionActual === "m3" && "Ahora vamos a sumar denominadores diferentes y SIMPLIFICAR el resultado a su fracción irreducible."}
                      {misionActual === "m4" && "Ahora vamos a INTEGRAR todo lo desarrollado en las misiones anteriores (Suma Triple + Simplificación + Justificación)."}
                    </div>

                    <p style={{ fontSize: "13px", color: "#cbd5e1", lineHeight: "1.5", textAlign: "center", marginBottom: "18px" }}>
                      Podés ver una simulación guiada con EduBot o ir directo a resolver tu prueba.
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {misionActual !== "m4" ? (
                        <button onClick={() => setFaseMision("simulacro")} style={styles.btnSimulacro}>
                          ▶️ VER CÓMO SE HACE (Simulacro EduBot)
                        </button>
                      ) : (
                        <button onClick={() => { setFaseMision("desafio"); setM4StepIndex(1); }} style={styles.btnSimulacro}>
                          🚀 INICIAR MISIÓN INTEGRADORA M4
                        </button>
                      )}
                      {misionActual !== "m4" && (
                        <button onClick={() => setFaseMision("desafio")} style={styles.btnDirecto}>
                          🚀 Ir directo a la prueba real
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* ────────────────────────────────────── */}
                {/* FASE: SIMULACRO GUIADO PASO A PASO     */}
                {/* ────────────────────────────────────── */}
                {faseMision === "simulacro" && (
                  <div style={{ textAlign: "center" }}>
                    {/* M1 SIMULACRO */}
                    {misionActual === "m1" && (
                      <>
                        <div style={styles.bannerDemo}>🤖 SIMULACRO EDUBOT M1 (Paso {pasoDemo} de 3)</div>
                        <div style={styles.ecuacionDemoBox}>
                          <span style={{ fontSize: "28px", fontWeight: "bold", color: "#ffffff" }}>
                            {pasoDemo === 1 && "1/5 + 2/5 = ?"}
                            {pasoDemo === 2 && "1/5 + 2/5 = ?"}
                            {pasoDemo === 3 && "1/5 + 2/5 = 3/5"}
                          </span>
                        </div>
                        <div style={styles.explicacionBox}>
                          {pasoDemo === 1 && <p style={{ margin: 0 }}>1️⃣ <strong>Mismo denominador (5):</strong> Observamos que ambos bidones tienen el mismo número abajo (5). Por lo tanto, la base del tanque no cambia.</p>}
                          {pasoDemo === 2 && <p style={{ margin: 0 }}>2️⃣ <strong>Sumamos arriba:</strong> Sumamos únicamente los números de arriba: 1 + 2 = 3.</p>}
                          {pasoDemo === 3 && <p style={{ margin: 0 }}>3️⃣ <strong>Resultado de la demostración:</strong> El tanque queda cargado en <strong>3/5 de agua</strong> (reemplazando el signo ?).</p>}
                        </div>
                        {pasoDemo < 3 ? (
                          <button onClick={() => setPasoDemo((p) => p + 1)} style={styles.btnFlechita}>
                            Siguiente Paso ➔
                          </button>
                        ) : (
                          <button onClick={() => setFaseMision("transicion")} style={styles.btnContinuar}>
                            ➔ Entendido · Cambiar cantidades e ir a mi desafío
                          </button>
                        )}
                      </>
                    )}

                    {/* M2 SIMULACRO */}
                    {misionActual === "m2" && (
                      <>
                        <div style={styles.bannerDemo}>🧪 SIMULADOR M2: Selecciona el Numerador Correcto</div>
                        <div style={styles.ecuacionDemoBox}>
                          <span style={{ fontSize: "26px", fontWeight: "bold", color: "#ffffff" }}>
                            1/3 + 1/6 = <span style={{ color: "#38bdf8" }}>?</span> / 6
                          </span>
                        </div>
                        <p style={{ fontSize: "14px", color: "#cbd5e1", lineHeight: "1.5", marginBottom: "14px" }}>
                          El menor común denominador entre 3 y 6 es <strong>6</strong>. Como 1/3 equivale a 2/6, al sumar 2/6 + 1/6 nos queda una fracción sobre 6.<br />
                          <strong>¿Cuál es el numerador correcto (?) que debe ir arriba?</strong>
                        </p>
                        <div style={styles.opcionesGrid6}>
                          {["1", "2", "3", "4", "5", "6"].map((num) => (
                            <button
                              key={num}
                              onClick={() => {
                              setM2SimulacroNum(num);
                              setStatsPorMision((prev) => {
                                const cur = prev[misionActual] || { intentosSimulacro: 0, intentosDesafio: 0, errores: 0, ayudas: 0, consultasQueMeEquivoque: 0, segundosResolucion: 0, ultimoError: null };
                                return { ...prev, [misionActual]: { ...cur, intentosSimulacro: (cur.intentosSimulacro || 0) + 1 } };
                              });
                            }}
                              style={{
                                padding: "14px",
                                borderRadius: "8px",
                                border: m2SimulacroNum === num ? (num === "3" ? "2px solid #10b981" : "2px solid #ef4444") : "1px solid #334155",
                                backgroundColor: m2SimulacroNum === num ? (num === "3" ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)") : "#1e293b",
                                color: "#fff",
                                fontSize: "16px",
                                fontWeight: "bold",
                                cursor: "pointer"
                              }}
                            >
                              {num}
                            </button>
                          ))}
                        </div>
                        {m2SimulacroNum && (
                          <div style={{ marginTop: "14px", textAlign: "left" }}>
                            {m2SimulacroNum === "3" ? (
                              <div style={{ padding: "12px", borderRadius: "8px", border: "1px solid #10b981", backgroundColor: "rgba(16,185,129,0.1)" }}>
                                <p style={{ margin: 0, fontWeight: "bold", color: "#4ade80" }}>🎉 ¡EXCELENTE! 2 + 1 = 3.</p>
                                <p style={{ margin: "4px 0 10px 0", fontSize: "13px", color: "#cbd5e1" }}>La operación completa da 3/6. ¡Estás listo para tu desafío!</p>
                                <button onClick={() => setFaseMision("transicion")} style={styles.btnContinuar}>
                                  ➔ ¡Logrado! Ir a la Operación Real M2
                                </button>
                              </div>
                            ) : (
                              <div style={{ padding: "12px", borderRadius: "8px", border: "1px solid #ef4444", backgroundColor: "rgba(239,68,68,0.1)", color: "#f87171", fontSize: "13px" }}>
                                ⚠️ Recordá que 1/3 equivale a 2/6. Sumando 2/6 + 1/6 = 3/6. Probá seleccionar 3.
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}

                    {/* M3 SIMULACRO */}
                    {misionActual === "m3" && (
                      <>
                        <div style={styles.bannerDemo}>📦 SIMULADOR M3: Ejemplo de Simplificación de Fracción</div>
                        <div style={styles.ecuacionDemoBox}>
                          <span style={{ fontSize: "26px", fontWeight: "bold", color: "#ffffff" }}>
                            Ejemplo: 3/6 = <span style={{ color: "#38bdf8" }}>?</span>
                          </span>
                        </div>
                        <p style={{ fontSize: "14px", color: "#cbd5e1", lineHeight: "1.5", marginBottom: "14px" }}>
                          En la Misión 3 aprendemos a simplificar dividiendo numerador y denominador por el mismo número.<br />
                          <strong>Si la suma te da 3/6, ¿cuál es su versión simplificada irreducible?</strong>
                        </p>
                        <div style={styles.opcionesGrid6}>
                          {["1/2", "1/3", "3/6", "2/3", "1/6", "3/3"].map((frac) => (
                            <button
                              key={frac}
                              onClick={() => {
                              setM3SimulacroAns(frac);
                              setStatsPorMision((prev) => {
                                const cur = prev[misionActual] || { intentosSimulacro: 0, intentosDesafio: 0, errores: 0, ayudas: 0, consultasQueMeEquivoque: 0, segundosResolucion: 0, ultimoError: null };
                                return { ...prev, [misionActual]: { ...cur, intentosSimulacro: (cur.intentosSimulacro || 0) + 1 } };
                              });
                            }}
                              style={{
                                padding: "14px",
                                borderRadius: "8px",
                                border: m3SimulacroAns === frac ? (frac === "1/2" ? "2px solid #10b981" : "2px solid #ef4444") : "1px solid #334155",
                                backgroundColor: m3SimulacroAns === frac ? (frac === "1/2" ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)") : "#1e293b",
                                color: "#fff",
                                fontSize: "16px",
                                fontWeight: "bold",
                                cursor: "pointer"
                              }}
                            >
                              {frac}
                            </button>
                          ))}
                        </div>
                        {m3SimulacroAns && (
                          <div style={{ marginTop: "14px", textAlign: "left" }}>
                            {m3SimulacroAns === "1/2" ? (
                              <div style={{ padding: "12px", borderRadius: "8px", border: "1px solid #10b981", backgroundColor: "rgba(16,185,129,0.1)" }}>
                                <p style={{ margin: 0, fontWeight: "bold", color: "#4ade80" }}>🎉 ¡CORRECTO! Dividiendo 3/6 por 3 nos da 1/2.</p>
                                <p style={{ margin: "4px 0 10px 0", fontSize: "13px", color: "#cbd5e1" }}>Ahora vas a resolver una operación real con simplificación.</p>
                                <button onClick={() => setFaseMision("transicion")} style={styles.btnContinuar}>
                                  ➔ ¡Logrado! Ir a la Operación Real M3
                                </button>
                              </div>
                            ) : (
                              <div style={{ padding: "12px", borderRadius: "8px", border: "1px solid #ef4444", backgroundColor: "rgba(239,68,68,0.1)", color: "#f87171", fontSize: "13px" }}>
                                ⚠️ 3/6 se puede simplificar dividiendo arriba y abajo por 3, obteniendo 1/2.
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* ────────────────────────────────────── */}
                {/* FASE: TRANSICIÓN A LA PRUEBA REAL       */}
                {/* ────────────────────────────────────── */}
                {faseMision === "transicion" && (
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "44px", marginBottom: "8px" }}>🚀</div>
                    <h2 style={{ color: "#a855f7", margin: "0 0 10px 0" }}>¡AHORA TE TOCA A VOS, EXPLORADOR/A!</h2>
                    <p style={{ color: "#cbd5e1", fontSize: "14px", lineHeight: "1.5" }}>
                      EduBot preparó tu prueba con números propios. Usá lo que aprendiste para resolver.
                    </p>
                    <button onClick={() => setFaseMision("desafio")} style={styles.btnComenzarDesafio}>
                      🎮 ABRIR MANDOS Y RESOLVER
                    </button>
                  </div>
                )}

                {/* ────────────────────────────────────── */}
                {/* FASE: DESAFÍO REAL Y PASOS DE M4       */}
                {/* ────────────────────────────────────── */}
                {(faseMision === "desafio" || faseMision === "exito") && (
                  <div>

                    {/* M1, M2 Y M3 */}
                    {misionActual !== "m4" && (
                      <>
                        {/* 🎮 CONTROLES TÁCTILES POR MISIÓN (M1 Y M4) */}
                        {misionActual === "m1" && <M1WaterTankHUD equation={dataM1.equation} />}

                        <div style={styles.consignaBox}>
                          <span style={styles.labelConsigna}>🚰 TU DESAFÍO EN PANTALLA:</span>
                          <div style={styles.ecuacionReal}>
                            {misionActual === "m1" && dataM1.equation}
                            {misionActual === "m2" && dataM2.equation}
                            {misionActual === "m3" && dataM3.equation}
                          </div>
                        </div>

                        <div style={styles.opcionesGrid6}>
                          {misionActual === "m1" && dataM1.options.map((opt) => {
                            const esSeleccionado = opcionSeleccionada === opt.value;
                            let borderStyle = "1px solid #0284c7";
                            let bgStyle = "#0f172a";
                            if (esSeleccionado) {
                              borderStyle = opt.correct ? "2px solid #10b981" : "2px solid #ef4444";
                              bgStyle = opt.correct ? "rgba(16, 185, 129, 0.25)" : "rgba(239, 68, 68, 0.25)";
                            }
                            return (
                              <button
                                key={opt.id}
                                onClick={() => handleSeleccionarOpcion(opt)}
                                disabled={opcionSeleccionada !== null}
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  padding: "12px 8px",
                                  borderRadius: "10px",
                                  border: borderStyle,
                                  backgroundColor: bgStyle,
                                  color: "#ffffff",
                                  cursor: opcionSeleccionada !== null ? "not-allowed" : "pointer",
                                  boxShadow: esSeleccionado ? (opt.correct ? "0 0 16px rgba(16, 185, 129, 0.5)" : "0 0 16px rgba(239, 68, 68, 0.5)") : "none"
                                }}
                              >
                                <span style={{ fontSize: "9px", color: "#38bdf8", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "2px" }}>
                                  VÁLVULA {opt.id}
                                </span>
                                <span style={{ fontSize: "17px", fontWeight: "bold", color: "#ffffff" }}>
                                  💧 {opt.value}
                                </span>
                              </button>
                            );
                          })}

                          {misionActual === "m2" && (
                            <div style={{
                              gridColumn: "1 / -1",
                              backgroundColor: "#030712",
                              border: m2FallingId ? "2px solid #ef4444" : "2px solid #0284c7",
                              borderRadius: "14px",
                              padding: "16px",
                              marginBottom: "12px",
                              boxShadow: m2FallingId ? "0 0 30px rgba(239, 68, 68, 0.4)" : "0 8px 24px rgba(2, 132, 199, 0.25)",
                              position: "relative",
                              overflow: "hidden",
                              animation: m2FallingId ? "screenShake 0.4s ease-in-out" : "none",
                              transition: "all 0.3s ease"
                            }}>
                              <div style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "12px",
                                borderBottom: "1px solid #1e293b",
                                paddingBottom: "8px"
                              }}>
                                <span style={{ fontSize: "11px", fontWeight: "bold", color: "#38bdf8", textTransform: "uppercase", letterSpacing: "0.8px" }}>
                                  🛢️ ESTANTERÍA INDUSTRIAL DE COMBUSTIBLE
                                </span>
                                <span style={{
                                  fontSize: "10px",
                                  backgroundColor: m2FallingId ? "rgba(239, 68, 68, 0.2)" : "rgba(56, 189, 248, 0.15)",
                                  border: m2FallingId ? "1px solid #ef4444" : "1px solid #38bdf8",
                                  color: m2FallingId ? "#fca5a5" : "#7dd3fc",
                                  padding: "2px 8px",
                                  borderRadius: "10px",
                                  fontWeight: "bold"
                                }}>
                                  {m2FallingId ? "⚠️ COLAPSO DE TAMBORES" : "⚙️ ESTANTERÍA ESTABLE"}
                                </span>
                              </div>

                              <div style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr 1fr",
                                gap: "12px"
                              }}>
                                {dataM2.options.map((opt) => {
                                  const esSeleccionado = opcionSeleccionada === opt.value;
                                  const isWobbling = m2WobbleId === opt.id;
                                  const isFalling = m2FallingId === opt.id;

                                  let borderStyle = "2px solid #0284c7";
                                  let bgStyle = "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)";
                                  let transformStyle = "scale(1)";
                                  let animStyle = "none";

                                  if (isWobbling) {
                                    animStyle = "barrelWobble 0.25s infinite ease-in-out";
                                    borderStyle = "2px solid #ef4444";
                                    bgStyle = "linear-gradient(180deg, #450a0a 0%, #180202 100%)";
                                  }
                                  if (isFalling) {
                                    animStyle = "barrelFall 1.2s forwards ease-in";
                                    borderStyle = "2px solid #dc2626";
                                    bgStyle = "linear-gradient(180deg, #7f1d1d 0%, #2a0808 100%)";
                                  }

                                  if (esSeleccionado && opt.correct) {
                                    borderStyle = "2px solid #10b981";
                                    bgStyle = "linear-gradient(180deg, #064e3b 0%, #022c22 100%)";
                                    animStyle = "drumDock 1.2s infinite alternate ease-in-out";
                                  }

                                  return (
                                    <button
                                      key={opt.id}
                                      onClick={() => handleSeleccionarOpcion(opt)}
                                      disabled={opcionSeleccionada !== null || m2FallingId !== null}
                                      style={{
                                        position: "relative",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        padding: "14px 6px 10px 6px",
                                        borderRadius: "12px",
                                        border: borderStyle,
                                        background: bgStyle,
                                        color: "#ffffff",
                                        cursor: (opcionSeleccionada !== null || m2FallingId !== null) ? "not-allowed" : "pointer",
                                        transform: transformStyle,
                                        animation: animStyle,
                                        transition: "transform 0.2s ease, border-color 0.2s ease, background 0.2s ease",
                                        boxShadow: (esSeleccionado && opt.correct)
                                          ? "0 0 25px rgba(16, 185, 129, 0.8)"
                                          : (isWobbling || isFalling)
                                            ? "0 0 20px rgba(239, 68, 68, 0.6)"
                                            : "0 4px 12px rgba(0,0,0,0.6)"
                                      }}
                                    >
                                      <div style={{
                                        width: "32px",
                                        height: "6px",
                                        borderRadius: "50%",
                                        border: (isWobbling || isFalling) ? "1px solid #fca5a5" : "1px solid #38bdf8",
                                        backgroundColor: (isWobbling || isFalling) ? "#991b1b" : "#0369a1",
                                        marginBottom: "4px"
                                      }} />
                                      <div style={{ fontSize: "26px", lineHeight: "1", marginBottom: "2px" }}>
                                        🛢️
                                      </div>
                                      <div style={{ fontSize: "17px", fontWeight: "800", color: "#ffffff" }}>
                                        {opt.value}
                                      </div>
                                      <div style={{
                                        fontSize: "9px",
                                        color: (isWobbling || isFalling) ? "#fca5a5" : "#7dd3fc",
                                        fontWeight: "bold",
                                        marginTop: "2px"
                                      }}>
                                        TAMBOR {opt.id}
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>

                              {m2FallingId && (
                                <div style={{
                                  marginTop: "12px",
                                  padding: "10px",
                                  borderRadius: "8px",
                                  color: "#fca5a5",
                                  fontSize: "11px",
                                  textAlign: "center",
                                  fontWeight: "bold",
                                  animation: "redAlertFlash 0.8s infinite alternate"
                                }}>
                                  💥 ¡MEZCLA INCOMPATIBLE! El tambor colapsó y cayó de la estantería. Reordenando estructura...
                                </div>
                              )}
                            </div>
                          )}

                          {misionActual === "m3" && (
                            <div style={{
                              gridColumn: "1 / -1",
                              backgroundColor: "#0b0618",
                              border: m3RejectId ? "2px solid #ef4444" : "2px solid #a855f7",
                              borderRadius: "14px",
                              padding: "16px",
                              marginBottom: "12px",
                              boxShadow: m3RejectId ? "0 0 30px rgba(239, 68, 68, 0.4)" : "0 8px 24px rgba(168, 85, 247, 0.25)",
                              position: "relative",
                              overflow: "hidden",
                              animation: m3RejectId ? "screenShake 0.4s ease-in-out" : "none",
                              transition: "all 0.3s ease"
                            }}>
                              <div style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "12px",
                                borderBottom: "1px solid #3b0764",
                                paddingBottom: "8px"
                              }}>
                                <span style={{ fontSize: "11px", fontWeight: "bold", color: "#c084fc", textTransform: "uppercase", letterSpacing: "0.8px" }}>
                                  📦 BODEGA DE CARGA Y SIMPLIFICACIÓN DE VÍVERES
                                </span>
                                <span style={{
                                  fontSize: "10px",
                                  backgroundColor: m3RejectId ? "rgba(239, 68, 68, 0.2)" : "rgba(168, 85, 247, 0.2)",
                                  border: m3RejectId ? "1px solid #ef4444" : "1px solid #c084fc",
                                  color: m3RejectId ? "#fca5a5" : "#e9d5ff",
                                  padding: "2px 8px",
                                  borderRadius: "10px",
                                  fontWeight: "bold"
                                }}>
                                  {m3RejectId ? "⚠️ EYECIÓN DE RACIÓN NO VÁLIDA" : "⚙️ BODEGA ESTABLE"}
                                </span>
                              </div>

                              <div style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr 1fr",
                                gap: "12px"
                              }}>
                                {dataM3.options.map((opt) => {
                                  const esSeleccionado = opcionSeleccionada === opt.value;
                                  const isWobbling = m3WobbleId === opt.id;
                                  const isRejecting = m3RejectId === opt.id;

                                  let borderStyle = "2px solid #6b21a8";
                                  let bgStyle = "linear-gradient(180deg, #1e1138 0%, #0d071a 100%)";
                                  let transformStyle = "scale(1)";
                                  let animStyle = "none";

                                  if (isWobbling) {
                                    animStyle = "boxWobble 0.25s infinite ease-in-out";
                                    borderStyle = "2px solid #ef4444";
                                  }
                                  if (isRejecting) {
                                    animStyle = "cargoEject 1.2s forwards ease-in";
                                    borderStyle = "2px solid #dc2626";
                                  }

                                  if (esSeleccionado && opt.correct) {
                                    borderStyle = "2px solid #10b981";
                                    bgStyle = "linear-gradient(180deg, #064e3b 0%, #022c22 100%)";
                                    transformStyle = "translateY(-6px) scale(1.04)";
                                    animStyle = "boxCompressDock 0.6s forwards ease-out";
                                  }

                                  return (
                                    <button
                                      key={opt.id}
                                      onClick={() => handleSeleccionarOpcion(opt)}
                                      disabled={opcionSeleccionada !== null || m3RejectId !== null}
                                      style={{
                                        position: "relative",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justify: "center",
                                        padding: "14px 6px 10px 6px",
                                        borderRadius: "12px",
                                        border: borderStyle,
                                        background: bgStyle,
                                        color: "#ffffff",
                                        cursor: (opcionSeleccionada !== null || m3RejectId !== null) ? "not-allowed" : "pointer",
                                        transform: transformStyle,
                                        animation: animStyle,
                                        transition: "transform 0.2s ease, border-color 0.2s ease",
                                        boxShadow: (esSeleccionado && opt.correct)
                                          ? "0 0 20px rgba(16, 185, 129, 0.6)"
                                          : "0 4px 12px rgba(0,0,0,0.6)"
                                      }}
                                    >
                                      <div style={{
                                        display: "flex",
                                        justify: "space-between",
                                        alignItems: "center",
                                        width: "100%",
                                        padding: "0 4px",
                                        marginBottom: "4px"
                                      }}>
                                        <span style={{ fontSize: "8px", fontWeight: "bold", color: "#d8b4fe", textTransform: "uppercase" }}>
                                          MÓDULO {opt.id}
                                        </span>
                                        <span style={{ fontSize: "7px", backgroundColor: "rgba(168, 85, 247, 0.25)", color: "#f3e8ff", padding: "1px 4px", borderRadius: "4px" }}>
                                          🗜️ SIMPL
                                        </span>
                                      </div>
                                      <div style={{ fontSize: "28px", lineHeight: "1", margin: "2px 0 4px 0" }}>
                                        📦
                                      </div>
                                      <div style={{ fontSize: "18px", fontWeight: "800", color: "#ffffff" }}>
                                        {opt.value}
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>

                              {m3RejectId && (
                                <div style={{
                                  marginTop: "12px",
                                  padding: "8px 12px",
                                  backgroundColor: "rgba(239, 68, 68, 0.2)",
                                  border: "1px solid #ef4444",
                                  borderRadius: "8px",
                                  color: "#fca5a5",
                                  fontSize: "11px",
                                  textAlign: "center",
                                  fontWeight: "bold",
                                  animation: "redAlertFlash 0.5s infinite alternate"
                                }}>
                                  💥 ¡RACIÓN NO SIMPLIFICADA! El módulo no está en su versión irreducible. Eyectando contenedor y reordenando bodega...
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </>
                    )}


                    {/* MISIÓN INTEGRADORA M4 (CORREGIDA PARA QUE PASEN LOS PASOS) */}
                    {misionActual === "m4" && (
                      <>
                        {/* 🎮 CONTROL TÁCTICO M4 */}
                        <M4LaunchConsoleHUD m4StepIndex={m4StepIndex} />

                        <div style={styles.consignaBox}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={styles.labelConsigna}>🚀 MISIÓN 4 INTEGRADORA · PARTE {m4StepIndex} DE 3</span>
                            <span style={{ fontSize: "11px", backgroundColor: "#0284c7", color: "#fff", padding: "2px 8px", borderRadius: "4px", fontWeight: "bold" }}>
                              PASO {m4StepIndex}/3
                            </span>
                          </div>
                          <div style={{ fontSize: "18px", color: "#38bdf8", fontWeight: "bold", margin: "6px 0" }}>
                            {dataM4.equationStr}
                          </div>
                          <p style={{ fontSize: "14px", color: "#e2e8f0", margin: "6px 0 0 0", lineHeight: "1.4" }}>
                            {m4StepIndex === 1 && dataM4.part1.prompt}
                            {m4StepIndex === 2 && dataM4.part2.prompt}
                            {m4StepIndex === 3 && dataM4.part3.prompt}
                          </p>
                        </div>

                        <div style={styles.opcionesGrid6}>
                          {(m4StepIndex === 1 ? dataM4.part1.options : m4StepIndex === 2 ? dataM4.part2.options : dataM4.part3.options).map((opt) => {
                            const esSeleccionado = opcionSeleccionada === opt.value;
                            let borderStyle = "2px solid #38bdf8";
                            let bgStyle = "#03172c";

                            if (esSeleccionado) {
                              borderStyle = opt.correct ? "2px solid #10b981" : "2px solid #ef4444";
                              bgStyle = opt.correct ? "rgba(16, 185, 129, 0.25)" : "rgba(239, 68, 68, 0.25)";
                            }

                            return (
                              <button
                                key={opt.id}
                                onClick={() => handleSeleccionarOpcion(opt)}
                                disabled={opcionSeleccionada !== null}
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  padding: "12px 10px",
                                  borderRadius: "12px",
                                  border: borderStyle,
                                  backgroundColor: bgStyle,
                                  color: "#ffffff",
                                  cursor: opcionSeleccionada !== null ? "not-allowed" : "pointer",
                                  boxShadow: esSeleccionado
                                    ? (opt.correct ? "0 0 20px rgba(16, 185, 129, 0.6)" : "0 0 20px rgba(239, 68, 68, 0.6)")
                                    : "0 0 10px rgba(56, 189, 248, 0.2), inset 0 0 10px rgba(56, 189, 248, 0.1)",
                                  position: "relative"
                                }}
                              >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", marginBottom: "4px" }}>
                                  <span style={{ fontSize: "9px", fontWeight: "bold", color: "#38bdf8", textTransform: "uppercase", letterSpacing: "0.8px" }}>
                                    🕹️ COMANDO {opt.id}
                                  </span>
                                  <span style={{ fontSize: "8px", backgroundColor: "rgba(56, 189, 248, 0.2)", color: "#7dd3fc", padding: "1px 5px", borderRadius: "4px", fontWeight: "bold" }}>
                                    🟢 READY
                                  </span>
                                </div>
                                <div style={{ fontSize: "17px", fontWeight: "bold", color: "#ffffff", textAlign: "center", margin: "1px 0" }}>
                                  🚀 {opt.value}
                                </div>
                                <div style={{ fontSize: "8px", color: "#94a3b8", textAlign: "center", marginTop: "1px", fontWeight: "600" }}>
                                  PASO {m4StepIndex} · FUSIÓN ACTIVA
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}

                    {/* FEEDBACK INMEDIATO Y BOTÓN DE AVANCE EXPLÍCITO EN M4 */}
                    {feedback && (
                      <div style={{
                        padding: "14px",
                        borderRadius: "10px",
                        border: feedback.correct ? "1px solid #10b981" : "1px solid #ef4444",
                        backgroundColor: feedback.correct ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                        marginBottom: "16px"
                      }}>
                        <p style={{ margin: 0, fontWeight: "bold", fontSize: "15px", color: feedback.correct ? "#4ade80" : "#f87171" }}>
                          {feedback.correct ? "🎉 ¡CORRECTO!" : "⚠️ REVISÁ TU CÁLCULO"}
                        </p>
                        <p style={{ margin: "6px 0 0 0", fontSize: "13px", color: "#e2e8f0", lineHeight: "1.4" }}>
                          {feedback.fb}
                        </p>

                        {/* BOTÓN EXPLÍCITO DE PASO EN M4 */}
                        {misionActual === "m4" && feedback.correct && m4StepIndex < 3 && (
                          <button
                            onClick={avanzarPasoM4}
                            style={{
                              marginTop: "12px",
                              width: "100%",
                              padding: "12px",
                              borderRadius: "8px",
                              border: "none",
                              backgroundColor: "#38bdf8",
                              color: "#020308",
                              fontWeight: "bold",
                              fontSize: "13px",
                              cursor: "pointer"
                            }}
                          >
                            ➔ Avanzar a la Parte {m4StepIndex + 1} de M4
                          </button>
                        )}
                      </div>
                    )}

                    {/* RECOMPENSA DE ÉXITO */}
                    {faseMision === "exito" && (
                      <div style={styles.recompensaCard}>
                        {/* 🌟 BANNER DE TRIUNFO DE MISIÓN CUMPLIDA */}
                        <div style={{
                          backgroundColor: "rgba(234, 179, 8, 0.15)",
                          border: "2px solid #eab308",
                          borderRadius: "12px",
                          padding: "16px",
                          textAlign: "center",
                          boxShadow: "0 0 20px rgba(234, 179, 8, 0.3)",
                          marginBottom: "16px"
                        }}>
                          <div style={{ fontSize: "28px" }}>🚀 🌟 🏆</div>
                          <h2 style={{ color: "#fef08a", margin: "4px 0", fontSize: "20px", fontWeight: "bold" }}>
                            ¡TRIUNFO DE MISIÓN CUMPLIDA!
                          </h2>
                          <p style={{ color: "#e2e8f0", fontSize: "13px", margin: "4px 0" }}>
                            ¡Excelente deducción matemática, {perfilAlumno.nickname}!
                          </p>
                          <div style={{
                            display: "inline-block",
                            marginTop: "8px",
                            backgroundColor: "#eab308",
                            color: "#0f172a",
                            padding: "4px 14px",
                            borderRadius: "20px",
                            fontWeight: "bold",
                            fontSize: "12px"
                          }}>
                            {misionActual === "m4" ? "+250 XP Acreditados" : "+100 XP Acreditados"}
                          </div>
                        </div>

                        {/* 🏆 INSIGNIA DIFICULTAD SUPERADA (SI OCURRIÓ UN ERROR PREVIO) */}
                        {(statsPorMision[misionActual]?.errores || 0) > 0 && (
                          <div style={{
                            backgroundColor: "rgba(16, 185, 129, 0.15)",
                            border: "1px solid #10b981",
                            borderRadius: "10px",
                            padding: "12px",
                            marginBottom: "14px",
                            textAlign: "center",
                            boxShadow: "0 0 12px rgba(16, 185, 129, 0.2)"
                          }}>
                            <div style={{ fontSize: "15px", fontWeight: "bold", color: "#4ade80" }}>
                              🏆 INSIGNIA: Dificultad superada
                            </div>
                            <p style={{ fontSize: "12px", color: "#cbd5e1", margin: "4px 0 0 0", lineHeight: "1.4" }}>
                              Superaste los desvíos iniciales razonando en tu borrador. ¡Esa es la actitud de un/a verdadero/a comandante espacial!
                            </p>
                          </div>
                        )}

                        {misionActual === "m4" && (
                          <div style={{
                            backgroundColor: "rgba(168, 85, 247, 0.15)",
                            border: "1px solid #a855f7",
                            borderRadius: "10px",
                            padding: "14px",
                            marginBottom: "16px",
                            textAlign: "center"
                          }}>
                            <div style={{ fontSize: "14px", fontWeight: "bold", color: "#c084fc" }}>
                              🏅 INSIGNIA ACREDITADA: Ingeniero/a de Fusión Estelar
                            </div>

                            {habilidadDesbloqueada && (
                              <div style={{ fontSize: "12px", color: "#38bdf8", fontWeight: "bold", marginTop: "8px" }}>
                                ✨ NUEVA HABILIDAD DESBLOQUEADA PARA FUTURAS MISIONES:<br />
                                <span style={{ fontSize: "14px", color: "#fef08a" }}>{habilidadDesbloqueada}</span>
                              </div>
                            )}
                          </div>
                        )}

                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                          {misionActual !== "m4" ? (
                            <button onClick={handlePasarSiguienteMision} style={styles.btnPasarMision}>
                              ➔ Pasar a Misión {misionActual === "m1" ? "M2: Combustible" : misionActual === "m2" ? "M3: Víveres" : "M4: Despegue"}
                            </button>
                          ) : (
                            <button onClick={() => setFaseGlobal("cierre")} style={styles.btnPasarMision}>
                              📝 IR AL CUESTIONARIO DE CIERRE FINAL
                            </button>
                          )}

                          <button onClick={handleGenerarNuevas} style={styles.btnRepetirNuevosDatos}>
                            🔄 Generar nuevas operaciones para re-entrenar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* COLUMNA DERECHA: EDUBOT - AYUDAS Y BITÁCORA */}
            <div style={styles.rightSidebarColumn}>
              <EduBotCopilot
                mood={copilotMood}
                message={copilotMsg}
                onClickHelp={handlePedirPista}
                onClickQueMeEquivoque={handleConsultarQueMeEquivoque}
                errorWarning={errorWarning}
              />

              <div style={styles.bitacoraBox}>
                <div style={styles.bitacoraTitle}>📋 BITÁCORA DE NAVEGACIÓN Y REGISTRO XAPI</div>
                <div style={styles.bitacoraList}>
                  {bitacora.map((item) => (
                    <div key={item.id}>
                      <span style={{ color: "#64748b" }}>[{item.timestamp}]</span> {item.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* DEBAJO DE TODO: MENSAJE DE DOCENTE */}
          <div style={styles.fullWidthTeacherCard}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <span style={{ fontSize: "20px" }}>📢</span>
              <span style={{ fontSize: "13px", fontWeight: "bold", color: "#c084fc", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Transmisión de tu Profe en Vivo:
              </span>
            </div>
            <p style={{ fontSize: "14px", color: "#f1f5f9", margin: 0, fontStyle: "italic", lineHeight: "1.5" }}>
              "{teacherMessage}"
            </p>
          </div>
        </>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* 4. CUESTIONARIO DE CIERRE DE TRAYECTORIA                   */}
      {/* ────────────────────────────────────────────────────────── */}
      {faseGlobal === "cierre" && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCardWide}>
            <div style={{ fontSize: "40px", textAlign: "center", marginBottom: "8px" }}>🏆</div>
            <h2 style={{ fontSize: "20px", color: "#38bdf8", textAlign: "center", margin: "0 0 6px 0" }}>
              Cuestionario de Cierre de Travesía
            </h2>
            <p style={{ fontSize: "13px", color: "#cbd5e1", textAlign: "center", marginBottom: "20px" }}>
              ¡Felicitaciones {perfilAlumno.nickname}! Completaste las 4 misiones. Ayudanos con tus opiniones.
            </p>

            <form onSubmit={handleEnviarEncuestaCierre} style={styles.formGrid}>
              
              {/* P1 */}
              <div style={styles.surveyQuestionBox}>
                <label style={styles.surveyLabel}>1. ¿Ya sabías los temas de las misiones?</label>
                <div style={styles.radioGroup}>
                  {["Sí", "Más o menos", "Los aprendí acá"].map((opt) => (
                    <label key={opt} style={styles.radioOption}>
                      <input
                        type="radio"
                        name="conocimientoPrevio"
                        value={opt}
                        checked={encuestaCierre.conocimientoPrevio === opt}
                        onChange={(e) => setPerfilCierre({ ...encuestaCierre, conocimientoPrevio: e.target.value })}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>

              {/* P2 */}
              <div style={styles.surveyQuestionBox}>
                <label style={styles.surveyLabel}>2. ¿Te fueron útiles los simulacros en las primeras misiones?</label>
                <div style={styles.radioGroup}>
                  {["Sí", "Algo", "No"].map((opt) => (
                    <label key={opt} style={styles.radioOption}>
                      <input
                        type="radio"
                        name="utilidadSimulacros"
                        value={opt}
                        checked={encuestaCierre.utilidadSimulacros === opt}
                        onChange={(e) => setPerfilCierre({ ...encuestaCierre, utilidadSimulacros: e.target.value })}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>

              {/* P3 */}
              <div style={styles.surveyQuestionBox}>
                <label style={styles.surveyLabel}>3. ¿Te gustaría recibir información cuando se habiliten nuevas misiones?</label>
                <div style={styles.radioGroup}>
                  {["Sí", "No sé", "No"].map((opt) => (
                    <label key={opt} style={styles.radioOption}>
                      <input
                        type="radio"
                        name="recibirInformacion"
                        value={opt}
                        checked={encuestaCierre.recibirInformacion === opt}
                        onChange={(e) => setPerfilCierre({ ...encuestaCierre, recibirInformacion: e.target.value })}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>

              {/* P4 */}
              <div style={styles.surveyQuestionBox}>
                <label style={styles.surveyLabel}>4. ¿Recomendarías EduMisión?</label>
                <div style={styles.radioGroup}>
                  {["Sí", "No", "No sé"].map((opt) => (
                    <label key={opt} style={styles.radioOption}>
                      <input
                        type="radio"
                        name="recomendarEduMision"
                        value={opt}
                        checked={encuestaCierre.recomendarEduMision === opt}
                        onChange={(e) => setPerfilCierre({ ...encuestaCierre, recomendarEduMision: e.target.value })}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>

              {/* P5 */}
              <div style={styles.surveyQuestionBox}>
                <label style={styles.surveyLabel}>5. ¿Qué nos podrías decir para mejorar?</label>
                <textarea
                  placeholder="Escribí aquí tus sugerencias o comentarios..."
                  value={encuestaCierre.sugerenciasMejora}
                  onChange={(e) => setPerfilCierre({ ...encuestaCierre, sugerenciasMejora: e.target.value })}
                  style={styles.formTextarea}
                  rows={3}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button type="submit" style={styles.btnFormSubmit}>
                  ✉️ ENVIAR RESPUESTAS A CONTROL CENTRAL
                </button>
                <button
                  type="button"
                  onClick={() => setFaseGlobal("juego")}
                  style={styles.btnSecondary}
                >
                  Volver al Juego
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL ANDAMIAJE METACOGNITIVO: ¿EN QUÉ ME ESTOY EQUIVOCANDO? */}
      {showQueMeEquivoqueModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCardWide}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #1e293b", paddingBottom: "10px", marginBottom: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "28px" }}>🤔</span>
                <h3 style={{ margin: 0, color: "#fb923c", fontSize: "16px", fontWeight: "bold" }}>
                  EduBot · ¿En qué me estoy equivocando?
                </h3>
              </div>
              <button onClick={() => setShowQueMeEquivoqueModal(false)} style={{ background: "none", border: "none", color: "#94a3b8", fontSize: "20px", cursor: "pointer" }}>✕</button>
            </div>

            <div style={{ backgroundColor: "#02040e", border: "1px solid #38bdf8", borderRadius: "10px", padding: "16px", marginBottom: "16px" }}>
              <p style={{ margin: 0, fontSize: "14px", color: "#f8fafc", lineHeight: "1.6" }}>
                {queMeEquivoqueTexto}
              </p>
            </div>

            <button
              onClick={() => setShowQueMeEquivoqueModal(false)}
              style={styles.btnFormSubmit}
            >
              ➔ ¡ENTENDIDO, VOY A REVISAR EN MI CUADERNO!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 🎨 ESTILOS GENERALES
// ==========================================
const styles = {
  container: {
    maxWidth: "1050px",
    margin: "0 auto",
    padding: "16px",
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    backgroundColor: "#030712",
    color: "#f3f4f6",
    minHeight: "100vh",
    boxSizing: "border-box"
  },
  topHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #1f2937",
    paddingBottom: "12px",
    marginBottom: "16px"
  },
  btnCuestionarioCierreTop: {
    padding: "8px 14px",
    borderRadius: "8px",
    border: "1px solid #10b981",
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    color: "#4ade80",
    fontWeight: "bold",
    fontSize: "11px",
    cursor: "pointer"
  },
  xpCardFullWidth: {
    backgroundColor: "rgba(7, 12, 34, 0.8)",
    borderRadius: "12px",
    padding: "16px",
    border: "1px solid #1e293b",
    marginBottom: "16px"
  },
  xpHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px"
  },
  progressBarBg: {
    height: "22px",
    backgroundColor: "#02040e",
    borderRadius: "11px",
    overflow: "hidden",
    border: "2px solid #334155"
  },
  progressBarFill: {
    height: "100%",
    borderRadius: "11px",
    transition: "width 0.5s ease-in-out",
    background: "linear-gradient(90deg, #10b981, #38bdf8)"
  },
  arbolMisionesCard: {
    backgroundColor: "rgba(7, 12, 34, 0.8)",
    borderRadius: "12px",
    padding: "16px",
    border: "1px solid #1e293b",
    marginBottom: "16px"
  },
  tacticalGrid4: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "10px"
  },
  mainTwoColumnLayout: {
    display: "grid",
    gridTemplateColumns: "1.2fr 0.8fr",
    gap: "16px",
    marginBottom: "16px"
  },
  leftMissionColumn: {
    display: "flex",
    flexDirection: "column"
  },
  rightSidebarColumn: {
    display: "flex",
    flexDirection: "column"
  },
  cardBox: {
    backgroundColor: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "12px",
    padding: "18px"
  },
  bannerContexto: {
    backgroundColor: "rgba(56, 189, 248, 0.1)",
    border: "1px solid #38bdf8",
    borderRadius: "8px",
    padding: "12px",
    fontSize: "13px",
    color: "#e2e8f0",
    lineHeight: "1.4",
    marginBottom: "14px",
    textAlign: "left"
  },
  btnSimulacro: {
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#0284c7",
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: "13px",
    cursor: "pointer"
  },
  btnDirecto: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #334155",
    backgroundColor: "transparent",
    color: "#94a3b8",
    fontWeight: "bold",
    fontSize: "12px",
    cursor: "pointer"
  },
  bannerDemo: {
    backgroundColor: "rgba(234, 179, 8, 0.15)",
    border: "1px solid #eab308",
    color: "#fef08a",
    fontSize: "12px",
    fontWeight: "bold",
    padding: "6px",
    borderRadius: "6px",
    marginBottom: "12px"
  },
  ecuacionDemoBox: {
    backgroundColor: "#020617",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #1e293b",
    marginBottom: "12px"
  },
  explicacionBox: {
    backgroundColor: "#020617",
    border: "1px solid #334155",
    borderRadius: "8px",
    padding: "12px",
    fontSize: "13px",
    lineHeight: "1.4",
    color: "#e2e8f0",
    marginBottom: "12px",
    textAlign: "left"
  },
  btnFlechita: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#eab308",
    color: "#000000",
    fontWeight: "bold",
    fontSize: "13px",
    cursor: "pointer"
  },
  btnContinuar: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#a855f7",
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: "13px",
    cursor: "pointer",
    marginTop: "8px"
  },
  btnComenzarDesafio: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#10b981",
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: "13px",
    cursor: "pointer",
    marginTop: "12px"
  },
  consignaBox: {
    backgroundColor: "#020617",
    padding: "14px",
    borderRadius: "8px",
    border: "1px solid #1e293b",
    marginBottom: "14px"
  },
  labelConsigna: {
    fontSize: "11px",
    fontWeight: "bold",
    color: "#38bdf8",
    letterSpacing: "0.5px"
  },
  ecuacionReal: {
    fontSize: "26px",
    fontWeight: "bold",
    margin: "6px 0",
    color: "#ffffff"
  },
  opcionesGrid6: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px",
    marginBottom: "14px"
  },
  recompensaCard: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    border: "1px solid #10b981",
    padding: "14px",
    borderRadius: "8px",
    textAlign: "center",
    marginBottom: "14px"
  },
  btnPasarMision: {
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#10b981",
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: "13px",
    cursor: "pointer"
  },
  btnRepetirNuevosDatos: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #38bdf8",
    backgroundColor: "#0284c7",
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: "12px",
    cursor: "pointer"
  },
  bitacoraBox: {
    backgroundColor: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "10px",
    padding: "12px"
  },
  bitacoraTitle: {
    fontSize: "11px",
    fontWeight: "bold",
    color: "#38bdf8",
    letterSpacing: "1px",
    marginBottom: "6px"
  },
  bitacoraList: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    fontSize: "11px",
    color: "#94a3b8",
    fontFamily: "monospace",
    maxHeight: "160px",
    overflowY: "auto"
  },
  fullWidthTeacherCard: {
    backgroundColor: "rgba(139, 92, 246, 0.1)",
    border: "1px solid #8b5cf6",
    borderRadius: "10px",
    padding: "14px 18px",
    boxShadow: "0 0 10px rgba(139, 92, 246, 0.15)"
  },
  modalOverlay: {
    position: "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.8)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10000,
    padding: "16px"
  },
  modalCard: {
    width: "380px",
    backgroundColor: "#0f172a",
    border: "2px solid #38bdf8",
    borderRadius: "14px",
    padding: "20px"
  },
  modalCardWide: {
    width: "500px",
    maxWidth: "95%",
    backgroundColor: "#0f172a",
    border: "2px solid #38bdf8",
    borderRadius: "14px",
    padding: "20px",
    maxHeight: "90vh",
    overflowY: "auto"
  },
  formGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },
  fieldLabel: {
    fontSize: "12px",
    fontWeight: "bold",
    color: "#cbd5e1",
    marginBottom: "4px",
    display: "block"
  },
  formInput: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#02040e",
    border: "1px solid #334155",
    borderRadius: "6px",
    color: "#ffffff",
    fontSize: "13px",
    boxSizing: "border-box"
  },
  formSelect: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#02040e",
    border: "1px solid #334155",
    borderRadius: "6px",
    color: "#ffffff",
    fontSize: "13px",
    boxSizing: "border-box"
  },
  formTextarea: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#02040e",
    border: "1px solid #334155",
    borderRadius: "6px",
    color: "#ffffff",
    fontSize: "13px",
    boxSizing: "border-box",
    fontFamily: "inherit"
  },
  btnFormSubmit: {
    padding: "12px",
    backgroundColor: "#10b981",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "bold",
    fontSize: "13px",
    cursor: "pointer",
    marginTop: "6px"
  },
  btnSecondary: {
    padding: "12px",
    backgroundColor: "transparent",
    color: "#94a3b8",
    border: "1px solid #334155",
    borderRadius: "8px",
    fontWeight: "bold",
    fontSize: "13px",
    cursor: "pointer",
    marginTop: "6px"
  },
  rulesList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginBottom: "18px"
  },
  ruleItem: {
    display: "flex",
    gap: "10px",
    backgroundColor: "#02040e",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #1e293b",
    fontSize: "12px",
    alignItems: "center"
  },
  surveyQuestionBox: {
    backgroundColor: "#02040e",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #1e293b"
  },
  surveyLabel: {
    fontSize: "16px",
    fontWeight: "bold",
    color: "#38bdf8",
    marginBottom: "10px",
    display: "block",
    lineHeight: "1.4"
  },
  radioGroup: {
    display: "flex",
    gap: "16px",
    flexWrap: "wrap"
  },
  radioOption: {
    fontSize: "15px",
    fontWeight: "bold",
    color: "#f1f5f9",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    padding: "8px 14px",
    borderRadius: "8px",
    border: "1px solid #334155"
  }
};
