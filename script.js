// Progress Tracking System
let progress = JSON.parse(localStorage.getItem('aiProfitProgress')) || {
    completedItems: [],
    fearAssessment: {},
    customPrompts: [],
    toolsSetup: {},
    weeklyProgress: {
        week1: [],
        week2: [],
        week3: [],
        week4: []
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeProgressBar();
    loadSavedProgress();
    setupEventListeners();
    updateProgressDisplay();
});

// Scroll to section function
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Progress Bar Functions
function initializeProgressBar() {
    updateProgressBar();
}

function updateProgressBar() {
    const totalCheckboxes = document.querySelectorAll('input[type="checkbox"]').length;
    const checkedBoxes = document.querySelectorAll('input[type="checkbox"]:checked').length;
    const percentage = totalCheckboxes > 0 ? Math.round((checkedBoxes / totalCheckboxes) * 100) : 0;

    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');

    if (progressBar && progressText) {
        progressBar.style.width = percentage + '%';
        progressText.textContent = percentage + '% Complete';
    }
}

// Mobile Menu Toggle
function toggleMenu() {
    const navMenu = document.querySelector('.nav-menu');
    const navToggle = document.querySelector('.nav-toggle');

    if (navMenu) {
        navMenu.classList.toggle('active');
    }
    if (navToggle) {
        navToggle.classList.toggle('active');
    }
}

