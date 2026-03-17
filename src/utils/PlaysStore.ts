// Save plays in RAM

export type PlayT = {
    uuid: string,
    downloadedCallback?: string,
    youtubeId: string,
    created: Date,
    meta?: {
        title: string
        artist: string
        thumbnail: string
        link: string
    }
}

export type PlaysStoreT = {
    [uuid: string]: PlayT
}

export const plays: PlaysStoreT = {
    
}