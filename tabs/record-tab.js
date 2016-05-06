(function () {
    "use strict";

    const nowPanel = document.getElementById('now');
    const chart = document.getElementsByTagName('pie-chart')[0];
    const detailPanel = document.querySelector('.detail-panel .content-container');

    window.datasource.now.forEach(carddata => {
        const el = document.createElement('moment-card');
        el.setData(carddata, window.datasource.config.activity);
        nowPanel.appendChild(el);
    });

    const statistics = [];

    const time2min = time => (([hour, minute]) => parseInt(hour * 60) + parseInt(minute))(time.split(':'));
    const min2time = min => [Math.floor(min / 60), min % 60].join(':');

    window.datasource.statistics.today.forEach(item => statistics.push({
        name: item.type,
        color: window.datasource.config.activity[item.type].color,
        value: item.multiple.map(({ start, end }) => time2min(end) - time2min(start)).reduce((p, c) => p + c)
    }));

    window.datasource.statistics.today.forEach(item => {
        const el = document.createElement('detail-item');
        el.setData(item, window.datasource.config.activity);
        detailPanel.appendChild(el);
    });

    console.log(statistics);
    chart.setData(statistics);
})();