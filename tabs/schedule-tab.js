(function () {
    "use strict";

    function map_schedules(arr) {
        const ret = {};
        arr.forEach(el => ret[el.getAttribute('x-tag')] = el);
        return Object.freeze(ret);
    }

    const obj2map = obj => new Map(Object.keys(obj).map(value => [value, obj[value]]));

    const push_content = document.querySelector('#push .content');
    const schedules = map_schedules(Array.from(document.querySelectorAll('#schedules .day')));
    const categories = document.getElementById('categories-list');
    const ease = t => t;
    const expand = (el, duration = 1000) => {
        //init
        let initHeight = el.getBoundingClientRect().height;
        console.log(initHeight);
        const initTime = new Date().getTime();
        const tick = pos => {
            const currentTime = new Date().getTime();
            if (currentTime - initTime >= duration) {
                el.style.height = 'auto';
                return;
            }
            const currentHeight = initHeight * ease((currentTime - initTime) / duration);
            console.log(currentHeight);
            el.style.height = `${ currentHeight }px`;
            requestAnimationFrame(tick);
        };
        tick();
    };

    const rootTimeline = timeliner();

    rootTimeline.push(document.querySelector('#push'));

    window.datasource.push.map(item => {
        const el = document.createElement('push-item');
        el.setTimeline(rootTimeline.fork());
        el.setData(item);
        return el;
    }).forEach(el => push_content.appendChild(el));

    obj2map(window.datasource.schedules).forEach((body, type) => (el => {
        const schedule = document.createElement('schedule-list');
        rootTimeline.push(el);
        schedule.setTimeline(rootTimeline.fork());
        schedule.setConfig(window.datasource.config.schedule);
        schedule.setData(body);
        el.appendChild(schedule);
    })(schedules[type]));

    rootTimeline.pushAll(document.querySelectorAll('aside *'));
    Array.from(document.querySelectorAll('calender-view')).forEach(v => v.setTimeline(rootTimeline));

    obj2map(window.datasource.config.schedule).forEach(({ color, title }) => {
        const el = document.createElement('div');
        const marker = document.createElement('div');
        marker.classList.add('marker');
        marker.style.background = color;
        el.appendChild(marker);
        const textNode = document.createTextNode(title);
        el.appendChild(textNode);
        rootTimeline.push(el);
        categories.appendChild(el);
    });

    document.addEventListener('insert', ({ detail: { path, data } }) => {
        const tree = path.split('>');
        const parent = schedules[tree[0]].querySelector('schedule-list').shadowRoot.getElementById(tree[1]);
        const item = document.createElement('schedule-item');
        item.style.transitionDuration = `.5s`;
        item.setConfig(window.datasource.config.schedule);
        item.setData(data);
        if (tree[2] === '-1') {
            parent.appendChild(item);
        } else {
            const x = parent.childNodes[tree[2]];
            parent.insertBefore(item, x);
        }
    });
})();