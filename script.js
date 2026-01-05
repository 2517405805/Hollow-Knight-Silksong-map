/* ==================================================================================
   SECTION 1: 全局配置与常量 (CONST CONFIG)
   ================================================================================== */
const LINE_THRESHOLD = 25; 
const PATH_COLORS = [
    '#ff0000', '#00ff00', '#00ffff', '#ff00ff', '#ffff00',
    '#ff8800', '#3949ab', '#43a047', '#639eceff', '#2f00ffff',
    '#00ffd5ff', '#546e7a', '#ffffff'
];
const iconFiles = [
    "地图.png", "NPC.png", "念珠.png",  "普通boss.png", "非必要物品.png", "遭遇战.png",
    "长椅.png", "技能.png", "纹章.png",  "跳蚤.png", "钟道.png",
    "必要boss.png", "普通委托.png", "必要委托.png", "纪念盒.png", "金属.png",
    "面具.png", "灵丝轴.png", "工具.png", "必要物品.png"
];
/* ==================================================================================
   SECTION 2: DOM 元素获取 (CONST DOM ELEMENTS)
   ================================================================================== */
const container = document.getElementById('map-container');
const map = document.getElementById('game-map');
const canvas = document.getElementById('lines-canvas');
const ctx = canvas.getContext('2d');
const btnGlobalTheme = document.getElementById('btn-global-theme');
const tooltip = document.getElementById('tooltip');
const globalTip = document.getElementById('global-tip');
const contextMenu = document.getElementById('context-menu');
const menuEdit = document.getElementById('menu-edit');
const menuMove = document.getElementById('menu-move');
const menuBind = document.getElementById('menu-bind');
const menuUnbind = document.getElementById('menu-unbind');
const menuDelete = document.getElementById('menu-delete');
const dialog = document.getElementById('marker-dialog');
const overlay = document.getElementById('dialog-overlay');
const btnOk = document.getElementById('btn-ok');
const btnCancel = document.getElementById('btn-cancel');
const nameInput = document.getElementById('dialog-name');
const introInput = document.getElementById('dialog-intro');
const coordXInput = document.getElementById('dialog-x');
const coordYInput = document.getElementById('dialog-y');
const layerSelect = document.getElementById('dialog-layer');
const btnTypeIcon = document.getElementById('btn-type-icon');
const btnTypeWall = document.getElementById('btn-type-wall');
const panelIconSelect = document.getElementById('panel-icon-select');
const panelWallSelect = document.getElementById('panel-wall-select');
const iconSelect = document.getElementById('dialog-icon-select');
const iconPreview = document.getElementById('dialog-icon-preview');
const btnWallBreakable = document.getElementById('btn-wall-breakable');
const btnWallOneway = document.getElementById('btn-wall-oneway');
const wallLenInput = document.getElementById('dialog-wall-len');
const wallAngleInput = document.getElementById('dialog-wall-angle');
const controlPanel = document.getElementById('control-panel');
const btnExport = document.getElementById('btn-export');
const btnImport = document.getElementById('btn-import');
const btnResetDefault = document.getElementById('btn-reset-default');
const btnClear = document.getElementById('btn-clear');
const fileInput = document.getElementById('file-input');
const searchInput = document.getElementById('search-input');
const btnSearchClear = document.getElementById('btn-search-clear');
const iconControls = document.getElementById('icon-controls');
const btnToggleDimmed = document.getElementById('btn-toggle-dimmed');
const btnToggleWalls = document.getElementById('btn-toggle-walls');
const layerBtns = document.querySelectorAll('.layer-btn');
const layerResetBtns = document.querySelectorAll('.layer-reset-btn');
const pathPanel = document.getElementById('path-panel');
const pathList = document.getElementById('path-list');
const pathTotalLenEl = document.getElementById('path-total-len');
const btnPathToggle = document.getElementById('btn-path-toggle');
const btnPathTeleport = document.getElementById('btn-path-teleport');
const btnPathAutoHide = document.getElementById('btn-path-autohide');
const btnPathUndo = document.getElementById('btn-path-undo');
const btnPathClear = document.getElementById('btn-path-clear');
const btnPathImport = document.getElementById('btn-path-import');
const btnPathExport = document.getElementById('btn-path-export');
const pathFileInput = document.getElementById('path-file-input');
const btnPathColor = document.getElementById('btn-path-color');
const batchDialog = document.getElementById('batch-dialog');
const btnOpenBatch = document.getElementById('btn-open-batch');
const btnCloseBatch = document.getElementById('btn-close-batch');
const batchFilterIcon = document.getElementById('batch-filter-icon');
const batchFilterName = document.getElementById('batch-filter-name');
const batchMatchInfo = document.getElementById('batch-match-info');
const chkBatchName = document.getElementById('chk-batch-name');
const inputBatchName = document.getElementById('input-batch-name');
const chkBatchLayer = document.getElementById('chk-batch-layer');
const inputBatchLayer = document.getElementById('input-batch-layer');
const chkBatchIcon = document.getElementById('chk-batch-icon');
const inputBatchIcon = document.getElementById('input-batch-icon');
const btnBatchApply = document.getElementById('btn-batch-apply');
const btnBatchDelete = document.getElementById('btn-batch-delete');
const logPanel = document.getElementById('log-panel');
const logList = document.getElementById('log-list');
const btnShowLog = document.getElementById('btn-show-log');
const btnHideLog = document.getElementById('btn-hide-log');
const btnClearLog = document.getElementById('btn-clear-log');
/* ==================================================================================
   SECTION 3: 全局状态变量 (LET STATE)
   ================================================================================== */
let mapX = 0;
let mapY = 0;
let scale = 0.5;
let isDragging = false;
let startX = 0, startY = 0;
let clickStartX = 0, clickStartY = 0;
let markersData = [];
let recordedPath = [];
let currentTargetMarkerData = null;
let editingMarkerData = null;
let hoveredMarkerData = null;
let bindingChildData = null;
let movingMarkerTarget = null;
let isBindingMode = false;
let isMovingMarkerMode = false;
let isRecordingPath = false;
let isPathInsertMode = false;
let isTeleport = false;
let isPathColorChange = true;
let pathInsertIndex = -1;
let layerVisibility = { 1: true, 2: true, 3: true };
let iconVisibility = {};
let hideDimmedMarkers = false;
let hideWalls = true;
let isPathAutoHide = true;
let pathHistoryStack = [];
let lastAutoName = "";
let lastUsedIcon = null;
let currentMarkerType = 'icon';
let currentWallType = 'wall-breakable';
let renderRequestId = null;
let tipTimer = null;
let actionLog = [];
/* 移动端 */
let lastTouchX = 0;
let lastTouchY = 0;
let initialPinchDist = 0;
let initialScale = 0;
let longPressTimer = null;
let isPinching = false;
/* ==================================================================================
   SECTION 4: 初始化流程 (INIT)
   ================================================================================== */
