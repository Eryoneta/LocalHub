class LHCore {
    //GLOBAL VARS
    static TAG = {
        VARIABLE: "lh-var",
        HUB: "lh-hub"
    };
    static MAIN_HUB = {
        CHANGE_TITLE: "changeTitle",
        CHANGE_ICON: "changeIcon"
    };
    static _loadedWindow = undefined;
    static _absoluteFilePath = undefined;
    //ROUTES
    static _routes = undefined;
    static createRoutes(routes = [{ url: "", path: "" }]) {
        this._routes = routes;
        this._reloadPage(this._loadedWindow.location.hash);
    }
    static getRoute(url = "") {
        const route = this._routes.find(route => route.url === url);
        if (!route) return undefined;
        return route.path;
    }
    //MAIN
    constructor() { }
    //LOADERS
    static loadMainHub(window = undefined, lhScriptFilePath = "") {
        this._loadedWindow = window;
        this._absoluteFilePath = lhScriptFilePath;
        this._loadedWindow.addEventListener("message", (message) => {
            switch (message.data.request) {
                case LHCore.MAIN_HUB.CHANGE_TITLE:
                    LHCore.getById("title").innerHTML = message.data.value;
                    break;
                case LHCore.MAIN_HUB.CHANGE_ICON:
                    LHCore.getById("icon").href = message.data.value;
                    break;
            }
        });
        this._loadedWindow.addEventListener("hashchange", () => this._reloadPage(this._loadedWindow.location.hash));
    }
    static loadHub(window = undefined, lhScriptFilePath = "") {
        this._loadedWindow = window;
        this._absoluteFilePath = lhScriptFilePath;
        this._loadedWindow.addEventListener("message", (message) => {
            this._loadedWindow.parent.postMessage({ request: message.data.request, value: message.data.value }, "*");
        });
    }
    static _reloadPage(hash = "") {
        console.log(hash);
        const urlAtual = this._getFilteredHash(hash);
        const hubPath = LHCore.getRoute(urlAtual);
        const hubs = LHCore.bindHub("routed");
        for (let element of hubs.nativeElements) {
            const frame = document.createElement("iframe");
            frame.style.border = "0";
            frame.scrolling = "no";
            frame.src = hubPath;
            const corePath = this._getRelativePath(hubPath, this._absoluteFilePath);
            frame.onload = () => {
                frame.contentWindow.postMessage({ loadScript: true, relativeCorePath: corePath, absoluteCorePath: this._absoluteFilePath }, "*");
            };
            element.replaceChildren(frame);
        }
    }
    static _getRelativePath(absolutePathBase = "", absolutePath = "") {
        absolutePathBase = absolutePathBase.split("/");
        absolutePath = absolutePath.split("/");
        let levelsToReturn = "";
        let foldersToEnter = "";
        const fileName = absolutePath[absolutePath.length - 1];
        for (let i = 0; i < absolutePathBase.length - 1 || i < absolutePath.length - 1; i++) {
            switch (true) {
                default:
                    if (absolutePathBase[i] !== absolutePath[i]) {
                        levelsToReturn += "/" + "..";
                        foldersToEnter += "/" + absolutePath[i];
                    }
                    break;
                case i >= absolutePath.length - 1:
                    levelsToReturn += "/" + "..";
                    break;
                case i >= absolutePathBase.length - 1:
                    foldersToEnter += "/" + absolutePath[i];
                    break;
            }
        }
        let relativePath = "." + levelsToReturn + foldersToEnter + "/" + fileName;
        return relativePath;
    }
    static _getFilteredHash(hash = "") {
        if (hash.startsWith("#")) return hash.substring(1);
        return hash;
    }
    //BINDERS
    static getById(id = "") {
        return document.getElementById(id);
    }
    static bindVariable(prop = "") {
        const elems = [...document.getElementsByTagName(LHCore.TAG.VARIABLE)].filter((elem) => elem.hasAttribute(prop));
        return {
            nativeElements: elems,
            get value() {
                return this.nativeElements[0].innerHTML;
            },
            set value(value) {
                for (let element of this.nativeElements) element.innerHTML = value;
            }
        };
    }
    static bindHub(prop = "") {
        const elems = [...document.getElementsByTagName(LHCore.TAG.HUB)].filter((elem) => elem.hasAttribute(prop));
        return {
            nativeElements: elems,
            get viewPath() {
                return this.nativeElements[0].innerHTML;
            },
            set viewPath(value) {
                for (let element of this.nativeElements) element.innerHTML = value;
            }
        };
    }
    //CHANGERS
    static changeTitle(title = "") {
        this._loadedWindow.parent.postMessage({ request: LHCore.MAIN_HUB.CHANGE_TITLE, value: title }, "*");
    }
    static changeIcon(iconPath = "") {
        this._loadedWindow.parent.postMessage({ request: LHCore.MAIN_HUB.CHANGE_ICON, value: iconPath }, "*");
    }
}