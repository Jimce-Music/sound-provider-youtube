export async function checkJimceServerConnection () {
    const start = performance.now();
    const res = await fetch("http://localhost:4002/api/ping", { method: "GET", cache: "no-store" });
    if (!res.ok) throw new Error("Server nicht erreichbar");
    const ms = Math.round(performance.now() - start);
    console.log(`Ping: ${ms} ms`);
}