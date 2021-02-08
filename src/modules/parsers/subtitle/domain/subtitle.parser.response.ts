export default interface SubtitleParserResponse {
    name: string;
    downloads: number;
    score: number;
    like_ratio: number;
    sent_by: string;
    sent_at: Date;
    language: string;
    download_link: string;
}