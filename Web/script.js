/* ==========================================================================
   Workbody · 图书馆空位查询与预约轻量化网页
   交互脚本 — 纯前端模拟数据 + 全部交互逻辑
   无需后端，所有数据为虚拟演示数据
   ========================================================================== */

// ============================================================================
//  一、模拟数据配置（★ 修改楼层/座位数据请改这里）
// ============================================================================
const FLOORS_DATA = [
    {
        id: 1,
        name: "一楼",
        desc: "综合阅览区 · 适合小组学习讨论",
        totalSeats: 80,
        rows: 8,
        cols: 10
    },
    {
        id: 2,
        name: "二楼",
        desc: "安静自习区 · 适合深度专注学习",
        totalSeats: 100,
        rows: 10,
        cols: 10
    },
    {
        id: 3,
        name: "三楼",
        desc: "电子阅览区 · 提供电源插座",
        totalSeats: 60,
        rows: 6,
        cols: 10
    },
    {
        id: 4,
        name: "四楼",
        desc: "考研自习区 · 长期备考专区",
        totalSeats: 120,
        rows: 10,
        cols: 12
    },
    {
        id: 5,
        name: "五楼",
        desc: "休闲阅读区 · 沙发座椅舒适区",
        totalSeats: 40,
        rows: 5,
        cols: 8
    }
];

// 全局状态
let floors = [];          // 完整楼层数据（含座位）
let currentFloorId = null; // 当前查看的楼层ID
let selectedSeatId = null; // 当前选中的座位ID
let selectedDuration = 30; // 默认预约时长（分钟）
let myReservations = [];   // 我预约的座位列表

// ============================================================================
//  二、初始化：生成座位数据
// ============================================================================
function initFloors() {
    floors = FLOORS_DATA.map(floorData => {
        const seats = [];
        // 根据楼层ID设定不同的繁忙程度，模拟真实场景
        const occupancyRate = [0.35, 0.55, 0.70, 0.85, 0.30][floorData.id - 1] || 0.5;

        for (let row = 0; row < floorData.rows; row++) {
            for (let col = 0; col < floorData.cols; col++) {
                const seatIndex = row * floorData.cols + col;
                const isOccupied = Math.random() < occupancyRate;
                seats.push({
                    id: `${floorData.id}-${seatIndex}`,
                    floorId: floorData.id,
                    row: row,
                    col: col,
                    label: `${floorData.id}F-${String(seatIndex + 1).padStart(2, '0')}`,
                    status: isOccupied ? 'occupied' : 'available' // available / occupied / reserved
                });
            }
        }

        const available = seats.filter(s => s.status === 'available').length;
        const occupied = seats.filter(s => s.status === 'occupied').length;

        return {
            ...floorData,
            seats: seats,
            availableCount: available,
            occupiedCount: occupied,
            reservedCount: 0
        };
    });
}

// 获取楼层拥挤状态
function getFloorStatus(floor) {
    const rate = floor.occupiedCount / floor.totalSeats;
    if (rate < 0.4) return 'available';    // 空闲
    if (rate < 0.7) return 'moderate';      // 适中
    return 'crowded';                       // 拥挤
}

function getFloorStatusText(status) {
    const map = {
        'available': '空闲',
        'moderate': '适中',
        'crowded': '拥挤'
    };
    return map[status] || '未知';
}

function getFloorStatusClass(status) {
    const map = {
        'available': '',
        'moderate': 'moderate',
        'crowded': 'crowded'
    };
    return map[status] || '';
}

function getFloorStatusColor(status) {
    const map = {
        'available': 'green',
        'moderate': 'yellow',
        'crowded': 'red'
    };
    return map[status] || 'green';
}

