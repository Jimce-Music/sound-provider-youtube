import { spawn } from "child_process";

const videoUrl = process.argv[2];
if (!videoUrl) {
  console.error("Bitte eine YouTube-URL angeben!");
  process.exit(1);
}

const args = [
  "-x",
  "--audio-format", "m4a",
  "--audio-quality", "0",
  "--progress",
  "-o", "%(title)s.%(ext)s",
  videoUrl
];

const yt = spawn("yt-dlp", args);

yt.stdout.on("data", (data) => {
  const line = data.toString().trim();
  if (line.includes("%")) {
    process.stdout.write(`\r${line}`);
  } else {
    console.log(line);
  }
});

yt.stderr.on("data", (data) => {
  process.stderr.write(data.toString());
});

yt.on("close", (code) => {
  console.log(`\nDownload beendet (Exit-Code ${code})`);
});
