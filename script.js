/*  ===================================================================
    1. 全局配置与常量
    ===================================================================*/
// 定义所有图标文件名
const iconFiles = [
    "特殊物品.png", "地图.png", "NPC.png",
    "技能.png", "纹章.png", "竞技场.png",
    "跳蚤.png", "钟道.png", "长椅.png",
    "普通boss.png", "必要boss.png", "普通委托.png", "必要委托.png",
    "纪念盒.png", "金属.png", "面具.png", "灵丝轴.png",
    "任务物品.png", "工具.png", "念珠.png"
];
// 小于此距离的父子连线会常驻显示，大于此距离的仅在悬停时显示
const LINE_THRESHOLD = 100;
/*  ===================================================================
    2. DOM 元素获取
    ===================================================================*/
// 画布与地图
const map = document.getElementById('game-map');
const container = document.getElementById('map-container');
const canvas = document.getElementById('lines-canvas');
const ctx = canvas.getContext('2d');
// 提示与信息浮窗
const tooltip = document.getElementById('tooltip');
const globalTip = document.getElementById('global-tip');
// 右键菜单
const contextMenu = document.getElementById('context-menu');
const menuDelete = document.getElementById('menu-delete');
const menuBind = document.getElementById('menu-bind');
const menuEdit = document.getElementById('menu-edit');
const menuMove = document.getElementById('menu-move');
const menuUnbind = document.getElementById('menu-unbind');
// 标记创建/编辑 弹窗的基础元素
const dialog = document.getElementById('marker-dialog');
const overlay = document.getElementById('dialog-overlay');
const btnOk = document.getElementById('btn-ok');
const btnCancel = document.getElementById('btn-cancel');
// 弹窗内的表单输入控件
const nameInput = document.getElementById('dialog-name');
const introInput = document.getElementById('dialog-intro');
const layerSelect = document.getElementById('dialog-layer');
const coordXInput = document.getElementById('dialog-x');
const coordYInput = document.getElementById('dialog-y');
// 弹窗内的类型切换控件
const btnTypeIcon = document.getElementById('btn-type-icon');
const btnTypeWall = document.getElementById('btn-type-wall');
const panelIconSelect = document.getElementById('panel-icon-select');
const panelWallSelect = document.getElementById('panel-wall-select');
// 图标类型参数
const iconSelect = document.getElementById('dialog-icon-select');
const iconPreview = document.getElementById('dialog-icon-preview');
// 墙/门类型参数
const btnWallBreakable = document.getElementById('btn-wall-breakable');
const btnWallOneway = document.getElementById('btn-wall-oneway');
const wallLenInput = document.getElementById('dialog-wall-len');
const wallAngleInput = document.getElementById('dialog-wall-angle');
// 左上角控制面板
const btnExport = document.getElementById('btn-export');
const btnImport = document.getElementById('btn-import');
const btnClear = document.getElementById('btn-clear');
const fileInput = document.getElementById('file-input');
const layerBtns = document.querySelectorAll('.layer-btn');
const layerResetBtns = document.querySelectorAll('.layer-reset-btn');
const searchInput = document.getElementById('search-input');
const btnSearchClear = document.getElementById('btn-search-clear');
const iconControls = document.getElementById('icon-controls');
const btnToggleDimmed = document.getElementById('btn-toggle-dimmed');
const btnToggleWalls = document.getElementById('btn-toggle-walls');
// 左下角路径记录面板
const btnPathToggle = document.getElementById('btn-path-toggle');
const btnPathExport = document.getElementById('btn-path-export');
const btnPathClear = document.getElementById('btn-path-clear');
const btnPathUndo = document.getElementById('btn-path-undo');
const pathList = document.getElementById('path-list');
const btnPathImport = document.getElementById('btn-path-import');
const pathFileInput = document.getElementById('path-file-input');
const btnPathAutoHide = document.getElementById('btn-path-autohide');
/*  ===================================================================
    3. 全局状态变量
    ===================================================================*/
