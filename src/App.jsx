import React, { useState, useEffect, useMemo } from "react";
import {
  User, Lock, Mail, Phone, MapPin, FileText, Search, ChevronLeft,
  ChevronRight, CheckCircle2, AlertCircle, Eye, EyeOff, LogOut,
  LogIn, UserPlus, KeyRound, Image as ImageIcon, X, Filter, Home,
  PlusCircle, ShieldCheck, Bell, ClipboardList, ThumbsUp, ChevronDown,
  ChevronUp, Flag, ClipboardCheck
} from "lucide-react";

/* ============================================================
   TOKENS DE DISEÑO
   ============================================================ */
const C = {
  bg: "#F6F5F1",
  card: "#FFFFFF",
  ink: "#1A2321",
  inkSoft: "#5B6660",
  line: "#DEDACD",
  primary: "#0F6B5C",
  primaryDark: "#0B4E42",
  primarySoft: "#E4EFEA",
  accent: "#C9992C",
  accentSoft: "#FCEFD9",
  danger: "#B3261E",
  dangerSoft: "#FBE7E6",
  success: "#1F6B4D",
};

const CATEGORIES = [
  "Espacio público",
  "Seguridad",
  "Medio ambiente",
  "Movilidad",
  "Cultura y recreación",
  "Servicios públicos",
];

const TAG_PALETTE = [
  { bg: "#E4EFEA", text: "#1F6B4D" },
  { bg: "#FCEFD9", text: "#9A6B12" },
  { bg: "#E6ECF5", text: "#33507A" },
  { bg: "#F3E6EC", text: "#8A3A57" },
  { bg: "#EAE6F5", text: "#5A3D8A" },
  { bg: "#EFEAE0", text: "#6B5A3D" },
];

const ESTADO_STYLE = {
  Pendiente: { bg: "#FCEFD9", text: "#9A6B12" },
  Aprobada: { bg: "#E4EFEA", text: "#1F6B4D" },
  Rechazada: { bg: "#FBE7E6", text: "#B3261E" },
};

const ESTADOS_REPORTE = ["Pendiente", "Revisión", "En proceso", "Solucionado", "Cerrado", "Rechazado"];

const ESTADO_REPORTE_STYLE = {
  Pendiente: { bg: "#FCEFD9", text: "#9A6B12" },
  "Revisión": { bg: "#E6ECF5", text: "#33507A" },
  "En proceso": { bg: "#EAE6F5", text: "#5A3D8A" },
  Solucionado: { bg: "#E4EFEA", text: "#1F6B4D" },
  Cerrado: { bg: "#EFEAE0", text: "#6B5A3D" },
  Rechazado: { bg: "#FBE7E6", text: "#B3261E" },
};

function tagColor(categoria) {
  const i = CATEGORIES.indexOf(categoria);
  return TAG_PALETTE[i >= 0 ? i % TAG_PALETTE.length : 0];
}

const makeId = (p) => `${p}_${Math.random().toString(36).slice(2, 9)}`;

/* ============================================================
   VALIDACIONES
   ============================================================ */
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const docRegex = /^\d{6,12}$/;
const phoneRegex = /^\d{7,10}$/;

function passwordChecks(pwd) {
  return {
    length: pwd.length >= 8,
    upper: /[A-Z]/.test(pwd),
    lower: /[a-z]/.test(pwd),
    number: /\d/.test(pwd),
    special: /[^A-Za-z0-9]/.test(pwd),
  };
}
function passwordIsValid(pwd) {
  const c = passwordChecks(pwd);
  return c.length && c.upper && c.lower && c.number && c.special;
}

/* ============================================================
   DATOS SEMILLA
   ============================================================ */
const seedUsers = [
  {
    id: "u-demo",
    nombreCompleto: "Vecino Demo",
    documento: "1020304050",
    correo: "demo@comunidad.co",
    telefono: "3001234567",
    direccion: "Cra 10 # 20-30, Barrio Central",
    password: "Demo1234!",
    rol: "ciudadano",
    notificaciones: [],
  },
  {
    id: "g-demo",
    nombreCompleto: "Gestora Demo",
    documento: "900000000",
    correo: "gestor@comunidad.co",
    telefono: "3009998888",
    direccion: "Oficina de la Junta de Acción Comunal",
    password: "Gestor123!",
    rol: "gestor",
    notificaciones: [],
  },
];

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

const seedPropuestasBase = [
  { titulo: "Parque infantil zona norte", categoria: "Espacio público", votos: 42, comentarios: 6, dias: 3 },
  { titulo: "Reciclaje comunitario por cuadras", categoria: "Medio ambiente", votos: 27, comentarios: 4, dias: 8 },
  { titulo: "Mejora de alumbrado calle 5", categoria: "Seguridad", votos: 35, comentarios: 9, dias: 15 },
  { titulo: "Reductores de velocidad en la entrada", categoria: "Movilidad", votos: 19, comentarios: 2, dias: 20 },
  { titulo: "Festival cultural de fin de año", categoria: "Cultura y recreación", votos: 51, comentarios: 12, dias: 40 },
  { titulo: "Reparación de fuga en acueducto", categoria: "Servicios públicos", votos: 30, comentarios: 5, dias: 45 },
  { titulo: "Ciclorruta hacia el parque principal", categoria: "Movilidad", votos: 22, comentarios: 3, dias: 55 },
  { titulo: "Cámaras en el punto de basuras", categoria: "Seguridad", votos: 18, comentarios: 1, dias: 65 },
  { titulo: "Huerta comunitaria en lote baldío", categoria: "Medio ambiente", votos: 12, comentarios: 2, dias: 75 },
  { titulo: "Torneo deportivo vecinal", categoria: "Cultura y recreación", votos: 9, comentarios: 0, dias: 90 },
  { titulo: "Bancas y sombra en el parque central", categoria: "Espacio público", votos: 14, comentarios: 3, dias: 100 },
  { titulo: "Revisión de presión de agua sector alto", categoria: "Servicios públicos", votos: 7, comentarios: 1, dias: 110 },
].map((p, idx) => ({
  id: `p${idx + 1}`,
  titulo: p.titulo,
  descripcion:
    "Descripción de ejemplo para la propuesta, pensada para mostrar cómo se vería el resumen en el listado de consulta ciudadana.",
  categoria: p.categoria,
  imagenNombre: null,
  estado: "Aprobada",
  autorId: "seed",
  autorNombre: "Vecino de la comunidad",
  fechaCreacion: daysAgo(p.dias),
  votosBase: p.votos,
  votantes: [],
  comentarios: p.comentarios,
}));

seedPropuestasBase.push({
  id: "p13",
  titulo: "Mantenimiento de la cancha múltiple",
  descripcion:
    "Propuesta creada por el usuario demo para mostrar cómo funciona el estado Pendiente y su visibilidad restringida.",
  categoria: "Cultura y recreación",
  imagenNombre: null,
  estado: "Pendiente",
  autorId: "u-demo",
  autorNombre: "Vecino Demo",
  fechaCreacion: daysAgo(0),
  votosBase: 0,
  votantes: [],
  comentarios: 0,
});