// Week Tab Navigation
function showWeek(weekNumber) {
    // Hide all week contents
    const weekContents = document.querySelectorAll('.week-content');
    weekContents.forEach(content => {
        content.style.display = 'none';
    });

    // Remove active class from all tabs
    const weekTabs = document.querySelectorAll('.week-tab');
    weekTabs.forEach(tab => {
        tab.classList.remove('active');
    });

    // Show selected week content
    const selectedWeek = document.getElementById(`week${weekNumber}`);
    if (selectedWeek) {
        selectedWeek.style.display = 'block';
    }

    // Add active class to selected tab
    const selectedTab = document.querySelector(`.week-tab:nth-child(${weekNumber})`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
}

// ROI Calculator
function calculateROI() {
    const hoursSaved = parseFloat(document.getElementById('hoursSaved').value) || 0;
    const hourlyValue = parseFloat(document.getElementById('hourlyValue').value) || 0;
    const newLeads = parseFloat(document.getElementById('newLeads').value) || 0;
    const conversionRate = parseFloat(document.getElementById('conversionRate').value) || 0;
    const avgCommission = parseFloat(document.getElementById('avgCommission').value) || 0;

    // Calculate weekly value
    const weeklyTimeSavings = hoursSaved * hourlyValue;

    // Calculate monthly lead value
    const monthlyLeads = newLeads * 4;
    const conversions = monthlyLeads * (conversionRate / 100);
    const monthlyCommissions = conversions * avgCommission;

    // Calculate annual ROI
    const annualTimeSavings = weeklyTimeSavings * 52;
    const annualCommissions = monthlyCommissions * 12;
    const totalAnnualROI = annualTimeSavings + annualCommissions;

    // Update display
    document.getElementById('weeklyValue').textContent = `$${weeklyTimeSavings.toLocaleString()}`;
    document.getElementById('monthlyValue').textContent = `$${monthlyCommissions.toLocaleString()}`;
    document.getElementById('annualROI').textContent = `$${totalAnnualROI.toLocaleString()}`;

    // Update ROI bar visual
    const roiBar = document.querySelector('.roi-bar-fill');
    if (roiBar) {
        const maxROI = 500000; // Maximum for visual scale
        const barWidth = Math.min((totalAnnualROI / maxROI) * 100, 100);
        roiBar.style.width = barWidth + '%';
    }
}

// Prompt Library Management
let customPrompts = [];

function openPromptEditor(category = '', index = -1) {
    const modal = document.getElementById('promptModal');
    const categorySelect = document.getElementById('promptCategory');
    const titleInput = document.getElementById('promptTitle');
    const contentInput = document.getElementById('promptContent');

    if (modal) {
        modal.style.display = 'flex';

        if (category) {
            categorySelect.value = category;
        }

        if (index >= 0 && customPrompts[index]) {
            titleInput.value = customPrompts[index].title;
            contentInput.value = customPrompts[index].content;
            categorySelect.value = customPrompts[index].category;
        } else {
            titleInput.value = '';
            contentInput.value = '';
        }

        // Store current editing index
        modal.dataset.editIndex = index;
    }
}

function closePromptEditor() {
    const modal = document.getElementById('promptModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function savePrompt() {
    const modal = document.getElementById('promptModal');
    const category = document.getElementById('promptCategory').value;
    const title = document.getElementById('promptTitle').value;
    const content = document.getElementById('promptContent').value;
    const editIndex = parseInt(modal.dataset.editIndex);

    if (title && content) {
        const promptData = {
            category: category,
            title: title,
            content: content,
            timestamp: new Date().toISOString()
        };

        if (editIndex >= 0) {
            customPrompts[editIndex] = promptData;
        } else {
            customPrompts.push(promptData);
        }

        // Save to localStorage
        progress.customPrompts = customPrompts;
        localStorage.setItem('aiProfitProgress', JSON.stringify(progress));

        // Update display
        displayCustomPrompts();
        closePromptEditor();
    }
}

function displayCustomPrompts() {
    const container = document.getElementById('customPromptsList');
    if (!container) return;

    container.innerHTML = '';

    customPrompts.forEach((prompt, index) => {
        const promptCard = document.createElement('div');
        promptCard.className = 'prompt-card';
        promptCard.innerHTML = `
            <div class="prompt-header">
                <h4>${prompt.title}</h4>
                <span class="prompt-category">${prompt.category}</span>
            </div>
            <p class="prompt-content">${prompt.content}</p>
            <div class="prompt-actions">
                <button onclick="copyPrompt(${index})" class="btn-secondary">Copy</button>
                <button onclick="openPromptEditor('${prompt.category}', ${index})" class="btn-secondary">Edit</button>
                <button onclick="deletePrompt(${index})" class="btn-secondary">Delete</button>
            </div>
        `;
        container.appendChild(promptCard);
    });
}

function deletePrompt(index) {
    if (confirm('Are you sure you want to delete this prompt?')) {
        customPrompts.splice(index, 1);
        progress.customPrompts = customPrompts;
        localStorage.setItem('aiProfitProgress', JSON.stringify(progress));
        displayCustomPrompts();
    }
}

// Copy Functions
function copyPrompt(index) {
    let textToCopy = '';

    if (typeof index === 'string') {
        // Copying preset prompts
        const promptElement = document.querySelector(`[data-prompt="${index}"]`);
        if (promptElement) {
            textToCopy = promptElement.textContent;
        }
    } else {
        // Copying custom prompts
        if (customPrompts[index]) {
            textToCopy = customPrompts[index].content;
        }
    }

    if (textToCopy) {
        navigator.clipboard.writeText(textToCopy).then(() => {
            showNotification('Prompt copied to clipboard!');
        });
    }
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--primary-color);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Fear Assessment
function processFearAssessment() {
    const fearCheckboxes = document.querySelectorAll('.fear-item input[type="checkbox"]');
    const checkedFears = [];

    fearCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
            const label = checkbox.parentElement.textContent.trim();
            checkedFears.push(label);
        }
    });

    // Save to progress
    progress.fearAssessment = {
        fears: checkedFears,
        timestamp: new Date().toISOString()
    };
    localStorage.setItem('aiProfitProgress', JSON.stringify(progress));

    // Display results
    const resultsDiv = document.getElementById('fearResults');
    if (resultsDiv) {
        if (checkedFears.length === 0) {
            resultsDiv.innerHTML = '<p class="success">Great! You\'re ready to embrace AI with confidence!</p>';
        } else {
            resultsDiv.innerHTML = `
                <h4>Your Identified Concerns:</h4>
                <ul>${checkedFears.map(fear => `<li>${fear}</li>`).join('')}</ul>
                <p class="advice">Remember: These are common concerns that we'll address throughout the course. Each module is designed to help you overcome these specific challenges.</p>
            `;
        }
    }
}

// Save and Load Progress
function saveProgress() {
    // Collect all checkbox states
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const checkedIds = [];

    checkboxes.forEach(checkbox => {
        if (checkbox.checked && checkbox.id) {
            checkedIds.push(checkbox.id);
        }
    });

    progress.completedItems = checkedIds;

    // Save tool setup status
    const toolCheckboxes = document.querySelectorAll('.tool-checklist input[type="checkbox"]');
    const toolsStatus = {};
    toolCheckboxes.forEach(checkbox => {
        if (checkbox.name) {
            toolsStatus[checkbox.name] = checkbox.checked;
        }
    });
    progress.toolsSetup = toolsStatus;

    // Save to localStorage
    localStorage.setItem('aiProfitProgress', JSON.stringify(progress));
    showNotification('Progress saved successfully!');
}

