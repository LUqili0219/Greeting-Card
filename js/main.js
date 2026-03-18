// IndexedDB 配置
const DB_CONFIG = {
    name: 'windy_sea_invitations',
    version: 1,
    store: 'participants'
};

let db = null;
let audio = null;
let currentNickname = '';
let isMusicPlaying = false;

// Supabase 配置
const SUPABASE_CONFIG = {
    url: 'https://rjznurdpxjpdhrkabgrg.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqem51cmRweGpwZGhya2FiZ3JnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4MzYzNDUsImV4cCI6MjA4OTQxMjM0NX0.05egqJDOSyQpzi2MXIqHp5DYLBzDZ4Job3jTCt8dqFw'
};

// 初始化 IndexedDB
async function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_CONFIG.name, DB_CONFIG.version);

        request.onerror = () => {
            console.error('数据库打开失败:', request.error);
            reject(request.error);
        };

        request.onupgradeneeded = (event) => {
            db = event.target.result;
            if (!db.objectStoreNames.contains(DB_CONFIG.store)) {
                const objectStore = db.createObjectStore(DB_CONFIG.store, { keyPath: 'nickname' });
                objectStore.createIndex('status', 'status', { unique: false });
                objectStore.createIndex('timestamp', 'timestamp', { unique: false });
            }
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            resolve(db);
        };
    });
}

// ===== 粒子系统 =====
class ParticleSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.running = false;
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticle() {
        return {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            size: Math.random() * 3 + 1,
            speedX: (Math.random() - 0.5) * 0.5,
            speedY: (Math.random() - 0.5) * 0.5,
            opacity: Math.random() * 0.5 + 0.2,
            hue: Math.random() > 0.5 ? 334 : 190 // #E94F8C(334) 或 #40DDFF(190)
        };
    }

    start() {
        if (this.running) return;
        this.running = true;
        
        // 创建初始粒子
        for (let i = 0; i < 100; i++) {
            this.particles.push(this.createParticle());
        }
        
        this.animate();
    }

    stop() {
        this.running = false;
    }

    animate() {
        if (!this.running) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 更新和绘制粒子
        this.particles.forEach((particle, index) => {
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            particle.opacity += (Math.random() - 0.5) * 0.02;
            
            // 边界检查
            if (particle.x < 0) particle.x = this.canvas.width;
            if (particle.x > this.canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = this.canvas.height;
            if (particle.y > this.canvas.height) particle.y = 0;
            
            // 透明度限制
            particle.opacity = Math.max(0.1, Math.min(0.8, particle.opacity));

            // 绘制粒子
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `hsla(${particle.hue}, 70%, 70%, ${particle.opacity})`;
            this.ctx.fill();
            
            // 添加辉光
            const gradient = this.ctx.createRadialGradient(
                particle.x, particle.y, 0,
                particle.x, particle.y, particle.size * 3
            );
            gradient.addColorStop(0, `hsla(${particle.hue}, 70%, 70%, ${particle.opacity * 0.5})`);
            gradient.addColorStop(1, 'transparent');
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
            this.ctx.fill();
        });

        requestAnimationFrame(() => this.animate());
    }
}

