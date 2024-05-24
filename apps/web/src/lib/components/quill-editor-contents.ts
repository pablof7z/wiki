import Quill from "quill";
import {deltaToMarkdown} from "quill-delta-to-markdown";

function processMentions(deltas: any[]) {
    const res: any[] = [];

    deltas.forEach((delta, i) => {
        if (delta.insert?.mention?.id) {
            const id = `nostr:${delta.insert.mention.id}`;
            if (deltas[i + 1]) {
                deltas[i + 1].insert = id + " " + deltas[i + 1].insert;
            } else {
                console.error("No next element in the array")
            }
        } else {
            res.push(delta);
        }
    });

    return res;
}

export function getContents(quill: Quill) {
    let delta = quill.getContents().ops;

    delta = processMentions(delta);

    const md = deltaToMarkdown(delta)

    return md;
    // return quill.getContents().ops
    //     .map((op) => {
    //         console.log(op);
    //         if (typeof op.insert === 'string') {
    //             return op.insert;
    //         }

    //     })
    // .join('');
}