import SubtitleCrawlerResponse from "./domain/subtitle.crawler.response";
import {SubtitleContextualScrapper, SubtitleListScrapper} from '../../scrappers';
import pup from 'puppeteer';
import {Browser} from "puppeteer/lib/cjs/puppeteer/common/Browser";
import chunk_enqueue from '../../utils/chunk.enqueue';
import {Page} from "puppeteer/lib/cjs/puppeteer/common/Page";
import config from 'config';
import logger from '../../../logger';
import SubtitleContextualResponse from "../../scrappers/subtitle.contextual/domain/subtitle.contextual.response";
import SubtitleListResponse from "../../scrappers/subtitle.list/domain/subtitle.list.response";
import parseSubtitle from '../../parsers/subtitle/subtitle.parser';
import {getUriEncodedCredentials} from "../../utils/functors";
import checkLogin from "../../scrappers/check.login/check.login.scrapper";

const base_url = config.get('urls.base_url') as string;
const login_url = config.get('urls.login_url') as string;
const search_url = config.get('urls.search_url') as (query: string) => string;
const credentials = config.get('credentials.login') as { uname: string; passwd: string };

export default class SubtitleCrawler {
    private browser!: Browser;
    private page!: Page;

    public async start(query: string): Promise<SubtitleCrawlerResponse> {
        const search_prefix = search_url(query);
        const listOfSubtitlesToScrap = [];
        let continueScrappingAsTheresStillPages = true;
        let currentPage = 0;

        await this.spawn();
        await this.login();

        do {
            logger.context('info', 'CRAWLER', `Crawling for "${query}" through page ${currentPage + 1}...`);
            const currentPageUrl = `${search_prefix}/1/-/${currentPage}/-`;

            const foundSubtitles = await this.scrapPage(currentPageUrl);

            if(foundSubtitles.length < 1){
                continueScrappingAsTheresStillPages = false;
                break;
            }

            listOfSubtitlesToScrap.push(...foundSubtitles);

            ++currentPage;
        } while (continueScrappingAsTheresStillPages);

        logger.context('info', 'CRAWLER', 'All pages have been discovered, crawling deeper pages...');
        const rawSubtitles = await chunk_enqueue(listOfSubtitlesToScrap, config.get('chunk_enqueue'));
        logger.context('info', 'CRAWLER', 'Parsing found subtitles pieces of information...');
        const parsedSubtitles = parseSubtitle(rawSubtitles, query);

        let analytics = {
            crawled: rawSubtitles.length,
            parsed: parsedSubtitles.length,
        }

        logger.context('info', 'CRAWLER', 'Crawler Finished!');

        await this.page.close();
        await this.browser.close();
        return {
            analytics,
            content: parsedSubtitles,
            query,
            similarity_threshold: config.get('querySimilarityThreshold')
        }
    }

    private async spawn() {
        this.browser = await pup.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        this.page = await this.browser.newPage();
        await this.page.setRequestInterception(true);
        this.page.on('request', request => {
            const overrides: { method?: string; postData?: string, headers?: any } = {};
            if (request.url() === login_url) {
                overrides.method = 'POST';
                overrides.postData = getUriEncodedCredentials();
                overrides.headers = {
                    ...request.headers(),
                    'Content-Type': 'application/x-www-form-urlencoded' // replace headers

                }

            }
            request.continue(overrides);
        });
    }

    private async login() {
        logger.context('info', 'CRAWLER', 'LOGGING IN...');
        await this.page.goto(login_url);
        await checkLogin(this.page);
        logger.context('info', 'CRAWLER', 'LOGGED!');
    }

    private async scrapPage(currentPageUrl: string){
        const listOfSubtitlesToScrap = [];
        await this.page.goto(currentPageUrl);
        const rawScrappedSubtitles = await SubtitleListScrapper.default(this.page);
        if (rawScrappedSubtitles.length > 0) {
            for (const rawScrappedSubtitle of rawScrappedSubtitles) {
                listOfSubtitlesToScrap.push(
                    async () => {
                        const subtitlePage = await this.browser.newPage();
                        await subtitlePage.goto(`${base_url}/${rawScrappedSubtitle.link}`)
                        return SubtitleContextualScrapper.default(subtitlePage).then(response => {
                            subtitlePage.close();
                            return {...rawScrappedSubtitle, contextual_response: response};
                        });
                    }
                )
            }
        }
        return listOfSubtitlesToScrap;
    }
}
