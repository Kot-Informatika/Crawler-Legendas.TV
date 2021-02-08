import {SubtitleCrawler} from './modules/crawlers';
import ListInquirerLog from './modules/utils/list-inquirer';


if (!process.argv[2] || process.argv[2].length < 3) {
    console.log('You must pass a string containing at least 3 characters');
    process.exit(-1);
}

const crawler = new SubtitleCrawler.default();

crawler.start(process.argv[2]).then((response) => {
    const title = `Resultados encontrados para a pesquida "${response.query}" utilizando similaridade de ${response.similarity_threshold}: ${response.content.length}`
    const inquirer = ListInquirerLog(title, response.content.map(entry => {
        return `Nome: ${entry.name}\tDownloads: ${entry.sent_at}\tNota: ${entry.score}\tRatio: ${entry.like_ratio}\tEnviado por: ${entry.sent_by}\tEnviado em: ${entry.sent_at}\tIdioma: ${entry.language}\tLink: ${entry.download_link}`
    }));
    inquirer.print();
});
