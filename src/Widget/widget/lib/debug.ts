function debugMethod(target: any, key: string, descriptor: TypedPropertyDescriptor<any>) {
    if (descriptor === undefined) {
        descriptor = Object.getOwnPropertyDescriptor(target, key);
    }
    const originalMethod = descriptor.value;
    descriptor.value = function(this:any, ...args: any[]) {
        const metadataKey = `__log_${key}_parameters`;
        const indices = target[metadataKey];
        window.logger && window.logger.debug(this.id + "." + key);
        if (Array.isArray(indices)) {
            for (var i = 0; i < args.length; i++) {
                if (indices.indexOf(i) !== -1) {
                    window.logger && window.logger.debug(this.id + `.${key} arg[${i}]:`, args[i]);
                }
            }
        }
        return originalMethod.apply(this, args);
    }
    return descriptor;
}

function debugParam(target: any, key: string, index: number) {
    var metadataKey = `__log_${key}_parameters`;
    if (Array.isArray(target[metadataKey])) {
        target[metadataKey].push(index);
    } else {
        target[metadataKey] = [index];
    }
}

function debug(this:any, ...args: any[]) {
    switch (args.length) {
        case 1:
            throw new Error("Class debug decorator not implemented yet");
            //return logClass.apply(this, args);
        case 2:
            throw new Error("Property debug decorator not implemented yet");
            //return logProperty.apply(this, args);
        case 3:
            if (typeof args[2] === "number") {
                return debugParam.apply(this, args);
            }
            return debugMethod.apply(this, args);
        default:
            throw new Error("Decorators are not valid here!");
    }
}

export {
    debug
}
