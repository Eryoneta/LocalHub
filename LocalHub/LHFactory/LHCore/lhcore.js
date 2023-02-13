class LHCore {

    //GLOBAL VARS
    static TAG = {
        VARIABLE: "lh-var",
        REFERENCE: "lh-ref",
        HUB: "lh-hub"
    };
    static REQUEST = {
        LOAD_SCRIPT: "loadScript",
        CHANGE_TITLE: "changeTitle",
        CHANGE_ICON: "changeIcon",
        CHANGE_URL: "changeURL",
        REDIRECT: "redirect",
        REROUTE: "reroute"
    };
    static _loadedWindow = undefined;
    static _absoluteFilePath = undefined;
    static _currentRoute = undefined;

    //ROUTES
    static _routes = undefined;
    static createRoutes(routes = [{ url: "", path: "" }]) {
        this._routes = routes;
    }
    static getRoute(url = "") {
        // const route = this._routes.find(route => url.startsWith(route.url) && (url.replace(route.url, "").startsWith("/") || url.replace(route.url, "").length === 0));
        const route = this._routes.find(route => route.url === url);
        if (!route) return undefined;
        return route.path;
    }

    //MAIN
    constructor() { }

    //FUNCS
    static _loadRoute(hash = "") {
        const routeAtual = this._getCurrentRoute(hash);
        const hubPath = LHCore.getRoute(routeAtual);
        const hubs = LHCore.bindHub("routed");
        for (let element of hubs.nativeElements) {
            const frame = document.createElement("iframe");
            frame.style.border = "0";
            frame.scrolling = "no";
            frame.src = hubPath;
            // frame.style.visibility="hidden";
            const corePath = this._getRelativePath(hubPath, this._absoluteFilePath);
            frame.onload = () => {
                // frame.style.visibility="visible";
                this._requestLoadScript(frame.contentWindow, corePath, this._absoluteFilePath, routeAtual);
            };
            element.replaceChildren(frame);
        }
    }
    static _getCurrentRoute(hash = "") {
        if (hash.startsWith("#")) hash = hash.substring(1);
        if (hash.startsWith("/")) hash = hash.substring(1);
        // if (hash.includes("/")) hash = hash.split("/")[0];
        return hash;
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

    //LOADERS
    static loadMainHub(window = undefined, lhScriptFilePath = "") {
        this._loadedWindow = window;
        this._absoluteFilePath = lhScriptFilePath;
        this._currentRoute = "";
        this._loadedWindow.addEventListener("message", (message) => {
            switch (message.data.request) {
                case LHCore.REQUEST.CHANGE_TITLE:
                    LHCore.getById("title").innerHTML = message.data.content;
                    break;
                case LHCore.REQUEST.CHANGE_ICON:
                    LHCore.getById("icon").href = message.data.content;
                    break;
                case LHCore.REQUEST.CHANGE_URL:
                    window.location = message.data.content;
                    break;
                case LHCore.REQUEST.REDIRECT:
                    let hash = message.data.content;
                    if (hash.startsWith("#")) hash = hash.substring(1);
                    window.location.hash = "";  //PARA QUE O HASH MUDE
                    window.location.hash = hash;
                    break;
            }
        });
        this._loadedWindow.addEventListener("hashchange", () => {
            if (this._loadedWindow.location.hash === "" || this._loadedWindow.location.hash === "#"){
                this._loadedWindow.location.hash = "/";     //SE A HASH É IGUAL, hashchange NÃO ATIVA
            }
            this._loadRoute(this._loadedWindow.location.hash);
        });
    }
    static loadHub(window = undefined, lhScriptFilePath = "", route = "") {
        this._loadedWindow = window;
        this._absoluteFilePath = lhScriptFilePath;
        this._currentRoute = route;
        this._loadedWindow.addEventListener("message", (message) => {
            switch (message.data.request) {
                case LHCore.REQUEST.CHANGE_TITLE:
                    this.changeTitle(message.data.content);
                    break;
                case LHCore.REQUEST.CHANGE_ICON:
                    this.changeIcon(message.data.content);
                    break;
                case LHCore.REQUEST.CHANGE_URL:
                    this.changeURL(message.data.content);
                    break;
                case LHCore.REQUEST.REDIRECT:
                    break;
                case LHCore.REQUEST.REROUTE:
                    break;
            }
        });
    }

    //REQUEST_MAKERS
    static _requestLoadScript(window = undefined, relativeCorePath = "", absoluteCorePath = "", route = "") {
        window.postMessage({ request: LHCore.REQUEST.LOAD_SCRIPT, content: { relativeCorePath: relativeCorePath, absoluteCorePath: absoluteCorePath, route: route } }, "*");
    }
    static _requestChangeTitle(window = undefined, newTitle = "") {
        window.postMessage({ request: LHCore.REQUEST.CHANGE_TITLE, content: newTitle }, "*");
    }
    static _requestChangeIcon(window = undefined, newIconPath = "") {
        window.postMessage({ request: LHCore.REQUEST.CHANGE_ICON, content: newIconPath }, "*");
    }
    static _requestChangeURL(window = undefined, newUrl = "") {
        window.postMessage({ request: LHCore.REQUEST.CHANGE_URL, content: newUrl }, "*");
    }
    static _requestRedirect(window = undefined, newRoute = "/") {
        window.postMessage({ request: LHCore.REQUEST.REDIRECT, content: newRoute }, "*");
    }

    //REQUESTS
    static changeTitle(newTitle = "") {
        this._requestChangeTitle(this._loadedWindow.parent, newTitle);
    }
    static changeIcon(newIconPath = "") {
        this._requestChangeIcon(this._loadedWindow.parent, newIconPath);
    }
    static changeURL(newUrl = "") {
        this._requestChangeURL(this._loadedWindow.parent, newUrl);
    }
    static redirect(newRoute = "/") {
        if (newRoute === "" || newRoute === "#") newRoute = "/";
        this._requestRedirect(this._loadedWindow.parent, newRoute);
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

}