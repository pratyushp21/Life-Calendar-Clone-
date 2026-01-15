/**
 * Life Calendar - Wallpaper Generator
 * Generates HD wallpapers for iPhone, Android, Desktop, and Tablet
 */

// ===================================
// THEME CONFIGURATIONS
// ===================================

const THEMES = {
    midnight: {
        name: 'Midnight',
        bgPrimary: '#0A0A0D',
        bgGradient: ['#0A0A0D', '#151518'],
        dotCompleted: '#FFFFFF',
        dotRemaining: '#2A2A2D',
        dotToday: '#FF6B35',
        textPrimary: '#FFFFFF',
        textSecondary: '#888888',
        accent: '#FF6B35'
    },
    purple: {
        name: 'Purple',
        bgPrimary: '#0D0A14',
        bgGradient: ['#0D0A14', '#1A1528'],
        dotCompleted: '#E8E0FF',
        dotRemaining: '#2D2545',
        dotToday: '#9B59B6',
        textPrimary: '#E8E0FF',
        textSecondary: '#9B8DC7',
        accent: '#9B59B6'
    },
    ocean: {
        name: 'Ocean',
        bgPrimary: '#0A0D14',
        bgGradient: ['#0A0D14', '#141D2B'],
        dotCompleted: '#E0F0FF',
        dotRemaining: '#1E3045',
        dotToday: '#3498DB',
        textPrimary: '#E0F0FF',
        textSecondary: '#7BA3C7',
        accent: '#3498DB'
    },
    matrix: {
        name: 'Matrix',
        bgPrimary: '#0A0D0A',
        bgGradient: ['#0A0D0A', '#141F14'],
        dotCompleted: '#D5FFD5',
        dotRemaining: '#1E301E',
        dotToday: '#2ECC71',
        textPrimary: '#D5FFD5',
        textSecondary: '#7AC77A',
        accent: '#2ECC71'
    },
    ruby: {
        name: 'Ruby',
        bgPrimary: '#140A0A',
        bgGradient: ['#140A0A', '#241414'],
        dotCompleted: '#FFE0E0',
        dotRemaining: '#351E1E',
        dotToday: '#E74C3C',
        textPrimary: '#FFE0E0',
        textSecondary: '#C77A7A',
        accent: '#E74C3C'
    },
    sunset: {
        name: 'Sunset',
        bgPrimary: '#140D0A',
        bgGradient: ['#140D0A', '#241914'],
        dotCompleted: '#FFF0E0',
        dotRemaining: '#352E1E',
        dotToday: '#E67E22',
        textPrimary: '#FFF0E0',
        textSecondary: '#C7A07A',
        accent: '#E67E22'
    }
};

// ===================================
// DEVICE CONFIGURATIONS
// ===================================

const DEVICES = {
    // Phones
    '1290x2796': { width: 1290, height: 2796, type: 'phone', name: 'iPhone 15 Pro Max' },
    '1179x2556': { width: 1179, height: 2556, type: 'phone', name: 'iPhone 15/14 Pro' },
    '1170x2532': { width: 1170, height: 2532, type: 'phone', name: 'iPhone 14/13' },
    '1080x2400': { width: 1080, height: 2400, type: 'phone', name: 'Android Standard' },
    '1440x3200': { width: 1440, height: 3200, type: 'phone', name: 'Android Flagship' },
    '1080x2340': { width: 1080, height: 2340, type: 'phone', name: 'Android Compact' },
    // Desktop
    '1920x1080': { width: 1920, height: 1080, type: 'desktop', name: 'Full HD' },
    '2560x1440': { width: 2560, height: 1440, type: 'desktop', name: '2K QHD' },
    '3840x2160': { width: 3840, height: 2160, type: 'desktop', name: '4K UHD' },
    // Tablet
    '2048x2732': { width: 2048, height: 2732, type: 'tablet', name: 'iPad Pro 12.9"' },
    '1640x2360': { width: 1640, height: 2360, type: 'tablet', name: 'iPad Air' }
};

// ===================================
// UTILITY FUNCTIONS
// ===================================

function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

function getDaysInYear(year) {
    return isLeapYear(year) ? 366 : 365;
}

