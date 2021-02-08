import _, { chunk } from 'lodash';
import logger from '../../logger';

export default async function chunk_enqueue<T>(promises: (() => Promise<T>)[], options: { chunk_size: number | undefined, retries: number | undefined } = { chunk_size: 4, retries: 3 }) {
    const { chunk_size, retries } = options;
    const chunks = _.chunk(promises, chunk_size);
    let resolutions: T[] = [];
    let jobId = 0;
    let jobMaxId = chunks.length + 1;
    for (const chunk of chunks) {
        jobId++;
        let currentRetryCount = retries;
        //@ts-ignore
        while (retries > 0) {
            try {
                logger.context('info', 'chunk.enqueue', `Working on job #${jobId} of ${jobMaxId}`);
                resolutions = resolutions.concat(await Promise.all(chunk.map(job => job())));
                break;
            } catch (error) {
                logger.context('error', 'chunk.enqueue', `Error on chunk queue task, ${error}. Retry ${currentRetryCount} of ${retries}.`);
                //@ts-ignore
                currentRetryCount--;
            }
        }
    }

    return resolutions;
}