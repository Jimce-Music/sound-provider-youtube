import { spawn } from 'child_process'

const videoUrl = process.argv[2]
if (!videoUrl) {
    console.error('Bitte eine YouTube-URL angeben!')
    process.exit(1)
}

const args = ['-g', videoUrl, '-f', 'bestaudio']

const yt = spawn('yt-dlp', args)

yt.stdout.on('data', (data) => {
    const line = data.toString().trim()
    if (line.includes('googlevideo')) {
        console.log(line.trim())
    }
})

// yt.stderr.on("data", (data) => {
//   process.stderr.write(data.toString());
// });

yt.on('close', (code) => {
    console.log(`\nDownload beendet (Exit-Code ${code})`)
})