function loadSavedProgress() {
    // Load checkbox states
    if (progress.completedItems) {
        progress.completedItems.forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox) {
                checkbox.checked = true;
            }
        });
    }

    // Load custom prompts
    if (progress.customPrompts) {
        customPrompts = progress.customPrompts;
        displayCustomPrompts();
    }

    // Load tools setup
    if (progress.toolsSetup) {
        Object.keys(progress.toolsSetup).forEach(toolName => {
            const checkbox = document.querySelector(`input[name="${toolName}"]`);
            if (checkbox) {
                checkbox.checked = progress.toolsSetup[toolName];
            }
        });
    }

    updateProgressDisplay();
}

function updateProgressDisplay() {
    updateProgressBar();
    updateDashboardStats();
}

function updateDashboardStats() {
    // Update tools setup count
    const toolsTotal = 5;
    const toolsCompleted = Object.values(progress.toolsSetup || {}).filter(v => v).length;
    const toolsElement = document.getElementById('toolsSetupCount');
    if (toolsElement) {
        toolsElement.textContent = `${toolsCompleted}/${toolsTotal}`;
    }

    // Update prompts count
    const promptsElement = document.getElementById('promptsCreatedCount');
    if (promptsElement) {
        promptsElement.textContent = customPrompts.length;
    }

    // Update overall progress
    const overallElement = document.getElementById('overallProgress');
    if (overallElement) {
        const totalCheckboxes = document.querySelectorAll('input[type="checkbox"]').length;
        const checkedBoxes = document.querySelectorAll('input[type="checkbox"]:checked').length;
        const percentage = totalCheckboxes > 0 ? Math.round((checkedBoxes / totalCheckboxes) * 100) : 0;
        overallElement.textContent = `${percentage}%`;
    }
}

