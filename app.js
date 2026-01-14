/**
 * Life Calendar - Year Progress Tracker
 * A beautiful, dark-themed year progress visualization
 */

// ===================================
// CONSTANTS & CONFIGURATION
// ===================================

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

const STORAGE_KEYS = {
    THEME: 'life-calendar-theme',
    GOAL: 'life-calendar-goal'
};

// ===================================
// UTILITY FUNCTIONS
// ===================================

/**
 * Check if a year is a leap year
 */
function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

/**
 * Get the number of days in a year
 */
function getDaysInYear(year) {
    return isLeapYear(year) ? 366 : 365;
}

/**
 * Get the day of year (1-365/366)
 */
function getDayOfYear(date) {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date - start;
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
}

/**
 * Get the week number of the year
 */
function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

/**
 * Format a date as a readable string
 */
function formatDate(date) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

/**
 * Get date from day of year
 */
function getDateFromDayOfYear(dayOfYear, year) {
    const date = new Date(year, 0);
    date.setDate(dayOfYear);
    return date;
}

/**
 * Format date for tooltip
 */
function formatDateShort(date) {
    const options = { month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

/**
 * Days between two dates
 */
function daysBetween(date1, date2) {
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.round(Math.abs((date2 - date1) / oneDay));
}

// ===================================
// PARTICLES BACKGROUND
// ===================================

class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.mouseX = 0;
        this.mouseY = 0;
        this.resize();
        this.init();
        this.bindEvents();
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    init() {
        const particleCount = Math.floor((this.canvas.width * this.canvas.height) / 15000);
        this.particles = [];

        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 0.5,
                speedX: (Math.random() - 0.5) * 0.3,
                speedY: (Math.random() - 0.5) * 0.3,
                opacity: Math.random() * 0.5 + 0.2
            });
        }
    }

    bindEvents() {
        window.addEventListener('resize', () => {
            this.resize();
            this.init();
        });

        window.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Get accent color from CSS
        const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#FF6B35';

        this.particles.forEach(particle => {
            // Update position
            particle.x += particle.speedX;
            particle.y += particle.speedY;

            // Wrap around edges
            if (particle.x < 0) particle.x = this.canvas.width;
            if (particle.x > this.canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = this.canvas.height;
            if (particle.y > this.canvas.height) particle.y = 0;

            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity * 0.3})`;
            this.ctx.fill();
        });

        // Draw connections
        this.particles.forEach((p1, i) => {
            this.particles.slice(i + 1).forEach(p2 => {
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 100) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(p1.x, p1.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.strokeStyle = `rgba(255, 255, 255, ${0.05 * (1 - distance / 100)})`;
                    this.ctx.stroke();
                }
            });
        });

        requestAnimationFrame(() => this.animate());
    }
}

// ===================================
// CALENDAR APP
// ===================================

class LifeCalendar {
    constructor() {
        this.today = new Date();
        this.year = this.today.getFullYear();
        this.dayOfYear = getDayOfYear(this.today);
        this.totalDays = getDaysInYear(this.year);

        this.init();
    }

    init() {
        this.loadTheme();
        this.renderStats();
        this.renderCalendarGrid();
        this.renderMonthlyProgress();
        this.bindThemeEvents();
        this.loadGoal();
        this.bindGoalEvents();
        this.bindExportEvents();

        // Initialize particles
        const canvas = document.getElementById('particles-canvas');
        if (canvas) {
            new ParticleSystem(canvas);
        }
    }

    // ===================================
    // STATS RENDERING
    // ===================================

    renderStats() {
        const daysPassed = this.dayOfYear;
        const daysRemaining = this.totalDays - this.dayOfYear;
        const progressPercent = ((this.dayOfYear / this.totalDays) * 100).toFixed(1);

        // Update stat cards
        document.getElementById('days-passed').textContent = daysPassed;
        document.getElementById('days-remaining').textContent = daysRemaining;
        document.getElementById('progress-percent').textContent = `${progressPercent}%`;

        // Update header info
        document.getElementById('current-date').textContent = formatDate(this.today);
        document.getElementById('week-info').textContent = `Week ${getWeekNumber(this.today)} of 52`;
    }

    // ===================================
    // CALENDAR GRID RENDERING
    // ===================================

    renderCalendarGrid() {
        const grid = document.getElementById('calendar-grid');
        if (!grid) return;

        grid.innerHTML = '';

        for (let day = 1; day <= this.totalDays; day++) {
            const dot = document.createElement('div');
            dot.className = 'day-dot';

            const date = getDateFromDayOfYear(day, this.year);
            dot.setAttribute('data-tooltip', formatDateShort(date));
            dot.setAttribute('data-day', day);

            if (day < this.dayOfYear) {
                dot.classList.add('completed');
            } else if (day === this.dayOfYear) {
                dot.classList.add('today');
            } else {
                dot.classList.add('remaining');
            }

            // Add staggered animation
            dot.style.animationDelay = `${day * 2}ms`;

            grid.appendChild(dot);
        }
    }

    // ===================================
    // MONTHLY PROGRESS RENDERING
    // ===================================

    renderMonthlyProgress() {
        const grid = document.getElementById('monthly-grid');
        if (!grid) return;

        grid.innerHTML = '';

        let dayCount = 0;

        MONTHS.forEach((month, index) => {
            const daysInMonth = (index === 1 && isLeapYear(this.year))
                ? 29
                : DAYS_IN_MONTH[index];

            const monthStart = dayCount + 1;
            const monthEnd = dayCount + daysInMonth;

            let progress = 0;
            if (this.dayOfYear >= monthEnd) {
                progress = 100;
            } else if (this.dayOfYear >= monthStart) {
                progress = ((this.dayOfYear - monthStart + 1) / daysInMonth) * 100;
            }

            const card = document.createElement('div');
            card.className = 'month-card';
            card.innerHTML = `
                <div class="month-header">
                    <span class="month-name">${month}</span>
                    <span class="month-percent">${Math.round(progress)}%</span>
                </div>
                <div class="month-bar">
                    <div class="month-progress" style="width: ${progress}%"></div>
                </div>
            `;

            grid.appendChild(card);
            dayCount += daysInMonth;
        });
    }

    // ===================================
    // THEME HANDLING
    // ===================================

    loadTheme() {
        const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) || 'midnight';
        this.setTheme(savedTheme);
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);

        // Update active button
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === theme);
        });

        localStorage.setItem(STORAGE_KEYS.THEME, theme);
    }

    bindThemeEvents() {
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.setTheme(btn.dataset.theme);
            });
        });
    }

    // ===================================
    // GOAL TRACKING
    // ===================================

    loadGoal() {
        const savedGoal = localStorage.getItem(STORAGE_KEYS.GOAL);
        if (savedGoal) {
            const goal = JSON.parse(savedGoal);
            this.displayGoal(goal);
        }
    }

    saveGoal(goal) {
        localStorage.setItem(STORAGE_KEYS.GOAL, JSON.stringify(goal));
    }

    clearGoal() {
        localStorage.removeItem(STORAGE_KEYS.GOAL);
        document.getElementById('goal-form').classList.remove('hidden');
        document.getElementById('goal-display').classList.add('hidden');

        // Clear form
        document.getElementById('goal-title').value = '';
        document.getElementById('goal-start').value = '';
        document.getElementById('goal-end').value = '';
    }

    displayGoal(goal) {
        const startDate = new Date(goal.startDate);
        const endDate = new Date(goal.endDate);
        const today = new Date();

        // Reset time to midnight for accurate day calculations
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        const totalDays = daysBetween(startDate, endDate);
        const daysPassed = Math.max(0, Math.min(totalDays, daysBetween(startDate, today)));
        const daysLeft = Math.max(0, daysBetween(today, endDate));
        const percent = totalDays > 0 ? Math.round((daysPassed / totalDays) * 100) : 0;

        // Update display
        document.getElementById('goal-display-title').textContent = goal.title;
        document.getElementById('goal-days-passed').textContent = daysPassed;
        document.getElementById('goal-days-left').textContent = daysLeft;
        document.getElementById('goal-percent').textContent = `${percent}%`;

        // Render goal grid
        this.renderGoalGrid(totalDays, daysPassed);

        // Show display, hide form
        document.getElementById('goal-form').classList.add('hidden');
        document.getElementById('goal-display').classList.remove('hidden');
    }

    renderGoalGrid(totalDays, daysPassed) {
        const grid = document.getElementById('goal-grid');
        if (!grid) return;

        grid.innerHTML = '';

        for (let day = 1; day <= totalDays; day++) {
            const dot = document.createElement('div');
            dot.className = 'day-dot';

            if (day < daysPassed) {
                dot.classList.add('completed');
            } else if (day === daysPassed) {
                dot.classList.add('today');
            } else {
                dot.classList.add('remaining');
            }

            grid.appendChild(dot);
        }
    }

    bindGoalEvents() {
        const setGoalBtn = document.getElementById('set-goal');
        const clearGoalBtn = document.getElementById('clear-goal');

        if (setGoalBtn) {
            setGoalBtn.addEventListener('click', () => {
                const title = document.getElementById('goal-title').value.trim();
                const startDate = document.getElementById('goal-start').value;
                const endDate = document.getElementById('goal-end').value;

                if (!title || !startDate || !endDate) {
                    alert('Please fill in all fields');
                    return;
                }

                if (new Date(startDate) >= new Date(endDate)) {
                    alert('End date must be after start date');
                    return;
                }

                const goal = { title, startDate, endDate };
                this.saveGoal(goal);
                this.displayGoal(goal);
            });
        }

        if (clearGoalBtn) {
            clearGoalBtn.addEventListener('click', () => {
                this.clearGoal();
            });
        }
    }

    // ===================================
    // EXPORT FUNCTIONALITY
    // ===================================

    bindExportEvents() {
        const exportBtn = document.getElementById('export-btn');

        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportCalendar();
            });
        }
    }

    async exportCalendar() {
        const calendarSection = document.querySelector('.calendar-section');
        if (!calendarSection) return;

        try {
            // Create a canvas to render the calendar
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Set canvas size
            const width = 800;
            const height = 600;
            canvas.width = width;
            canvas.height = height;

            // Get theme colors
            const styles = getComputedStyle(document.documentElement);
            const bgColor = styles.getPropertyValue('--bg-primary').trim() || '#0A0A0D';
            const dotCompleted = styles.getPropertyValue('--dot-completed').trim() || '#FFFFFF';
            const dotRemaining = styles.getPropertyValue('--dot-remaining').trim() || '#333333';
            const dotToday = styles.getPropertyValue('--dot-today').trim() || '#FF6B35';
            const textPrimary = styles.getPropertyValue('--text-primary').trim() || '#FFFFFF';
            const textSecondary = styles.getPropertyValue('--text-secondary').trim() || '#888888';

            // Draw background
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, width, height);

            // Draw title
            ctx.font = 'bold 32px Inter, sans-serif';
            ctx.fillStyle = textPrimary;
            ctx.textAlign = 'center';
            ctx.fillText('Life Calendar', width / 2, 50);

            // Draw subtitle
            ctx.font = '16px Inter, sans-serif';
            ctx.fillStyle = textSecondary;
            ctx.fillText(`${this.year} Progress: ${((this.dayOfYear / this.totalDays) * 100).toFixed(1)}%`, width / 2, 80);

            // Draw calendar grid
            const gridCols = 21;
            const gridRows = Math.ceil(this.totalDays / gridCols);
            const dotSize = 12;
            const dotGap = 4;
            const gridWidth = gridCols * (dotSize + dotGap);
            const gridHeight = gridRows * (dotSize + dotGap);
            const startX = (width - gridWidth) / 2;
            const startY = 120;

            for (let day = 1; day <= this.totalDays; day++) {
                const col = (day - 1) % gridCols;
                const row = Math.floor((day - 1) / gridCols);
                const x = startX + col * (dotSize + dotGap) + dotSize / 2;
                const y = startY + row * (dotSize + dotGap) + dotSize / 2;

                ctx.beginPath();
                ctx.arc(x, y, dotSize / 2, 0, Math.PI * 2);

                if (day < this.dayOfYear) {
                    ctx.fillStyle = dotCompleted;
                } else if (day === this.dayOfYear) {
                    ctx.fillStyle = dotToday;
                } else {
                    ctx.fillStyle = dotRemaining;
                }

                ctx.fill();
            }

            // Draw footer
            ctx.font = '12px Inter, sans-serif';
            ctx.fillStyle = textSecondary;
            ctx.textAlign = 'center';
            ctx.fillText(`Day ${this.dayOfYear} of ${this.totalDays} • ${formatDate(this.today)}`, width / 2, height - 30);

            // Download the image
            const link = document.createElement('a');
            link.download = `life-calendar-${this.year}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();

        } catch (error) {
            console.error('Export failed:', error);
            alert('Failed to export calendar. Please try again.');
        }
    }
}

// ===================================
// INITIALIZE APP
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    new LifeCalendar();
});
