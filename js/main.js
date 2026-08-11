// Michiland Space
const DISCORD_ADMIN = "dazagroupglobal";
const DISCORD_INVITE = "https://discord.gg/DNbKMrwn";

// ===== SERVER STATUS (Bedrock - puerto 25780) =====
// Ahora usa tu propio Cloudflare Worker (mucho más rápido y preciso)
const STATUS_API = "https://michiland-status.deibydaxa-enterprises.workers.dev";
const CHECK_INTERVAL = 2000; // cada 2 segundos

let isChecking = false;
let lastStatus = null;

async function updateServerStatus(force = false) {
    const statusEl = document.getElementById("server-status");
    const textEl = document.getElementById("status-text");
    const playersEl = document.getElementById("status-players");

    if (!statusEl || !textEl) return;
    if (isChecking && !force) return;

    isChecking = true;

    // Solo "Comprobando..." la primera vez
    if (lastStatus === null) {
        textEl.textContent = "Comprobando...";
        statusEl.classList.remove("online", "offline");
        if (playersEl) playersEl.textContent = "";
    }

    try {
        const res = await fetch(STATUS_API + "?t=" + Date.now(), {
            cache: "no-store",
            headers: { "Accept": "application/json" }
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();

        if (data.online === true) {
            statusEl.classList.remove("offline");
            statusEl.classList.add("online");
            textEl.textContent = "ACTIVO";

            if (data.players && typeof data.players.online === "number") {
                const max = data.players.max ?? "?";
                if (playersEl) playersEl.textContent = `• ${data.players.online}/${max}`;
            } else {
                if (playersEl) playersEl.textContent = "";
            }
            lastStatus = "online";
        } else {
            statusEl.classList.remove("online");
            statusEl.classList.add("offline");
            textEl.textContent = "APAGADO";
            if (playersEl) playersEl.textContent = "";
            lastStatus = "offline";
        }
    } catch (err) {
        if (lastStatus !== "online") {
            statusEl.classList.remove("online");
            statusEl.classList.add("offline");
            textEl.textContent = "APAGADO";
            if (playersEl) playersEl.textContent = "";
            lastStatus = "offline";
        }
        console.warn("Error al consultar estado del servidor:", err);
    } finally {
        isChecking = false;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // Partículas de fondo
    const c = document.querySelector(".particles");
    if (c) {
        for (let i = 0; i < 30; i++) {
            const p = document.createElement("div");
            p.className = "particle";
            p.style.left = Math.random() * 100 + "%";
            p.style.width = p.style.height = (Math.random() * 3 + 1) + "px";
            p.style.animationDuration = (Math.random() * 10 + 8) + "s";
            p.style.animationDelay = (Math.random() * 8) + "s";
            p.style.opacity = Math.random() * 0.4 + 0.15;
            c.appendChild(p);
        }
    }

    // Comprobación inmediata + cada 2 segundos
    updateServerStatus(true);
    setInterval(() => updateServerStatus(), CHECK_INTERVAL);

    // Al volver a la pestaña, comprueba al instante
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
            updateServerStatus(true);
        }
    });

    // Botón ACTUALIZAR STATUS
    const refreshBtn = document.getElementById("refresh-status-btn");
    if (refreshBtn) {
        refreshBtn.addEventListener("click", async () => {
            refreshBtn.disabled = true;
            refreshBtn.textContent = "ACTUALIZANDO...";
            lastStatus = null;
            await updateServerStatus(true);
            refreshBtn.disabled = false;
            refreshBtn.textContent = "ACTUALIZAR STATUS";
        });
    }
});

function getDiscordLink(name, price) {
    const msg = `Hola @${DISCORD_ADMIN}! Quiero comprar: **${name}**
Precio: ${price}

Métodos de pago:

🌍 Internacional (México, Argentina, Venezuela y otros):
• PayPal
• Binance

🇨🇴 Colombia:
• Llave Bre-B
• Bancolombia

¿Me ayudas con el pago?`;

    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(msg);
        }
    } catch (e) {}

    return DISCORD_INVITE;
}
