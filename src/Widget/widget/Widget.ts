import { declare, debug } from './lib/helpers';
import * as WidgetBase from "mxui/widget/_WidgetBase";

import "./ui/Widget.css";

class Widget extends WidgetBase {
    debug: (msg: string) => void

    postCreate() {
        this.debug = debug.bind(this);

    }

    uninitialize(): boolean {
        this.debug('uninitialize');
        return true;
    }
}

declare('Widget.widget.Widget', Widget);
