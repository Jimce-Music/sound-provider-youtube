// Save plays in RAM

export type PlayT = {
    uuid: string,
    downloadedCallback?: string,
    youtubeId: string,
    created: Date
    //...
}

export type PlaysStoreT = {
    [uuid: string]: PlayT
}

export const plays: PlaysStoreT = {
    
}