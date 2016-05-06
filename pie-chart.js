(function () {
    "use strict";

    const obj2map = obj => new Map(Object.keys(obj).map(value => [value, obj[value]]));

    function makeSVG(tag, attr) {
        const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
        obj2map(attr).forEach((v, k) => el.setAttribute(k, v));
        return el;
    }

    function drawArcs(parent, data) {
        const total = data.map(item => item.value).reduce((p, c) => p + c);
        data.forEach(item => item.angle = 360 * item.value / total);

        let startAngle = 0;
        let endAngle = 0;
        data.forEach((item, i) => {
            startAngle = endAngle;
            endAngle += item.angle;

            const x1 = parseInt(Math.round(100 + 100 * Math.sin(Math.PI * startAngle / 180)));
            const y1 = parseInt(Math.round(100 - 100 * Math.cos(Math.PI * startAngle / 180)));

            const x2 = parseInt(Math.round(100 + 100 * Math.sin(Math.PI * endAngle / 180)));
            const y2 = parseInt(Math.round(100 - 100 * Math.cos(Math.PI * endAngle / 180)));

            const d = `M100,100 L ${ x1 },${ y1 } A95,95 0 ${ endAngle - startAngle > 180 ? 1 : 0 },1 ${ x2 },${ y2 } Z`;
            const c = parseInt(i / data.length * 360); /* "hsl(" + c + ", 66%, 50%)" */
            var arc = makeSVG("path", { d: d, fill: item.color });
            parent.appendChild(arc);
        });
    }

    document.registerElement('pie-chart', class PieChart extends HTMLElement {
        createdCallback() {
            this.createShadowRoot();
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('viewport', '0 0 200 200');
            svg.setAttribute('width', '200px');
            svg.setAttribute('height', '200px');
            this.svg = svg;
            this.shadowRoot.appendChild(svg);
        }

        setData(data) {
            drawArcs(this.svg, data);
        }
    });
})();