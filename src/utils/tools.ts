import { platform } from "os";

export interface Tool {
  name: string;
  checkCmd: string;
}

const system = platform();

export const tools: Tool[] = (() => {
  if (system === "win32") {
    return [
      { name: "yt-dlp", checkCmd: "yt-dlp.exe --version" },
      { name: "ffmpeg", checkCmd: "ffmpeg.exe -version" },
      { name: "ffprobe", checkCmd: "ffprobe.exe -version" }
    ];
  }

  return [
    { name: "yt-dlp", checkCmd: "yt-dlp --version" },
    { name: "ffmpeg", checkCmd: "ffmpeg -version" },
    { name: "ffprobe", checkCmd: "ffprobe -version" }
  ];
})();
