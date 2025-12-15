Konvertiere den Blog-Artikel $ARGUMENTS in TTS-optimierten Text.

1. Entfernen:
   - Frontmatter, Markdown-Formatierung, URLs, Bilder, HTML-Tags

2. Umwandeln:
   - Überschriften als Überleitungen: "Schauen wir uns X an", "Fassen wir zusammen"
   - Tabellen und Aufzählungen als Fließtext
   - UI-Anleitungen beschreibend: "In den Einstellungen findest du..."
   - Abkürzungen ausschreiben: € → Euro, z.B. → zum Beispiel
   - Zahlen ausschreiben: 23 → dreiundzwanzig, 229 → zweihundertneunundzwanzig
   - Jahreszahlen: vor 2000 mit "hundert" (1990 → neunzehnhundertneunzig), ab 2000 mit "tausend" (2025 → zweitausendfünfundzwanzig)

3. Kürzen:
   - Redundanzen entfernen, Informationen nur einmal erwähnen
   - Zusammenfassungen kurz halten

4. Strukturieren:
   - Intro: "Ein Artikel von Stefan Gasser, vom [Datum]." <break time="0.8s" />
   - Titel des Artikels
   - Pausen: <break time="0.8s" /> zwischen Hauptabschnitten, <break time="0.5s" /> zwischen Unterabschnitten
   - Outro: <break time="0.5s" /> "Mehr dazu auf stefangasser.com"

Speichern als: [artikel].tts.txt neben der .md Datei