function init() {
    const savedTheme = localStorage.getItem('silkSongTheme') || 'dark';
    document.body.setAttribute('data-theme', savedTheme);
    initIconDropdown();
    initBatchDropdowns(); 
    initIconVisibility();
    initLayerVisibility();
    renderIconControls();
    loadMarkers();
    initState();
    btnTypeIcon.onclick = () => setDialogType('icon');
    btnTypeWall.onclick = () => setDialogType('wall');
    if (map.complete) {
        centerMap();
    } else {
        map.onload = centerMap;
    }
    setupPanelToggle('control-panel', 'btn-hide-control', 'btn-show-control');
    setupPanelToggle('path-panel', 'btn-hide-path', 'btn-show-path');
    setupPanelToggle('log-panel', 'btn-hide-log', 'btn-show-log');
    btnClearLog.onclick = () => {
        actionLog = [];
        renderLogList();
    };
}
init();
/* ==================================================================================
   SECTION 5: 核心渲染引擎 (RENDER LOOP)
   ================================================================================== */
function triggerRender() {
    if (!renderRequestId) {
        renderRequestId = requestAnimationFrame(() => {
            render();
            renderRequestId = null;
        });
    }
}
function render() {
    const tx = mapX;
    const ty = mapY;
    const s = scale;
    map.style.transform = `translate(${tx}px, ${ty}px) scale(${s})`;
    if (canvas.width !== container.clientWidth || canvas.height !== container.clientHeight) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const toScreen = (gx, gy) => ({ x: tx + gx * s, y: ty + gy * s });
    drawConnectionLines(ctx, toScreen);
    drawRecordedPath(ctx, toScreen);
    updateMarkersDOM(tx, ty, s);
}
/* ==================================================================================
   SECTION 5.1: Canvas 绘图逻辑
   ================================================================================== */
function drawConnectionLines(ctx, toScreen) {
    ctx.lineWidth = 2;
    markersData.forEach(item => {
        if (!item.parentId || !item._logicVisible) return;
        const parent = markersData.find(m => m.id === item.parentId);
        if (!parent || !parent._logicVisible) return;
        const p1 = toScreen(item.x, item.y);
        const p2 = toScreen(parent.x, parent.y);
        const dist = Math.hypot(item.x - parent.x, item.y - parent.y);
        const isHovered = hoveredMarkerData && (hoveredMarkerData === item || hoveredMarkerData === parent);
        const shouldDraw = (dist <= LINE_THRESHOLD) || isHovered;
        if (shouldDraw) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = item.dimmed ? 'rgba(255, 255, 0, 0.3)' : 'rgba(255, 255, 0, 0.8)';
            ctx.stroke();
        }
    });
}
function drawRecordedPath(ctx, toScreen) {
    if (recordedPath.length < 2) return;
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    let colorIndex = 0;
    ctx.beginPath();
    ctx.strokeStyle = PATH_COLORS[0];
    const startP = toScreen(recordedPath[0].x, recordedPath[0].y);
    ctx.moveTo(startP.x, startP.y);
    for (let i = 1; i < recordedPath.length; i++) {
        const curr = recordedPath[i];
        const prev = recordedPath[i - 1];
        const currScreen = toScreen(curr.x, curr.y);
        const prevScreen = toScreen(prev.x, prev.y);
        if (curr.isTeleport) {
            ctx.stroke();
            let isHovering = hoveredMarkerData && (
                (curr.markerId && hoveredMarkerData.id === curr.markerId)
                || (prev.markerId && hoveredMarkerData.id === prev.markerId));
            if (isHovering) {
                ctx.save();
                ctx.beginPath();
                ctx.moveTo(prevScreen.x, prevScreen.y);
                ctx.lineTo(currScreen.x, currScreen.y);
                ctx.setLineDash([5, 5]);
                ctx.globalAlpha = 0.5;
                ctx.strokeStyle = ctx.strokeStyle;
                ctx.stroke();
                ctx.restore();
            }
            const shouldChange = (curr.colorChange !== undefined) ? curr.colorChange : true;
            if (shouldChange) {
                colorIndex = (colorIndex + 1) % PATH_COLORS.length;
            }
            ctx.strokeStyle = PATH_COLORS[colorIndex];
            ctx.beginPath();
            ctx.moveTo(currScreen.x, currScreen.y);
            ctx.fillStyle = ctx.strokeStyle;
            ctx.fillRect(currScreen.x - 6, currScreen.y - 6, 12, 12);
        } else {
            ctx.lineTo(currScreen.x, currScreen.y);
        }
    }
    ctx.stroke();
}
/* ==================================================================================
   SECTION 5.2: DOM 元素更新逻辑
   ================================================================================== */
function updateMarkersDOM(tx, ty, s) {
    const buffer = 300;
    const viewLeft = -tx / s - buffer;
    const viewRight = (container.clientWidth - tx) / s + buffer;
    const viewTop = -ty / s - buffer;
    const viewBottom = (container.clientHeight - ty) / s + buffer;
    const currentSize = Math.max(20, 24 * Math.sqrt(s));
    markersData.forEach(item => {
        if (!item.element) return;
        if (!item._logicVisible ||
            item.x < viewLeft || item.x > viewRight || item.y < viewTop || item.y > viewBottom) {
            if (item._lastDisplayState !== 'none') {
                item.element.style.display = 'none';
                item._lastDisplayState = 'none';
            }
            return;
        }
        if (item._lastDisplayState !== 'block') {
            item.element.style.display = 'block';
            item._lastDisplayState = 'block';
        }
        if (item.type === 'wall') {
            const baseLength = item.length || 20;
            item.element.style.left = (tx + item.x * s) + 'px';
            item.element.style.top = (ty + item.y * s) + 'px';
            item.element.style.width = (baseLength * s) + 'px';
            item.element.style.height = (4 * s) + 'px';
            item.element.style.setProperty('--scale', s);
            item.element.style.transform = `translate(-50%, -50%) rotate(${item.angle || 0}deg)`;
        } else {
            item.element.style.left = (tx + item.x * s) + 'px';
            item.element.style.top = (ty + item.y * s) + 'px';
            item.element.style.width = currentSize + 'px';
            item.element.style.height = currentSize + 'px';
            item.element.style.transform = `translate(-50%, -50%)`;
        }
    });
}
/* ==================================================================================
   SECTION 6: 交互事件监听 (EVENT LISTENERS)
   ================================================================================== */