const seedReportes = [
  {
    id: "r1",
    descripcion: "Hueco grande en la vía principal que está afectando el tránsito de vehículos y motos.",
    categoria: "Movilidad",
    ubicacion: "Cra 8 con Calle 12",
    imagenNombre: null,
    estado: "En proceso",
    autorId: "u-demo",
    autorNombre: "Vecino Demo",
    fechaCreacion: daysAgo(10),
    historial: [
      { estado: "Pendiente", fecha: daysAgo(10), responsable: "Sistema" },
      { estado: "Revisión", fecha: daysAgo(8), responsable: "Gestora Demo" },
      { estado: "En proceso", fecha: daysAgo(5), responsable: "Gestora Demo" },
    ],
  },
  {
    id: "r2",
    descripcion: "Fuga de agua en el parque central que lleva varios días sin atención.",
    categoria: "Servicios públicos",
    ubicacion: "Parque Central, entrada norte",
    imagenNombre: null,
    estado: "Pendiente",
    autorId: "u-demo",
    autorNombre: "Vecino Demo",
    fechaCreacion: daysAgo(1),
    historial: [{ estado: "Pendiente", fecha: daysAgo(1), responsable: "Sistema" }],
  },
];

/* ============================================================
   COMPONENTES DE UI REUTILIZABLES
   ============================================================ */
function Banner({ banner, onClose }) {
  if (!banner) return null;
  const isError = banner.type === "error";
  const style = isError
    ? { bg: C.dangerSoft, text: C.danger, Icon: AlertCircle }
    : { bg: C.primarySoft, text: C.success, Icon: CheckCircle2 };
  const Icon = style.Icon;
  return (
    <div
      className="flex items-start gap-3 rounded-xl px-4 py-3 mb-5 text-sm"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      <Icon size={18} className="mt-0.5 shrink-0" />
      <div className="flex-1">{banner.text}</div>
      <button onClick={onClose} aria-label="Cerrar mensaje" className="shrink-0">
        <X size={16} />
      </button>
    </div>
  );
}

function Field({ label, error, children, hint }) {
  return (
    <label className="block mb-4">
      <span className="block text-sm font-medium mb-1" style={{ color: C.ink }}>
        {label}
      </span>
      {children}
      {hint && !error && (
        <span className="block text-xs mt-1" style={{ color: C.inkSoft }}>
          {hint}
        </span>
      )}
      {error && (
        <span className="block text-xs mt-1" style={{ color: C.danger }}>
          {error}
        </span>
      )}
    </label>
  );
}

function inputStyle(hasError) {
  return {
    borderColor: hasError ? C.danger : C.line,
    color: C.ink,
  };
}

function TextInput({ icon: Icon, error, ...props }) {
  return (
    <div className="relative">
      {Icon && (
        <Icon
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: C.inkSoft }}
        />
      )}
      <input
        {...props}
        style={inputStyle(!!error)}
        className={`w-full border rounded-lg py-2.5 text-sm focus:outline-none focus:ring-2 ${
          Icon ? "pl-9 pr-3" : "px-3"
        }`}
        onFocusCapture={(e) => (e.target.style.boxShadow = `0 0 0 2px ${C.primarySoft}`)}
      />
    </div>
  );
}

