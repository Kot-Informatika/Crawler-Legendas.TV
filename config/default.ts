import dotenv from 'dotenv'
dotenv.config();

export default {
    urls: {
        "base_url": "http://legendas.tv",
        "login_url": "http://legendas.tv/login",
        get search_url() {
            return (query: string) => `${this.base_url}/legenda/busca/${query}`
        },
    },
    credentials: {
        login: {
            uname: process.env.uname,
            passwd: process.env.passwd,
        }
    },
    chunk_enqueue: {
        "chunk_size": 30,
        "retries": 5,
    },
    page_workers: 5,
    querySimilarityThreshold: 0.1,
}