container.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
        const touch = e.touches[0];
        lastTouchX = touch.clientX;
        lastTouchY = touch.clientY;
        clickStartX = touch.clientX;
        clickStartY = touch.clientY;
        isDragging = true;
        longPressTimer = setTimeout(() => {
            isDragging = false;
            if (isMovingMarkerMode) {
                isMovingMarkerMode = false;
                movingMarkerTarget = null;
                showTip("已取消移动");
                return;
            }
            const pos = getTouchOnMap(touch);
            showDialog(pos.x, pos.y);
            if (navigator.vibrate) navigator.vibrate(50);
        }, 600);
    }
    else if (e.touches.length === 2) {
        isPinching = true;
        isDragging = false;
        clearTimeout(longPressTimer); 
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        initialPinchDist = Math.hypot(dx, dy);
        initialScale = scale; 
    }
}, { passive: false });
container.addEventListener('touchmove', (e) => {
    e.preventDefault(); 
    if (e.touches.length === 1 && isDragging && !isPinching) {
        const touch = e.touches[0];
        const dx = touch.clientX - lastTouchX;
        const dy = touch.clientY - lastTouchY;
        if (Math.hypot(touch.clientX - clickStartX, touch.clientY - clickStartY) > 10) {
            clearTimeout(longPressTimer);
        }
        mapX += dx;
        mapY += dy;
        lastTouchX = touch.clientX;
        lastTouchY = touch.clientY;
        triggerRender();
    }
    else if (e.touches.length === 2 && isPinching) {
        clearTimeout(longPressTimer);
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const currentDist = Math.hypot(dx, dy);
        if (initialPinchDist > 0) {
            const zoomFactor = currentDist / initialPinchDist;
            let newScale = initialScale * zoomFactor;
            newScale = Math.min(Math.max(newScale, 0.25), 5); 
            scale = newScale;
            triggerRender();
        }
    }
}, { passive: false });
container.addEventListener('touchend', (e) => {
    clearTimeout(longPressTimer);
    if (e.touches.length === 0) {
        isDragging = false;
        isPinching = false;
    }
});
function getTouchOnMap(touch) {
    const rawX = (touch.clientX - mapX) / scale;
    const rawY = (touch.clientY - mapY) / scale;
    return {
        x: Math.round(rawX / 5) * 5,
        y: Math.round(rawY / 5) * 5
    };
}
btnGlobalTheme.onclick = () => {
    const current = document.body.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', next);
    localStorage.setItem('silkSongTheme', next);
    showTip(next === 'light' ? "已切换为亮色主题 ☀️" : "已切换为暗色主题 🌙");
};
container.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    clickStartX = e.clientX;
    clickStartY = e.clientY;
    if (isMovingMarkerMode && movingMarkerTarget) {
        const oldSnapshot = { ...movingMarkerTarget };
        const pos = getMouseOnMap(e);
        movingMarkerTarget.x = pos.x;
        movingMarkerTarget.y = pos.y;
        addLogEntry("移动", `移动 "${movingMarkerTarget.name}"`, {
            action: 'restore_single',
            marker: oldSnapshot
        });
        saveMarkers();
        triggerRender();
        isMovingMarkerMode = false;
        movingMarkerTarget = null;
        container.style.cursor = 'default';
        tooltip.style.display = 'none';
        showTip(`移动成功！坐标: [${pos.x}, ${pos.y}]`);
        return;
    }
    if (e.target.closest('.marker') || e.target.closest('.map-wall') ||
        e.target.closest('#control-panel') || e.target.closest('#path-panel')) return;
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    container.style.cursor = 'grabbing';
});
window.addEventListener('mousemove', (e) => {
    if (tooltip.style.display === 'block') {
        tooltip.style.left = (e.clientX + 10) + 'px';
        tooltip.style.top = (e.clientY + 10) + 'px';
    }
    if (isMovingMarkerMode && movingMarkerTarget) {
        const pos = getMouseOnMap(e);
        tooltip.style.display = 'block';
        tooltip.style.left = (e.clientX + 15) + 'px';
        tooltip.style.top = (e.clientY + 15) + 'px';
        tooltip.innerHTML = `正在移动: <b>${movingMarkerTarget.name}</b><br>当前坐标: [${pos.x}, ${pos.y}]<br><span style="color:#aaa;font-size:12px">(单击左键放置)</span>`;
    }
    if (isDragging) {
        mapX += e.clientX - startX;
        mapY += e.clientY - startY;
        startX = e.clientX;
        startY = e.clientY;
        triggerRender();
    }
});
window.addEventListener('mouseup', () => {
    if (isDragging) {
        isDragging = false;
        container.style.cursor = 'default';
        triggerRender();
    }
});
container.addEventListener('wheel', (e) => {
    e.preventDefault();
    const direction = e.deltaY < 0 ? 1 : -1;
    let newScale = scale + (direction * 0.1 * scale);
    newScale = Math.min(Math.max(newScale, 0.25), 5);
    const mouseOnMapX = (e.clientX - mapX) / scale;
    const mouseOnMapY = (e.clientY - mapY) / scale;
    mapX = e.clientX - mouseOnMapX * newScale;
    mapY = e.clientY - mouseOnMapY * newScale;
    scale = newScale;
    triggerRender();
}, { passive: false });
container.addEventListener('click', (e) => {
    if (!isRecordingPath) return;
    if (e.target.closest('.marker') || e.target.closest('.map-wall') ||
        e.target.closest('#control-panel') || e.target.closest('#path-panel')) return;
    const dist = Math.hypot(e.clientX - clickStartX, e.clientY - clickStartY);
    if (dist > 5) return;
    let pos = getMouseOnMap(e);
    const lastPoint = recordedPath.length > 0 ? recordedPath[recordedPath.length - 1] : null;
    if (e.shiftKey && lastPoint) {
        const dx = Math.abs(pos.x - lastPoint.x);
        const dy = Math.abs(pos.y - lastPoint.y);
        if (dx > dy) pos.y = lastPoint.y;
        else pos.x = lastPoint.x;
    }
    addPathPoint({ x: pos.x, y: pos.y, name: isTeleport ? "传送点 (自定义)" : "自定义点" });
});
container.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    if (isMovingMarkerMode) {
        isMovingMarkerMode = false;
        movingMarkerTarget = null;
        container.style.cursor = 'default';
        showTip("已取消移动");
        return;
    }
    if (e.target.classList.contains('marker') || e.target.classList.contains('map-wall')) return;
    const pos = getMouseOnMap(e);
    showDialog(pos.x, pos.y);
});
btnCancel.onclick = hideAllMenus;
overlay.onclick = hideAllMenus;
window.addEventListener('click', () => { contextMenu.style.display = 'none'; });
btnOk.onclick = () => {
    const name = nameInput.value.trim() || "";
    const intro = introInput.value.trim();
    const layer = layerSelect.value;
    const x = Number(coordXInput.value);
    const y = Number(coordYInput.value);
    const type = currentMarkerType;
    const dataObj = {
        name, intro, layer, x, y, type,
        dimmed: editingMarkerData ? editingMarkerData.dimmed : false,
        parentId: editingMarkerData ? editingMarkerData.parentId : null,
        id: editingMarkerData ? editingMarkerData.id : Date.now()
    };
    if (type === 'wall') {
        dataObj.wallType = currentWallType;
        dataObj.length = Number(wallLenInput.value);
        dataObj.angle = Number(wallAngleInput.value);
    } else {
        dataObj.icon = iconSelect.value;
    }
    if (editingMarkerData) {
        const oldSnapshot = { ...editingMarkerData };
        Object.assign(editingMarkerData, dataObj);
        const currentTag = editingMarkerData.element.tagName.toLowerCase();
        const targetTag = (type === 'wall' ? 'div' : 'img');
        if (currentTag !== targetTag) {
            editingMarkerData.element.remove();
            createMarkerDOM(editingMarkerData);
        } else {
            if (type === 'wall') {
                editingMarkerData.element.className = `map-wall ${dataObj.wallType}`;
            } else {
                editingMarkerData.element.src = `icons/${dataObj.icon}`;
            }
        }
        addLogEntry("编辑", `修改了标记 "${dataObj.name}"`, {
            action: 'restore_single',
            marker: oldSnapshot
        });
    } else {
        if (type === 'icon') lastUsedIcon = dataObj.icon;
        createNewMarker(dataObj);
    }
    saveMarkers();
    checkLogicVisibility();
    triggerRender();
    hideAllMenus();
};
/* ==================================================================================
   SECTION 6.41
   ================================================================================== */