// ============================================================================
//  三、渲染：全校楼层空位数据看板
// ============================================================================
function renderOverview() {
    const grid = document.getElementById('floorGrid');
    grid.innerHTML = '';

    // 汇总数据
    let totalAll = 0, availableAll = 0, occupiedAll = 0;
    floors.forEach(f => {
        totalAll += f.totalSeats;
        availableAll += f.availableCount;
        occupiedAll += f.occupiedCount;
    });

    document.getElementById('totalSeatsAll').textContent = totalAll;
    document.getElementById('availableSeatsAll').textContent = availableAll;
    document.getElementById('occupiedSeatsAll').textContent = occupiedAll;
    const rate = totalAll > 0 ? Math.round((occupiedAll / totalAll) * 100) : 0;
    document.getElementById('occupancyRate').textContent = rate + '%';

    // 楼层卡片
    floors.forEach(floor => {
        const status = getFloorStatus(floor);
        const statusText = getFloorStatusText(status);
        const statusClass = getFloorStatusClass(status);
        const statusColor = getFloorStatusColor(status);
        const occupancyRate = Math.round((floor.occupiedCount / floor.totalSeats) * 100);

        const card = document.createElement('div');
        card.className = `floor-card status-${statusClass}`;
        card.dataset.floorId = floor.id;
        card.innerHTML = `
            <div class="floor-card-top">
                <span class="floor-name">${floor.name}</span>
                <span class="floor-tag ${statusClass}">${statusText}</span>
            </div>
            <p class="floor-card-desc">${floor.desc}</p>
            <div class="floor-stats">
                <div class="floor-stat-block">
                    <span class="floor-stat-num ${statusColor}">${floor.availableCount}</span>
                    <span class="floor-stat-label">空闲座位</span>
                </div>
                <div class="floor-stat-block" style="text-align:right;">
                    <span class="floor-stat-num" style="color:var(--text-primary);font-size:24px;">${floor.totalSeats}</span>
                    <span class="floor-stat-label">总座位</span>
                </div>
            </div>
            <div class="floor-progress">
                <div class="floor-progress-bar ${statusColor}" style="width:${occupancyRate}%"></div>
            </div>
        `;

        // 点击楼层卡片 → 切换到该楼层详情
        card.addEventListener('click', () => {
            selectFloor(floor.id);
            // 滚动到楼层详情区域
            document.getElementById('floor-detail').scrollIntoView({ behavior: 'smooth' });
        });

        grid.appendChild(card);
    });
}

// ============================================================================
//  四、渲染：智能推荐
// ============================================================================
function renderRecommendation() {
    // 找出空位最多且使用率最低的楼层
    let bestFloor = null;
    let bestScore = -1;

    floors.forEach(floor => {
        const availableRate = floor.availableCount / floor.totalSeats;
        // 综合评分：空位率 * 0.6 + 空位数量权重 * 0.4
        const score = availableRate * 0.6 + (floor.availableCount / 120) * 0.4;
        if (score > bestScore) {
            bestScore = score;
            bestFloor = floor;
        }
    });

    if (bestFloor) {
        const status = getFloorStatus(bestFloor);
        const statusText = getFloorStatusText(status);
        document.getElementById('recommendDesc').textContent =
            `当前「${bestFloor.name}」空位最多（${bestFloor.availableCount}个），使用率${Math.round(bestFloor.occupiedCount / bestFloor.totalSeats * 100)}%，状态：${statusText}，推荐前往！`;

        document.getElementById('recommendGo').onclick = () => {
            selectFloor(bestFloor.id);
            document.getElementById('floor-detail').scrollIntoView({ behavior: 'smooth' });
        };
    }
}

// ============================================================================
//  五、渲染：楼层标签 & 座位可视化
// ============================================================================
function renderFloorTabs() {
    const tabsContainer = document.getElementById('floorTabs');
    tabsContainer.innerHTML = '';

    floors.forEach(floor => {
        const tab = document.createElement('button');
        tab.className = 'floor-tab';
        tab.dataset.floorId = floor.id;
        if (floor.id === currentFloorId) tab.classList.add('active');
        tab.textContent = floor.name;
        tab.addEventListener('click', () => selectFloor(floor.id));
        tabsContainer.appendChild(tab);
    });
}

