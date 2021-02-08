import SubtitleParserResponse from "../../../parsers/subtitle/domain/subtitle.parser.response";

export default interface SubtitleCrawlerResponse {
    content: SubtitleParserResponse[],
    analytics: {
        crawled: number,
        parsed: number,
    }
    query: string;
    similarity_threshold: number;
}