function initBatchDropdowns() {
    iconFiles.forEach(icon => {
        const name = icon.replace('.png', '');
        const optFilter = document.createElement('option');
        optFilter.value = icon;
        optFilter.textContent = `🏷️ ${name}`;
        batchFilterIcon.appendChild(optFilter);
        const optEdit = document.createElement('option');
        optEdit.value = icon;
        optEdit.textContent = name;
        inputBatchIcon.appendChild(optEdit);
    });
}
btnOpenBatch.onclick = () => {
    batchDialog.style.display = 'block';
    overlay.style.display = 'block';
    batchFilterName.value = '';
    batchFilterIcon.value = 'all';
    chkBatchName.checked = false;
    chkBatchLayer.checked = false;
    chkBatchIcon.checked = false;
    toggleBatchInputs();
    updateBatchStats();
};
btnCloseBatch.onclick = () => {
    batchDialog.style.display = 'none';
    overlay.style.display = 'none';
};
batchFilterName.addEventListener('input', updateBatchStats);
batchFilterIcon.addEventListener('change', updateBatchStats);
function toggleBatchInputs() {
    inputBatchName.disabled = !chkBatchName.checked;
    inputBatchLayer.disabled = !chkBatchLayer.checked;
    inputBatchIcon.disabled = !chkBatchIcon.checked;
}
[chkBatchName, chkBatchLayer, chkBatchIcon].forEach(chk => {
    chk.addEventListener('change', toggleBatchInputs);
});
function getBatchTargets() {
    const filterName = batchFilterName.value.trim().toLowerCase();
    const filterIcon = batchFilterIcon.value; 
    return markersData.filter(m => {
        if (filterName && !m.name.toLowerCase().includes(filterName)) return false;
        if (filterIcon === 'all') return true;
        if (filterIcon === 'wall') return m.type === 'wall';
        return m.type !== 'wall' && m.icon === filterIcon;
    });
}
function updateBatchStats() {
    const targets = getBatchTargets();
    batchMatchInfo.textContent = `当前筛选命中: ${targets.length} 个标记`;
    const isEmpty = targets.length === 0;
    btnBatchApply.disabled = isEmpty;
    btnBatchDelete.disabled = isEmpty;
    btnBatchApply.style.opacity = isEmpty ? 0.5 : 1;
    btnBatchDelete.style.opacity = isEmpty ? 0.5 : 1;
}
btnBatchApply.onclick = () => {
    const targets = getBatchTargets();
    if (targets.length === 0) return;
    if (!chkBatchName.checked && !chkBatchLayer.checked && !chkBatchIcon.checked) {
        return alert("请至少勾选一项需要修改的属性！");
    }
    const newNameVal = inputBatchName.value.trim();
    const newLayerVal = inputBatchLayer.value;
    const newIconVal = inputBatchIcon.value;
    const searchKeyword = batchFilterName.value.trim();
    let nameMsg = '';
    if (chkBatchName.checked) {
        if (searchKeyword) {
            nameMsg = ` - 名称修改: 将包含 "${searchKeyword}" 的部分替换为 "${newNameVal}"\n`;
        } else {
            nameMsg = ` - 名称统一为: "${newNameVal}" (完全覆盖)\n`;
        }
    }
    const confirmMsg = `确定要修改这 ${targets.length} 个标记吗？\n` +
        nameMsg +
        (chkBatchLayer.checked ? ` - 图层统一为: ${newLayerVal}\n` : '') +
        (chkBatchIcon.checked ? ` - 图标统一为: ${inputBatchIcon.options[inputBatchIcon.selectedIndex].text}\n` : '');
    if (confirm(confirmMsg)) {
        const backupData = JSON.stringify(markersData);
        targets.forEach(m => {
            if (chkBatchName.checked) {
                if (searchKeyword) {
                    const regex = new RegExp(escapeRegExp(searchKeyword), 'gi');
                    m.name = m.name.replace(regex, newNameVal);
                } else {
                    m.name = newNameVal;
                }
            }
            if (chkBatchLayer.checked) m.layer = newLayerVal;
            if (chkBatchIcon.checked) {
                m.icon = newIconVal;
                if (m.type === 'wall') {
                    m.type = 'icon';
                    delete m.wallType;
                    delete m.length;
                    delete m.angle;
                }
            }
            if (m.element) {
                m.element.remove();
                createMarkerDOM(m);
            }
        });
        finishBatchOperation();
        addLogEntry("批量修改", `修改了 ${targets.length} 个标记的属性`, {
            action: 'restore_all',
            backup: backupData
        });
        alert("批量修改完成！");
    }
};
btnBatchDelete.onclick = () => {
    const targets = getBatchTargets();
    if (targets.length === 0) return;
    if (confirm(`确定要永久删除这 ${targets.length} 个标记吗？`)) {
        const backupData = JSON.stringify(markersData);
        targets.forEach(m => m.element && m.element.remove());
        markersData = markersData.filter(m => !targets.includes(m));
        finishBatchOperation();
        addLogEntry("批量删除", `删除了 ${targets.length} 个标记`, {
            action: 'restore_all',
            backup: backupData
        });
    }
};
function finishBatchOperation() {
    saveMarkers();
    checkLogicVisibility();
    triggerRender();
    batchDialog.style.display = 'none';
    overlay.style.display = 'none';
}
/* ==================================================================================
   SECTION 6.5 - 6.9: 其他交互逻辑
   ================================================================================== */
