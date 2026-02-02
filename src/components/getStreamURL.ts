import { spawn } from 'child_process'

export default function getStreamYoutubeURL(videoURL: string) {
    return new Promise<string>((resolve, reject) => {
        if (!videoURL) {
            console.error('[Get Stream URL]', 'Bitte eine YouTube-URL angeben!')
            process.exit(1)
        } else {
            console.log('[Get Stream URL]', 'Recived youtube ID/URL:', videoURL)
            console.log('[Get Stream URL]', 'Getting streamURL for ID/URL:')
        }

        const args = [
            '-g',
            videoURL,
            '-f',
            'bestaudio',
            '--js-runtimes',
            'bun',
            '--remote-components',
            'ejs:github'
        ]

        const yt = spawn('yt-dlp', args)

        yt.stdout.on('data', (data) => {
            const line = data.toString().trim()
            if (line.includes('googlevideo')) {
                console.log('[Get Stream URL]', line.trim())
                resolve(line.trim())
            }
        })

        // yt.stderr.on("data", (data) => {
        //   process.stderr.write(data.toString());
        // });

        yt.on('close', (code) => {
            console.log(
                '[Get Stream URL]',
                `\nDownload beendet (Exit-Code ${code})`
            )
        })
    })
}
