(function () {
    "use stirct";

    document.registerElement('tab-stub', {
        prototype: Object.create(HTMLElement.prototype, {
            createdCallback: {
                value() {
                    // this.createShadowRoot();
                    // this.shadowRoot.appendChild(document.importNode(template, true));
                }
            },

            setTab: {
                value(target) {
                    Array.from(this.childNodes).forEach(el => this.removeChild(el));
                    this.appendChild(document.importNode(target, true));
                }
            }
        })
    });
})();