import { exec } from "child_process";

// YouTube URL aus CLI-Argument
const videoUrl = process.argv[2];
if (!videoUrl) {
  console.error("Bitte eine YouTube-URL angeben!");
  process.exit(1);
}

// Audio herunterladen, Dateiname = YouTube-Titel
const outputTemplate = "%(title)s.%(ext)s";

// Audio direkt mit yt-dlp herunterladen und in AAC konvertieren
exec(
  `yt-dlp -x --audio-format m4a --audio-quality 0 -o "${outputTemplate}" "${videoUrl}"`,
  (err, stdout, stderr) => {
    if (err) {
      console.error("Fehler beim Download/Extrahieren:", stderr);
      return;
    }
    console.log("Audio heruntergeladen.");

    // Optional: Metadaten setzen
    // Wir müssen den Titel aus stdout oder yt-dlp-Infos holen
    // Für einfache Fälle nehmen wir den generierten Dateinamen aus stdout
    const lines = stdout.split("\n").filter((line) => line.includes(".m4a"));
    const audioFile = lines.length ? lines[0].trim() : null;

    if (!audioFile) {
      console.warn("Dateiname konnte nicht ermittelt werden. Metadaten werden übersprungen.");
      return;
    }

    exec(
      `AtomicParsley "${audioFile}" --artist "Artist Name" --title "${audioFile.replace(/\.m4a$/, "")}" --overWrite`,
      (metaErr) => {
        if (metaErr) {
          console.warn("AtomicParsley nicht gefunden oder Fehler beim Setzen der Metadaten.");
          return;
        }
        console.log("Metadaten gesetzt:", audioFile);
      }
    );
  }
);
