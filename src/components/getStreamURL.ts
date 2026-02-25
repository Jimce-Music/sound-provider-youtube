import { spawn } from 'child_process'

// Wir definieren einen Rückgabetyp für bessere Typsicherheit
export type YoutubeMetadata = {
    url: string
    title: string
    uploader: string // Artist
    thumbnail: string
    webpage_url: string
}

export default function getStreamYoutubeURL(videoURL: string) {
    return new Promise<YoutubeMetadata>((resolve, reject) => {
        if (!videoURL) {
            console.error('[Get Stream URL]', 'Bitte eine YouTube-URL angeben!')
            process.exit(1)
        }

        // ACHTUNG: Hier ändern wir '-g' zu '--dump-json'
        const args = [
            '--dump-json', 
            videoURL,
            '-f',
            'bestaudio',
            '--js-runtimes',
            'bun',
            '--cookies',
            'cookies.txt'
            // '--no-simulate' // Manchmal notwendig, um sicherzustellen, dass echte Stream-URLs generiert werden
        ]

        const yt = spawn('yt-dlp', args)
        
        let outputData = ''
        let errorData = ''

        yt.stdout.on('data', (data) => {
            // Wir sammeln den Output, da er gestückelt ankommen kann
            outputData += data.toString()
        })

        yt.stderr.on('data', (data) => {
            errorData += data.toString()
        })

        yt.on('close', (code) => {
            if (code !== 0) {
                console.error('[Get Stream URL] Error:', errorData)
                return reject(new Error(`yt-dlp exited with code ${code}`))
            }

            try {
                // Der Output ist ein JSON String. Wir parsen ihn.
                const json = JSON.parse(outputData)
                
                // Wir extrahieren nur das, was wir brauchen
                const metadata: YoutubeMetadata = {
                    url: json.url, // Die eigentliche Audio-Stream URL
                    title: json.title,
                    uploader: json.uploader,
                    thumbnail: json.thumbnail,
                    webpage_url: json.webpage_url
                }
                
                console.log('[Get Stream URL]', `Metadata fetched for: ${metadata.title}`)
                resolve(metadata)

            } catch (e) {
                console.error('[Get Stream URL] Could not parse JSON', e)
                reject(e)
            }
        })
    })
}