function selectFloor(floorId) {
    currentFloorId = floorId;
    selectedSeatId = null;
    updateSelectedSeatDisplay();
    updateReserveButton();

    // 更新标签高亮
    document.querySelectorAll('.floor-tab').forEach(tab => {
        tab.classList.toggle('active', parseInt(tab.dataset.floorId) === floorId);
    });

    renderSeatMap();
}

function renderSeatMap() {
    const seatMap = document.getElementById('seatMap');
    const floor = floors.find(f => f.id === currentFloorId);

    if (!floor) {
        seatMap.innerHTML = '<p class="seat-map-placeholder">👆 请先选择一个楼层</p>';
        document.getElementById('seatMapTitle').textContent = '请选择楼层';
        document.getElementById('floorInfoBar').style.display = 'none';
        return;
    }

    document.getElementById('seatMapTitle').textContent = `${floor.name} · ${floor.desc}`;

    // 渲染座位
    seatMap.innerHTML = '';
    floor.seats.forEach(seat => {
        const seatEl = document.createElement('div');
        seatEl.className = `seat ${seat.status}`;
        seatEl.dataset.seatId = seat.id;
        seatEl.textContent = seat.label.split('-')[1]; // 只显示编号部分
        seatEl.title = `${seat.label} - ${getStatusText(seat.status)}`;

        // 检查是否是我预约的座位
        if (myReservations.includes(seat.id)) {
            seatEl.classList.add('reserved-by-me');
            seatEl.title = `${seat.label} - 我已预约`;
        }

        seatEl.addEventListener('click', () => onSeatClick(seat));
        seatMap.appendChild(seatEl);
    });

    // 更新楼层信息条
    const reservedCount = floor.seats.filter(s => s.status === 'reserved').length;
    const availCount = floor.seats.filter(s => s.status === 'available').length;
    const occCount = floor.seats.filter(s => s.status === 'occupied').length;

    document.getElementById('floorTotal').textContent = floor.totalSeats;
    document.getElementById('floorAvail').textContent = availCount;
    document.getElementById('floorReserved').textContent = reservedCount;
    document.getElementById('floorOccupied').textContent = occCount;
    document.getElementById('floorInfoBar').style.display = 'flex';
}

function getStatusText(status) {
    const map = {
        'available': '空闲',
        'occupied': '已占用',
        'reserved': '已预约'
    };
    return map[status] || '未知';
}

// ============================================================================
//  六、座位点击交互
// ============================================================================
function onSeatClick(seat) {
    // 已占用或已被他人预约的座位不可选
    if (seat.status === 'occupied') {
        showResultModal('fail', '该座位已被占用', '请选择其他空闲座位');
        return;
    }
    if (seat.status === 'reserved') {
        // 如果是我自己预约的，可以取消
        if (myReservations.includes(seat.id)) {
            cancelReservation(seat);
            return;
        }
        showResultModal('fail', '该座位已被预约', '请选择其他空闲座位');
        return;
    }

    // 空闲座位 → 选中/取消选中
    if (selectedSeatId === seat.id) {
        // 取消选中
        selectedSeatId = null;
    } else {
        // 先清除之前的选中
        document.querySelectorAll('.seat.selected').forEach(el => el.classList.remove('selected'));
        selectedSeatId = seat.id;
    }

    updateSeatSelection();
    updateSelectedSeatDisplay();
    updateReserveButton();
}

function updateSeatSelection() {
    document.querySelectorAll('.seat').forEach(el => {
        el.classList.remove('selected');
    });
    if (selectedSeatId) {
        const el = document.querySelector(`.seat[data-seat-id="${selectedSeatId}"]`);
        if (el) el.classList.add('selected');
    }
}

