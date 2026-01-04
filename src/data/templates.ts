// Template interface definition
export interface Template {
    id: string;
    title: string;
    description: string;
    tags: string[];
    html: string;
    css: string;
    js: string;
    thumbnailUrl: string;
}

// Official templates available for forking
export const officialTemplates: Template[] = [
    {
        id: "landing-page",
        title: "Landing Page",
        description: "A modern, responsive landing page template",
        tags: ["HTML", "CSS", "Responsive"],
        thumbnailUrl: "",
        html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Modern Landing Page</title>
</head>
<body>
    <header class="header">
        <nav class="nav">
            <div class="logo">Brand</div>
            <ul class="nav-links">
                <li><a href="#features">Features</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </nav>
    </header>

    <main>
        <section class="hero">
            <h1>Welcome to the Future</h1>
            <p>Build something amazing with our modern platform. Simple, fast, and beautiful.</p>
            <button class="cta-button">Get Started</button>
        </section>

        <section id="features" class="features">
            <h2>Features</h2>
            <div class="feature-grid">
                <div class="feature-card">
                    <div class="feature-icon">🚀</div>
                    <h3>Fast Performance</h3>
                    <p>Lightning-fast load times and smooth interactions.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">🎨</div>
                    <h3>Beautiful Design</h3>
                    <p>Modern aesthetics that capture attention.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">📱</div>
                    <h3>Fully Responsive</h3>
                    <p>Looks great on all devices and screen sizes.</p>
                </div>
            </div>
        </section>
    </main>

    <footer class="footer">
        <p>&copy; 2024 Brand. All rights reserved.</p>
    </footer>
</body>
</html>`,
        css: `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.6;
    color: #333;
}

.header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 1rem 2rem;
    position: fixed;
    width: 100%;
    top: 0;
    z-index: 100;
}

.nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1200px;
    margin: 0 auto;
}

.logo {
    font-size: 1.5rem;
    font-weight: bold;
    color: white;
}

.nav-links {
    display: flex;
    list-style: none;
    gap: 2rem;
}

.nav-links a {
    color: white;
    text-decoration: none;
    transition: opacity 0.3s;
}

.nav-links a:hover {
    opacity: 0.8;
}

.hero {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 2rem;
}

.hero h1 {
    font-size: 3.5rem;
    margin-bottom: 1rem;
    animation: fadeInUp 0.8s ease-out;
}

.hero p {
    font-size: 1.25rem;
    max-width: 600px;
    margin-bottom: 2rem;
    opacity: 0.9;
    animation: fadeInUp 0.8s ease-out 0.2s both;
}

.cta-button {
    padding: 1rem 2.5rem;
    font-size: 1rem;
    border: none;
    border-radius: 50px;
    background: white;
    color: #667eea;
    cursor: pointer;
    transition: transform 0.3s, box-shadow 0.3s;
    animation: fadeInUp 0.8s ease-out 0.4s both;
}

.cta-button:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.features {
    padding: 5rem 2rem;
    background: #f8f9fa;
}

.features h2 {
    text-align: center;
    font-size: 2.5rem;
    margin-bottom: 3rem;
    color: #333;
}

.feature-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
    max-width: 1200px;
    margin: 0 auto;
}

.feature-card {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    text-align: center;
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    transition: transform 0.3s, box-shadow 0.3s;
}

.feature-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 30px rgba(0,0,0,0.12);
}

.feature-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.feature-card h3 {
    margin-bottom: 0.5rem;
    color: #333;
}

.feature-card p {
    color: #666;
}

.footer {
    background: #333;
    color: white;
    text-align: center;
    padding: 2rem;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media (max-width: 768px) {
    .hero h1 {
        font-size: 2.5rem;
    }
    
    .nav-links {
        display: none;
    }
}`,
        js: `// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// CTA button click handler
document.querySelector('.cta-button')?.addEventListener('click', () => {
    alert('Welcome! Let\\'s get started on your journey.');
});

// Add scroll-based header styling
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 50) {
        header.style.background = 'rgba(102, 126, 234, 0.95)';
        header.style.backdropFilter = 'blur(10px)';
    } else {
        header.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        header.style.backdropFilter = 'none';
    }
});

