(function () {
    "use strict";

    const obj2map = obj => new Map(Object.keys(obj).map(value => [value, obj[value]]));

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const weekday = {
        Su: 'Su',
        Mo: 'Mo',
        Tu: 'Tu',
        We: 'We',
        Th: 'Th',
        Fr: 'Fr',
        Sa: 'Sa'
    };

    const getTemplate = name => document.querySelector(`link[tag="${ name }"]`).import.querySelector('template').content;

    function increase_brightness(hex, percent) {
        // strip the leading # if it's there
        hex = hex.replace(/^\s*#|\s*$/g, '');

        // convert 3 char codes --> 6, e.g. `E0F` --> `EE00FF`
        if (hex.length == 3) {
            hex = hex.replace(/(.)/g, '$1$1');
        }

        var r = parseInt(hex.substr(0, 2), 16),
            g = parseInt(hex.substr(2, 2), 16),
            b = parseInt(hex.substr(4, 2), 16);

        return '#' + (0 | (1 << 8) + r + (256 - r) * percent / 100).toString(16).substr(1) + (0 | (1 << 8) + g + (256 - g) * percent / 100).toString(16).substr(1) + (0 | (1 << 8) + b + (256 - b) * percent / 100).toString(16).substr(1);
    }

    class BaseCustomElement extends HTMLElement {
        createdCallback() {
            this.createShadowRoot();
        }

        setTemplate(template) {
            this.shadowRoot.appendChild(document.importNode(template, true));
        }
    }

    (template => document.registerElement('push-item', class PushItem extends BaseCustomElement {
        createdCallback() {
            super.createdCallback();
            this.setTemplate(template);
        }
        setTimeline(timeline) {
            timeline.push(this.shadowRoot.host);
            timeline.fork().pushAll(this.shadowRoot.childNodes);
        }
        setData(data) {
            console.log(data);
            this.shadowRoot.getElementById('title').innerHTML = data.title;
            this.shadowRoot.getElementById('description').innerHTML = data.description;
            this.shadowRoot.getElementById('who').innerHTML = data.who;
            this.shadowRoot.getElementById('time').innerHTML = data.time;
            this.shadowRoot.getElementById('validity').innerHTML = data.validity;
            this.shadowRoot.getElementById('confirm').onclick = () => {
                this.shadowRoot.host.style.animation = `removing 1s ease 0s both`;
                if (data.target) {
                    this.shadowRoot.host.dispatchEvent(new CustomEvent('insert', { bubbles: true, detail: data.target }));
                }
            };
            this.shadowRoot.getElementById('delete').onclick = () => {
                this.shadowRoot.host.style.animation = `removing 1s ease 0s both`;
            };
        }
    }))(getTemplate('push-item'));

    (template => document.registerElement('schedule-item', class ScheduleItem extends BaseCustomElement {
        createdCallback() {
            super.createdCallback();
            this.setTemplate(template);
        }
        setConfig(config) {
            this.config = config;
        }
        setTimeline(timeline) {
            timeline.fork().pushAll(this.shadowRoot.childNodes);
        }
        setData(data) {
            this.shadowRoot.getElementById('title').innerHTML = data.title;
            if (data.description) this.shadowRoot.getElementById('description').innerHTML = data.description;
            if (data.time) this.shadowRoot.getElementById('time').innerHTML = data.time;else this.shadowRoot.getElementById('time').innerHTML = '全天';

            this.shadowRoot.getElementById('title-container').style.borderLeftColor = this.config[data.type].color;
        }
    }))(getTemplate('schedule-item'));

    (template => document.registerElement('schedule-list', class ScheduleList extends BaseCustomElement {
        createdCallback() {
            super.createdCallback();
            this.setTemplate(template);
        }
        setConfig(config) {
            this.config = config;
        }
        setTimeline(timeline) {
            // timeline.push(this.shadowRoot.host);
            this.timeline = timeline;
            timeline.fork().pushAll(this.shadowRoot.childNodes);
        }
        setData(data) {
            obj2map(data).forEach((body, key) => (el => body.forEach(scheduleItem => {
                const item = document.createElement('schedule-item');
                item.setConfig(this.config);
                item.setTimeline(this.timeline);
                item.setData(scheduleItem);
                el.appendChild(item);
            }))(this.shadowRoot.getElementById(key)));
        }
    }))(getTemplate('schedule-list'));

    (template => document.registerElement('calender-view', {
        prototype: Object.create(HTMLElement.prototype, {
            createdCallback: {
                value() {
                    this.createShadowRoot();
                    this.shadowRoot.appendChild(document.importNode(template, true));
                    this.updateDate();
                    obj2map(weekday).forEach((value, key) => this.shadowRoot.getElementById(key).innerHTML = value);
                }
            },

            updateDate: {
                value() {
                    const date = new Date(this.getAttribute('current-date'));
                    this.shadowRoot.getElementById('year').innerHTML = `${ months[date.getUTCMonth()] } ${ date.getUTCFullYear() }`;
                    /*简单模拟一下好了..到时候在做完整的*/
                    const view = this.shadowRoot.getElementById('day-view');
                    for (let i = 0; i < 31; i++) {
                        const item = document.createElement('div');
                        item.classList.add('current-month');
                        item.innerHTML = i + 1;
                        if (i + 1 === date.getUTCDay()) item.classList.add('current');
                        view.appendChild(item);
                    }
                    for (let i = 0; i < 11; i++) {
                        const item = document.createElement('div');
                        item.innerHTML = i + 1;
                        view.appendChild(item);
                    }
                }
            },

            setTimeline: {
                value(timeline) {
                    timeline.fork().pushAll(this.shadowRoot.querySelectorAll('*'));
                    console.log('calender-view');
                }
            },

            setDate: {
                value(date) {
                    this.setAttribute('current-date', date.toString());
                }
            }
        })
    }))(getTemplate('calender-view'));

    (template => document.registerElement('count-down', class CountDown extends BaseCustomElement {
        createdCallback() {
            super.createdCallback();
            this.setTemplate(template);
        }

        setData(time) {
            const [hour, minute, second] = time.split(':');
            obj2map({ hour, minute, second }).forEach((value, key) => this.shadowRoot.getElementById(key).innerHTML = value);
        }
    }))(getTemplate('count-down'));

    (template => document.registerElement('moment-card', class MomentCard extends BaseCustomElement {
        createdCallback() {
            super.createdCallback();
            this.setTemplate(template);
        }

        setData({ type, content, time }, config) {
            const target = config[type];
            const imageEl = this.shadowRoot.getElementById('image');
            // imageEl.style.background = `url(${target.image}) no-repeat`;
            imageEl.style.backgroundColor = target.color;
            imageEl.style.webkitMaskImage = `url(${ target.image })`;
            this.shadowRoot.getElementById('title').innerHTML = type;
            this.shadowRoot.getElementById('description').innerHTML = content;
            this.shadowRoot.getElementById('container').style.backgroundColor = increase_brightness(target.color, 90);
            this.shadowRoot.querySelector('count-down').setData(time);
            console.log(target);
        }

    }))(getTemplate('moment-card'));

    (template => document.registerElement('detail-item', class MomentCard extends BaseCustomElement {
        createdCallback() {
            super.createdCallback();
            this.setTemplate(template);
        }

        setData({ type, multiple }, config) {
            const target = config[type];
            const left = this.shadowRoot.getElementById('left');
            left.style.backgroundColor = target.color;
            const leftImage = this.shadowRoot.getElementById('left-image');
            leftImage.style.background = `url(${ target.image })`;
            this.shadowRoot.getElementById('title').innerHTML = `${ type } ${ multiple.length ? `(${ multiple.length })` : '' }`;
            const listRoot = this.shadowRoot.getElementById('content-container');
            multiple.forEach(({ start, end }) => {
                const el = document.createElement('div');
                el.innerHTML = `从${ start }开始,到${ end }结束`;
                listRoot.appendChild(el);
            });
        }

    }))(getTemplate('detail-item'));
})();