// ===== 波浪系统 =====
class WaveSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.waves = [];
        this.running = false;
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createWave(y, amplitude, frequency, speed, color) {
        return {
            y: y,
            amplitude: amplitude,
            frequency: frequency,
            speed: speed,
            phase: Math.random() * Math.PI * 2,
            color: color
        };
    }

    start() {
        if (this.running) return;
        this.running = true;
        
        // 创建波浪
        this.waves = [
            this.createWave(this.canvas.height * 0.7, 50, 0.01, 0.02, 'rgba(233, 79, 140, 0.25)'),
            this.createWave(this.canvas.height * 0.75, 40, 0.012, 0.025, 'rgba(64, 221, 255, 0.2)'),
            this.createWave(this.canvas.height * 0.8, 35, 0.008, 0.015, 'rgba(233, 79, 140, 0.15)'),
            this.createWave(this.canvas.height * 0.85, 45, 0.015, 0.03, 'rgba(64, 221, 255, 0.12)')
        ];
        
        this.animate();
    }

    stop() {
        this.running = false;
    }

    animate() {
        if (!this.running) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制波浪
        this.waves.forEach(wave => {
            this.ctx.beginPath();
            this.ctx.moveTo(0, wave.y);
            
            for (let x = 0; x <= this.canvas.width; x += 2) {
                const y = wave.y + 
                    Math.sin(x * wave.frequency + wave.phase) * wave.amplitude +
                    Math.sin(x * wave.frequency * 2 + wave.phase * 1.5) * wave.amplitude * 0.3;
                this.ctx.lineTo(x, y);
            }
            
            this.ctx.lineTo(this.canvas.width, this.canvas.height);
            this.ctx.lineTo(0, this.canvas.height);
            this.ctx.closePath();
            
            // 创建渐变
            const gradient = this.ctx.createLinearGradient(0, wave.y - wave.amplitude, 0, this.canvas.height);
            
            // 根据波浪颜色添加渐变
            if (wave.color.includes('233, 79, 140')) {
                // 红色系渐变
                gradient.addColorStop(0, wave.color);
                gradient.addColorStop(0.5, 'rgba(64, 221, 255, 0.08)');
                gradient.addColorStop(1, 'transparent');
            } else {
                // 蓝色系渐变
                gradient.addColorStop(0, wave.color);
                gradient.addColorStop(0.5, 'rgba(233, 79, 140, 0.08)');
                gradient.addColorStop(1, 'transparent');
            }
            
            this.ctx.fillStyle = gradient;
            this.ctx.fill();
            
            // 更新相位
            wave.phase += wave.speed;
        });

        requestAnimationFrame(() => this.animate());
    }
}

// ===== 视差效果 =====
class ParallaxEffect {
    constructor() {
        this.mouseX = 0;
        this.mouseY = 0;
        this.targetX = 0;
        this.targetY = 0;
        this.running = false;
        
        this.init();
    }

    init() {
        document.addEventListener('mousemove', (e) => {
            this.mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
            this.mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        });
    }

    start() {
        if (this.running) return;
        this.running = true;
        this.animate();
    }

    stop() {
        this.running = false;
    }

    animate() {
        if (!this.running) return;

        // 平滑过渡
        this.targetX += (this.mouseX - this.targetX) * 0.05;
        this.targetY += (this.mouseY - this.targetY) * 0.05;

        // 应用视差效果到不同元素
        const container = document.getElementById('mainContainer');
        if (container) {
            container.style.transform = `translate(${this.targetX * 10}px, ${this.targetY * 10}px)`;
        }

        // 极光层
        const auroraLayers = document.querySelectorAll('.aurora-layer');
        auroraLayers.forEach((layer, index) => {
            const depth = (index + 1) * 5;
            layer.style.transform = `translate(${this.targetX * depth}px, ${this.targetY * depth}px)`;
        });

        requestAnimationFrame(() => this.animate());
    }
}

// 系统实例
let particleSystem = null;
let waveSystem = null;
let parallaxEffect = null;

