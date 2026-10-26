# Poggio Ruppelt — Sito web

Sito statico (HTML + CSS + JS vanilla, senza framework) per **Poggio Ruppelt — dal Tedesco 1930**, location per matrimoni, eventi e ristorante panoramico sulla Baia di Napoli, nel cuore dei Campi Flegrei.

Design ispirato, come linea editoriale, al sito eventi di Villa Ephrussi de Rothschild: hero a piena pagina, sezioni fotografiche eleganti, presentazione degli spazi, servizi, galleria con lightbox e modulo contatti.

## Struttura

```
.
├── index.html              # Pagina unica: hero, location, matrimoni, eventi, ristorante, galleria, contatti
├── 404.html                # Pagina di errore
├── robots.txt
├── .nojekyll               # Pubblicazione file statici così come sono su GitHub Pages
└── assets/
    ├── css/style.css       # Stili, palette prugna/rosa cipria/crema, responsive
    ├── js/main.js          # Nav mobile, reveal allo scroll, lightbox, validazione form
    └── images/             # Foto ottimizzate + logo (chiaro e bianco) + favicon
```

## Avvio locale

Qualsiasi server statico va bene, ad esempio:

```bash
python3 -m http.server 8080
# poi apri http://localhost:8080
```

## Modulo contatti

Il modulo è valido e prevalidato lato client. Per ricevere realmente le email,
imposta `FORM_ENDPOINT` in `assets/js/main.js` con un servizio compatibile
(es. [Formspree](https://formspree.io/), Getform) o con il tuo endpoint:

```js
const FORM_ENDPOINT = "https://formspree.io/f/xxxxxxxx";
```

## Pubblicazione su GitHub Pages

1. Push del branch `main` (o di un branch dedicato) su GitHub.
2. Repository → **Settings → Pages**.
3. *Build and deployment → Source: Deploy from a branch*, branch `main`, cartella `/ (root)`.
4. Il sito sarà online su `https://<utente>.github.io/poggioruppelt/`.

In alternativa è pubblicabile così com'è su Netlify, Vercel o qualsiasi hosting statico.

## Pagine demo interne (non linkate dal sito pubblico)

Due strumenti dimostrativi, raggiungibili solo conoscendo l'URL e bloccati ai motori di ricerca (`robots.txt`, `noindex`):

- **`/modulo/`** — raccoglitore «Dove ci hai trovato»: scheda per ciascun ospite con canale di provenienza (Instagram, Facebook, Google, passaparola…), contatori per canale, elenco filtrabile, export CSV. I dati restano nel `localStorage` del browser; al primo avvio carica alcuni record di esempio.
- **`/contratto/`** — compilatore del contratto eventi: replica delle 2 pagine A4 del modulo ufficiale con tipografia elegante (Cormorant Garamond + Jost), tutti i campi editabili, menu modificabile, salvataggio bozza nel browser (anche automatico) e pulsante **Stampa / Salva PDF** con fogli A4 fedeli all'originale.

Entrambe funzionano senza backend e senza dipendenze.

## Crediti fotografici

Foto e marchio forniti dalla proprietà (Poggio Ruppelt), utilizzati per questo progetto.