function updateSelectedSeatDisplay() {
    const display = document.getElementById('selectedSeatDisplay');
    if (selectedSeatId) {
        display.textContent = selectedSeatId.replace('-', ' · ');
        display.classList.remove('empty');
    } else {
        display.textContent = '未选择座位';
        display.classList.add('empty');
    }
}

function updateReserveButton() {
    const btn = document.getElementById('btnReserve');
    btn.disabled = !selectedSeatId;
}

// ============================================================================
//  七、座位预约逻辑
// ============================================================================
function setupReservePanel() {
    // 预约时长选择
    document.querySelectorAll('.duration-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.duration-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedDuration = parseInt(btn.dataset.minutes);
        });
    });

    // 确认预约按钮
    document.getElementById('btnReserve').addEventListener('click', submitReservation);
}

function submitReservation() {
    if (!selectedSeatId) return;

    const floor = floors.find(f => f.id === currentFloorId);
    if (!floor) return;

    const seat = floor.seats.find(s => s.id === selectedSeatId);
    if (!seat || seat.status !== 'available') {
        showResultModal('fail', '预约失败', '该座位状态已变化，请刷新后重试');
        return;
    }

    // 模拟预约成功
    seat.status = 'reserved';
    floor.reservedCount++;
    floor.availableCount--;
    myReservations.push(seat.id);

    // 清除选中状态
    selectedSeatId = null;

    // 更新视图
    renderSeatMap();
    renderOverview();
    renderRecommendation();
    updateSelectedSeatDisplay();
    updateReserveButton();

    // 显示成功弹窗
    const endTime = getEndTime(selectedDuration);
    showResultModal(
        'success',
        '预约成功！',
        `座位 ${seat.label} 已为您锁定`,
        `预约时长：${selectedDuration} 分钟 | 到期时间：${endTime}`,
        `请在 ${selectedDuration} 分钟内入座，超时系统将自动释放座位`
    );
}

function cancelReservation(seat) {
    const floor = floors.find(f => f.id === seat.floorId);
    if (!floor) return;

    seat.status = 'available';
    floor.reservedCount--;
    floor.availableCount++;
    myReservations = myReservations.filter(id => id !== seat.id);

    renderSeatMap();
    renderOverview();
    renderRecommendation();

    showResultModal('success', '已取消预约', `座位 ${seat.label} 已释放`);
}

// 计算到期时间
function getEndTime(minutes) {
    const now = new Date();
    now.setMinutes(now.getMinutes() + minutes);
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
}

// ============================================================================
//  八、弹窗系统
// ============================================================================
function showResultModal(type, title, detail1, detail2, countdown) {
    const body = document.getElementById('resultBody');
    const icon = type === 'success' ? '✅' : '❌';
    const titleClass = type === 'success' ? 'success' : 'fail';

    let html = `
        <div class="result-icon">${icon}</div>
        <div class="result-title ${titleClass}">${title}</div>
        <div class="result-detail">${detail1}</div>
    `;

    if (detail2) {
        html += `<div class="result-detail">${detail2}</div>`;
    }

    if (countdown) {
        html += `<div class="result-countdown">⏰ ${countdown}</div>`;
    }

    html += `<button class="result-btn" onclick="closeResultModal()">知道了</button>`;

    body.innerHTML = html;
    document.getElementById('resultModal').classList.add('show');
}

function closeResultModal() {
    document.getElementById('resultModal').classList.remove('show');
}

