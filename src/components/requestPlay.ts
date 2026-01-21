export type reqPlayArgsT= {
    identifier: string,
    "just-download": boolean,
    "save-while-streaming": boolean,
    "downlaoded-callback": string
}

export default function requestPlay(reqPlayArgs: reqPlayArgsT) {
    if (!reqPlayArgs.identifier) {

    }
}

// {
//   identifier: "https://www.youtube.com/watch?v=6EF64kAgtF4",
//   "just-download": "false",
//   "save-while-streaming": "true",
//   "downloaded-callback": "http://jimce-server:8080/api/downlaoded-callback/67as0fhufuiashiu",
// }
