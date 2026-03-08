

# Business Idea Validator App

Eine App für 4 Unternehmer, um Geschäftsideen systematisch zu bewerten und zu vergleichen.

## Seiten & Navigation

- **Tab-Leiste oben**: 3 vorgeladene Ideen (Recruiting-Agentur, IT-Digitalisierung, SaaS-Automation) als Tabs. Tabs können umbenannt, gelöscht und neue hinzugefügt werden (Inline-Input mit Enter).
- **Zwei Views pro Idee**: Scoring View (Standard) und Compare View (Button in der Leiste).

## Scoring View

- **Kontext-Notizen**: Editierbares Textfeld oben, vorausgefüllt mit den Idee-Details.
- **Kriterien-Gruppen**: 5 Kategorien (Finanzen 35%, Lifestyle 15%, Markt 20%, Operations 15%, Risiken 15%) mit farbcodierten Headern und Gewichtungs-Badges.
- **Bewertung**: 1–5 Buttons pro Kriterium. Beim Klick erscheint der Hint-Text (z.B. "1 = >12 Monate", "5 = <30 Tage"). Animierter Score-Counter.
- **Rechte Sidebar**: Live-Gesamtscore mit Grade-Badge (GO/MAYBE/NO-GO), animierte Balken pro Kategorie und Kriterium, Liste unbeantworteter Kriterien.

## Compare View

- **Ranking-Liste**: Ideen sortiert nach Score. Jede Zeile zeigt Rang, Name, farbigen Fortschrittsbalken (grün/gelb/rot), Mini-Balkenchart der Kategorie-Scores, Gesamtscore + Badge. Klick → Scoring View.
- **Radar Chart**: Spider-Chart (Recharts) mit allen Ideen überlagert, 5 Achsen = 5 Kategorien.
- **Export**: Button zum Exportieren als PNG/PDF via html2canvas.

## Design

- Brutalistisch-minimal: Keine abgerundeten Ecken, keine Schatten, keine Verläufe.
- Dark Theme (#080808 Hintergrund, #E0E0E0 Text).
- Fonts: Bebas Neue (Überschriften/Scores), DM Mono (Body/Labels).
- Akzent: #FFD600. Kategoriefarben: Finanzen #00FF87, Lifestyle #FF6B35, Markt #00B4FF, Operations #CC88FF, Risiken #FF4444.
- Balkenfarben nach Score: grün (4–5), gelb (3), orange (1–2).

## Daten & Persistenz

- Alle Daten (Ideen, Scores, Notizen) werden in localStorage gespeichert.
- 3 Ideen mit Notizen und allen 23 Kriterien vorgeladen.
- Gewichtete Durchschnittsberechnung für Gesamtscore und Grading-Logik (≥4.2 GO, 3.2–4.1 MAYBE, <3.2 NO-GO).

## Technisch

- React + TypeScript, Tailwind + Inline Styles, Recharts für Radar Chart, html2canvas für Export. Keine zusätzlichen UI-Libraries.