// 地图状态
let mapX = 0;
let mapY = 0;
let scale = 0.5;
let isDragging = false;
let startX = 0, startY = 0;
let clickStartX = 0, clickStartY = 0;
// 数据与操作目标
let markersData = [];
let currentTargetMarkerData = null;
let editingMarkerData = null;
let hoveredMarkerData = null;
let bindingChildData = null;
// 筛选与UI状态
let layerVisibility = { 1: true, 2: true, 3: true };
let iconVisibility = {};
let lastAutoName = "";
let lastUsedIcon = null;
// 模式状态
let isBindingMode = false;
let isMovingMarkerMode = false;
let movingMarkerTarget = null;
let isRecordingPath = false;
let isPathInsertMode = false;
let pathInsertIndex = -1;
let isPathAutoHide = true;
let currentMarkerType = 'icon';
let currentWallType = 'wall-breakable';
let hideDimmedMarkers = false;
let hideWalls = true;
// 路径, 性能与交互状态
let recordedPath = [];
let renderRequestId = null;
let deleteTimer = null;
let isLongPressActionTriggered = false;
/* ===================================================================
    4. 初始化流程
    ===================================================================*/
// 主函数
function init() {
    // 初始化UI
    initIconDropdown();
    initIconVisibility();
    initLayerVisibility();
    renderIconControls();
    // 加载数据
    loadMarkers();
    // gx图层按钮UI
    layerBtns.forEach(btn => {
        const layer = btn.dataset.layer;
        btn.classList.toggle('active', layerVisibility[layer]);
    });
    // 绑定核心事件
    btnTypeIcon.onclick = () => setDialogType('icon');
    btnTypeWall.onclick = () => setDialogType('wall');
    // 确保地图加载后居中
    if (map.complete) {
        centerMap();
    } else {
        map.onload = centerMap;
    }
}
// 将地图居中显示
function centerMap() {
    const containerW = container.clientWidth;
    const containerH = container.clientHeight;
    const imgW = map.naturalWidth || 2000;
    const imgH = map.naturalHeight || 2000;
    mapX = (containerW - imgW * scale) / 2;
    mapY = (containerH - imgH * scale) / 2;
    triggerRender();
}
// 动态生成图标下拉菜单
function initIconDropdown() {
    iconSelect.innerHTML = '';
    iconFiles.forEach(fileName => {
        const option = document.createElement('option');
        option.value = fileName;
        option.textContent = fileName.replace('.png', '');
        iconSelect.appendChild(option);
    });
    // 自动填充名称
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
/*  ===================================================================
    5. 核心渲染引擎
    ===================================================================*/
function triggerRender() {
    if (!renderRequestId) {
        renderRequestId = requestAnimationFrame(() => {
            render();
            renderRequestId = null;
        });
    }
}
// 主渲染函数
function render() {
    const tx = mapX;
    const ty = mapY;
    const s = scale;
    // 应用地图变换
    map.style.transform = `translate(${tx}px, ${ty}px) scale(${s})`;
    // 同步并清空画布
    if (canvas.width !== container.clientWidth || canvas.height !== container.clientHeight) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // 坐标转换工具
    const toScreen = (gx, gy) => ({
        x: tx + gx * s,
        y: ty + gy * s
    });
    // 绘制路径线
    if (recordedPath.length > 1) {
        ctx.beginPath();
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 3;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        for (let i = 0; i < recordedPath.length - 1; i++) {
            const p1 = toScreen(recordedPath[i].x, recordedPath[i].y);
            const p2 = toScreen(recordedPath[i + 1].x, recordedPath[i + 1].y);
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
        }
        ctx.stroke();
    }
    // 计算视口边界，仅渲染屏幕内的元素
    const buffer = 300;
    const viewLeft = -tx / s - buffer;
    const viewRight = (container.clientWidth - tx) / s + buffer;
    const viewTop = -ty / s - buffer;
    const viewBottom = (container.clientHeight - ty) / s + buffer;
    const currentSize = Math.max(20, 24 * Math.sqrt(s));
    // 遍历所有标记数据更新
    markersData.forEach(item => {
        if (!item.element) return;
        // 如果逻辑上不可见直接跳过
        if (!item._logicVisible) {
            if (item._lastDisplayState !== 'none') {
                item.element.style.display = 'none';
                item._lastDisplayState = 'none';
            }
            return;
        }
        // 在屏幕外直接跳过
        if (item.x < viewLeft || item.x > viewRight || item.y < viewTop || item.y > viewBottom) {
            if (item._lastDisplayState !== 'none') {
                item.element.style.display = 'none';
                item._lastDisplayState = 'none';
            }
            return;
        }
        // 元素可见，更新其位置和大小
        if (item._lastDisplayState !== 'block') {
            item.element.style.display = 'block';
            item._lastDisplayState = 'block';
        }
        // 渲染
        if (item.type === 'wall') {
            const baseLength = item.length || 20;
            const scaledLen = baseLength * s;
            item.element.style.left = (tx + item.x * s) + 'px';
            item.element.style.top = (ty + item.y * s) + 'px';
            item.element.style.width = scaledLen + 'px';
            const cssHeight = 4;// 墙的厚度
            item.element.style.height = (cssHeight * s) + 'px';
            item.element.style.setProperty('--scale', s);
            item.element.style.transform = `translate(-50%, -50%) rotate(${item.angle || 0}deg)`;
        } else {
            item.element.style.left = (tx + item.x * s) + 'px';
            item.element.style.top = (ty + item.y * s) + 'px';
            item.element.style.width = currentSize + 'px';
            item.element.style.height = currentSize + 'px';
            item.element.style.transform = `translate(-50%, -50%)`;
        }
        // 绘制父子连线
        if (item.parentId) {
            const parent = markersData.find(m => m.id === item.parentId);
            if (parent && parent._logicVisible) {
                const dist = Math.hypot(item.x - parent.x, item.y - parent.y);
                const isHovered = hoveredMarkerData && (hoveredMarkerData === item || hoveredMarkerData === parent);
                const lineColor = item.dimmed ? 'rgba(255, 255, 0, 0.3)' : 'rgba(255, 255, 0, 1)';
                const shouldDraw = (dist <= LINE_THRESHOLD) || isHovered;
                if (shouldDraw) {
                    const p1 = toScreen(item.x, item.y);
                    const p2 = toScreen(parent.x, parent.y);
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = lineColor;
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
            }
        }
    });
}
/* ===================================================================
    6. 标记编辑与新建
    ===================================================================*/
function createMarkerDOM(data, fragment = null) {
    let el;
    if (data.type === 'wall') {
        el = document.createElement('div');
        el.className = `map-wall ${data.wallType || 'wall-breakable'}`;
    } else {
        el = document.createElement('img');
        el.className = 'marker';
        el.src = `icons/${data.icon || iconFiles[0]}`;
    }
    // 初始化渲染
    data._lastDisplayState = '';
    data._logicVisible = true;
    // 
    if (fragment) {
        fragment.appendChild(el);
    } else {
        container.appendChild(el);
    }
    // 初始化视觉状态
    data.element = el;
    if (data.element) el.style.opacity = data.dimmed ? 0.3 : 1;
    if (!data.layer) data.layer = "1";
    // mousehover
    el.addEventListener('mouseenter', () => {
        if (el.style.display === 'none') return;
        tooltip.style.display = 'block';
        let tipText = `${data.name}`;
        if (data.layer !== "1") tipText += ` (L${data.layer})`;
        if (data.intro) tipText += `\n${data.intro}`;
        if (data.type === 'wall') {
            tipText += `\n[长度:${data.length || 20}]`;
        } else {
            tipText += `\n[${Math.round(data.x)}, ${Math.round(data.y)}]`;
        }
        tooltip.textContent = tipText;
        hoveredMarkerData = data;
        triggerRender();
    });
    // mouseleave
    el.addEventListener('mouseleave', () => {
        tooltip.style.display = 'none';
        hoveredMarkerData = null;
        triggerRender();
    });
    // leftclick
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
        if (!isRecordingPath || (isRecordingPath && isPathAutoHide)) {
            data.dimmed = !data.dimmed;
            el.style.opacity = data.dimmed ? 0.3 : 1;
            // 同步子标记的状态
            markersData.forEach(child => {
                if (child.parentId === data.id) {
                    child.dimmed = data.dimmed;
                    if (child.element) {
                        child.element.style.opacity = child.dimmed ? 0.3 : 1;
                    }
                }
            });
        }
        saveMarkers();
        // 如果开了“隐藏已完成”，立即刷新可见性
        if (hideDimmedMarkers) {
            checkLogicVisibility();
            triggerRender();
        }
        // 如果在录制路径，则添加点
        if (isRecordingPath) {
            const newPoint = { 
                x: data.x, 
                y: data.y, 
                name: data.name, 
                markerId: data.id 
            };
            // 插入模式
            if (isPathInsertMode) {
                recordedPath.splice(pathInsertIndex, 0, newPoint);
                pathInsertIndex++;
            } else {
                recordedPath.push(newPoint);
            }
            updatePathListUI();
            triggerRender();
        }
    });
    // 右键点击
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
}
// 创建新标记
function createNewMarker(data) {
    markersData.push(data);
    createMarkerDOM(data);
    saveMarkers();
    checkLogicVisibility();
    triggerRender();
}
/* ===================================================================
    7. 核心交互事件 (地图操作)
    ===================================================================*/
