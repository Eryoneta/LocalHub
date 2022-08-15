class LHCore {
    //VARS
    static VARIABLE_TAG = "lh-var";
    //MAIN
    constructor() { }
    //FUNCS
    static createRoutes(routes = [{ url: "", path: "" }]) {
        console.log(routes);
    }
    static getById(id = "") {
        return document.getElementById(id);
    }
    static bindVariable(prop) {
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
    static bindView(prop) {
        const elems = [...document.getElementsByTagName("iframe")].filter((elem) => elem.hasAttribute(prop));
        return {
            nativeElements: elems,
            get viewPath() {
                return this.nativeElements[0].href;
            },
            set viewPath(value) {
                for (let element of this.nativeElements) element.href = value;
            }
        };
    }
}