// ============================================================================
//  九、数据刷新
// ============================================================================
function refreshData() {
    const refreshIcon = document.querySelector('.refresh-icon');
    refreshIcon.classList.add('spinning');

    // 模拟刷新延迟
    setTimeout(() => {
        // 重新随机生成座位状态（保留我已预约的座位）
        const myReservedSeats = new Set(myReservations);

        floors.forEach(floor => {
            const occupancyRate = [0.35, 0.55, 0.70, 0.85, 0.30][floor.id - 1] || 0.5;
            // 加入一点随机波动
            const variance = (Math.random() - 0.5) * 0.15;
            const adjustedRate = Math.max(0.1, Math.min(0.95, occupancyRate + variance));

            let available = 0, occupied = 0, reserved = 0;

            floor.seats.forEach(seat => {
                if (myReservedSeats.has(seat.id)) {
                    seat.status = 'reserved';
                    reserved++;
                } else if (seat.status === 'reserved') {
                    // 非我预约的保留状态
                    reserved++;
                } else {
                    const isOccupied = Math.random() < adjustedRate;
                    seat.status = isOccupied ? 'occupied' : 'available';
                    if (isOccupied) occupied++;
                    else available++;
                }
            });

            floor.availableCount = available;
            floor.occupiedCount = occupied;
            floor.reservedCount = reserved;
        });

        // 重新渲染
        renderOverview();
        renderRecommendation();
        if (currentFloorId) renderSeatMap();

        refreshIcon.classList.remove('spinning');
        showResultModal('success', '数据已刷新', '各楼层空位信息已更新至最新状态');
    }, 800);
}

// ============================================================================
//  十、导航 & 辅助功能
// ============================================================================
function setupNavigation() {
    // 导航点击 → 平滑滚动 + 高亮
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.dataset.target;
            const target = document.getElementById(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // 移动端汉堡菜单
    const menuToggle = document.getElementById('menuToggle');
    const nav = document.querySelector('.nav');
    menuToggle.addEventListener('click', () => {
        nav.classList.toggle('show');
    });

    // 点击导航链接后关闭移动端菜单
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('show');
        });
    });

    // 滚动监听 → 导航高亮 & 返回顶部
    const sections = document.querySelectorAll('.section');
    const backToTop = document.getElementById('backToTop');

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;

        // 返回顶部按钮显隐
        if (scrollY > 400) {
            backToTop.classList.add('show');
        } else {
            backToTop.classList.remove('show');
        }

        // 导航高亮（找到当前可视区域的板块）
        let currentSection = '';
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= 120 && rect.bottom >= 120) {
                currentSection = section.id;
            }
        });

        if (currentSection) {
            navLinks.forEach(link => {
                link.classList.toggle('active', link.dataset.target === currentSection);
            });
        }
    });

    // 返回顶部
    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // 弹窗关闭
    document.getElementById('modalClose').addEventListener('click', () => {
        document.getElementById('floorModal').classList.remove('show');
    });

    // 点击遮罩关闭弹窗
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('show');
            }
        });
    });

    // 刷新按钮
    document.getElementById('btnRefresh').addEventListener('click', refreshData);

    // ESC 关闭弹窗
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay.show').forEach(overlay => {
                overlay.classList.remove('show');
            });
        }
    });
}

// ============================================================================
//  十一、启动
// ============================================================================
function init() {
    // 生成模拟数据
    initFloors();

    // 渲染各板块
    renderOverview();
    renderRecommendation();
    renderFloorTabs();

    // 默认选中推荐楼层
    let bestFloor = null;
    let bestScore = -1;
    floors.forEach(floor => {
        const score = (floor.availableCount / floor.totalSeats) * 0.6 + (floor.availableCount / 120) * 0.4;
        if (score > bestScore) {
            bestScore = score;
            bestFloor = floor;
        }
    });
    if (bestFloor) {
        selectFloor(bestFloor.id);
    }

    // 设置预约面板交互
    setupReservePanel();

    // 设置导航与辅助功能
    setupNavigation();

    console.log('%c📚 Workbody · 图书馆空位查询与预约系统已启动', 'color: #4A90D9; font-size: 14px; font-weight: bold;');
    console.log('%c提示：本系统为前端模拟演示版本，座位数据为虚拟数据。', 'color: #999; font-size: 12px;');
}

// 页面加载完成 → 启动
document.addEventListener('DOMContentLoaded', init);
