(function () {
    "use strict";

    const getTemplate = name => document.querySelector(`link[tag="${ name }"]`).import.querySelector('template').content;

    const tabs = document.querySelector('tab-stub');
    const tabBtns = Array.from(document.querySelectorAll(`.header-container .button`));
    tabBtns.forEach(btn => btn.onclick = () => location.hash = '!' + btn.getAttribute('selected-tab'));
    function refresh() {
        let currentTab = 'schedule-tab';
        if (location.hash === '#!record-tab') currentTab = 'record-tab';
        tabBtns.forEach(btn => btn.getAttribute('selected-tab') === currentTab ? btn.setAttribute('selected', 'selected') : btn.removeAttribute('selected'));
        tabs.setTab(getTemplate(currentTab));
    }
    refresh();
    window.onhashchange = refresh;
})();