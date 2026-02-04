import { plays } from '../utils/PlaysStore'
import * as uuid from 'uuid'
import getStreamYoutubeURL from './getStreamURL'
import downloadYoutubeAudio from './download'

type RequestPlayArgs = {
    youtubeId: string
    justDownload: boolean
    saveWhileStreaming: boolean
}

export async function handleRequestPlay({
    youtubeId,
    justDownload,
    saveWhileStreaming
}: RequestPlayArgs) {

    const existingPlay = Object.values(plays).find(
        play => play.youtubeId === youtubeId
    )

    if (existingPlay) {

        if (justDownload || saveWhileStreaming) {
            setImmediate(() => {
                try {
                    downloadYoutubeAudio(existingPlay.youtubeId)
                } catch (err) {
                    console.error(err)
                }
            })
        }

        if (justDownload && !saveWhileStreaming) {
            return {
                uuid: existingPlay.uuid
            }
        }

        return {
            uuid: existingPlay.uuid,
            streamUrl: existingPlay.downloadedCallback,
            // Metadata
            title: existingPlay.meta?.title,
            artist: existingPlay.meta?.artist,
            thumbnail: existingPlay.meta?.thumbnail,
            link: existingPlay.meta?.link
        }
    }

    const playId = uuid.v4()

    // JUST DOWNLOAD MODE
    if (justDownload && !saveWhileStreaming) {

        plays[playId] = {
            uuid: playId,
            created: new Date(),
            youtubeId,
            downloadedCallback: undefined
        }

        setImmediate(() => {
            try {
                downloadYoutubeAudio(youtubeId)
            } catch (err) {
                console.error(err)
            }
        })

        setImmediate(async () => {
            try {
                const url = await getStreamYoutubeURL(youtubeId)
                if (plays[playId]) {
                    plays[playId].downloadedCallback = url
                }
            } catch (err) {
                console.error(err)
            }
        })

        return { uuid: playId }
    }

    // STREAM MODE
    const metadata = await getStreamYoutubeURL(youtubeId)

    plays[playId] = {
        uuid: playId,
        created: new Date(),
        youtubeId,
        downloadedCallback: metadata.url,
        // Save Metadata in PlayStore
        meta: {
            title: metadata.title,
            artist: metadata.uploader,
            thumbnail: metadata.thumbnail,
            link: metadata.webpage_url
        }
    }

    if (saveWhileStreaming) {
        setImmediate(() => {
            try {
                downloadYoutubeAudio(youtubeId)
            } catch (err) {
                console.error(err)
            }
        })
    }

    console.log('[TEST]', metadata)

    return {
        uuid: playId,
        streamUrl: metadata.url,
        // Metadata
        title: metadata.title,
        artist: metadata.uploader,
        thumbnail: metadata.thumbnail,
        link: metadata.webpage_url
    }
}
