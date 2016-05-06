(function () {
    "use strict";

    function timeliner(base = 0) {
        const ret = {
            push(el, name = 'show-opacity') {
                el.style.animation = `${ name } 1s ease ${ base++ / 60 }s both`;
            },

            pushAll(arrLike) {
                Array.from(arrLike).filter(el => el instanceof HTMLElement).forEach(el => ret.push(el));
            },

            fork() {
                return timeliner(base++);
            }
        };
        return ret;
    }

    window.timeliner = timeliner;
})();