container.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    clickStartX = e.clientX;
    clickStartY = e.clientY;
    // 移动标记模式，执行放置逻辑
    if (isMovingMarkerMode && movingMarkerTarget) {
        const rawX = (e.clientX - mapX) / scale;
        const rawY = (e.clientY - mapY) / scale;
        const snappedX = Math.round(rawX / 5) * 5;
        const snappedY = Math.round(rawY / 5) * 5;
        movingMarkerTarget.x = snappedX;
        movingMarkerTarget.y = snappedY;
        saveMarkers();
        triggerRender();
        // 退出移动模式
        isMovingMarkerMode = false;
        movingMarkerTarget = null;
        container.style.cursor = 'default';
        showTip(`移动成功！坐标: [${snappedX}, ${snappedY}]`);
        return;
    }
    // 忽略UI上的点击
    if (e.target.closest('.marker')) return;
    if (e.target.closest('.map-wall')) return;
    if (e.target.closest('#control-panel')) return;
    if (e.target.closest('#path-panel')) return;
    // 否则，开始拖拽地图
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    container.style.cursor = 'grabbing';
});
// 鼠标移动
window.addEventListener('mousemove', (e) => {
    if (tooltip.style.display === 'block') {
        tooltip.style.left = (e.clientX + 10) + 'px';
        tooltip.style.top = (e.clientY + 10) + 'px';
    }
    if (isDragging) {
        const currentX = mapX + e.clientX - startX;
        const currentY = mapY + e.clientY - startY;
        mapX = currentX;
        mapY = currentY;
        startX = e.clientX;
        startY = e.clientY;
        triggerRender();
    }
});
// 鼠标抬起：结束拖拽
window.addEventListener('mouseup', (e) => {
    if (isDragging) {
        isDragging = false;
        container.style.cursor = 'default';
        triggerRender();
    }
});
// 鼠标滚轮：以鼠标位置为中心进行缩放
container.addEventListener('wheel', (e) => {
    e.preventDefault();
    const direction = e.deltaY < 0 ? 1 : -1;
    let newScale = scale + (direction * 0.1 * scale);
    newScale = Math.min(Math.max(newScale, 0.25), 5);// 最小0.25最大5
    const mouseOnMapX = (e.clientX - mapX) / scale;
    const mouseOnMapY = (e.clientY - mapY) / scale;
    mapX = e.clientX - mouseOnMapX * newScale;
    mapY = e.clientY - mouseOnMapY * newScale;
    scale = newScale;
    triggerRender();
}, { passive: false });
// // 右键地图打开弹窗
container.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    // 如果在移动模式下右键取消移动
    if (isMovingMarkerMode) {
        isMovingMarkerMode = false;
        movingMarkerTarget = null;
        container.style.cursor = 'default';
        showTip("已取消移动");
        return;
    }
    // 忽略在已有标记上的右键
    if (e.target.classList.contains('marker') || e.target.classList.contains('map-wall')) return;
    // 吸附网格
    const rawX = (e.clientX - mapX) / scale;
    const rawY = (e.clientY - mapY) / scale;
    const snappedX = Math.round(rawX / 5) * 5;
    const snappedY = Math.round(rawY / 5) * 5;
    showDialog(snappedX, snappedY);
});
// 左键地图：如果在路径模式下，添加自定义点
container.addEventListener('click', (e) => {
    // 1. 基础过滤
    if (!isRecordingPath) return;
    if (e.target.closest('.marker') || e.target.closest('.map-wall')) return;
    if (e.target.closest('#control-panel') || e.target.closest('#path-panel')) return;
    // 2. 防止拖拽误触
    const dist = Math.hypot(e.clientX - clickStartX, e.clientY - clickStartY);
    if (dist > 5) return;
    // 3. 计算坐标与吸附
    const rawX = (e.clientX - mapX) / scale;
    const rawY = (e.clientY - mapY) / scale;
    const snappedX = Math.round(rawX / 5) * 5;
    const snappedY = Math.round(rawY / 5) * 5;
    // 4. 正交逻辑 (Shift键)
    let finalX = snappedX;
    let finalY = snappedY;
    const lastPoint = recordedPath.length > 0 ? recordedPath[recordedPath.length - 1] : null;
    if (e.shiftKey && lastPoint) {
        const dx = Math.abs(snappedX - lastPoint.x);
        const dy = Math.abs(snappedY - lastPoint.y);
        if (dx > dy) finalY = lastPoint.y;
        else finalX = lastPoint.x;
    }
    // 5. 存入数据
    const newPoint = {
        x: finalX,
        y: finalY,
        name: "自定义点"
    };
    if (isPathInsertMode) {
        recordedPath.splice(pathInsertIndex, 0, newPoint);
        pathInsertIndex++;
    } else {
        recordedPath.push(newPoint);
    }
    updatePathListUI();
    triggerRender();
});
/* ===================================================================
    8. 路径记录功能
    ===================================================================*/
