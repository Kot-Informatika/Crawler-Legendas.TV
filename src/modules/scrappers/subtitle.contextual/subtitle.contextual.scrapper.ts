import { Page } from "puppeteer/lib/cjs/puppeteer/common/Page";
import SubtitleContextualResponse from "./domain/subtitle.contextual.response";

export default function scrapPage(page: Page): Promise<SubtitleContextualResponse> {
    return page.evaluate(() => {
        const real_name = document.querySelector('body > div.container > div.middle.download > section.first > h3')?.innerHTML;
        const context_name = document.querySelector('body > div.container > div.middle.download > section.first > h5')?.innerHTML;
        const language = document.querySelector('body > div.container > div.middle.download > section:nth-child(2) > h1 > img')?.getAttribute('title');
        const action_download = document.querySelector('button.icon_arrow')?.getAttribute('onclick')
        //@ts-ignore
        const positive_likes = parseInt(document.querySelector('body > div.container > div.middle.download > section:nth-child(2) > aside:nth-child(4) > p:nth-child(1)').innerText || '0')
        //@ts-ignore
        const negative_likes = parseInt(document.querySelector('body > div.container > div.middle.download > section:nth-child(2) > aside:nth-child(4) > p:nth-child(2)').innerText || '0')

        const downloads = parseInt(document.querySelector('body > div.container > div.middle.download > section:nth-child(2) > aside:nth-child(3) > p > span')!.innerHTML);

        return {
            real_name: real_name as string,
            context_name: context_name as string,
            language: language as string,
            downloads,
            action_download: action_download as string,
            positive_likes,
            negative_likes,
        }
    })
}