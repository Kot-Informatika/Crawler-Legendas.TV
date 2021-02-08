import SubtitleContextualResponse from "../../scrappers/subtitle.contextual/domain/subtitle.contextual.response";
import SubtitleListResponse from "../../scrappers/subtitle.list/domain/subtitle.list.response";
import stringSimilarity from "string-similarity";
import config from 'config';
import moment from 'moment-timezone';


const infosMatcherRegex = /(\d+) downloads, nota (\d+), enviado por (.*) em (.*)/;
const downloadLinkMatcherRegex = /window\.open\('(.*)', '_self'\)/;

enum InfosMatcherFields {
    DOWNLOADS = 1,
    SCORE = 2,
    USERNAME = 3,
    DATE = 4,
}

export default function parseSubtitle(listOfSubtitleResponses: (SubtitleListResponse & { contextual_response: SubtitleContextualResponse })[], query: string): any {
    const parsed = [];
    for (const content of listOfSubtitleResponses) {
        const similarity = stringSimilarity.compareTwoStrings(content.contextual_response.context_name, query);
        if (similarity >= (config.get('querySimilarityThreshold') as number)) {
            const infos = content.card_infos.raw_analytics.match(infosMatcherRegex);
            if (!infos) {
                console.error(content)
                throw new Error('Could not parse RAW_ANALYTICS');
            }

            parsed.push({
                name: content.card_infos.file_name,
                downloads: content.contextual_response.downloads,
                score: parseInt(infos[InfosMatcherFields.SCORE]),
                like_ratio: content.contextual_response.negative_likes > 0 ? parseFloat((content.contextual_response.positive_likes / content.contextual_response.negative_likes).toFixed(2)) : '1.00',
                sent_by: infos[InfosMatcherFields.USERNAME],
                sent_at: moment(infos[InfosMatcherFields.DATE], 'DD/MM/YYYY - HH:mm').tz('Etc/UTC').toDate(),
                language: content.contextual_response.language,
                download_link: `${config.get('urls.base_url')}${content.contextual_response.action_download.match(downloadLinkMatcherRegex)![1]}`,
            });
        }
    }

    return parsed;
}
