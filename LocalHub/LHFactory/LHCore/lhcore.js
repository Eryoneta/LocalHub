class LHCore {
    //GLOBAL VARS
    static VARIABLE_TAG = "lh-var";
    static HUB_TAG = "lh-hub";
    //ROUTES
    static routes = {};
    static createRoutes(routes = [{ url: "", path: "" }], window = undefined) {
        this.routes[window] = routes;
    }
    static getRoute(url = "", window = undefined) {
        const route = LHCore.routes[window].find(route => route.url === url);
        if (!route) return undefined;
        return route.path;
    }
    //MAIN
    constructor() { }
    //BINDERS
    static getById(id = "") {
        return document.getElementById(id);
    }
    static bindVariable(prop = "") {
        const elems = [...document.getElementsByTagName(LHCore.VARIABLE_TAG)].filter((elem) => elem.hasAttribute(prop));
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
        const elems = [...document.getElementsByTagName(LHCore.HUB_TAG)].filter((elem) => elem.hasAttribute(prop));
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
    //LOADERS
    static loadMainHub(window = undefined) {
        window.addEventListener("message", (data) => {
            switch (data.request) {
                case "changeTitle":
                    LHCore.getById("title").innerHTML = data.value;
                    break;
                case "changeIcon":
                    LHCore.getById("icon").href = data.value;
                    break;
            }
        });
        window.addEventListener("hashchange", () => this._reloadPage(window));
        this._reloadPage(window);
    }
    static loadHub(window = undefined) {
        window.addEventListener("hashchange", () => this._reloadPage(window));
        this._reloadPage(window);
    }
    static _reloadPage(window = undefined) {
        const urlAtual = window.location.hash.replace("#", "");
        const hubPath = LHCore.getRoute(urlAtual, window);
        const hubs = LHCore.bindHub("routed");
        for (let element of hubs.nativeElements) {
            const content = document.createElement("iframe");
            content.src = hubPath;
            const corePath = "./LHFactory/LHCore/lhcore.js";
            content.onload = () => {
                content.contentWindow.postMessage({ corePath: corePath }, "*");
            };
            element.replaceChildren(content);
        }
    }
}