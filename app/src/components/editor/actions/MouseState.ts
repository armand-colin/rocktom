import { Resource } from "@niloc/ecs";

const CLICK_PREVENTED_DELAY = 100;

export class MouseState extends Resource {

    private _clickPrevented = false;
    private _clickPreventedTimestamp = 0;

    setClickPrevented(prevented: boolean) {
        this._clickPrevented = prevented;
        
        if (prevented === false)
            this._clickPreventedTimestamp = Date.now()

        this.changed()
    }

    get clickPrevented() {
        return !this._clickPrevented && Date.now() - this._clickPreventedTimestamp < CLICK_PREVENTED_DELAY;
    }

}