console.log('Landing page loaded successfully!');`
    },
    {
        id: "dashboard-ui",
        title: "Dashboard UI",
        description: "Admin dashboard with charts and tables",
        tags: ["HTML", "CSS", "JavaScript"],
        thumbnailUrl: "",
        html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard</title>
</head>
<body>
    <div class="dashboard">
        <aside class="sidebar">
            <div class="sidebar-header">
                <h2>Dashboard</h2>
            </div>
            <nav class="sidebar-nav">
                <a href="#" class="nav-item active">📊 Overview</a>
                <a href="#" class="nav-item">👥 Users</a>
                <a href="#" class="nav-item">📦 Products</a>
                <a href="#" class="nav-item">📈 Analytics</a>
                <a href="#" class="nav-item">⚙️ Settings</a>
            </nav>
        </aside>

        <main class="main-content">
            <header class="top-bar">
                <h1>Welcome back, Admin</h1>
                <div class="user-info">
                    <span class="notification">🔔</span>
                    <div class="avatar">A</div>
                </div>
            </header>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon blue">👥</div>
                    <div class="stat-info">
                        <h3>2,543</h3>
                        <p>Total Users</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon green">💰</div>
                    <div class="stat-info">
                        <h3>$45,234</h3>
                        <p>Revenue</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon purple">📦</div>
                    <div class="stat-info">
                        <h3>1,234</h3>
                        <p>Orders</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon orange">📈</div>
                    <div class="stat-info">
                        <h3>+23%</h3>
                        <p>Growth</p>
                    </div>
                </div>
            </div>

            <div class="content-grid">
                <div class="chart-card">
                    <h3>Revenue Overview</h3>
                    <div class="chart-placeholder">
                        <div class="bar" style="height: 60%"></div>
                        <div class="bar" style="height: 80%"></div>
                        <div class="bar" style="height: 45%"></div>
                        <div class="bar" style="height: 90%"></div>
                        <div class="bar" style="height: 70%"></div>
                        <div class="bar" style="height: 85%"></div>
                    </div>
                </div>

                <div class="table-card">
                    <h3>Recent Orders</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Amount</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>#12345</td>
                                <td>John Doe</td>
                                <td>$125.00</td>
                                <td><span class="status completed">Completed</span></td>
                            </tr>
                            <tr>
                                <td>#12346</td>
                                <td>Jane Smith</td>
                                <td>$89.00</td>
                                <td><span class="status pending">Pending</span></td>
                            </tr>
                            <tr>
                                <td>#12347</td>
                                <td>Bob Wilson</td>
                                <td>$234.00</td>
                                <td><span class="status completed">Completed</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    </div>
</body>
</html>`,
        css: `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: #f0f2f5;
    min-height: 100vh;
}

.dashboard {
    display: flex;
    min-height: 100vh;
}

.sidebar {
    width: 250px;
    background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
    color: white;
    padding: 1.5rem;
    position: fixed;
    height: 100vh;
}

.sidebar-header h2 {
    font-size: 1.5rem;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(255,255,255,0.1);
}

.sidebar-nav {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.nav-item {
    color: rgba(255,255,255,0.7);
    text-decoration: none;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    transition: all 0.3s;
}

.nav-item:hover, .nav-item.active {
    background: rgba(255,255,255,0.1);
    color: white;
}

.main-content {
    flex: 1;
    margin-left: 250px;
    padding: 2rem;
}

.top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}

.top-bar h1 {
    font-size: 1.75rem;
    color: #1e293b;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.notification {
    font-size: 1.5rem;
    cursor: pointer;
}

.avatar {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.stat-card {
    background: white;
    padding: 1.5rem;
    border-radius: 12px;
    display: flex;
    align-items: center;
    gap: 1rem;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    transition: transform 0.3s, box-shadow 0.3s;
}

.stat-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.stat-icon {
    width: 50px;
    height: 50px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
}

.stat-icon.blue { background: #dbeafe; }
.stat-icon.green { background: #dcfce7; }
.stat-icon.purple { background: #f3e8ff; }
.stat-icon.orange { background: #ffedd5; }

.stat-info h3 {
    font-size: 1.5rem;
    color: #1e293b;
}

.stat-info p {
    color: #64748b;
    font-size: 0.875rem;
}

.content-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
}

.chart-card, .table-card {
    background: white;
    padding: 1.5rem;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.chart-card h3, .table-card h3 {
    margin-bottom: 1.5rem;
    color: #1e293b;
}

.chart-placeholder {
    display: flex;
    align-items: flex-end;
    justify-content: space-around;
    height: 200px;
    padding: 1rem;
}

.bar {
    width: 40px;
    background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
    border-radius: 4px 4px 0 0;
    transition: height 0.5s ease;
}

table {
    width: 100%;
    border-collapse: collapse;
}

th, td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid #e2e8f0;
}

th {
    color: #64748b;
    font-weight: 600;
    font-size: 0.875rem;
}

.status {
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 500;
}

.status.completed {
    background: #dcfce7;
    color: #16a34a;
}

.status.pending {
    background: #fef3c7;
    color: #d97706;
}

@media (max-width: 1024px) {
    .content-grid {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 768px) {
    .sidebar {
        display: none;
    }
    
    .main-content {
        margin-left: 0;
    }
}`,
        js: `// Animate stat cards on load
document.querySelectorAll('.stat-card').forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    setTimeout(() => {
        card.style.transition = 'all 0.5s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
    }, index * 100);
});

// Animate chart bars
document.querySelectorAll('.bar').forEach((bar, index) => {
    const height = bar.style.height;
    bar.style.height = '0';
    setTimeout(() => {
        bar.style.height = height;
    }, 500 + index * 100);
});

// Navigation click handler
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        this.classList.add('active');
    });
});

// Notification click
document.querySelector('.notification')?.addEventListener('click', () => {
    alert('You have 3 new notifications!');
});

console.log('Dashboard loaded successfully!');`
    },
    {
        id: "portfolio",
        title: "Portfolio",
        description: "Personal portfolio with smooth animations",
        tags: ["HTML", "CSS", "Animation"],
        thumbnailUrl: "",
        html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Portfolio - Creative Developer</title>
</head>
<body>
    <nav class="navbar">
        <div class="nav-brand">JD</div>
        <ul class="nav-menu">
            <li><a href="#about">About</a></li>
            <li><a href="#projects">Projects</a></li>
            <li><a href="#skills">Skills</a></li>
            <li><a href="#contact">Contact</a></li>
        </ul>
    </nav>

    <section class="hero-section">
        <div class="hero-content">
            <span class="greeting">Hello, I'm</span>
            <h1 class="name">John Developer</h1>
            <p class="tagline">Creative Developer & Designer</p>
            <div class="hero-buttons">
                <a href="#projects" class="btn primary">View Work</a>
                <a href="#contact" class="btn secondary">Contact Me</a>
            </div>
        </div>
        <div class="hero-visual">
            <div class="floating-shapes">
                <div class="shape shape-1"></div>
                <div class="shape shape-2"></div>
                <div class="shape shape-3"></div>
            </div>
        </div>
    </section>

    <section id="about" class="about-section">
        <h2>About Me</h2>
        <p>I'm a passionate developer who loves creating beautiful, functional web experiences. With expertise in modern technologies, I bring ideas to life through clean code and thoughtful design.</p>
    </section>

    <section id="projects" class="projects-section">
        <h2>Featured Projects</h2>
        <div class="projects-grid">
            <div class="project-card">
                <div class="project-image"></div>
                <div class="project-info">
                    <h3>E-Commerce Platform</h3>
                    <p>Full-stack online store with payment integration</p>
                    <div class="project-tags">
                        <span>React</span>
                        <span>Node.js</span>
                    </div>
                </div>
            </div>
            <div class="project-card">
                <div class="project-image"></div>
                <div class="project-info">
                    <h3>Task Manager App</h3>
                    <p>Productivity app with real-time collaboration</p>
                    <div class="project-tags">
                        <span>Vue.js</span>
                        <span>Firebase</span>
                    </div>
                </div>
            </div>
            <div class="project-card">
                <div class="project-image"></div>
                <div class="project-info">
                    <h3>Weather Dashboard</h3>
                    <p>Beautiful weather app with animations</p>
                    <div class="project-tags">
                        <span>JavaScript</span>
                        <span>API</span>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section id="skills" class="skills-section">
        <h2>Skills</h2>
        <div class="skills-grid">
            <div class="skill-item">
                <div class="skill-bar" data-level="90">HTML/CSS</div>
            </div>
            <div class="skill-item">
                <div class="skill-bar" data-level="85">JavaScript</div>
            </div>
            <div class="skill-item">
                <div class="skill-bar" data-level="80">React</div>
            </div>
            <div class="skill-item">
                <div class="skill-bar" data-level="75">Node.js</div>
            </div>
        </div>
    </section>

    <section id="contact" class="contact-section">
        <h2>Get In Touch</h2>
        <p>Have a project in mind? Let's work together!</p>
        <a href="mailto:hello@example.com" class="btn primary">Say Hello</a>
    </section>

    <footer>
        <p>&copy; 2024 John Developer. Made with ❤️</p>
    </footer>
</body>
</html>`,
        css: `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: #0a0a0a;
    color: #ffffff;
    overflow-x: hidden;
}