// Export Functions
function exportProgress() {
    const dataStr = JSON.stringify(progress, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ai-profit-progress-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
}

function printCertificate() {
    const totalCheckboxes = document.querySelectorAll('input[type="checkbox"]').length;
    const checkedBoxes = document.querySelectorAll('input[type="checkbox"]:checked').length;
    const percentage = totalCheckboxes > 0 ? Math.round((checkedBoxes / totalCheckboxes) * 100) : 0;

    if (percentage < 80) {
        alert('Please complete at least 80% of the course to generate your certificate.');
        return;
    }

    const certificateWindow = window.open('', '_blank');
    certificateWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Certificate of Completion</title>
            <style>
                body {
                    font-family: 'Georgia', serif;
                    text-align: center;
                    padding: 50px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .certificate {
                    background: white;
                    color: #333;
                    padding: 60px;
                    border-radius: 20px;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                    max-width: 800px;
                    border: 10px solid gold;
                }
                h1 {
                    font-size: 48px;
                    margin-bottom: 20px;
                    color: #2563eb;
                }
                .date {
                    font-size: 18px;
                    margin-top: 40px;
                }
                .signature {
                    margin-top: 60px;
                    border-top: 2px solid #333;
                    width: 300px;
                    margin-left: auto;
                    margin-right: auto;
                    padding-top: 10px;
                }
            </style>
        </head>
        <body>
            <div class="certificate">
                <h1>Certificate of Completion</h1>
                <h2>AI Profit Accelerators for Real Estate</h2>
                <p style="font-size: 24px; margin: 40px 0;">This certifies that you have successfully completed</p>
                <p style="font-size: 20px;"><strong>${percentage}%</strong> of the course curriculum</p>
                <div class="date">Date: ${new Date().toLocaleDateString()}</div>
                <div class="signature">Edmund Bogen</div>
            </div>
        </body>
        </html>
    `);

    setTimeout(() => {
        certificateWindow.print();
    }, 500);
}

// Setup Event Listeners
function setupEventListeners() {
    // Mobile menu toggle
    const navToggle = document.getElementById('navToggle');
    if (navToggle) {
        navToggle.addEventListener('click', toggleMenu);
    }

    // Checkbox change listeners
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            updateProgressBar();
            saveProgress();
        });
    });

    // ROI Calculator inputs
    const calcInputs = ['hoursSaved', 'hourlyValue', 'newLeads', 'conversionRate', 'avgCommission'];
    calcInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', calculateROI);
        }
    });

    // Initial ROI calculation
    calculateROI();

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const target = document.getElementById(targetId);
            if (target) {
                // Close mobile menu if open
                const navMenu = document.querySelector('.nav-menu');
                const navToggle = document.querySelector('.nav-toggle');
                if (navMenu && navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                }
                if (navToggle && navToggle.classList.contains('active')) {
                    navToggle.classList.remove('active');
                }
                // Scroll to target
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Modal close on outside click
    const modal = document.getElementById('promptModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closePromptEditor();
            }
        });
    }
}

// Calculate Metrics for Integration Section
function calculateMetrics() {
    const timeSaved = parseFloat(document.getElementById('kpi-time').value) || 0;
    const newLeads = parseFloat(document.getElementById('kpi-leads').value) || 0;
    const responseImprove = parseFloat(document.getElementById('kpi-response').value) || 0;
    const satisfaction = parseFloat(document.getElementById('kpi-satisfaction').value) || 0;

    // Calculate impact
    const hourlyRate = 100; // Assumed hourly value
    const weeklySavings = timeSaved * hourlyRate;
    const monthlySavings = weeklySavings * 4;
    const yearlySavings = monthlySavings * 12;

    // Lead value calculation
    const avgDealValue = 10000; // Assumed average commission per deal
    const conversionRate = 0.05; // 5% conversion rate
    const leadValue = newLeads * conversionRate * avgDealValue;

    // Total impact
    const totalImpact = yearlySavings + (leadValue * 12);

    // Display results
    const resultsDiv = document.getElementById('metricsResults');
    if (resultsDiv) {
        resultsDiv.innerHTML = `
            <h4>Your AI Impact Analysis</h4>
            <div style="display: grid; gap: 1rem; margin-top: 1rem;">
                <div>
                    <strong>Time Value:</strong> $${weeklySavings.toLocaleString()}/week
                </div>
                <div>
                    <strong>Lead Value:</strong> $${leadValue.toLocaleString()}/month
                </div>
                <div>
                    <strong>Response Time:</strong> ${responseImprove}% faster
                </div>
                <div>
                    <strong>Client Satisfaction:</strong> ${satisfaction}/10
                </div>
                <div style="padding-top: 1rem; border-top: 2px solid #e5e7eb;">
                    <strong>Total Annual Impact:</strong> $${totalImpact.toLocaleString()}
                </div>
            </div>
        `;
        resultsDiv.classList.add('show');
    }
}

// Update Challenge Progress
function updateChallenge() {
    const days = parseInt(document.getElementById('challenge-days').value) || 0;
    const percentage = Math.min(Math.round((days / 90) * 100), 100);

    const fillBar = document.getElementById('challengeFill');
    const statusText = document.getElementById('challengeStatus');

    if (fillBar) {
        fillBar.style.width = percentage + '%';
    }

    if (statusText) {
        let message = '';
        if (percentage === 0) {
            message = 'Ready to start your 90-day journey!';
        } else if (percentage < 25) {
            message = `${percentage}% Complete - Great start! Keep building momentum!`;
        } else if (percentage < 50) {
            message = `${percentage}% Complete - You're making excellent progress!`;
        } else if (percentage < 75) {
            message = `${percentage}% Complete - Over halfway there! Stay focused!`;
        } else if (percentage < 100) {
            message = `${percentage}% Complete - Final stretch! You're almost there!`;
        } else {
            message = '100% Complete - Congratulations! You're an AI Master! 🎉';
        }
        statusText.textContent = message;
    }
}

// Download Toolkit Function
function downloadToolkit() {
    // Create a sample toolkit content
    const toolkitContent = `
AI PROFIT ACCELERATORS TOOLKIT
================================

Your Complete Resource Library

1. ESSENTIAL PROMPTS
-------------------
• Lie Detector Prompt Template
• Virtual Staging Instructions
• CMA Generation Framework
• Message Summarization Guide
• Lead Scoring Criteria

2. WORKFLOW TEMPLATES
--------------------
• Daily AI Routine Checklist
• Weekly Implementation Plan
• Monthly Review Template
• Quarterly Goal Setting

3. BEST PRACTICES
----------------
• Prompt Engineering Tips
• Tool Integration Guide
• Client Communication Scripts
• ROI Tracking Spreadsheet

4. ADVANCED STRATEGIES
---------------------
• Chain-of-Thought Examples
• Role-Based Prompting
• Few-Shot Learning Templates
• Constraint-Based Prompts

5. RESOURCES
-----------
• Tool Comparison Chart
• Implementation Timeline
• Troubleshooting Guide
• Community Forum Links

Generated on: ${new Date().toLocaleDateString()}

© 2025 AI Profit Accelerators
    `;

    // Create blob and download
    const blob = new Blob([toolkitContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AI-Toolkit-${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);

    showNotification('Toolkit downloaded successfully!');
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);