// 切换路径记录模式
btnPathToggle.onclick = () => {
    // 插入模式
    if (isPathInsertMode) {
        isPathInsertMode = false;
        pathInsertIndex = -1;
        isRecordingPath = false;
        btnPathToggle.textContent = "▶ 开始记录";
        btnPathToggle.style.backgroundColor = "";
        showTip("已退出插入模式。");
        return;
    }
    // 记录模式
    isRecordingPath = !isRecordingPath;
    if (isRecordingPath) {
        btnPathToggle.textContent = "⏹ 停止记录";
        btnPathToggle.style.backgroundColor = "#dc3545";
        showTip("路径模式");
    } else {
        btnPathToggle.textContent = "▶ 开始记录";
        btnPathToggle.style.backgroundColor = "";
    }
};
btnPathAutoHide.onclick = () => {
    isPathAutoHide = !isPathAutoHide;
    btnPathAutoHide.classList.toggle('active', isPathAutoHide);
    btnPathAutoHide.textContent = isPathAutoHide ? '自动隐藏' : '仅记录';
};
// 撤销上一个路径点
if (btnPathUndo) {
    btnPathUndo.onclick = () => {
        if (recordedPath.length > 0) {
            const undonePoint = recordedPath.pop();
            if (undonePoint && undonePoint.markerId) {
                const targetMarker = markersData.find(m => m.id === undonePoint.markerId);
                if (targetMarker && targetMarker.dimmed) {
                    targetMarker.dimmed = false;
                    if (targetMarker.element) {
                        targetMarker.element.style.opacity = 1;
                    }
                    markersData.forEach(child => {
                        if (child.parentId === targetMarker.id) {
                            child.dimmed = false;
                            if (child.element) {
                                child.element.style.opacity = 1;
                            }
                        }
                    });
                    saveMarkers();
                }
            }
            updatePathListUI();
            triggerRender();
        } else {
            showTip("路径为空，无法撤销");
        }
    };
}
// 清空当前路径
btnPathClear.onclick = () => {
    if (confirm("确定清空当前路径吗？")) {
        recordedPath = [];
        updatePathListUI();
        triggerRender();
    }
};
// 导出txt文件
btnPathExport.onclick = () => {
    const validData = recordedPath.filter(p => p.markerId);
    if (validData.length === 0) return alert("没有路径数据");
    const content = JSON.stringify(validData, null, 2);
    downloadFile(content, "path.json", "application/json");
};
// 刷新路径面板的UI
function updatePathListUI() {
    pathList.innerHTML = '';
    const visiblePoints = recordedPath.filter(p => p.markerId);
    if (visiblePoints.length === 0) {
        pathList.innerHTML = '<li>(暂无标记记录)</li>';
    }
    let displayIndex = 0;
    recordedPath.forEach((p, realIndex) => {
        if (!p.markerId) {
            return;
        }
        displayIndex++;
        const li = document.createElement('li');
        const span = document.createElement('span');
        span.textContent = `${displayIndex}. ${p.name}`;
        const btnContainer = document.createElement('div');
        const insertBtn = document.createElement('button');
        insertBtn.textContent = "⤵";
        insertBtn.className = "btn-insert-point";
        insertBtn.title = "在此点后插入";
        insertBtn.onclick = () => {
            isPathInsertMode = true;
            pathInsertIndex = realIndex + 1;
            isRecordingPath = true;
            btnPathToggle.textContent = "⏹️ 结束插入";
            btnPathToggle.style.backgroundColor = "#ffc107";
            showTip(`插入模式：将在 "${p.name}" 后插入`);
        };
        // 删除按钮
        const delBtn = document.createElement('button');
        delBtn.textContent = "✖";
        delBtn.className = "btn-delete-point";
        delBtn.title = "删除此点";
        delBtn.onclick = () => {
            // 恢复标记的高亮/透明度状态
            const pointToDelete = recordedPath[realIndex];
            if (pointToDelete && pointToDelete.markerId) {
                const targetMarker = markersData.find(m => m.id === pointToDelete.markerId);
                if (targetMarker && targetMarker.dimmed) {
                    targetMarker.dimmed = false;
                    if (targetMarker.element) targetMarker.element.style.opacity = 1;
                    // 同步子标记
                    markersData.forEach(child => {
                        if (child.parentId === targetMarker.id) {
                            child.dimmed = false;
                            if (child.element) child.element.style.opacity = 1;
                        }
                    });
                    saveMarkers();
                }
            }
            recordedPath.splice(realIndex, 1);
            updatePathListUI();
            triggerRender();
        };
        btnContainer.appendChild(insertBtn);
        btnContainer.appendChild(delBtn);
        li.appendChild(span);
        li.appendChild(btnContainer);
        pathList.appendChild(li);
    });
    pathList.scrollTop = pathList.scrollHeight;
}
/* ===================================================================
    9. UI 交互逻辑
    ===================================================================*/