.navbar {
    position: fixed;
    width: 100%;
    padding: 1.5rem 3rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 100;
    background: rgba(10, 10, 10, 0.8);
    backdrop-filter: blur(10px);
}

.nav-brand {
    font-size: 1.5rem;
    font-weight: bold;
    background: linear-gradient(135deg, #00d9ff, #8b5cf6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.nav-menu {
    display: flex;
    list-style: none;
    gap: 2rem;
}

.nav-menu a {
    color: #888;
    text-decoration: none;
    transition: color 0.3s;
}

.nav-menu a:hover {
    color: #00d9ff;
}

.hero-section {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 5rem;
    position: relative;
}

.hero-content {
    max-width: 600px;
    z-index: 2;
}

.greeting {
    color: #00d9ff;
    font-size: 1.25rem;
    display: block;
    margin-bottom: 0.5rem;
}

.name {
    font-size: 4rem;
    font-weight: 800;
    margin-bottom: 1rem;
    background: linear-gradient(135deg, #ffffff 0%, #888888 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.tagline {
    font-size: 1.5rem;
    color: #888;
    margin-bottom: 2rem;
}

.hero-buttons {
    display: flex;
    gap: 1rem;
}

.btn {
    padding: 1rem 2rem;
    border-radius: 50px;
    text-decoration: none;
    font-weight: 600;
    transition: all 0.3s;
}

.btn.primary {
    background: linear-gradient(135deg, #00d9ff, #8b5cf6);
    color: white;
}

.btn.primary:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 30px rgba(0, 217, 255, 0.3);
}

.btn.secondary {
    border: 2px solid #333;
    color: white;
}

.btn.secondary:hover {
    border-color: #00d9ff;
}

.hero-visual {
    position: absolute;
    right: 10%;
    top: 50%;
    transform: translateY(-50%);
}

.floating-shapes {
    position: relative;
    width: 400px;
    height: 400px;
}

.shape {
    position: absolute;
    border-radius: 50%;
    animation: float 6s ease-in-out infinite;
}

.shape-1 {
    width: 200px;
    height: 200px;
    background: linear-gradient(135deg, rgba(0, 217, 255, 0.3), rgba(139, 92, 246, 0.3));
    top: 50px;
    left: 50px;
    animation-delay: 0s;
}

.shape-2 {
    width: 150px;
    height: 150px;
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(236, 72, 153, 0.3));
    bottom: 50px;
    right: 30px;
    animation-delay: 2s;
}

.shape-3 {
    width: 100px;
    height: 100px;
    background: linear-gradient(135deg, rgba(34, 211, 238, 0.3), rgba(168, 85, 247, 0.3));
    top: 150px;
    right: 100px;
    animation-delay: 4s;
}

@keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-20px); }
}

