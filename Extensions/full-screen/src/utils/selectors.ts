// Spotify 1.3.5+ ships new hashed class names that Spicetify no longer maps to readable
// `main-*` / `Root__*` names, so each lookup tries the legacy class selectors first and then
// falls back to stable ids / data-testid attributes.
class HtmlSelectors {
    private static readonly EXTRA_BAR_SELECTORS = [
        ".main-nowPlayingBar-right",
        ".Y6soMMBElF7EQDbJv8Xb",
    ];
    // Buttons that live in the now playing bar's extra controls (bottom right) container
    private static readonly EXTRA_BAR_BUTTON_TEST_IDS = [
        "lyrics-button",
        "control-button-queue",
        "fullscreen-mode-button",
        "pip-toggle-button",
    ];
    private static readonly TOP_BAR_SELECTORS = [
        ".main-globalNav-navRight",
        ".main-topBar-topbarContentRight>.main-actionButtons",
        ".main-topBar-topbarContentRight",
        ".vRrKblnUUQV5eMbvUdv8>.CuBx12mEGmMQ1XAXHZCs",
        ".main-topBar-historyButtons",
        ".XjaqJVmY9FrZPbQjWDjw.main-actionButtons",
        "#global-nav-bar>div:last-child>div:has(>[data-testid='user-widget-link'])",
        "#global-nav-bar>div:last-child",
    ];
    private static readonly TOP_CONTAINER_SELECTORS = [".Root__top-container", ".Root>div:has(>#global-nav-bar)"];
    private static readonly ORIGINAL_QUEUE_BUTTON_SELECTORS = [
        "div.Y6soMMBElF7EQDbJv8Xb > div > div > button",
        "div.main-nowPlayingBar-right > div > div > button",
        "[data-testid='now-playing-bar'] [data-testid='control-button-queue']",
    ];
    private static readonly RIGHT_PANEL_SELECTORS = [".Root__right-sidebar", "#main-view+div"];

    private static queryFirst(selectors: string[]): HTMLElement | null {
        for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element) return element as HTMLElement;
        }
        return null;
    }

    static getTopBarSelector(): HTMLElement | null {
        return this.queryFirst(this.TOP_BAR_SELECTORS);
    }

    static getExtraBarSelector(): HTMLElement | null {
        for (const selector of this.EXTRA_BAR_SELECTORS) {
            const element = document.querySelector(selector)?.childNodes[0];
            if (element) return element as HTMLElement;
        }

        // Fallback: the container that holds two or more of the known extra control buttons
        const nowPlayingBar = document.querySelector("[data-testid='now-playing-bar']");
        const buttons = this.EXTRA_BAR_BUTTON_TEST_IDS.map((id) =>
            nowPlayingBar?.querySelector(`[data-testid='${id}']`),
        ).filter((el): el is Element => !!el);
        if (buttons.length < 2) return null;

        let container = buttons[0].parentElement;
        while (container && !container.contains(buttons[1])) container = container.parentElement;
        return container;
    }

    static getOriginalQueueButton(): HTMLElement | null {
        return this.queryFirst(this.ORIGINAL_QUEUE_BUTTON_SELECTORS);
    }

    static getRightPanel(): HTMLElement | null {
        return this.queryFirst(this.RIGHT_PANEL_SELECTORS);
    }

    static getTopContainer(): HTMLElement | null {
        return this.queryFirst(this.TOP_CONTAINER_SELECTORS);
    }
}

export default HtmlSelectors;