// 显示创建标记弹窗并初始化
function showDialog(x, y) {
    editingMarkerData = null;
    coordXInput.value = x;
    coordYInput.value = y;
    nameInput.value = "";
    introInput.value = "";
    layerSelect.value = "1";
    // 默认图标模式
    setDialogType('icon');
    // 记住上次使用的图标，否则用第一个
    const defaultIcon = lastUsedIcon || iconFiles[0];
    iconSelect.value = defaultIcon;
    iconPreview.src = `icons/${defaultIcon}`;
    const name = defaultIcon.replace('.png', '');
    nameInput.value = name;
    lastAutoName = name;
    // 墙体参数
    wallLenInput.value = 15;
    wallAngleInput.value = "0";
    setWallType('wall-breakable');
    dialog.style.display = 'block';
    overlay.style.display = 'block';
    contextMenu.style.display = 'none';
    nameInput.focus();
}
// 隐藏UI
function hideAllMenus() {
    dialog.style.display = 'none';
    overlay.style.display = 'none';
    contextMenu.style.display = 'none';
}
// 绑定关闭事件
btnCancel.onclick = hideAllMenus;
overlay.onclick = hideAllMenus;
window.addEventListener('click', () => { contextMenu.style.display = 'none'; });
// 切换弹窗面板
function setDialogType(type) {
    currentMarkerType = type;
    if (type === 'wall') {
        btnTypeIcon.classList.remove('active');
        btnTypeWall.classList.add('active');
        panelIconSelect.style.display = 'none';
        panelWallSelect.style.display = 'block';
        nameInput.style.display = 'block';
        introInput.style.display = 'block';
    } else {
        btnTypeWall.classList.remove('active');
        btnTypeIcon.classList.add('active');
        panelIconSelect.style.display = 'flex';
        panelWallSelect.style.display = 'none';
        nameInput.style.display = 'block';
        introInput.style.display = 'block';
    }
}
// 弹窗确认
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
    // 根据类型填充特定数据
    if (type === 'wall') {
        dataObj.wallType = currentWallType;
        dataObj.length = Number(wallLenInput.value);
        dataObj.angle = Number(wallAngleInput.value);
    } else {
        dataObj.icon = iconSelect.value;
    }
    // 判断是编辑还是新建
    if (editingMarkerData) {
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
    } else {
        if (type === 'icon') {
            lastUsedIcon = dataObj.icon;
        }
        createNewMarker(dataObj);
    }
    saveMarkers();
    checkLogicVisibility();
    triggerRender();
    hideAllMenus();
};
// 右键菜单编辑
menuEdit.onclick = () => {
    if (currentTargetMarkerData) {
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
    }
};
// 右键菜单删除，按住2秒可以删除所有同名同类型的标记
menuDelete.addEventListener('mousedown', () => {
    isLongPressActionTriggered = false;
    deleteTimer = setTimeout(() => {
        isLongPressActionTriggered = true;
        hideAllMenus();
        if (currentTargetMarkerData) {
            const targetName = currentTargetMarkerData.name;
            const targetType = currentTargetMarkerData.type || 'icon';
            if (confirm(`长按删除：确定删除所有名称为 "${targetName}" 的同类型标记吗？`)) {
                const markersToDelete = markersData.filter(m =>
                    m.name === targetName && (m.type || 'icon') === targetType
                );
                markersToDelete.forEach(m => m.element && m.element.remove());
                markersData = markersData.filter(m =>
                    !(m.name === targetName && (m.type || 'icon') === targetType)
                );
                saveMarkers();
                triggerRender();
            }
        }
    }, 2000);
});
const cancelLongPress = () => {
    clearTimeout(deleteTimer);
};
menuDelete.addEventListener('mouseup', cancelLongPress);
menuDelete.addEventListener('mouseleave', cancelLongPress);
menuDelete.addEventListener('click', () => {
    if (isLongPressActionTriggered) {
        isLongPressActionTriggered = false;
        return;
    }
    if (currentTargetMarkerData) {
        currentTargetMarkerData.element.remove();
        markersData = markersData.filter(m => m !== currentTargetMarkerData);
        saveMarkers();
        triggerRender();
    }
    hideAllMenus();
});
// 右键菜单绑定
menuBind.onclick = () => {
    if (currentTargetMarkerData) {
        isBindingMode = true;
        bindingChildData = currentTargetMarkerData;
        showTip("请点击另一个标记作为父级");
        hideAllMenus();
    }
};
// 取消绑定
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
// 右键菜单移动
menuMove.onclick = () => {
    if (currentTargetMarkerData) {
        isMovingMarkerMode = true;
        movingMarkerTarget = currentTargetMarkerData;
        container.style.cursor = 'crosshair';
        showTip("请点击地图新位置放置标记 (已开启自动吸附)");
        hideAllMenus();
    }
};
// 搜索框
searchInput.addEventListener('input', () => {
    checkLogicVisibility();
    triggerRender();
});
btnSearchClear.onclick = () => {
    searchInput.value = "";
    checkLogicVisibility();
    triggerRender();
};
// 图层开关按钮
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
// 图层重置按钮
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
// 渲染图标筛选按钮
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
// ===================================================================
// 10. 核心筛选逻辑
// ===================================================================
// 计算每个标记的逻辑可见性
function checkLogicVisibility() {
    const query = searchInput.value.trim().toLowerCase();
    markersData.forEach(data => {
        if (!data.element) return;
        // 隐藏墙
        if (data.type === 'wall' && hideWalls) {
            data._logicVisible = false;
            if (data.element.classList.contains('search-match')) {
                data.element.classList.remove('search-match');
            }
            return;
        }
        //
        const isLayerOpen = layerVisibility[data.layer];
        let isIconOpen = true;
        if (data.type !== 'wall') {
            isIconOpen = iconVisibility[data.icon] !== false;
        }
        //
        let isMatch = true;
        if (query) {
            const nameMatch =
                data.name.toLowerCase().includes(query) ||
                (data.intro && data.intro.toLowerCase().includes(query));
            let iconMatch = false;
            if (data.type !== 'wall' && data.icon) {
                const iconName = data.icon.replace('.png', '').toLowerCase();
                iconMatch = iconName.includes(query);
            }
            isMatch = nameMatch || iconMatch;
        }
        //
        const shouldHideDimmed = hideDimmedMarkers && data.dimmed;
        const iconPass = query ? true : isIconOpen;
        data._logicVisible = (isLayerOpen && iconPass && isMatch) && !shouldHideDimmed;
        if (query && isMatch && data._logicVisible)
            data.element.classList.add('search-match');
        else
            data.element.classList.remove('search-match');
    });
}
/* ===================================================================
    11. 保存数据
    ===================================================================*/
