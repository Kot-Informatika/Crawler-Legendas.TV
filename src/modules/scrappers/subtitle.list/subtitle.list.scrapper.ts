import { Page } from "puppeteer/lib/cjs/puppeteer/common/Page";
import ListSubtitleResponse from "./domain/subtitle.list.response";
import { link, analytics, list } from './domain/subtitle.list.selectors.json';

export default async function crawIndividualPage(page: Page): Promise<Array<ListSubtitleResponse>> {
    //@ts-ignore
    return page.evaluate(({ link, analytics, list }) => {
        const entries = Array.from(document.querySelectorAll(list));
        return entries.map((entry) => ({
            card_infos: {
                file_name: entry.querySelector(link)?.innerHTML,
                //@ts-ignore
                raw_analytics: entry.querySelector(analytics)?.innerText,
            },
            link: entry.querySelector(link)?.getAttribute('href'),
        })) as Array<ListSubtitleResponse>
    }, { list, link, analytics });
}