// 存储参与者数据
async function saveParticipant(data) {
    if (!db) {
        await initDB();
    }

    return new Promise((resolve, reject) => {
        const transaction = db.transaction([DB_CONFIG.store], 'readwrite');
        const objectStore = transaction.objectStore(DB_CONFIG.store);
        const request = objectStore.put(data);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// 获取所有参与者
async function getAllParticipants() {
    if (!db) {
        await initDB();
    }

    return new Promise((resolve, reject) => {
        const transaction = db.transaction([DB_CONFIG.store], 'readonly');
        const objectStore = transaction.objectStore(DB_CONFIG.store);
        const request = objectStore.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// 显示所有参与者数据
async function showAllParticipants() {
    try {
        const participants = await getAllParticipants();
        console.log('=== 参与者数据 ===');
        console.table(participants);
        console.log(`总计: ${participants.length} 人`);
        
        const accepted = participants.filter(p => p.status === 'accepted').length;
        const declined = participants.filter(p => p.status === 'declined').length;
        
        console.log(`接受邀请: ${accepted} 人`);
        console.log(`婉拒邀请: ${declined} 人`);
        
        return participants;
    } catch (error) {
        console.error('获取参与者数据失败:', error);
        return [];
    }
}

// 清空所有数据（谨慎使用）
async function clearAllData() {
    if (!confirm('确定要清空所有参与者数据吗？此操作不可恢复！')) {
        return;
    }
    
    try {
        const transaction = db.transaction([DB_CONFIG.store], 'readwrite');
        const objectStore = transaction.objectStore(DB_CONFIG.store);
        const request = objectStore.clear();

        request.onsuccess = () => {
            console.log('所有数据已清空');
            alert('所有参与者数据已清空');
        };
        request.onerror = () => {
            console.error('清空数据失败:', request.error);
            alert('清空数据失败');
        };
    } catch (error) {
        console.error('清空数据失败:', error);
        alert('清空数据失败');
    }
}

// 导出数据为JSON
async function exportData() {
    try {
        const participants = await getAllParticipants();
        const dataStr = JSON.stringify(participants, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `participants_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        console.log('数据已导出');
    } catch (error) {
        console.error('导出数据失败:', error);
        alert('导出数据失败');
    }
}

// 切换数据面板显示
function toggleDataPanel() {
    const dataContent = document.querySelector('.data-content');
    dataContent.classList.toggle('active');
    
    if (dataContent.classList.contains('active')) {
        refreshData();
    }
}

// 刷新数据显示
async function refreshData() {
    try {
        const participants = await getAllParticipants();
        
        // 更新统计数据
        document.getElementById('stat-total').textContent = participants.length;
        document.getElementById('stat-accepted').textContent = participants.filter(p => p.status === 'accepted').length;
        document.getElementById('stat-declined').textContent = participants.filter(p => p.status === 'declined').length;
        
        // 更新列表
        const listContainer = document.getElementById('participants-list');
        
        if (participants.length === 0) {
            listContainer.innerHTML = '<p class="empty-text">暂无数据</p>';
            return;
        }
        
        // 按时间排序（最新的在前）
        const sortedParticipants = [...participants].sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
        );
        
        listContainer.innerHTML = sortedParticipants.map(p => {
            const date = new Date(p.timestamp);
            const timeStr = date.toLocaleString('zh-CN', {
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            const statusClass = p.status === 'accepted' ? 'accepted' : 'declined';
            const statusText = p.status === 'accepted' ? '已接受' : '已婉拒';
            
            return `
                <div class="participant-item">
                    <div>
                        <div class="participant-name">${p.nickname}</div>
                        <div class="participant-time">${timeStr}</div>
                    </div>
                    <div class="participant-status ${statusClass}">${statusText}</div>
                </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error('刷新数据失败:', error);
        document.getElementById('participants-list').innerHTML = 
            '<p class="empty-text">加载失败</p>';
    }
}

// 屏幕切换函数
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

function showWelcomeScreen() {
    showScreen('welcome-screen');
}

function showInputScreen() {
    showScreen('input-screen');
    document.getElementById('nickname').focus();
}

function showDetailScreen() {
    showScreen('detail-screen');
}

function showDeclineScreen() {
    showScreen('decline-screen');
}

// 昵称验证
function validateNickname(nickname) {
    const regex = /^[a-zA-Z0-9_\u4e00-\u9fa5]{2,15}$/;
    return regex.test(nickname);
}

// 显示错误信息
function showError(message) {
    const errorElement = document.getElementById('error-message');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

function clearError() {
    const errorElement = document.getElementById('error-message');
    errorElement.textContent = '';
    errorElement.style.display = 'none';
}

// 提交昵称
function submitNickname() {
    const nickname = document.getElementById('nickname').value.trim();

    if (!nickname) {
        showError('请输入昵称');
        return;
    }

    if (!validateNickname(nickname)) {
        showError('昵称需为2-15字符（支持中文，示例：小海、星辰大海）');
        return;
    }

    currentNickname = nickname;
    document.getElementById('modal-nickname').textContent = nickname;
    showModal();
}

// 显示模态框
function showModal() {
    document.getElementById('confirm-modal').classList.add('active');
}

function closeModal() {
    document.getElementById('confirm-modal').classList.remove('active');
}

// 发送数据到 Supabase
async function sendDataToSupabase(data) {
    // 检查是否配置了 Supabase
    if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey) {
        console.log('Supabase 未配置，跳过数据上传');
        return { success: true, skipped: true };
    }

    try {
        // 动态加载 Supabase SDK
        if (typeof supabase === 'undefined') {
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }

        const supabaseClient = supabase.createClient(
            SUPABASE_CONFIG.url,
            SUPABASE_CONFIG.anonKey
        );

        const insertData = {
            nickname: data.nickname,
            status: data.status,
            timestamp: data.timestamp
        };

        // 如果有原因，添加到插入数据中
        if (data.reason) {
            insertData.reason = data.reason;
        }

        const { data: result, error } = await supabaseClient
            .from('participants')
            .insert([insertData])
            .select();

        if (error) throw error;

        console.log('数据上传成功:', result);
        return { success: true, data: result };
    } catch (error) {
        console.error('数据上传失败:', error);
        return { success: false, error };
    }
}

// 确认参加
async function confirmAccept() {
    closeModal();
    
    const participantData = {
        nickname: currentNickname,
        status: 'accepted',
        timestamp: new Date().toISOString()
    };

    try {
        // 保存到本地数据库
        await saveParticipant(participantData);
        
        // 上传到 Supabase
        const supabaseResult = await sendDataToSupabase(participantData);
        
        document.getElementById('display-nickname').textContent = currentNickname;
        showDetailScreen();
        
        // 清空输入
        document.getElementById('nickname').value = '';
        updateCharCount();
        
        console.log('参与者已保存:', participantData);
        
        if (supabaseResult.skipped) {
            console.log('提示：请在 js/main.js 中配置 Supabase 以收集数据');
        }
    } catch (error) {
        console.error('保存失败:', error);
        if (error.name === 'ConstraintError') {
            showError('该昵称已被使用，请选择其他昵称');
        } else {
            showError('保存失败，请重试');
        }
    }
}

// 提交婉拒
async function submitDecline() {
    const feedback = document.getElementById('feedback-text').value.trim();
    
    const declineData = {
        nickname: '匿名',
        status: 'declined',
        timestamp: new Date().toISOString(),
        reason: feedback || '未填写原因'
    };

    try {
        // 保存到本地数据库
        await saveParticipant(declineData);
        
        // 上传到 Supabase
        await sendDataToSupabase(declineData);
        
        // 清空输入
        document.getElementById('feedback-text').value = '';
        updateFeedbackCount();
        
        alert('感谢您的反馈，风之海会一直等待您。');
        showWelcomeScreen();
        
        console.log('婉拒信息已保存:', declineData);
    } catch (error) {
        console.error('保存失败:', error);
        alert('保存失败，请重试');
    }
}

// 字符计数
function updateCharCount() {
    const input = document.getElementById('nickname');
    const countDisplay = document.getElementById('char-count');
    countDisplay.textContent = `${input.value.length}/15`;
}

function updateFeedbackCount() {
    const textarea = document.getElementById('feedback-text');
    const countDisplay = document.getElementById('feedback-count');
    countDisplay.textContent = `${textarea.value.length}/200`;
}

// 音乐控制
function toggleMusicControls() {
    const controls = document.getElementById('music-controls');
    controls.classList.toggle('active');
}

function toggleMusic() {
    if (audio) {
        if (isMusicPlaying) {
            audio.pause();
            document.getElementById('music-icon').textContent = '🎵';
        } else {
            audio.play();
            document.getElementById('music-icon').textContent = '🔇';
        }
        isMusicPlaying = !isMusicPlaying;
    } else {
        // 如果没有音频，先显示控制面板
        toggleMusicControls();
    }
}

function changeVolume(value) {
    if (audio) {
        audio.volume = value / 100;
    }
}

// 上传音乐
async function uploadMusic(event) {
    const file = event.target.files[0];
    
    if (!file) {
        return;
    }

    if (file.size > 10 * 1024 * 1024) {
        alert('文件大小不能超过10MB');
        return;
    }

    try {
        const arrayBuffer = await file.arrayBuffer();
        const audioBlob = new Blob([arrayBuffer], { type: file.type });
        const audioUrl = URL.createObjectURL(audioBlob);

        // 停止当前播放
        if (audio) {
            audio.pause();
            audio = null;
        }

        // 创建新的音频
        audio = new Audio(audioUrl);
        audio.loop = true;
        audio.volume = document.getElementById('volume-slider').value / 100;

        // 播放音乐
        await audio.play();
        isMusicPlaying = true;
        document.getElementById('music-icon').textContent = '🔇';

        // 保存到 IndexedDB
        await saveMusicToDB(file.name, arrayBuffer);

        document.getElementById('music-status').textContent = `正在播放: ${file.name}`;
        
        console.log('音乐上传并播放成功:', file.name);
    } catch (error) {
        console.error('音乐上传失败:', error);
        alert('音乐上传失败，请重试');
    }
}

// 保存音乐到 IndexedDB
async function saveMusicToDB(name, data) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['music'], 'readwrite');
        
        if (!transaction.objectStore('music')) {
            // 创建音乐存储
            const objectStore = db.createObjectStore('music', { keyPath: 'name' });
        }

        const objectStore = transaction.objectStore('music');
        const request = objectStore.put({ name, data, timestamp: new Date().toISOString() });

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// 从 IndexedDB 加载音乐
async function loadMusicFromDB() {
    try {
        const transaction = db.transaction(['music'], 'readonly');
        const objectStore = transaction.objectStore('music');
        const request = objectStore.getAll();

        return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error('加载音乐失败:', error);
        return [];
    }
}

// 涟漪效果
function createRipple(event) {
    const button = event.currentTarget;
    const ripple = button.querySelector('.ripple-effect');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
}

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
    // 初始化特效系统
    particleSystem = new ParticleSystem('particlesCanvas');
    particleSystem.start();
    
    waveSystem = new WaveSystem('waveCanvas');
    waveSystem.start();
    
    parallaxEffect = new ParallaxEffect();
    parallaxEffect.start();

    // 初始化数据库
    await initDB();

    // 设置输入事件监听
    const nicknameInput = document.getElementById('nickname');
    nicknameInput.addEventListener('input', () => {
        updateCharCount();
        clearError();
    });

    const feedbackInput = document.getElementById('feedback-text');
    feedbackInput.addEventListener('input', updateFeedbackCount);

    // 为所有按钮添加涟漪效果
    document.querySelectorAll('.btn.ripple').forEach(button => {
        button.addEventListener('click', createRipple);
    });

    // 点击音乐按钮时切换控制面板
    document.querySelector('.music-toggle').addEventListener('click', (e) => {
        if (!audio) {
            e.stopPropagation();
            toggleMusicControls();
        }
    });

    // 点击其他地方关闭控制面板
    document.addEventListener('click', (e) => {
        const musicPlayer = document.querySelector('.music-player');
        if (!musicPlayer.contains(e.target)) {
            document.getElementById('music-controls').classList.remove('active');
        }
    });

    // 尝试加载保存的音乐
    try {
        const savedMusic = await loadMusicFromDB();
        if (savedMusic.length > 0) {
            const latestMusic = savedMusic[savedMusic.length - 1];
            document.getElementById('music-status').textContent = `已保存: ${latestMusic.name}`;
        }
    } catch (error) {
        console.log('没有找到保存的音乐');
    }

    // 添加数据管理功能到控制台
    console.log('%c🌊 风之海邀请贺卡已初始化', 'color: #E94F8C; font-size: 16px; font-weight: bold;');
    console.log('%c🔒 数据安全提示', 'color: #4CAF50; font-size: 14px; font-weight: bold;');
    console.log('%c所有数据仅存储在您的浏览器本地，不会上传到任何服务器，完全私密安全。', 'color: #666; font-size: 12px;');
    console.log('');
    console.log('%c=== 数据管理命令 ===', 'color: #40DDFF; font-size: 14px; font-weight: bold;');
    console.log('%cshowAllParticipants()%c - 查看所有参与者数据', 'color: #E94F8C; font-weight: bold;', 'color: #666;');
    console.log('%cclearAllData()%c - 清空所有数据（谨慎使用）', 'color: #E94F8C; font-weight: bold;', 'color: #666;');
    console.log('%cexportData()%c - 导出数据为JSON文件', 'color: #40DDFF; font-weight: bold;', 'color: #666;');

    // 在页面加载时显示当前参与者数量
    try {
        const participants = await getAllParticipants();
        console.log(`当前存储的参与者数量: ${participants.length} 人`);
    } catch (error) {
        console.log('获取参与者数据失败');
    }

    // Supabase 配置提示
    if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey) {
        console.log('%c⚠️  Supabase 未配置', 'color: #FFA500; font-size: 14px; font-weight: bold;');
        console.log('%c配置方法：', 'color: #666; font-size: 12px;');
        console.log('1. 访问 https://supabase.com/ 注册账号');
        console.log('2. 创建新项目，选择区域');
        console.log('3. 在 Table Editor 中创建 participants 表');
        console.log('4. 在 SQL Editor 中运行提供的 SQL 命令');
        console.log('5. 在 js/main.js 的 SUPABASE_CONFIG 中填入你的 Project URL 和 anon Key');
        console.log('%c配置完成后，好友的数据将自动保存到 Supabase！', 'color: #4CAF50; font-size: 12px; font-weight: bold;');
    }
});

// 键盘快捷键
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
    }
});