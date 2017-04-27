import * as dojoDeclare from "dojo/_base/declare";
import * as WidgetBase from "mxui/widget/_WidgetBase";

/**
 * Declare a widget. This should be used at the end of a widget
 *
 * @param  {string} id     Id of the widget. This should follow the "WidgetName.widget.WidgetName" convention
 * @param  {any}    Widget Widget class. This should be an extension of 'WidgetBase'
 * @return {void}           [description]
 */
function declareWidget(id: string, Widget: any):void {
    dojoDeclare(id, [WidgetBase], function(Source: any) {
        const result: any = {};
        for (const property in Source.prototype) {
            if (property !== "constructor" && Source.prototype.hasOwnProperty(property)) {
                result[property] = Source.prototype[property];
            }
        }
        return result;
    } (Widget));
}

/**
 * Executes a callback and logs the method from where the callback was called
 * @param  {string}     from method identifier
 * @param  {function}   cb   callback function
 * @return {void}       [description]
 */
function executeCallback(this:any, from: string, cb?: () => void):void {
    if (cb) {
        window.logger && window.logger.debug(`${this.id} execute callback from ${from}`);
        cb();
    }
}

export {
    declareWidget,
    executeCallback
}