section {
    padding: 5rem;
}

section h2 {
    font-size: 2.5rem;
    margin-bottom: 2rem;
    text-align: center;
}

.about-section {
    background: #111;
    text-align: center;
}

.about-section p {
    max-width: 800px;
    margin: 0 auto;
    color: #888;
    font-size: 1.25rem;
    line-height: 1.8;
}

.projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    max-width: 1200px;
    margin: 0 auto;
}

.project-card {
    background: #111;
    border-radius: 16px;
    overflow: hidden;
    transition: transform 0.3s, box-shadow 0.3s;
}

.project-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
}

.project-image {
    height: 200px;
    background: linear-gradient(135deg, #1a1a1a, #2a2a2a);
}

.project-info {
    padding: 1.5rem;
}

.project-info h3 {
    margin-bottom: 0.5rem;
}

.project-info p {
    color: #888;
    margin-bottom: 1rem;
}

.project-tags {
    display: flex;
    gap: 0.5rem;
}

.project-tags span {
    padding: 0.25rem 0.75rem;
    background: #222;
    border-radius: 20px;
    font-size: 0.8rem;
    color: #00d9ff;
}

.skills-section {
    background: #111;
}

.skills-grid {
    max-width: 600px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.skill-bar {
    background: #222;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    position: relative;
    overflow: hidden;
}

.skill-bar::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    background: linear-gradient(90deg, #00d9ff, #8b5cf6);
    border-radius: 8px;
    width: 0;
    transition: width 1s ease;
}

.contact-section {
    text-align: center;
    background: linear-gradient(135deg, #0a0a0a, #1a1a1a);
}

.contact-section p {
    color: #888;
    margin-bottom: 2rem;
    font-size: 1.25rem;
}

footer {
    text-align: center;
    padding: 2rem;
    background: #0a0a0a;
    color: #666;
}

@media (max-width: 768px) {
    .hero-section {
        padding: 0 2rem;
    }
    
    .name {
        font-size: 2.5rem;
    }
    
    .hero-visual {
        display: none;
    }
    
    .nav-menu {
        display: none;
    }
}`,
        js: `// Smooth scroll for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Animate skill bars on scroll
const observerOptions = {
    threshold: 0.5
};

const skillsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const skillBars = document.querySelectorAll('.skill-bar');
            skillBars.forEach(bar => {
                const level = bar.getAttribute('data-level');
                bar.style.setProperty('--skill-width', level + '%');
                bar.classList.add('animate');
            });
        }
    });
}, observerOptions);