function PrimaryButton({ children, className = "", ...props }) {
  return (
    <button
      {...props}
      style={{ backgroundColor: C.primary }}
      className={`text-white text-sm font-medium rounded-lg py-2.5 px-4 hover:opacity-90 transition disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

function GhostButton({ children, className = "", ...props }) {
  return (
    <button
      {...props}
      style={{ borderColor: C.line, color: C.ink }}
      className={`text-sm font-medium rounded-lg py-2.5 px-4 border hover:bg-black/5 transition ${className}`}
    >
      {children}
    </button>
  );
}

function AuthShell({ title, subtitle, children }) {
  return (
    <div className="min-h-[560px] flex items-center justify-center px-4 py-10">
      <div
        className="w-full max-w-md rounded-2xl p-6 sm:p-8"
        style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}
      >
        <h1 className="text-xl font-semibold mb-1" style={{ color: C.ink }}>
          {title}
        </h1>
        <p className="text-sm mb-6" style={{ color: C.inkSoft }}>
          {subtitle}
        </p>
        {children}
      </div>
    </div>
  );
}

/* ============================================================
   APP PRINCIPAL
   ============================================================ */
export default function App() {
  const [users, setUsers] = useState(seedUsers);
  const [propuestas, setPropuestas] = useState(seedPropuestasBase);
  const [reportes, setReportes] = useState(seedReportes);
  const [resetTokens, setResetTokens] = useState({});
  const [loginAttempts, setLoginAttempts] = useState({});

  const [session, setSession] = useState(null);
  const [screen, setScreen] = useState("login");
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    if (!banner) return;
    const t = setTimeout(() => setBanner(null), 5000);
    return () => clearTimeout(t);
  }, [banner]);

  function notify(type, text) {
    setBanner({ type, text });
  }

  function goTo(next) {
    setBanner(null);
    setScreen(next);
  }

  function currentUser() {
    return users.find((u) => u.id === session?.userId) || null;
  }

  function logout() {
    setSession(null);
    notify("success", "Sesión cerrada correctamente.");
    goTo("login");
  }

  function pushNotification(userId, mensaje) {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              notificaciones: [
                { id: makeId("n"), mensaje, leida: false, fecha: new Date().toISOString() },
                ...u.notificaciones,
              ],
            }
          : u
      )
    );
  }

  function markNotificationsRead() {
    const user = currentUser();
    if (!user) return;
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, notificaciones: u.notificaciones.map((n) => ({ ...n, leida: true })) } : u))
    );
  }

  /* ---------- Registro de usuario ---------- */
  function handleRegister(form) {
    const errors = {};
    if (!form.nombreCompleto || form.nombreCompleto.trim().length < 3)
      errors.nombreCompleto = "Ingresa tu nombre completo (mínimo 3 caracteres).";
    if (!docRegex.test(form.documento))
      errors.documento = "El documento debe tener entre 6 y 12 dígitos numéricos.";
    if (!emailRegex.test(form.correo)) {
      errors.correo = "Ingresa un correo electrónico válido.";
    } else if (users.some((u) => u.correo.toLowerCase() === form.correo.toLowerCase())) {
      errors.correo = "Este correo ya está registrado. Intenta iniciar sesión.";
    }
    if (!phoneRegex.test(form.telefono))
      errors.telefono = "Ingresa un teléfono válido (7 a 10 dígitos).";
    if (!form.direccion || form.direccion.trim().length < 5)
      errors.direccion = "Ingresa una dirección válida.";
    if (!passwordIsValid(form.password))
      errors.password = "La contraseña no cumple los requisitos de seguridad.";
    if (form.password !== form.confirmPassword)
      errors.confirmPassword = "Las contraseñas no coinciden.";

    if (Object.keys(errors).length > 0) return { ok: false, errors };

    const newUser = {
      id: makeId("u"),
      nombreCompleto: form.nombreCompleto.trim(),
      documento: form.documento,
      correo: form.correo.trim(),
      telefono: form.telefono,
      direccion: form.direccion.trim(),
      password: form.password,
      rol: "ciudadano",
      notificaciones: [],
    };
    setUsers((prev) => [...prev, newUser]);
    return { ok: true };
  }

  /* ---------- Inicio de sesión ---------- */
  function handleLogin(correo, password) {
    const key = correo.trim().toLowerCase();
    const attempt = loginAttempts[key];
    const now = Date.now();

    if (attempt?.lockUntil && attempt.lockUntil > now) {
      const secs = Math.ceil((attempt.lockUntil - now) / 1000);
      return { ok: false, error: `Cuenta bloqueada temporalmente. Intenta de nuevo en ${secs}s.` };
    }

    const user = users.find((u) => u.correo.toLowerCase() === key);
    const valid = user && user.password === password;

    if (!valid) {
      const count = (attempt?.count || 0) + 1;
      const locked = count >= 5;
      setLoginAttempts((prev) => ({
        ...prev,
        [key]: { count: locked ? 0 : count, lockUntil: locked ? now + 60_000 : 0 },
      }));
      if (locked) {
        return { ok: false, error: "Se superaron los intentos permitidos. Cuenta bloqueada por 60 segundos." };
      }
      return { ok: false, error: `Correo o contraseña incorrectos. Intento ${count} de 5.` };
    }

    setLoginAttempts((prev) => ({ ...prev, [key]: { count: 0, lockUntil: 0 } }));

    const payload = { sub: user.id, rol: user.rol, iat: now, exp: now + 1000 * 60 * 60 * 2 };
    const token = "demo." + btoa(JSON.stringify(payload)) + ".sig";
    setSession({ userId: user.id, nombre: user.nombreCompleto, rol: user.rol, token });

    if (user.rol === "gestor") {
      goTo("gestor");
    } else {
      goTo("home");
    }
    return { ok: true };
  }

  /* ---------- Recuperación de contraseña ---------- */
  function requestReset(correo) {
    const exists = users.some((u) => u.correo.toLowerCase() === correo.trim().toLowerCase());
    if (exists) {
      const token = makeId("tok");
      const expiresAt = Date.now() + 1000 * 60 * 60;
      setResetTokens((prev) => ({ ...prev, [token]: { correo: correo.trim(), expiresAt } }));
      return { ok: true, token };
    }
    return { ok: true, token: null };
  }

  function resetPassword(token, newPassword, confirmPassword) {
    const record = resetTokens[token];
    if (!record) return { ok: false, error: "El enlace no es válido. Solicita uno nuevo." };
    if (record.expiresAt < Date.now())
      return { ok: false, error: "El enlace expiró (vencen a la hora). Solicita uno nuevo." };
    if (!passwordIsValid(newPassword))
      return { ok: false, error: "La nueva contraseña no cumple los requisitos de seguridad." };
    if (newPassword !== confirmPassword) return { ok: false, error: "Las contraseñas no coinciden." };

    setUsers((prev) =>
      prev.map((u) => (u.correo.toLowerCase() === record.correo.toLowerCase() ? { ...u, password: newPassword } : u))
    );
    setResetTokens((prev) => {
      const copy = { ...prev };
      delete copy[token];
      return copy;
    });
    return { ok: true };
  }

  /* ---------- Publicar propuesta ---------- */
  function publicarPropuesta(form) {
    const user = currentUser();
    if (!user) return { ok: false, error: "Debes iniciar sesión para publicar una propuesta." };

    const errors = {};
    if (!form.titulo || form.titulo.trim().length < 5) errors.titulo = "El título debe tener al menos 5 caracteres.";
    if (!form.descripcion || form.descripcion.trim().length < 20)
      errors.descripcion = "Describe tu propuesta con al menos 20 caracteres.";
    if (!form.categoria) errors.categoria = "Selecciona una categoría.";
    if (Object.keys(errors).length > 0) return { ok: false, errors };

    const nueva = {
      id: makeId("p"),
      titulo: form.titulo.trim(),
      descripcion: form.descripcion.trim(),
      categoria: form.categoria,
      imagenNombre: form.imagenNombre || null,
      estado: "Pendiente",
      autorId: user.id,
      autorNombre: user.nombreCompleto,
      fechaCreacion: new Date().toISOString(),
      votosBase: 0,
      votantes: [],
      comentarios: 0,
    };
    setPropuestas((prev) => [nueva, ...prev]);
    return { ok: true };
  }

  /* ---------- Sistema de votación ---------- */
  function toggleVoto(propuestaId) {
    const user = currentUser();
    if (!user) {
      notify("error", "Debes iniciar sesión para votar.");
      return;
    }
    setPropuestas((prev) =>
      prev.map((p) => {
        if (p.id !== propuestaId || p.estado !== "Aprobada") return p;
        const yaVoto = p.votantes.includes(user.id);
        const votantes = yaVoto ? p.votantes.filter((id) => id !== user.id) : [...p.votantes, user.id];
        return { ...p, votantes };
      })
    );
  }

  /* ---------- Registro de reportes ---------- */
  function crearReporte(form) {
    const user = currentUser();
    if (!user) return { ok: false, error: "Debes iniciar sesión para reportar una incidencia." };

    const errors = {};
    if (!form.descripcion || form.descripcion.trim().length < 15)
      errors.descripcion = "Describe el problema con al menos 15 caracteres.";
    if (!form.categoria) errors.categoria = "Selecciona una categoría.";
    if (!form.ubicacion || form.ubicacion.trim().length < 5)
      errors.ubicacion = "Indica la ubicación del problema.";
    if (Object.keys(errors).length > 0) return { ok: false, errors };

    const ahora = new Date().toISOString();
    const nuevo = {
      id: makeId("r"),
      descripcion: form.descripcion.trim(),
      categoria: form.categoria,
      ubicacion: form.ubicacion.trim(),
      imagenNombre: form.imagenNombre || null,
      estado: "Pendiente",
      autorId: user.id,
      autorNombre: user.nombreCompleto,
      fechaCreacion: ahora,
      historial: [{ estado: "Pendiente", fecha: ahora, responsable: "Sistema" }],
    };
    setReportes((prev) => [nuevo, ...prev]);

    users.filter((u) => u.rol === "gestor").forEach((g) => {
      pushNotification(g.id, `Nuevo reporte de ${user.nombreCompleto}: "${nuevo.descripcion.slice(0, 50)}..."`);
    });

    return { ok: true };
  }

  /* ---------- Atender reportes (gestor) ---------- */
  function cambiarEstadoReporte(reporteId, nuevoEstado) {
    const gestor = currentUser();
    let autorId = null;
    let descripcionCorta = "";
    setReportes((prev) =>
      prev.map((r) => {
        if (r.id !== reporteId) return r;
        autorId = r.autorId;
        descripcionCorta = r.descripcion.slice(0, 50);
        return {
          ...r,
          estado: nuevoEstado,
          historial: [
            ...r.historial,
            { estado: nuevoEstado, fecha: new Date().toISOString(), responsable: gestor?.nombreCompleto || "Gestor" },
          ],
        };
      })
    );
    if (autorId) {
      pushNotification(autorId, `Tu reporte "${descripcionCorta}..." cambió a estado: ${nuevoEstado}`);
    }
  }

  /* ============================================================
     LAYOUT
     ============================================================ */
  const loggedIn = !!session;
  const user = currentUser();

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: C.bg, color: C.ink }}>
      <TopNav
        loggedIn={loggedIn}
        user={user}
        screen={screen}
        goTo={goTo}
        onLogout={logout}
        onOpenNotifications={markNotificationsRead}
      />
      <main className="max-w-3xl mx-auto px-4">
        {banner && <div className="pt-6"><Banner banner={banner} onClose={() => setBanner(null)} /></div>}

        {screen === "login" && <LoginScreen onLogin={handleLogin} goTo={goTo} notify={notify} />}
        {screen === "register" && <RegisterScreen onRegister={handleRegister} goTo={goTo} notify={notify} />}
        {screen === "forgot" && <ForgotScreen onRequestReset={requestReset} goTo={goTo} />}
        {screen === "reset" && <ResetScreen onResetPassword={resetPassword} goTo={goTo} notify={notify} />}
        {screen === "home" && (
          <ConsultaScreen
            propuestas={propuestas}
            loggedIn={loggedIn}
            userId={session?.userId}
            onToggleVoto={toggleVoto}
            goTo={goTo}
          />
        )}
        {screen === "publicar" && (
          <PublicarScreen loggedIn={loggedIn} onPublicar={publicarPropuesta} goTo={goTo} notify={notify} />
        )}
        {screen === "reportar" && (
          <ReportarScreen loggedIn={loggedIn} onCrearReporte={crearReporte} goTo={goTo} notify={notify} />
        )}
        {screen === "misReportes" && (
          <MisReportesScreen loggedIn={loggedIn} userId={session?.userId} reportes={reportes} goTo={goTo} />
        )}
        {screen === "gestor" && (
          <GestorScreen
            loggedIn={loggedIn}
            rol={user?.rol}
            reportes={reportes}
            onCambiarEstado={cambiarEstadoReporte}
            goTo={goTo}
          />
        )}
      </main>
      <footer className="text-center text-xs py-8" style={{ color: C.inkSoft }}>
        Prototipo Sprint 1-2 · App Gestión Comunitaria · Datos simulados en memoria, no persisten al recargar.
      </footer>
    </div>
  );
}

/* ============================================================
   NAV
   ============================================================ */
function TopNav({ loggedIn, user, screen, goTo, onLogout, onOpenNotifications }) {
  const [showNotifs, setShowNotifs] = useState(false);

  const NavBtn = ({ target, label, Icon }) => (
    <button
      onClick={() => goTo(target)}
      className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition"
      style={{
        color: screen === target ? C.primaryDark : C.inkSoft,
        backgroundColor: screen === target ? C.primarySoft : "transparent",
        fontWeight: screen === target ? 600 : 500,
      }}
    >
      <Icon size={15} /> {label}
    </button>
  );

  const notificaciones = user?.notificaciones || [];
  const noLeidas = notificaciones.filter((n) => !n.leida).length;

  function toggleNotifs() {
    if (!showNotifs) onOpenNotifications();
    setShowNotifs((s) => !s);
  }

  return (
    <div style={{ borderBottom: `1px solid ${C.line}`, backgroundColor: C.card }}>
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
        <button
          onClick={() => goTo(loggedIn ? (user?.rol === "gestor" ? "gestor" : "home") : "login")}
          className="flex items-center gap-2 font-semibold"
          style={{ color: C.primaryDark }}
        >
          <ShieldCheck size={20} />
          <span>Gestión Comunitaria</span>
        </button>

        {loggedIn ? (
          <div className="flex items-center gap-1 flex-wrap">
            {user?.rol === "ciudadano" && (
              <>
                <NavBtn target="home" label="Propuestas" Icon={Home} />
                <NavBtn target="publicar" label="Publicar" Icon={PlusCircle} />
                <NavBtn target="reportar" label="Reportar" Icon={Flag} />
                <NavBtn target="misReportes" label="Mis reportes" Icon={ClipboardList} />
              </>
            )}
            {user?.rol === "gestor" && <NavBtn target="gestor" label="Atender reportes" Icon={ClipboardCheck} />}

            <div className="relative">
              <button
                onClick={toggleNotifs}
                className="relative flex items-center p-2 rounded-lg hover:bg-black/5"
                aria-label="Notificaciones"
              >
                <Bell size={17} style={{ color: C.inkSoft }} />
                {noLeidas > 0 && (
                  <span
                    className="absolute top-0.5 right-0.5 text-[10px] leading-none rounded-full px-1 py-0.5"
                    style={{ backgroundColor: C.danger, color: "#fff" }}
                  >
                    {noLeidas}
                  </span>
                )}
              </button>
              {showNotifs && (
                <div
                  className="absolute right-0 mt-2 w-72 rounded-xl shadow-lg z-10 max-h-80 overflow-y-auto"
                  style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}
                >
                  {notificaciones.length === 0 ? (
                    <div className="p-4 text-sm" style={{ color: C.inkSoft }}>
                      No tienes notificaciones.
                    </div>
                  ) : (
                    notificaciones.map((n) => (
                      <div key={n.id} className="p-3 text-xs" style={{ borderBottom: `1px solid ${C.line}` }}>
                        <p style={{ color: C.ink }}>{n.mensaje}</p>
                        <p className="mt-1" style={{ color: C.inkSoft }}>
                          {new Date(n.fecha).toLocaleString("es-CO")}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <span className="text-sm mx-1 hidden sm:inline" style={{ color: C.inkSoft }}>
              {user?.nombreCompleto}
            </span>
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg hover:bg-black/5"
              style={{ color: C.danger }}
            >
              <LogOut size={15} /> Salir
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <NavBtn target="login" label="Ingresar" Icon={LogIn} />
            <NavBtn target="register" label="Registrarme" Icon={UserPlus} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   PANTALLA: LOGIN
   ============================================================ */
function LoginScreen({ onLogin, goTo, notify }) {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      const res = onLogin(correo, password);
      if (!res.ok) setError(res.error);
      else notify("success", "Inicio de sesión exitoso. ¡Bienvenido/a!");
      setLoading(false);
    }, 300);
  }

  return (
    <AuthShell title="Inicia sesión" subtitle="Accede con tu correo y contraseña.">
      {error && (
        <div
          className="flex items-center gap-2 text-sm rounded-lg px-3 py-2 mb-4"
          style={{ backgroundColor: C.dangerSoft, color: C.danger }}
        >
          <AlertCircle size={16} /> {error}
        </div>
      )}
      <div className="text-xs rounded-lg px-3 py-2 mb-5" style={{ backgroundColor: C.accentSoft, color: "#7A5A15" }}>
        Ciudadano: <strong>demo@comunidad.co</strong> / <strong>Demo1234!</strong>
        <br />
        Gestor comunitario: <strong>gestor@comunidad.co</strong> / <strong>Gestor123!</strong>
      </div>
      <form onSubmit={submit}>
        <Field label="Correo electrónico">
          <TextInput
            icon={Mail}
            type="email"
            required
            placeholder="tucorreo@ejemplo.com"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
          />
        </Field>
        <Field label="Contraseña">
          <div className="relative">
            <TextInput
              icon={Lock}
              type={showPwd ? "text" : "password"}
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPwd((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: C.inkSoft }}
              aria-label="Mostrar u ocultar contraseña"
            >
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </Field>
        <div className="flex justify-end mb-4">
          <button type="button" onClick={() => goTo("forgot")} className="text-xs font-medium" style={{ color: C.primaryDark }}>
            ¿Olvidaste tu contraseña?
          </button>
        </div>
        <PrimaryButton type="submit" className="w-full" disabled={loading}>
          {loading ? "Verificando..." : "Ingresar"}
        </PrimaryButton>
      </form>
      <p className="text-sm text-center mt-5" style={{ color: C.inkSoft }}>
        ¿No tienes cuenta?{" "}
        <button onClick={() => goTo("register")} style={{ color: C.primaryDark }} className="font-medium">
          Regístrate
        </button>
      </p>
    </AuthShell>
  );
}

/* ============================================================
   PANTALLA: REGISTRO
   ============================================================ */
function RegisterScreen({ onRegister, goTo, notify }) {
  const [form, setForm] = useState({
    nombreCompleto: "",
    documento: "",
    correo: "",
    telefono: "",
    direccion: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [showPwd, setShowPwd] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => goTo("login"), 1600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [success]);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function submit(e) {
    e.preventDefault();
    const res = onRegister(form);
    if (!res.ok) {
      setErrors(res.errors);
      return;
    }
    setErrors({});
    setSuccess(true);
    notify("success", "Registro exitoso. Redirigiendo a inicio de sesión...");
  }

  const checks = passwordChecks(form.password);
  const CheckItem = ({ ok, label }) => (
    <li className="flex items-center gap-1.5" style={{ color: ok ? C.success : C.inkSoft }}>
      <CheckCircle2 size={13} style={{ opacity: ok ? 1 : 0.35 }} /> {label}
    </li>
  );

  if (success) {
    return (
      <AuthShell title="¡Cuenta creada!" subtitle="Tu registro fue exitoso.">
        <div className="flex items-center gap-2 text-sm rounded-lg px-3 py-3" style={{ backgroundColor: C.primarySoft, color: C.success }}>
          <CheckCircle2 size={18} /> Te estamos llevando a la pantalla de inicio de sesión...
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Crea tu cuenta" subtitle="Regístrate para participar en tu comunidad.">
      <form onSubmit={submit}>
        <Field label="Nombre completo" error={errors.nombreCompleto}>
          <TextInput
            icon={User}
            placeholder="Ej. Ana María Torres"
            value={form.nombreCompleto}
            error={errors.nombreCompleto}
            onChange={(e) => set("nombreCompleto", e.target.value)}
          />
        </Field>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
          <Field label="Documento de identidad" error={errors.documento}>
            <TextInput
              icon={FileText}
              placeholder="1020304050"
              value={form.documento}
              error={errors.documento}
              onChange={(e) => set("documento", e.target.value.replace(/[^\d]/g, ""))}
            />
          </Field>
          <Field label="Teléfono" error={errors.telefono}>
            <TextInput
              icon={Phone}
              placeholder="3001234567"
              value={form.telefono}
              error={errors.telefono}
              onChange={(e) => set("telefono", e.target.value.replace(/[^\d]/g, ""))}
            />
          </Field>
        </div>
        <Field label="Correo electrónico" error={errors.correo}>
          <TextInput
            icon={Mail}
            type="email"
            placeholder="tucorreo@ejemplo.com"
            value={form.correo}
            error={errors.correo}
            onChange={(e) => set("correo", e.target.value)}
          />
        </Field>
        <Field label="Dirección" error={errors.direccion}>
          <TextInput
            icon={MapPin}
            placeholder="Cra 10 # 20-30"
            value={form.direccion}
            error={errors.direccion}
            onChange={(e) => set("direccion", e.target.value)}
          />
        </Field>
        <Field label="Contraseña" error={errors.password}>
          <div className="relative">
            <TextInput
              icon={Lock}
              type={showPwd ? "text" : "password"}
              placeholder="••••••••"
              value={form.password}
              error={errors.password}
              onChange={(e) => set("password", e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPwd((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: C.inkSoft }}
              aria-label="Mostrar u ocultar contraseña"
            >
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <ul className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs mt-2">
            <CheckItem ok={checks.length} label="8+ caracteres" />
            <CheckItem ok={checks.upper} label="Una mayúscula" />
            <CheckItem ok={checks.lower} label="Una minúscula" />
            <CheckItem ok={checks.number} label="Un número" />
            <CheckItem ok={checks.special} label="Un carácter especial" />
          </ul>
        </Field>
        <Field label="Confirmar contraseña" error={errors.confirmPassword}>
          <TextInput
            icon={Lock}
            type={showPwd ? "text" : "password"}
            placeholder="••••••••"
            value={form.confirmPassword}
            error={errors.confirmPassword}
            onChange={(e) => set("confirmPassword", e.target.value)}
          />
        </Field>
        <PrimaryButton type="submit" className="w-full mt-1">
          Crear cuenta
        </PrimaryButton>
      </form>
      <p className="text-sm text-center mt-5" style={{ color: C.inkSoft }}>
        ¿Ya tienes cuenta?{" "}
        <button onClick={() => goTo("login")} style={{ color: C.primaryDark }} className="font-medium">
          Inicia sesión
        </button>
      </p>
    </AuthShell>
  );
}

/* ============================================================
   PANTALLA: RECUPERAR CONTRASEÑA (solicitud)
   ============================================================ */
function ForgotScreen({ onRequestReset, goTo }) {
  const [correo, setCorreo] = useState("");
  const [sent, setSent] = useState(false);
  const [demoToken, setDemoToken] = useState(null);

  function submit(e) {
    e.preventDefault();
    const res = onRequestReset(correo);
    setSent(true);
    setDemoToken(res.token);
  }

  if (sent) {
    return (
      <AuthShell title="Revisa tu correo" subtitle="Te enviamos instrucciones si el correo existe en el sistema.">
        <div className="flex items-start gap-2 text-sm rounded-lg px-3 py-3 mb-4" style={{ backgroundColor: C.primarySoft, color: C.success }}>
          <CheckCircle2 size={18} className="mt-0.5" />
          <span>
            Si <strong>{correo}</strong> está registrado, recibirás un enlace de recuperación válido por 1 hora.
          </span>
        </div>
        {demoToken && (
          <div className="text-xs rounded-lg px-3 py-3 mb-4" style={{ backgroundColor: C.accentSoft, color: "#7A5A15" }}>
            <strong>Modo demo</strong> (aquí no hay envío real de correo): usa este enlace de prueba para continuar.
            <div className="mt-2">
              <GhostButton type="button" onClick={() => goTo("reset")} className="text-xs">
                Usar enlace de recuperación
              </GhostButton>
            </div>
            <div className="mt-2 break-all opacity-70">token: {demoToken}</div>
          </div>
        )}
        <GhostButton type="button" onClick={() => goTo("login")} className="w-full">
          Volver a inicio de sesión
        </GhostButton>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Recuperar contraseña" subtitle="Ingresa tu correo para recibir un enlace de recuperación.">
      <form onSubmit={submit}>
        <Field label="Correo electrónico">
          <TextInput
            icon={Mail}
            type="email"
            required
            placeholder="tucorreo@ejemplo.com"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
          />
        </Field>
        <PrimaryButton type="submit" className="w-full">
          Enviar enlace de recuperación
        </PrimaryButton>
      </form>
      <p className="text-sm text-center mt-5" style={{ color: C.inkSoft }}>
        <button onClick={() => goTo("login")} style={{ color: C.primaryDark }} className="font-medium">
          Volver a inicio de sesión
        </button>
      </p>
    </AuthShell>
  );
}

/* ============================================================
   PANTALLA: RESTABLECER CONTRASEÑA
   ============================================================ */
function ResetScreen({ onResetPassword, goTo, notify }) {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  function submit(e) {
    e.preventDefault();
    const res = onResetPassword(token.trim(), password, confirmPassword);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setError("");
    setDone(true);
    notify("success", "Contraseña actualizada correctamente.");
    setTimeout(() => goTo("login"), 1400);
  }

  if (done) {
    return (
      <AuthShell title="Contraseña actualizada" subtitle="Ya puedes iniciar sesión con tu nueva contraseña.">
        <div className="flex items-center gap-2 text-sm rounded-lg px-3 py-3" style={{ backgroundColor: C.primarySoft, color: C.success }}>
          <CheckCircle2 size={18} /> Redirigiendo a inicio de sesión...
        </div>
      </AuthShell>
    );
  }

  const checks = passwordChecks(password);
  return (
    <AuthShell title="Restablecer contraseña" subtitle="Pega el token del enlace y define tu nueva contraseña.">
      {error && (
        <div className="flex items-center gap-2 text-sm rounded-lg px-3 py-2 mb-4" style={{ backgroundColor: C.dangerSoft, color: C.danger }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}
      <form onSubmit={submit}>
        <Field label="Token de recuperación" hint="Este campo simula el enlace único que llegaría por correo.">
          <TextInput icon={KeyRound} required placeholder="tok_xxxxxxx" value={token} onChange={(e) => setToken(e.target.value)} />
        </Field>
        <Field label="Nueva contraseña">
          <TextInput icon={Lock} type="password" required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
          <ul className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs mt-2">
            <li style={{ color: checks.length ? C.success : C.inkSoft }}>8+ caracteres</li>
            <li style={{ color: checks.upper ? C.success : C.inkSoft }}>Una mayúscula</li>
            <li style={{ color: checks.lower ? C.success : C.inkSoft }}>Una minúscula</li>
            <li style={{ color: checks.number ? C.success : C.inkSoft }}>Un número</li>
            <li style={{ color: checks.special ? C.success : C.inkSoft }}>Un carácter especial</li>
          </ul>
        </Field>
        <Field label="Confirmar nueva contraseña">
          <TextInput icon={Lock} type="password" required placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        </Field>
        <PrimaryButton type="submit" className="w-full">
          Guardar nueva contraseña
        </PrimaryButton>
      </form>
    </AuthShell>
  );
}

/* ============================================================
   PANTALLA: PUBLICAR PROPUESTA
   ============================================================ */
function PublicarScreen({ loggedIn, onPublicar, goTo, notify }) {
  const [form, setForm] = useState({ titulo: "", descripcion: "", categoria: "", imagenNombre: null });
  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState(null);

  if (!loggedIn) {
    return (
      <AuthShell title="Inicia sesión primero" subtitle="Debes tener una cuenta activa para publicar una propuesta.">
        <PrimaryButton className="w-full" onClick={() => goTo("login")}>
          Ir a inicio de sesión
        </PrimaryButton>
      </AuthShell>
    );
  }

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    set("imagenNombre", file.name);
    setPreview(URL.createObjectURL(file));
  }

  function submit(e) {
    e.preventDefault();
    const res = onPublicar(form);
    if (!res.ok) {
      setErrors(res.errors || {});
      if (res.error) notify("error", res.error);
      return;
    }
    setErrors({});
    setForm({ titulo: "", descripcion: "", categoria: "", imagenNombre: null });
    setPreview(null);
    notify("success", "Propuesta enviada con estado Pendiente. Se notificó al gestor comunitario para su revisión.");
    goTo("home");
  }

  return (
    <div className="py-8">
      <div className="rounded-2xl p-6 sm:p-8" style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}>
        <h1 className="text-xl font-semibold mb-1">Publicar una propuesta</h1>
        <p className="text-sm mb-6" style={{ color: C.inkSoft }}>
          Comparte una idea de mejora para tu comunidad. Quedará en estado <strong>Pendiente</strong> hasta que un
          gestor comunitario la revise.
        </p>
        <form onSubmit={submit}>
          <Field label="Título" error={errors.titulo}>
            <TextInput icon={FileText} placeholder="Ej. Mejora del parque infantil" value={form.titulo} error={errors.titulo} onChange={(e) => set("titulo", e.target.value)} />
          </Field>
          <Field label="Categoría" error={errors.categoria}>
            <select
              value={form.categoria}
              onChange={(e) => set("categoria", e.target.value)}
              style={inputStyle(!!errors.categoria)}
              className="w-full border rounded-lg py-2.5 px-3 text-sm focus:outline-none"
            >
              <option value="">Selecciona una categoría</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Descripción" error={errors.descripcion}>
            <textarea
              rows={5}
              placeholder="Describe tu propuesta con el mayor detalle posible..."
              value={form.descripcion}
              onChange={(e) => set("descripcion", e.target.value)}
              style={inputStyle(!!errors.descripcion)}
              className="w-full border rounded-lg py-2.5 px-3 text-sm focus:outline-none resize-none"
            />
          </Field>
          <Field label="Imagen (opcional)">
            <label className="flex items-center gap-2 text-sm border rounded-lg py-2.5 px-3 cursor-pointer w-fit" style={{ borderColor: C.line, color: C.inkSoft }}>
              <ImageIcon size={16} />
              {form.imagenNombre || "Seleccionar archivo"}
              <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
            </label>
            {preview && <img src={preview} alt="Vista previa" className="mt-3 h-32 rounded-lg object-cover border" style={{ borderColor: C.line }} />}
          </Field>
          <div className="flex gap-3 mt-2">
            <PrimaryButton type="submit" className="flex-1">
              Enviar propuesta
            </PrimaryButton>
            <GhostButton type="button" onClick={() => goTo("home")}>
              Cancelar
            </GhostButton>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ============================================================
   PANTALLA: CONSULTA DE PROPUESTAS (+ votación)
   ============================================================ */
const PAGE_SIZE = 10;

function ConsultaScreen({ propuestas, loggedIn, userId, onToggleVoto, goTo }) {
  const [tab, setTab] = useState("aprobadas");
  const [categoria, setCategoria] = useState("");
  const [rango, setRango] = useState("todas");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [tab, categoria, rango, q]);

  const base = useMemo(() => {
    if (tab === "mias") return propuestas.filter((p) => p.autorId === userId);
    return propuestas.filter((p) => p.estado === "Aprobada");
  }, [propuestas, tab, userId]);

  const filtered = useMemo(() => {
    const now = Date.now();
    return base.filter((p) => {
      if (categoria && p.categoria !== categoria) return false;
      if (q && !p.titulo.toLowerCase().includes(q.toLowerCase())) return false;
      if (rango !== "todas") {
        const days = (now - new Date(p.fechaCreacion).getTime()) / (1000 * 60 * 60 * 24);
        if (rango === "7" && days > 7) return false;
        if (rango === "30" && days > 30) return false;
        if (rango === "365" && days > 365) return false;
      }
      return true;
    });
  }, [base, categoria, q, rango]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="py-8">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <h1 className="text-xl font-semibold">Propuestas comunitarias</h1>
        {loggedIn && (
          <PrimaryButton onClick={() => goTo("publicar")} className="flex items-center gap-1.5">
            <PlusCircle size={16} /> Nueva propuesta
          </PrimaryButton>
        )}
      </div>

      <div className="flex gap-2 mb-5">
        <TabBtn active={tab === "aprobadas"} onClick={() => setTab("aprobadas")}>
          Aprobadas
        </TabBtn>
        {loggedIn && (
          <TabBtn active={tab === "mias"} onClick={() => setTab("mias")}>
            Mis propuestas
          </TabBtn>
        )}
      </div>

      <div className="rounded-xl p-4 mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3" style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: C.inkSoft }} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por título..."
            style={{ borderColor: C.line }}
            className="w-full border rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-none"
          />
        </div>
        <select value={categoria} onChange={(e) => setCategoria(e.target.value)} style={{ borderColor: C.line }} className="w-full border rounded-lg py-2 px-3 text-sm focus:outline-none">
          <option value="">Todas las categorías</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select value={rango} onChange={(e) => setRango(e.target.value)} style={{ borderColor: C.line }} className="w-full border rounded-lg py-2 px-3 text-sm focus:outline-none">
          <option value="todas">Cualquier fecha</option>
          <option value="7">Últimos 7 días</option>
          <option value="30">Últimos 30 días</option>
          <option value="365">Este último año</option>
        </select>
        <div className="flex items-center gap-1.5 text-xs" style={{ color: C.inkSoft }}>
          <Filter size={14} /> {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
        </div>
      </div>

      {pageItems.length === 0 ? (
        <div className="text-center rounded-xl py-12 text-sm" style={{ backgroundColor: C.card, border: `1px solid ${C.line}`, color: C.inkSoft }}>
          No hay propuestas que coincidan con tu búsqueda.
        </div>
      ) : (
        <div className="grid gap-3">
          {pageItems.map((p) => (
            <PropuestaCard key={p.id} p={p} showEstado={tab === "mias"} loggedIn={loggedIn} userId={userId} onToggleVoto={onToggleVoto} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button disabled={page === 1} onClick={() => setPage((n) => Math.max(1, n - 1))} className="p-2 rounded-lg border disabled:opacity-40" style={{ borderColor: C.line }}>
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm" style={{ color: C.inkSoft }}>
            Página {page} de {totalPages}
          </span>
          <button disabled={page === totalPages} onClick={() => setPage((n) => Math.min(totalPages, n + 1))} className="p-2 rounded-lg border disabled:opacity-40" style={{ borderColor: C.line }}>
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

function TabBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="text-sm font-medium px-4 py-2 rounded-lg transition"
      style={{ backgroundColor: active ? C.primary : "transparent", color: active ? "#fff" : C.inkSoft, border: `1px solid ${active ? C.primary : C.line}` }}
    >
      {children}
    </button>
  );
}

function PropuestaCard({ p, showEstado, loggedIn, userId, onToggleVoto }) {
  const tag = tagColor(p.categoria);
  const estado = ESTADO_STYLE[p.estado] || ESTADO_STYLE.Pendiente;
  const fecha = new Date(p.fechaCreacion).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
  const totalVotos = p.votosBase + p.votantes.length;
  const yaVoto = userId ? p.votantes.includes(userId) : false;
  const puedeVotar = loggedIn && p.estado === "Aprobada";

  return (
    <div className="rounded-xl p-4 flex gap-4" style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}>
      <div className="w-16 h-16 rounded-lg shrink-0 flex items-center justify-center text-xs" style={{ backgroundColor: tag.bg, color: tag.text }}>
        <ImageIcon size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <h3 className="font-medium text-sm sm:text-base">{p.titulo}</h3>
          <div className="flex gap-2 shrink-0">
            {showEstado && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: estado.bg, color: estado.text }}>
                {p.estado}
              </span>
            )}
            <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: tag.bg, color: tag.text }}>
              {p.categoria}
            </span>
          </div>
        </div>
        <p className="text-sm mt-1 line-clamp-2" style={{ color: C.inkSoft }}>
          {p.descripcion}
        </p>
        <div className="flex items-center gap-3 text-xs mt-3 flex-wrap">
          <span style={{ color: C.inkSoft }}>{fecha}</span>
          <span style={{ color: C.inkSoft }}>💬 {p.comentarios} comentarios</span>
          {puedeVotar ? (
            <button
              onClick={() => onToggleVoto(p.id)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full font-medium transition"
              style={
                yaVoto
                  ? { backgroundColor: C.primary, color: "#fff" }
                  : { backgroundColor: C.primarySoft, color: C.primaryDark }
              }
            >
              <ThumbsUp size={12} /> {totalVotos} {yaVoto ? "· Ya votaste" : "· Votar"}
            </button>
          ) : (
            <span style={{ color: C.inkSoft }}>▲ {totalVotos} votos</span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   PANTALLA: REGISTRO DE REPORTES
   ============================================================ */
function ReportarScreen({ loggedIn, onCrearReporte, goTo, notify }) {
  const [form, setForm] = useState({ descripcion: "", categoria: "", ubicacion: "", imagenNombre: null });
  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState(null);

  if (!loggedIn) {
    return (
      <AuthShell title="Inicia sesión primero" subtitle="Debes tener una cuenta activa para reportar una incidencia.">
        <PrimaryButton className="w-full" onClick={() => goTo("login")}>
          Ir a inicio de sesión
        </PrimaryButton>
      </AuthShell>
    );
  }

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    set("imagenNombre", file.name);
    setPreview(URL.createObjectURL(file));
  }

  function submit(e) {
    e.preventDefault();
    const res = onCrearReporte(form);
    if (!res.ok) {
      setErrors(res.errors || {});
      if (res.error) notify("error", res.error);
      return;
    }
    setErrors({});
    setForm({ descripcion: "", categoria: "", ubicacion: "", imagenNombre: null });
    setPreview(null);
    notify("success", "Reporte enviado con estado Pendiente. Se notificó al gestor comunitario.");
    goTo("misReportes");
  }

  return (
    <div className="py-8">
      <div className="rounded-2xl p-6 sm:p-8" style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}>
        <h1 className="text-xl font-semibold mb-1">Reportar una incidencia</h1>
        <p className="text-sm mb-6" style={{ color: C.inkSoft }}>
          Cuéntanos qué problema hay en tu barrio. La fecha y hora se registran automáticamente y quedará en estado{" "}
          <strong>Pendiente</strong> hasta que un gestor comunitario la revise.
        </p>
        <form onSubmit={submit}>
          <Field label="Categoría" error={errors.categoria}>
            <select
              value={form.categoria}
              onChange={(e) => set("categoria", e.target.value)}
              style={inputStyle(!!errors.categoria)}
              className="w-full border rounded-lg py-2.5 px-3 text-sm focus:outline-none"
            >
              <option value="">Selecciona una categoría</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Ubicación" error={errors.ubicacion}>
            <TextInput icon={MapPin} placeholder="Ej. Cra 8 con Calle 12" value={form.ubicacion} error={errors.ubicacion} onChange={(e) => set("ubicacion", e.target.value)} />
          </Field>
          <Field label="Descripción del problema" error={errors.descripcion}>
            <textarea
              rows={5}
              placeholder="Describe el problema con el mayor detalle posible..."
              value={form.descripcion}
              onChange={(e) => set("descripcion", e.target.value)}
              style={inputStyle(!!errors.descripcion)}
              className="w-full border rounded-lg py-2.5 px-3 text-sm focus:outline-none resize-none"
            />
          </Field>
          <Field label="Imagen (opcional)">
            <label className="flex items-center gap-2 text-sm border rounded-lg py-2.5 px-3 cursor-pointer w-fit" style={{ borderColor: C.line, color: C.inkSoft }}>
              <ImageIcon size={16} />
              {form.imagenNombre || "Seleccionar archivo"}
              <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
            </label>
            {preview && <img src={preview} alt="Vista previa" className="mt-3 h-32 rounded-lg object-cover border" style={{ borderColor: C.line }} />}
          </Field>
          <div className="flex gap-3 mt-2">
            <PrimaryButton type="submit" className="flex-1">
              Enviar reporte
            </PrimaryButton>
            <GhostButton type="button" onClick={() => goTo("home")}>
              Cancelar
            </GhostButton>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ============================================================
   PANTALLA: SEGUIMIENTO DE REPORTES (ciudadano)
   ============================================================ */
function MisReportesScreen({ loggedIn, userId, reportes, goTo }) {
  const [expandedId, setExpandedId] = useState(null);

  if (!loggedIn) {
    return (
      <AuthShell title="Inicia sesión primero" subtitle="Debes tener una cuenta activa para ver tus reportes.">
        <PrimaryButton className="w-full" onClick={() => goTo("login")}>
          Ir a inicio de sesión
        </PrimaryButton>
      </AuthShell>
    );
  }

  const mios = reportes.filter((r) => r.autorId === userId).sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));

  return (
    <div className="py-8">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <h1 className="text-xl font-semibold">Mis reportes</h1>
        <PrimaryButton onClick={() => goTo("reportar")} className="flex items-center gap-1.5">
          <Flag size={16} /> Nuevo reporte
        </PrimaryButton>
      </div>

      {mios.length === 0 ? (
        <div className="text-center rounded-xl py-12 text-sm" style={{ backgroundColor: C.card, border: `1px solid ${C.line}`, color: C.inkSoft }}>
          Todavía no has creado ningún reporte.
        </div>
      ) : (
        <div className="grid gap-3">
          {mios.map((r) => {
            const estado = ESTADO_REPORTE_STYLE[r.estado] || ESTADO_REPORTE_STYLE.Pendiente;
            const tag = tagColor(r.categoria);
            const fecha = new Date(r.fechaCreacion).toLocaleString("es-CO", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
            const isOpen = expandedId === r.id;
            return (
              <div key={r.id} className="rounded-xl p-4" style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}>
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: estado.bg, color: estado.text }}>
                        {r.estado}
                      </span>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: tag.bg, color: tag.text }}>
                        {r.categoria}
                      </span>
                    </div>
                    <p className="text-sm font-medium">{r.ubicacion}</p>
                    <p className="text-sm mt-1" style={{ color: C.inkSoft }}>
                      {r.descripcion}
                    </p>
                    <p className="text-xs mt-2" style={{ color: C.inkSoft }}>
                      Creado: {fecha}
                    </p>
                  </div>
                  <button
                    onClick={() => setExpandedId(isOpen ? null : r.id)}
                    className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg shrink-0"
                    style={{ color: C.primaryDark }}
                  >
                    {isOpen ? "Ocultar" : "Ver detalle"} {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>
                {isOpen && (
                  <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${C.line}` }}>
                    <p className="text-xs font-medium mb-2" style={{ color: C.inkSoft }}>
                      Historial de cambios
                    </p>
                    <ul className="space-y-2">
                      {r.historial.map((h, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: C.primary }} />
                          <span className="font-medium">{h.estado}</span>
                          <span style={{ color: C.inkSoft }}>
                            — {new Date(h.fecha).toLocaleString("es-CO")} · {h.responsable}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   PANTALLA: ATENDER REPORTES (gestor comunitario)
   ============================================================ */
function GestorScreen({ loggedIn, rol, reportes, onCambiarEstado, goTo }) {
  const [expandedId, setExpandedId] = useState(null);

  if (!loggedIn) {
    return (
      <AuthShell title="Inicia sesión primero" subtitle="Debes iniciar sesión como gestor comunitario.">
        <PrimaryButton className="w-full" onClick={() => goTo("login")}>
          Ir a inicio de sesión
        </PrimaryButton>
      </AuthShell>
    );
  }
  if (rol !== "gestor") {
    return (
      <AuthShell title="No autorizado" subtitle="Esta pantalla es exclusiva para el rol de gestor comunitario.">
        <PrimaryButton className="w-full" onClick={() => goTo("home")}>
          Volver a propuestas
        </PrimaryButton>
      </AuthShell>
    );
  }

  const ordenados = [...reportes].sort((a, b) => {
    if (a.estado === "Pendiente" && b.estado !== "Pendiente") return -1;
    if (a.estado !== "Pendiente" && b.estado === "Pendiente") return 1;
    return new Date(b.fechaCreacion) - new Date(a.fechaCreacion);
  });

  return (
    <div className="py-8">
      <h1 className="text-xl font-semibold mb-1">Atender reportes</h1>
      <p className="text-sm mb-6" style={{ color: C.inkSoft }}>
        Actualiza el estado de los reportes ciudadanos. El vecino que lo creó recibirá una notificación con el cambio.
      </p>

      <div className="grid gap-3">
        {ordenados.map((r) => {
          const estado = ESTADO_REPORTE_STYLE[r.estado] || ESTADO_REPORTE_STYLE.Pendiente;
          const tag = tagColor(r.categoria);
          const fecha = new Date(r.fechaCreacion).toLocaleString("es-CO", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
          const isOpen = expandedId === r.id;
          return (
            <div key={r.id} className="rounded-xl p-4" style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: tag.bg, color: tag.text }}>
                      {r.categoria}
                    </span>
                    <span className="text-xs" style={{ color: C.inkSoft }}>
                      {r.autorNombre} · {fecha}
                    </span>
                  </div>
                  <p className="text-sm font-medium">{r.ubicacion}</p>
                  <p className="text-sm mt-1" style={{ color: C.inkSoft }}>
                    {r.descripcion}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <select
                    value={r.estado}
                    onChange={(e) => onCambiarEstado(r.id, e.target.value)}
                    className="text-xs font-medium rounded-full px-2 py-1 border focus:outline-none"
                    style={{ backgroundColor: estado.bg, color: estado.text, borderColor: "transparent" }}
                  >
                    {ESTADOS_REPORTE.map((e) => (
                      <option key={e} value={e}>
                        {e}
                      </option>
                    ))}
                  </select>
                  <button onClick={() => setExpandedId(isOpen ? null : r.id)} className="flex items-center gap-1 text-xs font-medium" style={{ color: C.primaryDark }}>
                    {isOpen ? "Ocultar historial" : "Ver historial"} {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>
              </div>
              {isOpen && (
                <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${C.line}` }}>
                  <ul className="space-y-2">
                    {r.historial.map((h, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: C.primary }} />
                        <span className="font-medium">{h.estado}</span>
                        <span style={{ color: C.inkSoft }}>
                          — {new Date(h.fecha).toLocaleString("es-CO")} · {h.responsable}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}