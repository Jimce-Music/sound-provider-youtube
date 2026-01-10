import { exec } from "child_process";
import { promisify } from "util";
import { tools } from "./tools";

const execAsync = promisify(exec);

async function checkDependencies() {
  let hasErrors = false;

  for (const tool of tools) {
    try {
      // checkCmd statt nur name verwenden
      await execAsync(tool.checkCmd);
      console.log(`${tool.name} ist installiert.`);
    } catch {
      console.error(`${tool.name} fehlt!`);
      hasErrors = true;
    }
  }

  if (hasErrors) {
    console.error("\nAbhängigkeiten fehlen. Stelle sicher, dass sie:");
    console.error("- im Dockerfile installiert sind ODER");
    console.error("- lokal im PATH verfügbar sind");
    process.exit(1);
  }

  console.log("\nAlle Dependencies sind verfügbar.");
}

checkDependencies().catch((err) => {
  console.error("Fehler beim Prüfen der Dependencies:", err);
  process.exit(1);
});
