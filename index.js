init();
var tabs;
function init() {
    refreshTabs();
    refreshCardGroups();
}

function activate(windowId, index) {
    windowId = parseInt(windowId);
    index = parseInt(index);
    chrome.tabs.highlight({ windowId, tabs: index });
}

function close(id) {
    id = parseInt(id);
    chrome.tabs.remove(id);
}

function refreshTabs() {
    getOpenedTabs({ active: false }).then(res => {
        // id做key 对象本身为val  转为map
        tabs = new Map(res.map(item => [item.id, item]));
        let html = '';
        res.forEach(item => {
            html += buildTabBtn(item);
        });
        document.getElementById('sidenav').innerHTML = html;
        document.getElementsByName('activateBtn').forEach(item => {
            // 点击事件 激活对应tab
            item.addEventListener("click", function () {
                activate(item.getAttribute("windowId"), item.getAttribute("index"))
            });
            item.addEventListener("dragstart", function (ev) {
                dragstart_handler(ev);
            });
            item.addEventListener("dragend", function (ev) {
                dragend_handler(ev);
            });
            // 右击事件 关闭对应tab
            item.oncontextmenu = function () {
                close(item.id);
                let parent = item.parentElement;
                parent.removeChild(item);
                // 屏蔽原有事件
                return false;
            };
        });
    });
}

async function getOpenedTabs(queryOptions) {
    return chrome.tabs.query(queryOptions);
}

function buildTabBtn(data) {
    return '<button draggable="true" class="opened-tab" name="activateBtn" windowId="' + data.windowId + '" index="' + data.index + '" id="' + data.id + '">' +
        '<img class="opened-tab-icon" src="' + (data.favIconUrl == undefined ? '' : data.favIconUrl) + '"></span>' +
        '<span class="opened-tab-title">' + data.title.replace("<", "&lt;").replace(">", "&gt;") + '</span>' +
        '<svg width="34" height="34" viewBox="0 0 74 74" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<circle cx="37" cy="37" r="35.5" stroke="black" stroke-width="3"></circle>' +
        '<path d="M25 35.5C24.1716 35.5 23.5 36.1716 23.5 37C23.5 37.8284 24.1716 38.5 25 38.5V35.5ZM49.0607 38.0607C49.6464 37.4749 49.6464 36.5251 49.0607 35.9393L39.5147 26.3934C38.9289 25.8076 37.9792 25.8076 37.3934 26.3934C36.8076 26.9792 36.8076 27.9289 37.3934 28.5147L45.8787 37L37.3934 45.4853C36.8076 46.0711 36.8076 47.0208 37.3934 47.6066C37.9792 48.1924 38.9289 48.1924 39.5147 47.6066L49.0607 38.0607ZM25 38.5L48 38.5V35.5L25 35.5V38.5Z" fill="black"></path>' +
        '</svg>' +
        '</button>';
}

function buildCard(data) {
    return '<div class="card">' +
        '<img class="card_load" src="' + data.favIconUrl + '">' +
        '<div class="card_load_extreme_title">' +
        data.title.replace("<", "&lt;").replace(">", "&gt;") +
        '</div>' +
        '</div>';
}

function buildCardGroup(groups, tabs) {
    if (!groups) return '';
    let html = '';
    groups.forEach(function (value, key) {
        html += '<div class="card-group" name="cardGroup" id="' + key + '">' +
            '<input placeholder="Group Name" type="text" class="input-title" required="" name="cardName" groupId="' + key + '" value="' + value + '">';

        if (tabs != null) {
            let arr = tabs.groups[i];
            if (arr != null) {
                arr.forEach(item => {
                    html += '<div' + item.url + '>' +
                        '<div class="card">' +
                        '<img class="card_load" src="' + (data.favIconUrl == undefined ? '' : data.favIconUrl)
                    '"><div class="card_load_extreme_title">' +
                        item.title
                    '</div>' +
                        '</div>' +
                        '</div>';
                })
            }
        }
        html += '</div>';
    })
    return html;
}

document.addEventListener('visibilitychange', function () {
    // 用户回到页面时刷新opened-tabs
    if (document.visibilityState === 'visible') {
        refreshTabs();
    }
})

document.oncontextmenu = function () {
    let tabGroups = getCardGroups();
    if (tabGroups === null) {
        tabGroups = new Map();
        tabGroups.set("1", "Tabs Group");
        setCardGroups(tabGroups);
    }
    refreshCardGroups(tabGroups)
    // 屏蔽原有事件
    return false;
};

function refreshCardGroups(tabGroups) {
    if (!tabGroups) {
        tabGroups = getCardGroupsToMap();
    }
    document.getElementById('cards').innerHTML = buildCardGroup(tabGroups);
    let cardGroups = document.getElementsByName('cardGroup');
    cardGroups.forEach(item => {
        item.addEventListener("drop", function (ev) {
            drop_handler(ev)
        });
        item.addEventListener("dragover", function (ev) {
            dragover_handler(ev)
        });
    });
    let cardsNames = document.getElementsByName('cardName');
    cardsNames.forEach(item => {
        item.addEventListener("blur", function (e) {
            updateCardName(e.target.getAttribute('groupId'), e.target.value)
        });
    });
}

function updateCardName(groupId, value) {
    tabGroups = getCardGroupsToMap();
    tabGroups.set(groupId, value);
    setCardGroups(tabGroups);
}

// drop impl start
function dragstart_handler(ev) {
    // 更改源元素的背景颜色以表示已开始拖动
    ev.currentTarget.style.border = "dashed";
    // 将拖拽源元素的id添加到拖拽数据有效负载中，以便在触发拖拽事件时可用
    ev.dataTransfer.setData("text", ev.target.id);
    // 告诉浏览器可以复制和移动
    ev.effectAllowed = "copyMove";
}

function dragend_handler(ev) {
    // 恢复源边界
    ev.target.style.border = "solid black";
    // 删除所有的拖动数据
    ev.dataTransfer.clearData();
}

function dragover_handler(ev) {
    // 更改目标元素的边框以表示发生了拖移事件
    // ev.currentTarget.style.background = "lightblue";
    ev.preventDefault();
}

function drop_handler(ev) {
    ev.preventDefault();
    // 获取拖动源元素的id(由dragstart事件处理程序添加到拖动数据有效负载中)
    let id = ev.dataTransfer.getData("text");
    let cardGroups = getCardGroupsToMap();
    if (cardGroups.has(ev.target.id)) {
        let nodeCopy = document.getElementById(id).cloneNode(true);
        nodeCopy.id = "newId";
        ev.target.appendChild(nodeCopy);
    }
}
// drop impl end

// local storage start
function getCardGroups() {
    return localStorage.getItem("tabGroups");    
}

function getCardGroupsToMap() {
    return new Map(JSON.parse(getCardGroups()));
}

function setCardGroups(data) {
    localStorage.setItem("tabGroups", JSON.stringify([...data]));
}
// local storage end