const skillsSection = document.querySelector('.skills-section');
if (skillsSection) {
    skillsObserver.observe(skillsSection);
}

// Add animated class to skill bars
document.querySelectorAll('.skill-bar').forEach(bar => {
    const level = bar.getAttribute('data-level');
    bar.style.cssText = '--skill-level: ' + level + '%;';
});

// Animate on scroll
const animateOnScroll = () => {
    const elements = document.querySelectorAll('.project-card, .about-section p');
    elements.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight - 100) {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }
    });
};

// Initial styling for animation
document.querySelectorAll('.project-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'all 0.6s ease';
});

window.addEventListener('scroll', animateOnScroll);
window.addEventListener('load', animateOnScroll);

// Animate skill bars when visible
const styleSheet = document.createElement('style');
styleSheet.textContent = \`
    .skill-bar.animate::before {
        width: var(--skill-level, 0%);
    }
\`;
document.head.appendChild(styleSheet);

console.log('Portfolio loaded successfully!');`
    },
    {
        id: "blog-layout",
        title: "Blog Layout",
        description: "Clean blog layout with typography focus",
        tags: ["HTML", "CSS", "Typography"],
        thumbnailUrl: "",
        html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>The Developer's Blog</title>
</head>
<body>
    <header class="site-header">
        <div class="container">
            <a href="#" class="logo">Dev Blog</a>
            <nav class="main-nav">
                <a href="#">Home</a>
                <a href="#">Articles</a>
                <a href="#">About</a>
                <a href="#">Subscribe</a>
            </nav>
        </div>
    </header>

    <main class="container">
        <article class="featured-post">
            <div class="post-meta">
                <span class="category">Development</span>
                <span class="date">January 2, 2024</span>
            </div>
            <h1>Building Modern Web Applications in 2024</h1>
            <p class="excerpt">An in-depth guide to the latest technologies, best practices, and tools for creating exceptional web experiences.</p>
            <div class="author">
                <div class="author-avatar">JD</div>
                <div class="author-info">
                    <span class="author-name">John Developer</span>
                    <span class="read-time">8 min read</span>
                </div>
            </div>
        </article>

        <section class="posts-grid">
            <h2 class="section-title">Latest Articles</h2>
            
            <div class="post-card">
                <div class="post-image"></div>
                <div class="post-content">
                    <span class="category">JavaScript</span>
                    <h3>Understanding Async/Await in Depth</h3>
                    <p>Master asynchronous JavaScript with practical examples and common patterns.</p>
                    <div class="post-footer">
                        <span class="date">Dec 28, 2023</span>
                        <span class="read-time">5 min read</span>
                    </div>
                </div>
            </div>

            <div class="post-card">
                <div class="post-image"></div>
                <div class="post-content">
                    <span class="category">CSS</span>
                    <h3>CSS Grid: The Complete Guide</h3>
                    <p>Everything you need to know about CSS Grid Layout for modern designs.</p>
                    <div class="post-footer">
                        <span class="date">Dec 25, 2023</span>
                        <span class="read-time">7 min read</span>
                    </div>
                </div>
            </div>

            <div class="post-card">
                <div class="post-image"></div>
                <div class="post-content">
                    <span class="category">React</span>
                    <h3>React Server Components Explained</h3>
                    <p>A deep dive into the future of React with server-side rendering.</p>
                    <div class="post-footer">
                        <span class="date">Dec 22, 2023</span>
                        <span class="read-time">6 min read</span>
                    </div>
                </div>
            </div>
        </section>

        <aside class="newsletter">
            <h3>Stay Updated</h3>
            <p>Get the latest articles delivered to your inbox.</p>
            <form class="newsletter-form">
                <input type="email" placeholder="Enter your email">
                <button type="submit">Subscribe</button>
            </form>
        </aside>
    </main>

    <footer class="site-footer">
        <div class="container">
            <p>&copy; 2024 Dev Blog. All rights reserved.</p>
            <div class="social-links">
                <a href="#">Twitter</a>
                <a href="#">GitHub</a>
                <a href="#">LinkedIn</a>
            </div>
        </div>
    </footer>
</body>
</html>`,
        css: `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Georgia', serif;
    background: #fafafa;
    color: #333;
    line-height: 1.7;
}

