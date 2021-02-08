import { Page } from "puppeteer/lib/cjs/puppeteer/common/Page";

export default function checkLogin(page: Page): Promise<void> {
    return page.evaluate(() => {
        const login_error_message = document.querySelector('body > div.container > div.middle.login > section > div.alert.alert-error');
        const has_to_login_field = document.querySelector('body > div.container > header > section > div.login > a.js_entrar');

        if (login_error_message) {
            throw new Error('Unsuccessfull login');
        }

        if (has_to_login_field) {
            throw new Error('Not logged yet');
        }
    })
}