// 图标可见性
function initIconVisibility() {
    const saved = localStorage.getItem('silkSongIconVisibility');
    if (saved) iconVisibility = JSON.parse(saved);
}
function saveIconVisibility() {
    localStorage.setItem('silkSongIconVisibility', JSON.stringify(iconVisibility));
}
// 图层可见性
function initLayerVisibility() {
    const saved = localStorage.getItem('silkSongLayerVisibility');
    if (saved) {
        Object.assign(layerVisibility, JSON.parse(saved));
    }
}
function saveLayerVisibility() {
    localStorage.setItem('silkSongLayerVisibility', JSON.stringify(layerVisibility));
}
// 导出标记数据
btnExport.onclick = () => {
    const str = JSON.stringify(markersData, null, 2);
    downloadFile(str, "markers.json", "application/json");
};
// 通用文件下载工具
function downloadFile(content, fileName, mime) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
}
// 导入标记数据
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
                        x: snappedX,
                        y: snappedY,
                        name: d.name,
                        type: d.type || 'icon',
                        wallType: d.wallType, length: d.length, angle: d.angle,
                        icon: d.icon,
                        layer: d.layer || "1", intro: d.intro || "",
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
        } catch (err) { alert("文件损坏或格式不对"); }
        fileInput.value = '';
    };
    reader.readAsText(file);
};
btnPathImport.onclick = () => {
    pathFileInput.click();
};
// 文件输入框内容改变时，读取并解析文件
pathFileInput.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        try {
            if (confirm("导入路径将覆盖当前记录，确定吗？")) {
                const content = ev.target.result;
                const importedPath = JSON.parse(content);
                if (!Array.isArray(importedPath)) {
                    throw new Error("JSON 文件内容不是一个有效的路径数组。");
                }
                recordedPath = importedPath;
                updatePathListUI();
                triggerRender();
                showTip("路径导入成功！");
            }
        } catch (err) {
            alert("文件损坏或格式不正确！请确保是导出的路径JSON文件。");
            console.error(err);
        } finally {
            pathFileInput.value = '';
        }
    };
    reader.readAsText(file);
};
// 清除所有标记
btnClear.onclick = () => {
    if (confirm("警告：确定删除所有标记？此操作无法撤销。")) {
        markersData.forEach(m => m.element && m.element.remove());
        markersData = [];
        saveMarkers();
        triggerRender();
    }
};
// 保存标记数据
function saveMarkers() {
    const cleanData = markersData.map(m => {
        const { element, _lastDisplayState, _logicVisible, ...rest } = m;
        return rest;
    });
    localStorage.setItem('silkSongMapMarkers', JSON.stringify(cleanData));
}
// 加载标记数据
function loadMarkers() {
    const str = localStorage.getItem('silkSongMapMarkers');
    if (str) {
        try {
            const arr = JSON.parse(str);
            const fragment = document.createDocumentFragment();
            arr.forEach(d => {
                markersData.push(d);
                createMarkerDOM(d, fragment);
            });
            container.appendChild(fragment);
            checkLogicVisibility();
        } catch (e) { console.error(e); }
    }
}
/* ===================================================================
    12. 辅助与通用工具
    ===================================================================*/
