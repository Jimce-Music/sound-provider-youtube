// tests/integration.test.ts
import { describe, it, expect, beforeAll, beforeEach, afterAll, mock } from 'bun:test'
import { buildApp } from '../app' // Importiere die App-Factory
import { plays } from '../utils/PlaysStore'

// Variable, um Fehler im Test zu steuern
let simulateError = false;

mock.module('child_process', () => {
    return {
        spawn: () => {
            return {
                stdout: { on: (event: string, cb: Function) => {
                    if (!simulateError && event === 'data') cb(Buffer.from('googlevideo.com/test'));
                }},
                stderr: { on: (event: string, cb: Function) => {
                    if (simulateError && event === 'data') cb(Buffer.from('YouTube Error: Video unavailable'));
                }},
                on: (event: string, cb: Function) => {
                    if (event === 'close') cb(simulateError ? 1 : 0); // 1 = Fehler, 0 = Erfolg
                }
            }
        }
    }
});

describe('Server Integration Tests', () => {
    let app: any;

    beforeAll(async () => {
        // Logger ausschalten für Tests
        app = await buildApp({ logger: false }) 
        await app.ready()
    })

    beforeEach(() => {
    // Leert das Objekt, ohne die Referenz zu zerstören
        for (const prop in plays) { delete plays[prop]; }
    });

    afterAll(async () => {
        await app.close()
    })

    describe('API Route Tests', () => {
        it('GET /ping should return pong', async () => {
            const response = await app.inject({
                method: 'GET',
                url: '/ping'
            })
            expect(response.statusCode).toBe(200)
            expect(response.body).toBe('pong')
        })

        it('GET /info should return metadata', async () => {
            const response = await app.inject({
                method: 'GET',
                url: '/info'
            })
            const json = response.json()
            expect(response.statusCode).toBe(200)
            expect(json.success).toBe(true)
            expect(json['prvider-type']).toBe('youtube')
        })

        it('GET /request-play should validate identifier', async () => {
            const response = await app.inject({
                method: 'GET',
                url: '/request-play'
            })
            expect(response.statusCode).toBe(400)
        })

        it('GET /request-play (mocked) should return uuid', async () => {
            const response = await app.inject({
                method: 'GET',
                url: '/request-play?identifier=dQw4w9WgXcQ'
            })
            const json = response.json()
            
            expect(response.statusCode).toBe(200)
            expect(json.success).toBe(true)
            expect(json.uuid).toBeDefined()
            expect(json.streamUrl).toBeDefined() // Da unser Mock eine URL zurückgibt
        })

        it('GET /stream should return stream url for valid UUID', async () => {
            // Erst eine Play-Request machen, um eine UUID zu bekommen
            const playRes = await app.inject({
                method: 'GET',
                url: '/request-play?identifier=dQw4w9WgXcQ'
            })
            const uuid = playRes.json().uuid

            // Dann Stream anfragen
            const response = await app.inject({
                method: 'GET',
                url: `/stream?id=${uuid}`
            })
            
            const json = response.json()
            expect(response.statusCode).toBe(200)
            expect(json.success).toBe(true)
            // Checken ob der Mock-Wert zurückkommt
            expect(json.downloadedCallback).toContain('googlevideo.com')
        })

        it('GET /request-play with just-download should trigger download logic', async () => {
            const response = await app.inject({
                method: 'GET',
                url: '/request-play?identifier=dQw4w9WgXcQ&just-download=true'
            })
            const json = response.json()
            
            expect(response.statusCode).toBe(200)
            expect(json.success).toBe(true)
            // Bei just-download bekommen wir eine UUID, aber keine streamUrl direkt (je nach Logik)
            expect(json.uuid).toBeDefined()
        })

        it('GET /download should start download process for valid UUID', async () => {
            // 1. Erst einen Play-Request machen (damit der Eintrag im Store ist)
            // Wir nutzen "just-download", damit der Store Eintrag korrekt vorbereitet ist
            const playRes = await app.inject({
                method: 'GET',
                url: '/request-play?identifier=dQw4w9WgXcQ&just-download=true'
            })
            const uuid = playRes.json().uuid

            // 2. Jetzt den expliziten Download Endpoint aufrufen
            const response = await app.inject({
                method: 'GET',
                url: `/download?id=${uuid}`
            })
            
            const json = response.json()
            expect(response.statusCode).toBe(200)
            expect(json.success).toBe(true)
        })

        it('GET /download should fail without uuid', async () => {
            const response = await app.inject({
                method: 'GET',
                url: '/download'
            })
            expect(response.statusCode).toBe(400)
        })

        it('should reuse existing play data when requested again', async () => {
            const identifier = 'duplicate-test-id';
            
            // Erster Aufruf: Erstellt den Eintrag
            const res1 = await app.inject({
                method: 'GET',
                url: `/request-play?identifier=${identifier}`
            });
            const uuid1 = res1.json().uuid;

            // Zweiter Aufruf: Sollte die gleiche UUID zurückgeben
            const res2 = await app.inject({
                method: 'GET',
                url: `/request-play?identifier=${identifier}`
            });
            const uuid2 = res2.json().uuid;

            expect(uuid1).toBe(uuid2); // Prüft, ob der Cache in PlaysStore funktioniert
        });

        it('should handle save-while-streaming flag correctly', async () => {
            const response = await app.inject({
                method: 'GET',
                url: '/request-play?identifier=test-id-3&save-while-streaming=true'
            });
            
            expect(response.statusCode).toBe(200);
            expect(response.json().streamUrl).toBeDefined(); // Stream URL muss trotz Download-Flag da sein
        });

        it('should return a valid-looking google video URL', async () => {
            const response = await app.inject({
                method: 'GET',
                url: '/request-play?identifier=dQw4w9WgXcQ'
            });
            
            const streamUrl = response.json().streamUrl;
            // Prüft, ob die URL von yt-dlp das erwartete Format hat
            expect(streamUrl).toContain('googlevideo.com'); 
        });

        it('should eventually update the stream URL in background when just-download is used', async () => {
            const response = await app.inject({
                method: 'GET',
                url: '/request-play?identifier=async-test&just-download=true'
            });
            const uuid = response.json().uuid;

            // Wir warten 100ms, damit setImmediate/Promise Zeit haben
            await new Promise(resolve => setTimeout(resolve, 100));

            const streamRes = await app.inject({
                method: 'GET',
                url: `/stream?id=${uuid}`
            });
            
            // Jetzt sollte die URL da sein, auch wenn sie asynchron geholt wurde
            expect(streamRes.json().downloadedCallback).toBeDefined();
        });
    })

    describe('Download Component Deep Test', () => {
        it('should handle yt-dlp errors gracefully', async () => {
            simulateError = true; // Fehler-Modus aktivieren
            
            // Wir rufen die Route auf, die den Download triggert
            const response = await app.inject({
                method: 'GET',
                url: '/request-play?identifier=error-video&just-download=true'
            });
            
            // Wir warten kurz, damit der asynchrone setImmediate-Block (mit dem Error) läuft
            await new Promise(resolve => setTimeout(resolve, 50));
            
            expect(response.statusCode).toBe(200); // Die API antwortet trotzdem, da Download im Hintergrund läuft
            simulateError = false; // Reset für nächste Tests
        });

        it('should trigger download when an existing play is requested again with download flags', async () => {
            // Deckt requestPlayHandler.ts Zeile 28 ab (existingPlay mit justDownload)
            const id = 're-download-id';
            
            // 1. Erstmalig erstellen (nur Stream)
            await app.inject({ method: 'GET', url: `/request-play?identifier=${id}` });
            
            // 2. Erneut anfragen, diesmal mit download flag
            const response = await app.inject({
                method: 'GET',
                url: `/request-play?identifier=${id}&just-download=true`
            });
            
            expect(response.statusCode).toBe(200);
        });
    });
})
