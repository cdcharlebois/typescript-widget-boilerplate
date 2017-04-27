import { declareWidget, executeCallback } from './lib/helpers';
import * as WidgetBase from 'mxui/widget/_WidgetBase';

import './ui/Widget.scss';

class Widget extends WidgetBase {
    // Set in modeler
    public name: string;

    // Private properties
    private _execCB: typeof executeCallback;
    private _contextObj: mendix.lib.MxObject;

    // This could be omitted
    constructor() {
        super();
    }

    // Public methods (overridden from WidgetBase)
    postCreate() {
        this._execCB = executeCallback.bind(this);
    }

    update(obj: mendix.lib.MxObject, cb?:() => void){
        this._contextObj = obj;
        this._updateRendering(cb);
    }

    uninitialize(): boolean {
        return true;
    }

    // Private methods
    private _updateRendering(cb?: () => void) {
        this._execCB('_updateRendering', cb);
    }
}

declareWidget('Widget.widget.Widget', Widget);