// 显示全局顶部提示
function showTip(text) {
    globalTip.textContent = text;
    globalTip.style.opacity = 1;
    setTimeout(() => {
        if (!isBindingMode && !isRecordingPath && !isMovingMarkerMode) globalTip.style.opacity = 0;
    }, 2000);
}
// 面板折叠功能
function setupPanelToggle(panelId, hideBtnId, showBtnId) {
    const panel = document.getElementById(panelId);
    const hideBtn = document.getElementById(hideBtnId);
    const showBtn = document.getElementById(showBtnId);
    if (!panel || !hideBtn || !showBtn) {
        console.error(`面板初始化失败: 找不到 ${panelId}, ${hideBtnId} 或 ${showBtnId}`);
        return;
    }
    if (panel.classList.contains('collapsed')) {
        showBtn.style.display = 'flex';
    } else {
        showBtn.style.display = 'none';
    }
    hideBtn.onclick = () => {
        panel.classList.add('collapsed');
        showBtn.style.display = 'flex';
    };
    showBtn.onclick = () => {
        panel.classList.remove('collapsed');
        showBtn.style.display = 'none';
    };
}
setupPanelToggle('control-panel', 'btn-hide-control', 'btn-show-control');
setupPanelToggle('path-panel', 'btn-hide-path', 'btn-show-path');
// 墙体子类型切换
btnWallBreakable.onclick = () => setWallType('wall-breakable');
btnWallOneway.onclick = () => setWallType('wall-oneway');
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
// 隐藏透明按钮
btnToggleDimmed.onclick = () => {
    hideDimmedMarkers = !hideDimmedMarkers;
    btnToggleDimmed.classList.toggle('active', hideDimmedMarkers);
    btnToggleDimmed.textContent = hideDimmedMarkers ? '显示已完成' : '隐藏已完成';
    checkLogicVisibility();
    triggerRender();
};
// 隐藏墙体
btnToggleWalls.onclick = () => {
    hideWalls = !hideWalls;
    btnToggleWalls.classList.toggle('active', hideWalls);
    btnToggleWalls.textContent = hideWalls ? '显示墙体' : '隐藏墙体';
    checkLogicVisibility();
    triggerRender();
};
/* ===================================================================
    13. 启动
    ===================================================================*/
init();