menuEdit.onclick = () => {
    if (!currentTargetMarkerData) return;
    editingMarkerData = currentTargetMarkerData;
    nameInput.value = editingMarkerData.name;
    introInput.value = editingMarkerData.intro || "";
    layerSelect.value = editingMarkerData.layer;
    coordXInput.value = editingMarkerData.x;
    coordYInput.value = editingMarkerData.y;
    if (editingMarkerData.type === 'wall') {
        setDialogType('wall');
        setWallType(editingMarkerData.wallType || 'wall-breakable');
        wallLenInput.value = editingMarkerData.length || 20;
        wallAngleInput.value = (editingMarkerData.angle || 0).toString();
    } else {
        setDialogType('icon');
        iconSelect.value = editingMarkerData.icon;
        iconPreview.src = `icons/${editingMarkerData.icon}`;
    }
    dialog.style.display = 'block';
    overlay.style.display = 'block';
    contextMenu.style.display = 'none';
};
menuBind.onclick = () => {
    if (currentTargetMarkerData) {
        isBindingMode = true;
        bindingChildData = currentTargetMarkerData;
        showTip("请点击另一个标记作为父级");
        hideAllMenus();
    }
};
menuUnbind.onclick = () => {
    if (currentTargetMarkerData) {
        if (currentTargetMarkerData.parentId) {
            currentTargetMarkerData.parentId = null;
            saveMarkers();
            triggerRender();
            showTip("取消绑定成功！");
        } else {
            showTip("该标记未绑定任何父级。");
        }
    }
    hideAllMenus();
};
menuMove.onclick = () => {
    if (currentTargetMarkerData) {
        isMovingMarkerMode = true;
        movingMarkerTarget = currentTargetMarkerData;
        container.style.cursor = 'crosshair';
        showTip("请点击地图新位置放置标记 (已开启自动吸附)");
        hideAllMenus();
    }
};
menuDelete.onclick = () => {
    if (currentTargetMarkerData) {
        if (currentTargetMarkerData.element) {
            currentTargetMarkerData.element.remove();
        }
        markersData = markersData.filter(m => m !== currentTargetMarkerData);
        const oldSnapshot = { ...currentTargetMarkerData };
        addLogEntry("删除", `删除了标记 "${currentTargetMarkerData.name}"`, {
            action: 'restore_single',
            marker: oldSnapshot
        });
        saveMarkers();
        triggerRender();
    }
    hideAllMenus();
};
searchInput.addEventListener('input', () => {
    checkLogicVisibility();
    triggerRender();
});
btnSearchClear.onclick = () => {
    searchInput.value = "";
    checkLogicVisibility();
    triggerRender();
};
layerBtns.forEach(btn => {
    btn.onclick = () => {
        const l = btn.dataset.layer;
        layerVisibility[l] = !layerVisibility[l];
        btn.classList.toggle('active', layerVisibility[l]);
        saveLayerVisibility();
        checkLogicVisibility();
        triggerRender();
    };
});
layerResetBtns.forEach(btn => {
    btn.onclick = () => {
        const l = btn.dataset.layer;
        if (confirm(`重置图层 ${l} 的所有标记透明度？`)) {
            markersData.forEach(d => {
                if (d.layer === l) {
                    d.dimmed = false;
                    if (d.element) d.element.style.opacity = 1;
                }
            });
            saveMarkers();
        }
    }
});
btnToggleDimmed.onclick = () => {
    hideDimmedMarkers = !hideDimmedMarkers;
    btnToggleDimmed.classList.toggle('active', !hideDimmedMarkers);
    checkLogicVisibility();
    triggerRender();
};
btnToggleWalls.onclick = () => {
    hideWalls = !hideWalls;
    btnToggleWalls.classList.toggle('active', !hideWalls);
    checkLogicVisibility();
    triggerRender();
};
btnWallBreakable.onclick = () => setWallType('wall-breakable');
btnWallOneway.onclick = () => setWallType('wall-oneway');
btnResetDefault.onclick = () => {
    if (confirm("确定要【丢弃当前所有修改】并恢复到 default.json 的预设数据吗？\n此操作不可撤销！")) {
        loadDefaultData();
    }
};
btnPathToggle.onclick = () => {
    if (isPathInsertMode) {
        isPathInsertMode = false;
        pathInsertIndex = -1;
        isRecordingPath = false;
        btnPathToggle.textContent = "▶ 开始记录";
        btnPathToggle.style.backgroundColor = "";
        showTip("已退出插入模式。");
        return;
    }
    isRecordingPath = !isRecordingPath;
    if (isRecordingPath) {
        btnPathToggle.textContent = "⏹ 停止记录";
        btnPathToggle.style.backgroundColor = "#dc3545";
        showTip("路径模式");
    } else {
        btnPathToggle.textContent = "▶ 开始记录";
        btnPathToggle.style.backgroundColor = "";
        showTip("已停止记录");
        if (isTeleport) {
            isTeleport = false;
            btnPathTeleport.classList.add('active');
        }
    }
};
btnPathTeleport.onclick = () => {
    if (!isRecordingPath) return showTip("请先开始记录路径！");
    isTeleport = !isTeleport;
    btnPathTeleport.classList.toggle('active', !isTeleport);
    showTip(isTeleport ? "传送模式：请点击下一个点" : "已取消传送模式。");
};
btnPathColor.onclick = () => {
    isPathColorChange = !isPathColorChange;
    btnPathColor.classList.toggle('active', isPathColorChange);
};
btnPathAutoHide.onclick = () => {
    isPathAutoHide = !isPathAutoHide;
    btnPathAutoHide.classList.toggle('active', !isPathAutoHide);
};
if (btnPathUndo) {
    btnPathUndo.onclick = () => {
        if (pathHistoryStack.length === 0) {
            return showTip("没有可撤销的路径操作");
        }
        const lastAction = pathHistoryStack.pop();
        if (lastAction.type === 'add') {
            recordedPath.splice(lastAction.index, 1);
            if (isPathInsertMode && pathInsertIndex > lastAction.index) {
                pathInsertIndex--;
            }
            if (lastAction.markerId && lastAction.dimChanged) {
                const targetMarker = markersData.find(m => m.id === lastAction.markerId);
                if (targetMarker && targetMarker.dimmed) {
                    toggleMarkerDimmed(targetMarker, false);
                    saveMarkers();
                    checkLogicVisibility();
                }
            }
        }
        else if (lastAction.type === 'delete') {
            recordedPath.splice(lastAction.index, 0, lastAction.data);
            if (lastAction.data.markerId) {
                const m = markersData.find(x => x.id === lastAction.data.markerId);
            }
        }
        updatePathListUI(true);
        triggerRender();
        showTip("已撤销上一步路径操作");
    };
}
btnPathClear.onclick = () => {
    if (confirm("确定清空当前路径吗？")) {
        recordedPath = [];
        pathHistoryStack = [];
        updatePathListUI();
        triggerRender();
    }
};
btnExport.onclick = () => downloadFile(JSON.stringify(markersData, null, 2), "markers.json", "application/json");
btnPathExport.onclick = () => {
    const validData = recordedPath.filter(p => p.markerId);
    if (validData.length === 0) return alert("没有路径数据");
    downloadFile(JSON.stringify(validData, null, 2), "path.json", "application/json");
};
btnClear.onclick = () => {
    if (confirm("警告：确定删除所有标记？此操作无法撤销。")) {
        markersData.forEach(m => m.element && m.element.remove());
        markersData = [];
        saveMarkers();
        triggerRender();
    }
};
window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        const latestUndoableLog = actionLog.find(item => item.undoData);
        if (latestUndoableLog) {
            handleUndo(latestUndoableLog.id);
        } else {
            showTip("当前没有可撤销的操作");
        }
    }
});
btnImport.onclick = () => fileInput.click();
fileInput.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        try {
            const arr = JSON.parse(ev.target.result);
            if (!Array.isArray(arr)) return alert("格式错误");
            if (confirm("导入将覆盖现有标记，确定吗？")) {
                markersData.forEach(m => m.element && m.element.remove());
                markersData = [];
                const fragment = document.createDocumentFragment();
                arr.forEach(d => {
                    const snappedX = Math.round(d.x / 5) * 5;
                    const snappedY = Math.round(d.y / 5) * 5;
                    const clean = {
                        id: d.id || Date.now() + Math.random(),
                        x: snappedX, y: snappedY,
                        name: d.name, type: d.type || 'icon',
                        wallType: d.wallType, length: d.length, angle: d.angle,
                        icon: d.icon, layer: d.layer || "1", intro: d.intro || "",
                        dimmed: d.dimmed || false, parentId: d.parentId || null
                    };
                    markersData.push(clean);
                    createMarkerDOM(clean, fragment);
                });
                container.appendChild(fragment);
                saveMarkers();
                checkLogicVisibility();
                triggerRender();
                alert("导入成功！");
            }
        } catch (err) { alert("文件损坏"); }
        fileInput.value = '';
    };
    reader.readAsText(file);
};
btnPathImport.onclick = () => pathFileInput.click();
pathFileInput.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        try {
            if (confirm("导入路径将覆盖当前记录，确定吗？")) {
                const importedPath = JSON.parse(ev.target.result);
                if (!Array.isArray(importedPath)) throw new Error("无效数组");
                recordedPath = importedPath;
                pathHistoryStack = [];
                updatePathListUI();
                triggerRender();
                showTip("路径导入成功！");
            }
        } catch (err) { alert("文件格式错误"); }
        pathFileInput.value = '';
    };
    reader.readAsText(file);
};
/* ==================================================================================
   SECTION 7: 功能函数模块 (FUNCTIONS)
   ================================================================================== */
