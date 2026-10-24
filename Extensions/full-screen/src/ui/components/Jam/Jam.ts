import qrcode from "qrcode-generator";
import { DOM } from "../../elements";
import CFM from "../../../utils/config";

type JamSession = {
    sessionId: string;
    joinSessionToken: string;
    joinSessionUri: string;
    active: boolean;
} | null;

export class Jam {
    // Guards against a slow short link request overwriting a newer session
    static renderedSessionId: string | null = null;

    // The album art moves whenever it or the song details below it resize
    static artObserver = new ResizeObserver(() => Jam.alignToArt());

    static get api() {
        return Spicetify.Platform?.SocialConnectAPI;
    }

    static init() {
        if (!CFM.get("jamQrDisplay") || !this.api) return;
        this.destroy();
        this.api.getEvents?.()?.addListener("update", this.handleSessionUpdate);
        this.handleSessionUpdate({ data: this.api.getCurrentSession?.() ?? null });
        DOM.container.querySelectorAll("#fsd-art, #fsd-details").forEach((el) => this.artObserver.observe(el));
    }

    static destroy() {
        this.api?.getEvents?.()?.removeListener("update", this.handleSessionUpdate);
        this.artObserver.disconnect();
        this.renderedSessionId = null;
        DOM.container.classList.remove("jam-active");
    }

    static alignToArt() {
        const art = DOM.container.querySelector("#fsd-art");
        if (!art) return;
        const artRect = art.getBoundingClientRect();
        const containerTop = DOM.container.getBoundingClientRect().top;
        DOM.container.style.setProperty(
            "--jam-art-center",
            `${artRect.top - containerTop + artRect.height / 2}px`,
        );
        DOM.container.style.setProperty("--jam-art-size", `${artRect.width}px`);
    }

    static handleSessionUpdate = async ({ data: session }: { data: JamSession }) => {
        const jamContainer = DOM.container.querySelector<HTMLElement>("#fsd-jam-container");
        if (!jamContainer || !session?.joinSessionToken || !session.joinSessionUri) {
            Jam.renderedSessionId = null;
            DOM.container.classList.remove("jam-active");
            return;
        }
        if (Jam.renderedSessionId === session.sessionId) return;
        Jam.renderedSessionId = session.sessionId;

        let inviteUrl = `https://open.spotify.com/socialsession/${session.joinSessionToken}`;
        try {
            const shortLink = await Jam.api.getShortInviteLink(
                session.joinSessionToken,
                session.joinSessionUri,
                true,
            );
            if (shortLink?.shareableUrl) inviteUrl = shortLink.shareableUrl;
        } catch (err) {
            console.error("Error getting Jam invite link: ", err);
        }
        if (Jam.renderedSessionId !== session.sessionId) return;

        const qr = qrcode(0, "M");
        qr.addData(inviteUrl);
        qr.make();
        jamContainer.querySelector("#fsd-jam-qr")!.innerHTML = qr.createSvgTag({
            cellSize: 1,
            margin: 0,
            scalable: true,
        });
        DOM.container.classList.add("jam-active");
    };
}
