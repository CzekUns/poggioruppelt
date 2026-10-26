/* ============================================================
   Compilatore contratto eventi — app.js
   Demo: bozza salvata nel browser (localStorage), stampa/PDF
   ============================================================ */
(function () {
  "use strict";

  const STORAGE_KEY = "pr_contratto_bozza_v1";
  const statusEl = document.getElementById("saveStatus");

  const fields = Array.prototype.slice.call(document.querySelectorAll("[data-save]"));

  /* Ad ogni campo senza id assegniamo una chiave stabile basata
     sull'ordine nel documento (tabella acconti, condizioni…). */
  fields.forEach(function (el, i) {
    if (!el.id) el.dataset.saveKey = "f" + i;
  });

  function keyOf(el) {
    return el.id ? "id:" + el.id : "key:" + el.dataset.saveKey;
  }
  function isEditableBlock(el) {
    return el.isContentEditable;
  }

  /* ---------- Salvataggio ---------- */
  function collect() {
    const data = {};
    fields.forEach(function (el) {
      data[keyOf(el)] = isEditableBlock(el) ? el.innerHTML : el.value;
    });
    return data;
  }

  function save(manual) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(collect()));
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      statusEl.textContent = (manual ? "Bozza salvata alle " : "Salvataggio automatico alle ") + hh + ":" + mm;
      statusEl.classList.add("ok");
    } catch (e) {
      statusEl.textContent = "Memoria del browser non disponibile";
      statusEl.classList.remove("ok");
    }
  }

  /* ---------- Ripristino ---------- */
  function restore() {
    let data;
    try {
      data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    } catch (e) {
      data = null;
    }
    if (!data) {
      statusEl.textContent = "Bozza non salvata";
      return;
    }
    fields.forEach(function (el) {
      const v = data[keyOf(el)];
      if (v === undefined) return;
      if (isEditableBlock(el)) el.innerHTML = v;
      else el.value = v;
    });
    statusEl.textContent = "Bozza ripristinata dal browser";
    statusEl.classList.add("ok");
  }

  /* ---------- Autosave con debounce ---------- */
  let timer = null;
  document.addEventListener("input", function () {
    window.clearTimeout(timer);
    timer = window.setTimeout(function () { save(false); }, 700);
  });

  /* ---------- Pulsanti ---------- */
  document.getElementById("btnSave").addEventListener("click", function () {
    save(true);
  });

  document.getElementById("btnReset").addEventListener("click", function () {
    if (!window.confirm("Azzera tutti i campi del contratto? La bozza salvata verrà eliminata.")) return;
    fields.forEach(function (el) {
      if (isEditableBlock(el)) {
        el.innerHTML = el.dataset.defaultHtml || el.innerHTML;
      } else if (el.tagName === "TEXTAREA") {
        el.value = "";
      } else if (el.defaultValue !== undefined && el.defaultValue !== "") {
        el.value = el.defaultValue; // mantiene i valori precompilati delle condizioni
      } else {
        el.value = "";
      }
    });
    localStorage.removeItem(STORAGE_KEY);
    statusEl.textContent = "Modulo azzerato";
    statusEl.classList.remove("ok");
  });

  document.getElementById("btnPrint").addEventListener("click", function () {
    save(true);
    window.print();
  });

  /* ---------- Scorciatoie da tastiera ---------- */
  document.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
      e.preventDefault();
      save(true);
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "p") {
      e.preventDefault();
      save(true);
      window.print();
    }
  });

  /* ---------- Init ---------- */
  // Memorizza l'HTML di default del menu per il pulsante Azzera
  fields.forEach(function (el) {
    if (isEditableBlock(el)) el.dataset.defaultHtml = el.innerHTML;
  });
  restore();
})();