function createNewMarker(data) {
    markersData.push(data);
    createMarkerDOM(data);
    addLogEntry("新建", `创建了标记 "${data.name}"`, {
        action: 'delete_id',
        id: data.id
    })
    saveMarkers();
    checkLogicVisibility();
    triggerRender();
}
function createMarkerDOM(data, fragment = null) {
    let el;
    if (data.type === 'wall') {
        el = document.createElement('div');
        el.className = `map-wall ${data.wallType || 'wall-breakable'}`;
    } else {
        el = document.createElement('img');
        el.className = 'marker';
        el.src = `icons/${data.icon || iconFiles[0]}`;
        el.onerror = () => { el.src = 'icons/地图.png'; };
    }
    data._lastDisplayState = '';
    data._logicVisible = true;
    data.element = el;
    if (data.dimmed) el.style.opacity = 0.3;
    if (!data.layer) data.layer = "1";
    el.addEventListener('mouseenter', () => {
        if (el.style.display === 'none') return;
        tooltip.style.display = 'block';
        let tipText = `${data.name}`;
        if (data.layer !== "1") tipText += ` (L${data.layer})`;
        if (data.intro) tipText += `\n${data.intro}`;
        if (data.type === 'wall') tipText += `\n[长度:${data.length || 20}]`;
        else tipText += `\n[${Math.round(data.x)}, ${Math.round(data.y)}]`;
        tooltip.textContent = tipText;
        hoveredMarkerData = data;
        triggerRender();
    });
    el.addEventListener('mouseleave', () => {
        tooltip.style.display = 'none';
        hoveredMarkerData = null;
        triggerRender();
    });
    el.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isBindingMode) {
            if (bindingChildData === data) return showTip("不能绑定自己！");
            bindingChildData.parentId = data.id;
            showTip("绑定成功！");
            isBindingMode = false;
            bindingChildData = null;
            saveMarkers();
            triggerRender();
            return;
        }
        if (isRecordingPath) {
            addPathPointFromMarker(data);
            return;
        }
        const isSpecial = data.icon && (data.icon.includes('长椅') || data.icon.includes('钟道'));
        if (!isSpecial) {
            toggleMarkerDimmed(data, !data.dimmed);
            saveMarkers();
            if (hideDimmedMarkers) {
                checkLogicVisibility();
                triggerRender();
            }
        }
    });
    el.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isBindingMode) {
            isBindingMode = false;
            showTip("已取消绑定");
            return;
        }
        currentTargetMarkerData = data;
        contextMenu.style.display = 'block';
        contextMenu.style.left = e.clientX + 'px';
        contextMenu.style.top = e.clientY + 'px';
    });
    /* 手机 */
    let markerPressTimer;
    el.addEventListener('touchstart', (e) => {
        e.stopPropagation(); 
        markerPressTimer = setTimeout(() => {
            if (isBindingMode) {
                isBindingMode = false;
                showTip("已取消绑定");
                return;
            }
            currentTargetMarkerData = data;
            contextMenu.style.display = 'block';
            const touch = e.touches[0];
            contextMenu.style.left = touch.clientX + 'px';
            contextMenu.style.top = touch.clientY + 'px';
            if (navigator.vibrate) navigator.vibrate(50);
        }, 600); 
    });
    el.addEventListener('touchend', () => {
        clearTimeout(markerPressTimer); 
    });
    el.addEventListener('touchmove', () => {
        clearTimeout(markerPressTimer); 
    });
    /* */
    if (fragment) fragment.appendChild(el);
    else container.appendChild(el);
}
function toggleMarkerDimmed(data, isDimmed) {
    data.dimmed = isDimmed;
    if (data.element) data.element.style.opacity = isDimmed ? 0.3 : 1;
    const children = markersData.filter(child => child.parentId === data.id);
    children.forEach(child => {
        toggleMarkerDimmed(child, isDimmed);
    });
}
function addPathPoint(pointData, causedDimChange = false) {
    const newPoint = {
        x: pointData.x,
        y: pointData.y,
        name: pointData.name,
        markerId: pointData.markerId || null,
        isTeleport: isTeleport,
        colorChange: isTeleport ? isPathColorChange : false
    };
    if (isTeleport) {
        isTeleport = false;
        btnPathTeleport.classList.add('active');
        container.style.cursor = "default";
    }
    let actualIndex = -1;
    if (isPathInsertMode) {
        recordedPath.splice(pathInsertIndex, 0, newPoint);
        actualIndex = pathInsertIndex;
        pathInsertIndex++;
    } else {
        recordedPath.push(newPoint);
        actualIndex = recordedPath.length - 1;
    }
    pathHistoryStack.push({
        type: 'add',
        index: actualIndex,
        markerId: pointData.markerId || null,
        dimChanged: causedDimChange
    });
    updatePathListUI(isPathInsertMode);
    triggerRender();
}
function addPathPointFromMarker(data) {
    let dimStateChanged = false;
    const isSpecial = data.icon && (data.icon.includes('长椅') || data.icon.includes('钟道'));
    if (isPathAutoHide && !isSpecial) {
        if (!data.dimmed) {
            dimStateChanged = true;
        }
        toggleMarkerDimmed(data, !data.dimmed);
        saveMarkers();
        if (hideDimmedMarkers) {
            checkLogicVisibility();
        }
    }
    addPathPoint({
        x: data.x,
        y: data.y,
        name: data.name,
        markerId: data.id
    }, dimStateChanged);
}
function updatePathListUI(maintainScroll = false) {
    const scrollContainer = pathList.parentElement;
    const currentScrollTop = scrollContainer.scrollTop;
    pathList.innerHTML = '';
    const totalLen = calculatePathLength();
    if (pathTotalLenEl) pathTotalLenEl.textContent = `当前总长: ${totalLen.toLocaleString()}`;
    const visiblePoints = recordedPath.filter(p => p.markerId);
    if (visiblePoints.length === 0) pathList.innerHTML = '<li>(暂无标记记录)</li>';
    let displayIndex = 0;
    let listColorIndex = 0;
    recordedPath.forEach((p, realIndex) => {
        const shouldChange = (p.colorChange !== undefined) ? p.colorChange : true;
        if (p.isTeleport && realIndex > 0 && shouldChange) {
            listColorIndex = (listColorIndex + 1) % PATH_COLORS.length;
        }
        const currentColor = PATH_COLORS[listColorIndex];
        if (!p.markerId) return;
        displayIndex++;
        const li = document.createElement('li');
        li.style.borderLeft = `5px solid ${currentColor}`;
        li.style.paddingLeft = "8px";
        const span = document.createElement('span');
        const isTp = p.isTeleport ? " 🌀" : "";
        span.textContent = `${displayIndex}. ${p.name}${isTp}`;
        const btnContainer = document.createElement('div');
        const insertBtn = document.createElement('button');
        insertBtn.textContent = "⤵";
        insertBtn.className = "btn-insert-point";
        insertBtn.onclick = () => {
            isPathInsertMode = true;
            pathInsertIndex = realIndex + 1;
            isRecordingPath = true;
            btnPathToggle.textContent = "⏹️ 结束插入";
            btnPathToggle.style.backgroundColor = "#ffc107";
            showTip(`插入模式：将在 "${p.name}" 后插入`);
        };
        const delBtn = document.createElement('button');
        delBtn.textContent = "✖";
        delBtn.className = "btn-delete-point";
        delBtn.onclick = () => {
            if (p.markerId) {
                const targetMarker = markersData.find(m => m.id === p.markerId);
                if (targetMarker && targetMarker.dimmed) {
                    toggleMarkerDimmed(targetMarker, false);
                    saveMarkers();
                }
            }
            pathHistoryStack.push({
                type: 'delete',
                index: realIndex,
                data: p
            });
            recordedPath.splice(realIndex, 1);
            updatePathListUI(true);
            triggerRender();
        };
        btnContainer.appendChild(insertBtn);
        btnContainer.appendChild(delBtn);
        li.appendChild(span);
        li.appendChild(btnContainer);
        pathList.appendChild(li);
    });
    if (maintainScroll) {
        scrollContainer.scrollTop = currentScrollTop;
    } else {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
}
function calculatePathLength() {
    if (recordedPath.length < 2) return 0;
    let totalDist = 0;
    for (let i = 0; i < recordedPath.length - 1; i++) {
        const p1 = recordedPath[i];
        const p2 = recordedPath[i + 1];
        if (p2.isTeleport) continue;
        totalDist += Math.hypot(p2.x - p1.x, p2.y - p1.y);
    }
    return Math.round(totalDist);
}
function centerMap() {
    const containerW = container.clientWidth;
    const containerH = container.clientHeight;
    const imgW = map.naturalWidth || 2000;
    const imgH = map.naturalHeight || 2000;
    mapX = (containerW - imgW * scale) / 2;
    mapY = (containerH - imgH * scale) / 2;
    triggerRender();
}
function showDialog(x, y) {
    editingMarkerData = null;
    coordXInput.value = x;
    coordYInput.value = y;
    nameInput.value = "";
    introInput.value = "";
    layerSelect.value = "1";
    setDialogType('icon');
    const defaultIcon = lastUsedIcon || iconFiles[0];
    iconSelect.value = defaultIcon;
    iconPreview.src = `icons/${defaultIcon}`;
    nameInput.value = defaultIcon.replace('.png', '');
    lastAutoName = nameInput.value;
    wallLenInput.value = 15;
    wallAngleInput.value = "0";
    setWallType('wall-breakable');
    dialog.style.display = 'block';
    overlay.style.display = 'block';
    contextMenu.style.display = 'none';
    nameInput.focus();
}
function hideAllMenus() {
    dialog.style.display = 'none';
    overlay.style.display = 'none';
    contextMenu.style.display = 'none';
    if (batchDialog) batchDialog.style.display = 'none';
}
function setDialogType(type) {
    currentMarkerType = type;
    if (type === 'wall') {
        btnTypeIcon.classList.remove('active');
        btnTypeWall.classList.add('active');
        panelIconSelect.style.display = 'none';
        panelWallSelect.style.display = 'block';
    } else {
        btnTypeWall.classList.remove('active');
        btnTypeIcon.classList.add('active');
        panelIconSelect.style.display = 'flex';
        panelWallSelect.style.display = 'none';
    }
}
function setWallType(type) {
    currentWallType = type;
    if (type === 'wall-breakable') {
        btnWallBreakable.classList.add('active');
        btnWallOneway.classList.remove('active');
    } else {
        btnWallOneway.classList.add('active');
        btnWallBreakable.classList.remove('active');
    }
}
function showTip(text) {
    globalTip.textContent = text;
    globalTip.style.opacity = 1;
    if (tipTimer) {
        clearTimeout(tipTimer);
        tipTimer = null;
    }
    tipTimer = setTimeout(() => {
        const isModeActive = isBindingMode || isRecordingPath || isMovingMarkerMode || isTeleport;
        if (!isModeActive) globalTip.style.opacity = 0;
    }, 2000);
}
function checkLogicVisibility() {
    const query = searchInput.value.trim().toLowerCase();
    markersData.forEach(data => {
        if (!data.element) return;
        if (data.type === 'wall' && hideWalls) {
            data._logicVisible = false;
            data.element.classList.remove('search-match');
            return;
        }
        const isLayerOpen = layerVisibility[data.layer];
        let isIconOpen = true;
        if (data.type !== 'wall') isIconOpen = iconVisibility[data.icon] !== false;
        let isMatch = true;
        if (query) {
            const nameMatch = data.name.toLowerCase().includes(query) ||
                (data.intro && data.intro.toLowerCase().includes(query));
            let iconMatch = false;
            if (data.type !== 'wall' && data.icon) {
                iconMatch = data.icon.replace('.png', '').toLowerCase().includes(query);
            }
            isMatch = nameMatch || iconMatch;
        }
        const specialType = data.icon && data.icon.includes('钟道') || data.icon && data.icon.includes('长椅');
        const shouldHideDimmed = hideDimmedMarkers && data.dimmed && !specialType;
        const iconPass = query ? true : isIconOpen;
        data._logicVisible = (isLayerOpen && iconPass && isMatch) && !shouldHideDimmed;
        if (query && isMatch && data._logicVisible) data.element.classList.add('search-match');
        else data.element.classList.remove('search-match');
    });
}
function initIconDropdown() {
    iconSelect.innerHTML = '';
    iconFiles.forEach(fileName => {
        const option = document.createElement('option');
        option.value = fileName;
        option.textContent = fileName.replace('.png', '');
        iconSelect.appendChild(option);
    });
    iconSelect.onchange = () => {
        const iconName = iconSelect.value.replace('.png', '');
        iconPreview.src = `icons/${iconSelect.value}`;
        if (!editingMarkerData && nameInput.value === lastAutoName) {
            lastAutoName = iconName;
            nameInput.value = iconName;
        }
    };
    if (iconFiles.length > 0) {
        iconSelect.value = iconFiles[0];
        iconPreview.src = `icons/${iconFiles[0]}`;
    }
}
function renderIconControls() {
    iconControls.innerHTML = '';
    iconFiles.forEach(icon => {
        const btn = document.createElement('button');
        btn.className = 'icon-toggle-btn';
        if (iconVisibility[icon] !== false) btn.classList.add('active');
        btn.textContent = icon.replace('.png', '');
        btn.onclick = () => {
            iconVisibility[icon] = iconVisibility[icon] === false ? true : false;
            btn.classList.toggle('active');
            saveIconVisibility();
            checkLogicVisibility();
            triggerRender();
        };
        iconControls.appendChild(btn);
    });
}
function setupPanelToggle(panelId, hideBtnId, showBtnId) {
    const panel = document.getElementById(panelId);
    const hideBtn = document.getElementById(hideBtnId);
    const showBtn = document.getElementById(showBtnId);
    if (panel.classList.contains('collapsed')) showBtn.style.display = 'flex';
    else showBtn.style.display = 'none';
    hideBtn.onclick = () => {
        panel.classList.add('collapsed');
        showBtn.style.display = 'flex';
    };
    showBtn.onclick = () => {
        panel.classList.remove('collapsed');
        showBtn.style.display = 'none';
    };
}
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function saveMarkers() {
    const cleanData = markersData.map(m => {
        const { element, _lastDisplayState, _logicVisible, ...rest } = m;
        return rest;
    });
    localStorage.setItem('silkSongMapMarkers', JSON.stringify(cleanData));
}
function loadMarkers() {
    const str = localStorage.getItem('silkSongMapMarkers');
    if (str) {
        try {
            const arr = JSON.parse(str);
            if (arr.length === 0) {
                console.log("加载了本地缓存（空数据）");
            } else {
                const fragment = document.createDocumentFragment();
                arr.forEach(d => {
                    markersData.push(d);
                    createMarkerDOM(d, fragment);
                });
                container.appendChild(fragment);
                checkLogicVisibility();
            }
        } catch (e) { console.error(e); }
    } else {
        console.log("未检测到本地存档，正在请求默认数据...");
        loadDefaultData();
    }
}
// 异步加载默认数据
function loadDefaultData() {
    fetch('default.json')
        .then(response => {
            if (!response.ok) {
                throw new Error("无法读取默认文件 (HTTP " + response.status + ")");
            }
            return response.json();
        })
        .then(data => {
            if (!Array.isArray(data)) throw new Error("JSON 格式不正确，应为数组");
            markersData.forEach(m => m.element && m.element.remove());
            markersData = [];
            const fragment = document.createDocumentFragment();
            data.forEach(d => {
                const clean = {
                    ...d,
                    id: d.id || Date.now() + Math.random(),
                    layer: d.layer || "1"
                };
                markersData.push(clean);
                createMarkerDOM(clean, fragment);
            });
            container.appendChild(fragment);
            saveMarkers();
            checkLogicVisibility();
            triggerRender();
            console.log(`成功加载默认数据：${data.length} 条`);
            showTip(`已重置为默认数据 (${data.length} 个标记)`);
        })
        .catch(err => {
            console.error(err);
            alert("加载默认数据失败！\n请检查：\n1. default.json 文件是否存在？\n2. 是否使用了本地服务器打开？(直接双击 html 无法读取本地 json)");
        });
}
function saveIconVisibility() {
    localStorage.setItem('silkSongIconVisibility', JSON.stringify(iconVisibility));
}
function initIconVisibility() {
    const saved = localStorage.getItem('silkSongIconVisibility');
    if (saved) iconVisibility = JSON.parse(saved);
}
function saveLayerVisibility() {
    localStorage.setItem('silkSongLayerVisibility', JSON.stringify(layerVisibility));
}
function initLayerVisibility() {
    const saved = localStorage.getItem('silkSongLayerVisibility');
    if (saved) Object.assign(layerVisibility, JSON.parse(saved));
}
function downloadFile(content, fileName, mime) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
}
function getMouseOnMap(e) {
    const rawX = (e.clientX - mapX) / scale;
    const rawY = (e.clientY - mapY) / scale;
    return {
        x: Math.round(rawX / 5) * 5,
        y: Math.round(rawY / 5) * 5
    };
}
function initState() {
    btnToggleWalls.classList.toggle('active', !hideWalls);
    btnToggleDimmed.classList.toggle('active', !hideDimmedMarkers);
    layerBtns.forEach(btn => {
        const layer = btn.dataset.layer;
        btn.classList.toggle('active', layerVisibility[layer]);
    });
}
function addLogEntry(type, description, undoData = null) {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    const entry = {
        id: Date.now() + Math.random(),
        time: timeStr,
        type: type,
        desc: description,
        undoData: undoData
    };
    actionLog.unshift(entry);
    if (actionLog.length > 50) actionLog.pop();
    renderLogList();
}
function renderLogList() {
    logList.innerHTML = '';
    if (actionLog.length === 0) {
        logList.innerHTML = '<li style="color:#666; text-align:center;">(暂无操作记录)</li>';
        return;
    }
    actionLog.forEach((item) => {
        const li = document.createElement('li');
        let undoBtnHtml = '';
        if (item.undoData) {
            undoBtnHtml = `<button class="btn-undo-log" onclick="handleUndo('${item.id}')">撤销</button>`;
        }
        li.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <span class="log-time">[${item.time}]</span>
                    <span class="log-type">${item.type}</span>
                </div>
                ${undoBtnHtml}
            </div>
            <div style="margin-top:4px; color:#ddd;">${item.desc}</div>
        `;
        logList.appendChild(li);
    });
}
window.handleUndo = function (logId) {
    const entryIndex = actionLog.findIndex(e => e.id == logId);
    if (entryIndex === -1) return;
    const entry = actionLog[entryIndex];
    const data = entry.undoData;
    if (data.action === 'delete_id') {
        const target = markersData.find(m => m.id === data.id);
        if (target) {
            target.element.remove();
            markersData = markersData.filter(m => m.id !== data.id);
        }
    }
    else if (data.action === 'restore_single') {
        const existingIdx = markersData.findIndex(m => m.id === data.marker.id);
        if (existingIdx !== -1) {
            markersData[existingIdx].element.remove();
            markersData[existingIdx] = data.marker;
        } else {
            markersData.push(data.marker);
        }
        createMarkerDOM(data.marker);
    }
    else if (data.action === 'restore_all') {
        markersData.forEach(m => m.element && m.element.remove());
        markersData = [];
        const restoredList = JSON.parse(data.backup);
        const fragment = document.createDocumentFragment();
        restoredList.forEach(m => {
            markersData.push(m);
            createMarkerDOM(m, fragment);
        });
        container.appendChild(fragment);
    }
    saveMarkers();
    checkLogicVisibility();
    triggerRender();
    actionLog.splice(entryIndex, 1);
    renderLogList();
    showTip("已执行撤销");
};