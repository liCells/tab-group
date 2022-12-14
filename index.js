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
    return '<a href="' + data.url + '" name="savedTab" value="' + data.id + '"><div class="card">' +
        '<img class="card_load" src="' + data.favIconUrl + '">' +
        '<div class="card_load_extreme_title">' +
        data.title.replace("<", "&lt;").replace(">", "&gt;") +
        '</div>' +
        '</div></a>';
}

function buildCardGroup(groups, tabs) {
    if (!groups) return '';
    let html = '';
    groups.forEach(function (value, key) {
        html += '<div class="card-group" name="cardGroup" id="' + key + '">' +
            '<input placeholder="Group Name" type="text" class="input-title" required="" name="cardName" groupId="' + key + '" value="' + value + '">' +
            '<button class="tooltip button-delete" name="groupDel" value="' + key + '"><svg value="' + key + '" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20" height="25" width="25"><path value="' + key + '" fill="#6361D9" d="M8.78842 5.03866C8.86656 4.96052 8.97254 4.91663 9.08305 4.91663H11.4164C11.5269 4.91663 11.6329 4.96052 11.711 5.03866C11.7892 5.11681 11.833 5.22279 11.833 5.33329V5.74939H8.66638V5.33329C8.66638 5.22279 8.71028 5.11681 8.78842 5.03866ZM7.16638 5.74939V5.33329C7.16638 4.82496 7.36832 4.33745 7.72776 3.978C8.08721 3.61856 8.57472 3.41663 9.08305 3.41663H11.4164C11.9247 3.41663 12.4122 3.61856 12.7717 3.978C13.1311 4.33745 13.333 4.82496 13.333 5.33329V5.74939H15.5C15.9142 5.74939 16.25 6.08518 16.25 6.49939C16.25 6.9136 15.9142 7.24939 15.5 7.24939H15.0105L14.2492 14.7095C14.2382 15.2023 14.0377 15.6726 13.6883 16.0219C13.3289 16.3814 12.8414 16.5833 12.333 16.5833H8.16638C7.65805 16.5833 7.17054 16.3814 6.81109 16.0219C6.46176 15.6726 6.2612 15.2023 6.25019 14.7095L5.48896 7.24939H5C4.58579 7.24939 4.25 6.9136 4.25 6.49939C4.25 6.08518 4.58579 5.74939 5 5.74939H6.16667H7.16638ZM7.91638 7.24996H12.583H13.5026L12.7536 14.5905C12.751 14.6158 12.7497 14.6412 12.7497 14.6666C12.7497 14.7771 12.7058 14.8831 12.6277 14.9613C12.5495 15.0394 12.4436 15.0833 12.333 15.0833H8.16638C8.05588 15.0833 7.94989 15.0394 7.87175 14.9613C7.79361 14.8831 7.74972 14.7771 7.74972 14.6666C7.74972 14.6412 7.74842 14.6158 7.74584 14.5905L6.99681 7.24996H7.91638Z" clip-rule="evenodd" fill-rule="evenodd"></path></svg></button>'

        tabs = getTabsToMap().get(key);
        if (tabs) {
            [...tabs.values()].forEach(item => {
                html += buildCard(item);
            });
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

document.oncontextmenu = function (e) {
    let symbol = e.target.name;
    if (!symbol) {
        symbol = e.target.parentNode.name;
        if (!symbol) {
            if (e.target.parentNode.parentNode != null) {
                symbol = e.target.parentNode.parentNode.name;
            }
        }
    }
    if (symbol == 'activateBtn' || symbol == 'savedTab') {
        return false;
    }
    let tabGroups = getCardGroupsToMap();
    if (tabGroups === null) {
        tabGroups = new Map();
        tabGroups.set("1", "Tabs Group Name");
        setCardGroups(tabGroups);
    } else {
        let maxId = 0;
        [...tabGroups.keys()].forEach(item => {
            maxId = Math.max(item, maxId);
        });
        tabGroups.set((maxId + 1).toString(), "Tabs Group Name");
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

    let groupDelBtns = document.getElementsByName('groupDel');
    groupDelBtns.forEach(item => {
        item.addEventListener("click", function (e) {
            removeGroup(e.target.getAttribute('value'))
        });
    });

    let savedTabs = document.getElementsByName('savedTab');
    savedTabs.forEach(item => {
        item.oncontextmenu = function () {
            removeTab(item.getAttribute('value'));
            let parent = item.parentElement;
            parent.removeChild(item);
            // 屏蔽原有事件
            return false;
        };
    });
}

function updateCardName(groupId, value) {
    let tabGroups = getCardGroupsToMap();
    tabGroups.set(groupId.toString(), value);
    setCardGroups(tabGroups);
}

function removeGroup(key) {
    let tabGroups = getCardGroupsToMap();
    tabGroups.delete(key);
    let tabMap = getTabsToMap();
    tabMap.delete(key);
    setTabs(tabMap);
    setCardGroups(tabGroups);
    refreshCardGroups();
}

function removeTab(id) {
    let tabMap = getTabsToMap();
    out:
    for (let tabArr of [...tabMap.values()]) {
        if (tabArr) {
            for (let i = 0; i < tabArr.length; i++) {
                if (id == tabArr[i].id) {
                    tabArr.splice(i, 1);
                    break out;
                }
            }
        }
    }
    setTabs(tabMap);
}

// drop impl start
function dragstart_handler(ev) {
    // 更改源元素的背景颜色以表示已开始拖动
    ev.currentTarget.style.border = "dashed";
    // 将拖拽源元素的id添加到拖拽数据有效负载中, 以便在触发拖拽事件时可用
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
        let tab = tabs.get(parseInt(nodeCopy.id));
        let html = buildCard(tab);
        ev.target.appendChild(htmlToElement(html));
        let tabMap = getTabsToMap();
        let tabArr = tabMap.get(ev.target.id);
        let obj = {url: tab.url, title: tab.title, favIconUrl: tab.favIconUrl, id: Math.ceil(Math.random() * 1000)};
        if (tabArr) {
            tabArr.push(obj);
        } else {
            tabArr = [obj];
        }
        tabMap.set(ev.target.id, tabArr);
        setTabs(tabMap);
    }
}

function htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim();
    template.innerHTML = html;
    return template.content.firstChild;
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

function getTabs() {
    return localStorage.getItem("tabs");
}

function getTabsToMap() {
    return new Map(JSON.parse(getTabs()));
}

function setTabs(data) {
    localStorage.setItem("tabs", JSON.stringify([...data]));
}
// local storage end