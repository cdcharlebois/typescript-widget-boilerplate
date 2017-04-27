import * as dojoDeclare from "dojo/_base/declare";
import * as WidgetBase from "mxui/widget/_WidgetBase";

const declareWidget = (id: string, Widget: any) => {
    // tslint:disable : only-arrow-functions
    dojoDeclare(id, [ WidgetBase ], function(Source: any) {
        const result: any = {};
        for (const property in Source.prototype) {
            if (property !== "constructor" && Source.prototype.hasOwnProperty(property)) {
                result[property] = Source.prototype[property];
            }
        }
        return result;
    }(Widget));
}

function debug(this: any, method: string, msg = '') {
    logger.debug(`${this.id}.${method} ${msg}`);
}

export {
    declareWidget,
    debug
}