.container {
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 2rem;
}

/* Header */
.site-header {
    background: white;
    border-bottom: 1px solid #eee;
    padding: 1.5rem 0;
    position: sticky;
    top: 0;
    z-index: 100;
}

.site-header .container {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.logo {
    font-family: 'Segoe UI', sans-serif;
    font-size: 1.5rem;
    font-weight: 700;
    color: #333;
    text-decoration: none;
}

.main-nav {
    display: flex;
    gap: 2rem;
}

.main-nav a {
    text-decoration: none;
    color: #666;
    font-family: 'Segoe UI', sans-serif;
    font-size: 0.95rem;
    transition: color 0.3s;
}

.main-nav a:hover {
    color: #000;
}

/* Featured Post */
.featured-post {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 4rem;
    border-radius: 16px;
    margin: 3rem 0;
}

.post-meta {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
    font-family: 'Segoe UI', sans-serif;
    font-size: 0.875rem;
}

.category {
    background: rgba(255,255,255,0.2);
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
}

.date {
    opacity: 0.8;
}

.featured-post h1 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    line-height: 1.3;
}

.excerpt {
    font-size: 1.25rem;
    opacity: 0.9;
    margin-bottom: 2rem;
    max-width: 700px;
}

.author {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.author-avatar {
    width: 48px;
    height: 48px;
    background: rgba(255,255,255,0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Segoe UI', sans-serif;
    font-weight: 600;
}

.author-info {
    display: flex;
    flex-direction: column;
    font-family: 'Segoe UI', sans-serif;
}

.author-name {
    font-weight: 600;
}

.read-time {
    opacity: 0.8;
    font-size: 0.875rem;
}

/* Posts Grid */
.section-title {
    font-size: 1.5rem;
    margin-bottom: 2rem;
    font-family: 'Segoe UI', sans-serif;
    color: #333;
}

.posts-grid {
    margin: 3rem 0;
}

.post-card {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    display: flex;
    margin-bottom: 1.5rem;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    transition: transform 0.3s, box-shadow 0.3s;
}

.post-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.post-image {
    width: 280px;
    background: linear-gradient(135deg, #f5f5f5, #e0e0e0);
    flex-shrink: 0;
}

.post-content {
    padding: 1.5rem 2rem;
    display: flex;
    flex-direction: column;
}

.post-content .category {
    background: #f0f0f0;
    color: #667eea;
    width: fit-content;
    margin-bottom: 0.75rem;
    font-family: 'Segoe UI', sans-serif;
    font-size: 0.75rem;
    font-weight: 600;
}

.post-content h3 {
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
    color: #333;
    font-family: 'Segoe UI', sans-serif;
}

.post-content p {
    color: #666;
    font-size: 0.95rem;
    flex-grow: 1;
}

.post-footer {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
    font-family: 'Segoe UI', sans-serif;
    font-size: 0.85rem;
    color: #999;
}

/* Newsletter */
.newsletter {
    background: #333;
    color: white;
    padding: 3rem;
    border-radius: 12px;
    text-align: center;
    margin: 3rem 0;
}

.newsletter h3 {
    font-family: 'Segoe UI', sans-serif;
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
}

.newsletter p {
    opacity: 0.8;
    margin-bottom: 1.5rem;
}

.newsletter-form {
    display: flex;
    max-width: 400px;
    margin: 0 auto;
    gap: 0.5rem;
}

.newsletter-form input {
    flex: 1;
    padding: 0.75rem 1rem;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-family: 'Segoe UI', sans-serif;
}

.newsletter-form button {
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-family: 'Segoe UI', sans-serif;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.3s;
}

.newsletter-form button:hover {
    transform: scale(1.05);
}

/* Footer */
.site-footer {
    background: white;
    border-top: 1px solid #eee;
    padding: 2rem 0;
    margin-top: 3rem;
}

.site-footer .container {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.site-footer p {
    color: #999;
    font-family: 'Segoe UI', sans-serif;
    font-size: 0.875rem;
}

.social-links {
    display: flex;
    gap: 1.5rem;
}

.social-links a {
    color: #666;
    text-decoration: none;
    font-family: 'Segoe UI', sans-serif;
    font-size: 0.875rem;
    transition: color 0.3s;
}

.social-links a:hover {
    color: #667eea;
}

@media (max-width: 768px) {
    .featured-post {
        padding: 2rem;
    }
    
    .featured-post h1 {
        font-size: 1.75rem;
    }
    
    .post-card {
        flex-direction: column;
    }
    
    .post-image {
        width: 100%;
        height: 180px;
    }
    
    .newsletter-form {
        flex-direction: column;
    }
    
    .main-nav {
        display: none;
    }
}`,
        js: `// Animate elements on scroll
const animateOnScroll = () => {
    const elements = document.querySelectorAll('.post-card, .featured-post');
    elements.forEach(el => {
        const rect = el.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight - 100;
        
        if (isVisible && !el.classList.contains('animated')) {
            el.classList.add('animated');
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }
    });
};

// Initial setup for animations
document.querySelectorAll('.post-card').forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = \`all 0.5s ease \${index * 0.1}s\`;
});

window.addEventListener('scroll', animateOnScroll);
window.addEventListener('load', animateOnScroll);

// Newsletter form handling
document.querySelector('.newsletter-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = this.querySelector('input').value;
    if (email) {
        alert(\`Thanks for subscribing with \${email}! You'll receive our latest articles.\`);
        this.reset();
    }
});

// Reading time calculator (for demonstration)
const calculateReadTime = (text) => {
    const wordsPerMinute = 200;
    const wordCount = text.split(/\\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
};

// Smooth scroll for internal links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

console.log('Blog loaded successfully!');`
    }
];
