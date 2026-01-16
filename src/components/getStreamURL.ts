import { spawn } from 'child_process'

export default function getStreamYoutubeURL(videoURL:string) {
    return new Promise<string>((resolve, reject) => {
        if (!videoURL) {
            console.error('Bitte eine YouTube-URL angeben!')
            process.exit(1)
        } else {
            console.log("[Getted Youtube Video URL]", videoURL)
        }

        const args = ['-g', videoURL, '-f', 'bestaudio']

        const yt = spawn('yt-dlp', args)

        yt.stdout.on('data', (data) => {
            const line = data.toString().trim()
            if (line.includes('googlevideo')) {
                console.log(line.trim())
                resolve(line.trim())
            }
        })

        // yt.stderr.on("data", (data) => {
        //   process.stderr.write(data.toString());
        // });

        yt.on('close', (code) => {
            console.log(`\nDownload beendet (Exit-Code ${code})`)
        })
    })
}