function getDayOfYear(date) {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date - start;
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
}

function formatDate(date) {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// ===================================
// WALLPAPER GENERATOR CLASS
// ===================================

class WallpaperGenerator {
    constructor() {
        this.currentTheme = 'midnight';
        this.currentResolution = '1290x2796';
        this.currentDevice = 'phone';
        this.today = new Date();
        this.dayOfYear = getDayOfYear(this.today);
        this.totalDays = getDaysInYear(this.today.getFullYear());
        this.year = this.today.getFullYear();

        this.init();
    }

    init() {
        this.bindEvents();
        this.loadTheme();
        this.updatePreview();
        this.initParticles();
        this.initPlatformTabs();
    }

    bindEvents() {
        // Device type buttons
        document.querySelectorAll('.device-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.device-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentDevice = btn.dataset.device;
                this.updateResolutionOptions();
                this.updatePreview();
            });
        });

        // Resolution select
        const resolutionSelect = document.getElementById('resolution-select');
        resolutionSelect.addEventListener('change', (e) => {
            this.currentResolution = e.target.value;
            this.updatePreview();
        });

        // Theme buttons
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentTheme = btn.dataset.theme;
                document.documentElement.setAttribute('data-theme', this.currentTheme);
                localStorage.setItem('life-calendar-theme', this.currentTheme);
                this.updatePreview();
            });
        });

        // Download button
        document.getElementById('download-btn').addEventListener('click', () => {
            this.downloadWallpaper();
        });

        // Copy URL button
        document.getElementById('copy-url').addEventListener('click', () => {
            const urlInput = document.getElementById('image-url');
            urlInput.select();
            document.execCommand('copy');
            alert('URL copied to clipboard!');
        });
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('life-calendar-theme') || 'midnight';
        this.currentTheme = savedTheme;
        document.documentElement.setAttribute('data-theme', savedTheme);

        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === savedTheme);
        });
    }

    updateResolutionOptions() {
        const select = document.getElementById('resolution-select');
        const deviceType = this.currentDevice;

        // Find first matching resolution
        for (const [key, device] of Object.entries(DEVICES)) {
            if (device.type === deviceType) {
                select.value = key;
                this.currentResolution = key;
                break;
            }
        }
    }

    initPlatformTabs() {
        document.querySelectorAll('.platform-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.platform-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.platform-content').forEach(c => c.classList.remove('active'));

                tab.classList.add('active');
                document.getElementById(`${tab.dataset.platform}-content`).classList.add('active');
            });
        });
    }

    initParticles() {
        const canvas = document.getElementById('particles-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let particles = [];

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const init = () => {
            const count = Math.floor((canvas.width * canvas.height) / 15000);
            particles = [];
            for (let i = 0; i < count; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    size: Math.random() * 2 + 0.5,
                    speedX: (Math.random() - 0.5) * 0.3,
                    speedY: (Math.random() - 0.5) * 0.3,
                    opacity: Math.random() * 0.5 + 0.2
                });
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach(p => {
                p.x += p.speedX;
                p.y += p.speedY;
                if (p.x < 0) p.x = canvas.width;
                if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height;
                if (p.y > canvas.height) p.y = 0;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * 0.3})`;
                ctx.fill();
            });

            requestAnimationFrame(animate);
        };

        resize();
        init();
        animate();
        window.addEventListener('resize', () => { resize(); init(); });
    }

    updatePreview() {
        const canvas = document.getElementById('preview-canvas');
        const frame = document.getElementById('preview-frame');
        const device = DEVICES[this.currentResolution];
        const theme = THEMES[this.currentTheme];

        // Update frame style
        frame.className = 'preview-frame ' + device.type;

        // Set canvas aspect ratio for preview
        const maxPreviewWidth = device.type === 'desktop' ? 400 : 200;
        const scale = maxPreviewWidth / device.width;
        canvas.width = device.width * scale;
        canvas.height = device.height * scale;

        // Generate preview
        this.renderWallpaper(canvas, device, theme, scale);

        // Update info
        document.getElementById('preview-resolution').textContent = `${device.width}×${device.height}`;
        document.getElementById('preview-day').textContent = `Day ${this.dayOfYear}`;
        document.getElementById('preview-theme').textContent = theme.name;
    }

    renderWallpaper(canvas, device, theme, scale = 1) {
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;

        // Draw gradient background
        const gradient = ctx.createLinearGradient(0, 0, w, h);
        gradient.addColorStop(0, theme.bgGradient[0]);
        gradient.addColorStop(1, theme.bgGradient[1]);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);

        // Add subtle noise texture
        this.addNoiseTexture(ctx, w, h, 0.02);

        if (device.type === 'phone' || device.type === 'tablet') {
            this.renderPhoneLayout(ctx, w, h, theme, scale);
        } else {
            this.renderDesktopLayout(ctx, w, h, theme, scale);
        }
    }

    addNoiseTexture(ctx, w, h, opacity) {
        const imageData = ctx.getImageData(0, 0, w, h);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const noise = (Math.random() - 0.5) * 20;
            data[i] += noise;
            data[i + 1] += noise;
            data[i + 2] += noise;
        }
        ctx.putImageData(imageData, 0, 0);
    }

    renderPhoneLayout(ctx, w, h, theme, scale) {
        const s = scale; // Scale factor

        // Calculate grid dimensions
        const gridCols = 14;
        const gridRows = Math.ceil(this.totalDays / gridCols);

        // Dot sizing
        const dotSize = Math.round(w * 0.035);
        const dotGap = Math.round(dotSize * 0.5);

        // Grid dimensions
        const gridWidth = gridCols * (dotSize + dotGap) - dotGap;
        const gridHeight = gridRows * (dotSize + dotGap) - dotGap;

        // Center the grid vertically (slightly below center for lock screen)
        const startX = (w - gridWidth) / 2;
        const startY = h * 0.35;

        // Draw title
        ctx.font = `bold ${Math.round(w * 0.08)}px Inter, sans-serif`;
        ctx.fillStyle = theme.textPrimary;
        ctx.textAlign = 'center';
        ctx.fillText('Life Calendar', w / 2, h * 0.15);

        // Draw year
        ctx.font = `${Math.round(w * 0.04)}px Inter, sans-serif`;
        ctx.fillStyle = theme.textSecondary;
        ctx.fillText(`${this.year}`, w / 2, h * 0.20);

        // Draw progress percentage (big)
        const progressPercent = ((this.dayOfYear / this.totalDays) * 100).toFixed(1);
        ctx.font = `bold ${Math.round(w * 0.12)}px Inter, sans-serif`;
        ctx.fillStyle = theme.accent;
        ctx.fillText(`${progressPercent}%`, w / 2, h * 0.30);

        // Draw calendar grid
        for (let i = 0; i < this.totalDays; i++) {
            const dayNum = i + 1;
            const col = i % gridCols;
            const row = Math.floor(i / gridCols);
            const x = startX + col * (dotSize + dotGap) + dotSize / 2;
            const y = startY + row * (dotSize + dotGap) + dotSize / 2;

            ctx.beginPath();
            ctx.arc(x, y, dotSize / 2, 0, Math.PI * 2);

            if (dayNum < this.dayOfYear) {
                ctx.fillStyle = theme.dotCompleted;
                ctx.shadowColor = theme.dotCompleted;
                ctx.shadowBlur = 4 * s;
            } else if (dayNum === this.dayOfYear) {
                ctx.fillStyle = theme.dotToday;
                ctx.shadowColor = theme.dotToday;
                ctx.shadowBlur = 12 * s;
            } else {
                ctx.fillStyle = theme.dotRemaining;
                ctx.shadowColor = 'transparent';
                ctx.shadowBlur = 0;
            }

            ctx.fill();
            ctx.shadowBlur = 0;
        }

        // Draw stats at bottom
        const statsY = startY + gridHeight + h * 0.08;
        ctx.font = `${Math.round(w * 0.035)}px Inter, sans-serif`;
        ctx.fillStyle = theme.textSecondary;
        ctx.textAlign = 'center';

        const statsText = `Day ${this.dayOfYear} of ${this.totalDays} • ${this.totalDays - this.dayOfYear} days left`;
        ctx.fillText(statsText, w / 2, statsY);

        // Draw date
        ctx.font = `${Math.round(w * 0.03)}px Inter, sans-serif`;
        ctx.fillStyle = theme.textSecondary;
        ctx.fillText(formatDate(this.today), w / 2, statsY + w * 0.05);
    }

    renderDesktopLayout(ctx, w, h, theme, scale) {
        const s = scale;

        // Calculate grid dimensions (wider for desktop)
        const gridCols = 30;
        const gridRows = Math.ceil(this.totalDays / gridCols);

        const dotSize = Math.round(h * 0.025);
        const dotGap = Math.round(dotSize * 0.5);

        const gridWidth = gridCols * (dotSize + dotGap) - dotGap;
        const gridHeight = gridRows * (dotSize + dotGap) - dotGap;

        // Position grid on right side
        const startX = w * 0.55;
        const startY = (h - gridHeight) / 2;

        // Left side - big stats
        ctx.textAlign = 'left';

        // Title
        ctx.font = `bold ${Math.round(h * 0.08)}px Inter, sans-serif`;
        ctx.fillStyle = theme.textPrimary;
        ctx.fillText('Life Calendar', w * 0.05, h * 0.25);

        // Year
        ctx.font = `${Math.round(h * 0.04)}px Inter, sans-serif`;
        ctx.fillStyle = theme.textSecondary;
        ctx.fillText(this.year.toString(), w * 0.05, h * 0.32);

        // Big percentage
        const progressPercent = ((this.dayOfYear / this.totalDays) * 100).toFixed(1);
        ctx.font = `bold ${Math.round(h * 0.2)}px Inter, sans-serif`;
        ctx.fillStyle = theme.accent;
        ctx.fillText(`${progressPercent}%`, w * 0.05, h * 0.55);

        // Sub stats
        ctx.font = `${Math.round(h * 0.035)}px Inter, sans-serif`;
        ctx.fillStyle = theme.textSecondary;
        ctx.fillText(`Day ${this.dayOfYear} of ${this.totalDays}`, w * 0.05, h * 0.65);
        ctx.fillText(`${this.totalDays - this.dayOfYear} days remaining`, w * 0.05, h * 0.72);
        ctx.fillText(formatDate(this.today), w * 0.05, h * 0.79);

        // Draw calendar grid
        for (let i = 0; i < this.totalDays; i++) {
            const dayNum = i + 1;
            const col = i % gridCols;
            const row = Math.floor(i / gridCols);
            const x = startX + col * (dotSize + dotGap) + dotSize / 2;
            const y = startY + row * (dotSize + dotGap) + dotSize / 2;

            ctx.beginPath();
            ctx.arc(x, y, dotSize / 2, 0, Math.PI * 2);

            if (dayNum < this.dayOfYear) {
                ctx.fillStyle = theme.dotCompleted;
                ctx.shadowColor = theme.dotCompleted;
                ctx.shadowBlur = 3 * s;
            } else if (dayNum === this.dayOfYear) {
                ctx.fillStyle = theme.dotToday;
                ctx.shadowColor = theme.dotToday;
                ctx.shadowBlur = 10 * s;
            } else {
                ctx.fillStyle = theme.dotRemaining;
                ctx.shadowColor = 'transparent';
                ctx.shadowBlur = 0;
            }

            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }

    downloadWallpaper() {
        const device = DEVICES[this.currentResolution];
        const theme = THEMES[this.currentTheme];

        // Create full-resolution canvas
        const canvas = document.createElement('canvas');
        canvas.width = device.width;
        canvas.height = device.height;

        // Render at full resolution
        this.renderWallpaper(canvas, device, theme, 1);

        // Download
        const link = document.createElement('a');
        const deviceName = device.name.replace(/[^a-z0-9]/gi, '-').toLowerCase();
        link.download = `life-calendar-${deviceName}-${this.currentTheme}.png`;
        link.href = canvas.toDataURL('image/png', 1.0);
        link.click();
    }
}

// ===================================
// INITIALIZE
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    new WallpaperGenerator();
});
