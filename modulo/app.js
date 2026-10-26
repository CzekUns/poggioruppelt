/* ============================================================
   Modulo «Dove ci hai trovato» — app.js
   Demo: salvataggio locale nel browser (localStorage) + export CSV
   ============================================================ */
(function () {
  "use strict";

  const STORAGE_KEY = "pr_raccoglitore_ospiti_v1";
  const SEED_FLAG = "pr_raccoglitore_seed_v1";

  const CHANNEL_COLORS = {
    "Instagram": "#c1558b",
    "Facebook": "#3f5d9c",
    "Google": "#4a8f5b",
    "Passaparola": "#b08d57",
    "Sito web": "#5b7fa6",
    "Matrimonio.com": "#a86b7c",
    "Fiera / evento": "#7e8f74",
    "Altro": "#8a7a96"
  };
  const CHANNELS = Object.keys(CHANNEL_COLORS);

  const form = document.getElementById("guestForm");
  const formMsg = document.getElementById("formMsg");
  const rowsEl = document.getElementById("guestRows");
  const statsList = document.getElementById("statsList");
  const totalEl = document.getElementById("totalGuests");
  const emptyEl = document.getElementById("emptyState");
  const searchInput = document.getElementById("searchInput");
  const channelFilter = document.getElementById("channelFilter");

  /* ---------- Persistenza ---------- */
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }
  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(guests));
  }

  /* ---------- Dati di esempio (solo primo avvio) ---------- */
  function seed() {
    if (localStorage.getItem(SEED_FLAG)) return;
    const today = new Date();
    function d(back) {
      const dt = new Date(today);
      dt.setDate(dt.getDate() - back);
      return dt.toISOString().slice(0, 10);
    }
    guests = [
      { id: uid(), data: d(2), nome: "Giulia", cognome: "Rossi", tavolo: "9", canale: "Instagram", nota: "Ha visto le stories del matrimonio di giugno" },
      { id: uid(), data: d(2), nome: "Marco", cognome: "Esposito", tavolo: "4", canale: "Passaparola", nota: "Consigliato dagli sposi del 2024" },
      { id: uid(), data: d(1), nome: "Anna", cognome: "Bianchi", tavolo: "12", canale: "Matrimonio.com", nota: "" },
      { id: uid(), data: d(1), nome: "Luca", cognome: "Russo", tavolo: "7", canale: "Google", nota: "Cercava «location matrimoni Campi Flegrei»" },
      { id: uid(), data: d(0), nome: "Chiara", cognome: "Ferrara", tavolo: "2", canale: "Instagram", nota: "" },
      { id: uid(), data: d(0), nome: "Salvatore", cognome: "De Luca", tavolo: "5", canale: "Facebook", nota: "" },
      { id: uid(), data: d(0), nome: "Federica", cognome: "Gallo", tavolo: "11", canale: "Fiera / evento", nota: "Incontrati a esposizione wedding" },
      { id: uid(), data: d(0), nome: "Antonio", cognome: "Marino", tavolo: "3", canale: "Passaparola", nota: "Amico di famiglia" }
    ];
    save();
    localStorage.setItem(SEED_FLAG, "1");
  }
  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  let guests = load();

  /* ---------- Popola filtro canali ---------- */
  CHANNELS.forEach(function (c) {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    channelFilter.appendChild(opt);
  });

  /* ---------- Render ---------- */
  function fmtDate(iso) {
    if (!iso) return "—";
    const [y, m, day] = iso.split("-");
    return day + "/" + m + "/" + y;
  }

  function renderStats() {
    const counts = {};
    CHANNELS.forEach(function (c) { counts[c] = 0; });
    guests.forEach(function (g) {
      if (counts[g.canale] === undefined) counts[g.canale] = 0;
      counts[g.canale] += 1;
    });
    const total = guests.length;
    totalEl.textContent = total;

    statsList.innerHTML = "";
    CHANNELS.filter(function (c) { return counts[c] > 0; })
      .sort(function (a, b) { return counts[b] - counts[a]; })
      .forEach(function (c) {
        const pct = total ? Math.round((counts[c] / total) * 100) : 0;
        const li = document.createElement("li");
        li.className = "stats-item";
        li.innerHTML =
          '<div class="stats-top"><strong>' + escapeHtml(c) + "</strong>" +
          "<span>" + counts[c] + " · " + pct + "%</span></div>" +
          '<div class="bar"><i style="width:' + pct + '%;--c:' + CHANNEL_COLORS[c] + ';background:' + CHANNEL_COLORS[c] + '"></i></div>';
        statsList.appendChild(li);
      });
    if (!statsList.children.length) {
      statsList.innerHTML = '<li style="color:var(--muted);font-size:.92rem">Nessun dato disponibile.</li>';
    }
  }

  function renderTable() {
    const q = searchInput.value.trim().toLowerCase();
    const f = channelFilter.value;
    const list = guests
      .filter(function (g) {
        const matchQ = !q || ((g.nome + " " + g.cognome + " " + (g.nota || "")).toLowerCase().indexOf(q) !== -1);
        const matchC = !f || g.canale === f;
        return matchQ && matchC;
      })
      .sort(function (a, b) { return (b.data || "").localeCompare(a.data || ""); });

    rowsEl.innerHTML = "";
    list.forEach(function (g, i) {
      const tr = document.createElement("tr");
      const color = CHANNEL_COLORS[g.canale] || "#8a7a96";
      tr.innerHTML =
        "<td>" + (i + 1) + "</td>" +
        "<td>" + fmtDate(g.data) + "</td>" +
        '<td class="guest-name">' + escapeHtml(g.nome + " " + g.cognome) + "</td>" +
        "<td>" + escapeHtml(g.tavolo || "—") + "</td>" +
        '<td><span class="tag" style="--tag-c:' + color + '">' + escapeHtml(g.canale) + "</span></td>" +
        "<td>" + escapeHtml(g.nota || "—") + "</td>" +
        '<td><button type="button" class="row-del" data-id="' + g.id + '" aria-label="Elimina scheda">&times;</button></td>';
      rowsEl.appendChild(tr);
    });
    emptyEl.classList.toggle("show", list.length === 0);
  }

  function render() {
    renderStats();
    renderTable();
  }

  function escapeHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  /* ---------- Nuova scheda ---------- */
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const nome = form.nome.value.trim();
    const cognome = form.cognome.value.trim();
    const canale = form.querySelector('input[name="canale"]:checked');

    formMsg.className = "form-msg";
    if (!nome || !cognome || !canale) {
      formMsg.textContent = "Compila nome, cognome e scegli un canale.";
      formMsg.classList.add("err");
      return;
    }

    guests.push({
      id: uid(),
      data: form.data.value || new Date().toISOString().slice(0, 10),
      nome: nome,
      cognome: cognome,
      tavolo: form.tavolo.value.trim(),
      canale: canale.value,
      nota: form.nota.value.trim()
    });
    save();
    render();
    form.reset();
    form.data.value = new Date().toISOString().slice(0, 10);
    formMsg.textContent = "Scheda aggiunta: " + nome + " " + cognome + " · " + canale.value;
    formMsg.classList.add("ok");
    window.setTimeout(function () { formMsg.textContent = ""; }, 3500);
  });

  /* ---------- Elimina / azzera ---------- */
  rowsEl.addEventListener("click", function (e) {
    const btn = e.target.closest(".row-del");
    if (!btn) return;
    guests = guests.filter(function (g) { return g.id !== btn.dataset.id; });
    save();
    render();
  });

  document.getElementById("clearAll").addEventListener("click", function () {
    if (!guests.length) return;
    if (!window.confirm("Eliminare tutte le schede ospiti? L'operazione non è annullabile.")) return;
    guests = [];
    save();
    render();
  });

  /* ---------- Filtri ---------- */
  searchInput.addEventListener("input", renderTable);
  channelFilter.addEventListener("change", renderTable);

  /* ---------- Export CSV (Excel, separatore ;) ---------- */
  document.getElementById("exportCsv").addEventListener("click", function () {
    if (!guests.length) {
      window.alert("Non ci sono dati da esportare.");
      return;
    }
    const header = ["Data", "Nome", "Cognome", "Tavolo", "Canale", "Nota"];
    const lines = guests.map(function (g) {
      return [g.data, g.nome, g.cognome, g.tavolo, g.canale, g.nota]
        .map(csvCell).join(";");
    });
    const fileContent = "\uFEFF" + header.join(";") + "\r\n" + lines.join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = "dove-ci-hai-trovato_" + stamp + ".csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
  function csvCell(v) {
    v = String(v == null ? "" : v);
    if (/[;"\r\n]/.test(v)) v = '"' + v.replace(/"/g, '""') + '"';
    return v;
  }

  /* ---------- Init ---------- */
  seed();
  guests = load();
  form.data.value = new Date().toISOString().slice(0, 10);
  render();
})();
