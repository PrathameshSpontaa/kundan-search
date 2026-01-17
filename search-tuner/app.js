// ========================================
// Search Relevance Tuner - Main Application
// ========================================

class SearchTunerApp {
    constructor() {
        this.searchEngine = new SearchEngine();
        this.locations = window.LOCATIONS || [];
        this.selectedResult = null;
        this.currentView = 'cards';
        
        this.init();
    }
    
    init() {
        // Initialize search engine with documents
        this.searchEngine.initialize(this.locations);
        
        // Setup UI
        this.setupControlPanel();
        this.setupSearchBox();
        this.setupModal();
        this.setupViewToggles();
        
        // Update data count
        document.getElementById('dataCount').textContent = `${this.locations.length.toLocaleString()} locations`;
    }
    
    setupControlPanel() {
        this.renderFieldWeights();
        this.renderMatchMultipliers();
        this.renderBM25Params();
        
        // Reset button
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.searchEngine.reset();
            this.renderFieldWeights();
            this.renderMatchMultipliers();
            this.renderBM25Params();
            this.rerunSearch();
            this.showToast('Reset to default values');
        });
        
        // Export button
        document.getElementById('exportBtn').addEventListener('click', () => {
            const config = this.searchEngine.getConfig();
            navigator.clipboard.writeText(JSON.stringify(config, null, 2));
            this.showToast('Configuration copied to clipboard!');
        });
    }
    
    renderFieldWeights() {
        const container = document.getElementById('fieldWeights');
        const weights = this.searchEngine.fieldWeights;
        const icons = { name: '📛', category: '🏷️', tags: '🔖', description: '📝', reviews: '⭐' };
        
        container.innerHTML = Object.entries(weights).map(([field, value]) => `
            <div class="weight-item">
                <div class="weight-header">
                    <span class="weight-label">${icons[field] || ''} ${field}</span>
                    <span class="weight-value" id="value-${field}">${value}</span>
                </div>
                <input type="range" class="weight-slider" 
                    id="weight-${field}" 
                    min="0" max="200" value="${value}"
                    data-field="${field}" data-type="fieldWeight">
            </div>
        `).join('');
        
        container.querySelectorAll('.weight-slider').forEach(slider => {
            slider.addEventListener('input', (e) => this.handleSliderChange(e));
        });
    }
    
    renderMatchMultipliers() {
        const container = document.getElementById('matchMultipliers');
        const multipliers = this.searchEngine.matchMultipliers;
        const colors = { exact: '#10b981', prefix: '#3b82f6', contains: '#8b5cf6', fuzzy: '#f59e0b' };
        
        container.innerHTML = Object.entries(multipliers).map(([type, value]) => `
            <div class="weight-item">
                <div class="weight-header">
                    <span class="weight-label">
                        <span class="match-badge ${type}">${type}</span>
                    </span>
                    <span class="weight-value" id="value-${type}">×${value.toFixed(1)}</span>
                </div>
                <input type="range" class="weight-slider" 
                    id="mult-${type}" 
                    min="0" max="30" value="${value * 10}"
                    data-type="matchMultiplier" data-match="${type}">
            </div>
        `).join('');
        
        container.querySelectorAll('.weight-slider').forEach(slider => {
            slider.addEventListener('input', (e) => this.handleSliderChange(e));
        });
    }
    
    renderBM25Params() {
        const container = document.getElementById('bm25Params');
        const params = this.searchEngine.bm25Params;
        
        container.innerHTML = `
            <div class="weight-item">
                <div class="weight-header">
                    <span class="weight-label">k1 (term freq saturation)</span>
                    <span class="weight-value" id="value-k1">${params.k1.toFixed(1)}</span>
                </div>
                <input type="range" class="weight-slider" 
                    id="bm25-k1" min="0" max="30" value="${params.k1 * 10}"
                    data-type="bm25" data-param="k1">
            </div>
            <div class="weight-item">
                <div class="weight-header">
                    <span class="weight-label">b (length normalization)</span>
                    <span class="weight-value" id="value-b">${params.b.toFixed(2)}</span>
                </div>
                <input type="range" class="weight-slider" 
                    id="bm25-b" min="0" max="100" value="${params.b * 100}"
                    data-type="bm25" data-param="b">
            </div>
        `;
        
        container.querySelectorAll('.weight-slider').forEach(slider => {
            slider.addEventListener('input', (e) => this.handleSliderChange(e));
        });
    }
    
    handleSliderChange(e) {
        const slider = e.target;
        const type = slider.dataset.type;
        const value = parseFloat(slider.value);
        
        if (type === 'fieldWeight') {
            const field = slider.dataset.field;
            this.searchEngine.setFieldWeight(field, value);
            document.getElementById(`value-${field}`).textContent = value;
        } else if (type === 'matchMultiplier') {
            const match = slider.dataset.match;
            const actualValue = value / 10;
            this.searchEngine.setMatchMultiplier(match, actualValue);
            document.getElementById(`value-${match}`).textContent = `×${actualValue.toFixed(1)}`;
        } else if (type === 'bm25') {
            const param = slider.dataset.param;
            const actualValue = param === 'k1' ? value / 10 : value / 100;
            this.searchEngine.setBM25Param(param, actualValue);
            document.getElementById(`value-${param}`).textContent = actualValue.toFixed(param === 'k1' ? 1 : 2);
        }
        
        this.rerunSearch();
    }
    
    setupSearchBox() {
        const input = document.getElementById('searchInput');
        let debounceTimer;
        
        input.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => this.performSearch(e.target.value), 150);
        });
        
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                clearTimeout(debounceTimer);
                this.performSearch(e.target.value);
            }
        });
        
        // Suggestion clicks
        document.getElementById('suggestions').addEventListener('click', (e) => {
            if (e.target.classList.contains('suggestion')) {
                const query = e.target.dataset.query;
                input.value = query;
                this.performSearch(query);
            }
        });
    }
    
    performSearch(query) {
        this.currentQuery = query;
        
        if (!query || query.trim().length === 0) {
            this.renderEmptyState();
            return;
        }
        
        const searchResult = this.searchEngine.search(query, this.locations);
        this.renderResults(searchResult);
    }
    
    rerunSearch() {
        if (this.currentQuery) {
            this.performSearch(this.currentQuery);
        }
    }
    
    renderEmptyState() {
        document.getElementById('resultCount').textContent = '0 results';
        document.getElementById('searchTime').textContent = '0ms';
        document.getElementById('resultsContainer').innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🔍</div>
                <h3>Start searching</h3>
                <p>Type a query above to see results with detailed scoring breakdown</p>
            </div>
        `;
        this.renderBreakdownPlaceholder();
    }
    
    renderResults(searchResult) {
        const { results, totalMatches, searchTime } = searchResult;
        
        document.getElementById('resultCount').textContent = `${totalMatches} results`;
        document.getElementById('searchTime').textContent = `${searchTime}ms`;
        
        if (results.length === 0) {
            document.getElementById('resultsContainer').innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">😕</div>
                    <h3>No results found</h3>
                    <p>Try adjusting your search or weights</p>
                </div>
            `;
            return;
        }
        
        const container = document.getElementById('resultsContainer');
        container.innerHTML = `<div class="results-grid">${results.map((r, i) => this.renderResultCard(r, i + 1)).join('')}</div>`;
        
        // Add click handlers
        container.querySelectorAll('.result-card').forEach(card => {
            card.addEventListener('click', () => {
                const idx = parseInt(card.dataset.index);
                this.selectResult(results[idx]);
                
                container.querySelectorAll('.result-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
            });
        });
        
        // Auto-select first result
        if (results.length > 0) {
            this.selectResult(results[0]);
            container.querySelector('.result-card')?.classList.add('selected');
        }
    }
    
    renderResultCard(result, rank) {
        const doc = result.document;
        const type = window.LOCATION_TYPES[doc.category] || { icon: '📍', color: '#666' };
        const query = this.currentQuery || '';
        
        const highlightText = (text) => {
            if (!query) return text;
            const regex = new RegExp(`(${query})`, 'gi');
            return text.replace(regex, '<mark>$1</mark>');
        };
        
        return `
            <div class="result-card" data-index="${rank - 1}">
                <span class="result-rank">#${rank}</span>
                <div class="result-header">
                    <div class="result-icon" style="background: ${type.color}22; color: ${type.color}">
                        ${type.icon}
                    </div>
                    <div class="result-title-section">
                        <div class="result-name">${highlightText(doc.name)}</div>
                        <div class="result-category">${highlightText(doc.category)} • ${doc.location}</div>
                    </div>
                </div>
                <div class="result-meta">
                    ${doc.tags.slice(0, 4).map(tag => `<span class="result-tag">${highlightText(tag)}</span>`).join('')}
                </div>
                <div class="result-score-bar">
                    <div class="score-bar-bg">
                        <div class="score-bar-fill" style="width: ${result.normalizedScore}%"></div>
                    </div>
                    <span class="score-value">${result.totalScore.toFixed(1)}</span>
                </div>
            </div>
        `;
    }
    
    selectResult(result) {
        this.selectedResult = result;
        this.renderBreakdown(result);
    }
    
    renderBreakdownPlaceholder() {
        document.getElementById('breakdownPanel').innerHTML = `
            <div class="breakdown-placeholder">
                <div class="placeholder-icon">📊</div>
                <p>Click on a result to see detailed score breakdown</p>
            </div>
        `;
    }
    
    renderBreakdown(result) {
        const doc = result.document;
        const breakdown = result.breakdown;
        const panel = document.getElementById('breakdownPanel');
        
        const fieldOrder = ['name', 'category', 'tags', 'description', 'reviews'];
        const matchedFields = fieldOrder.filter(f => breakdown[f]);
        
        panel.innerHTML = `
            <div class="breakdown-header">
                <div class="breakdown-title">${doc.name}</div>
                <div class="breakdown-subtitle">${doc.category} • ${doc.location}</div>
            </div>
            
            <div class="breakdown-total">
                <span class="breakdown-total-label">Total Score</span>
                <span class="breakdown-total-value">${result.totalScore.toFixed(2)}</span>
            </div>
            
            <div class="breakdown-section">
                <div class="breakdown-section-title">Field Contributions</div>
                ${matchedFields.map(field => this.renderFieldBreakdown(field, breakdown[field])).join('')}
            </div>
            
            ${this.renderUnmatchedFields(breakdown)}
        `;
    }
    
    renderFieldBreakdown(field, data) {
        const icons = { name: '📛', category: '🏷️', tags: '🔖', description: '📝', reviews: '⭐' };
        
        return `
            <div class="breakdown-item">
                <div class="breakdown-item-header">
                    <span class="breakdown-item-field">${icons[field]} ${field}</span>
                    <span class="breakdown-item-score">+${parseFloat(data.fieldScore).toFixed(2)}</span>
                </div>
                <div class="breakdown-item-details">
                    <div class="breakdown-item-calc">
                        <span class="calc-part">${data.fieldWeight}</span>
                        <span class="calc-operator">×</span>
                        <span class="calc-part"><span class="match-badge ${data.matchType}">${data.matchType}</span> ${data.matchMultiplier}</span>
                        <span class="calc-operator">×</span>
                        <span class="calc-part">BM25: ${data.bm25Score}</span>
                        ${data.reviewBoost ? `<span class="calc-operator">×</span><span class="calc-part">boost: ${data.reviewBoost}</span>` : ''}
                    </div>
                    <div style="margin-top: 8px; color: var(--text-secondary); font-size: 0.8rem;">
                        "${data.matchedText || data.matchedTexts?.[0] || ''}"
                        ${data.matchCount ? ` (${data.matchCount} reviews)` : ''}
                    </div>
                </div>
            </div>
        `;
    }
    
    renderUnmatchedFields(breakdown) {
        const allFields = ['name', 'category', 'tags', 'description', 'reviews'];
        const unmatched = allFields.filter(f => !breakdown[f]);
        
        if (unmatched.length === 0) return '';
        
        return `
            <div class="breakdown-section">
                <div class="breakdown-section-title">No Match</div>
                ${unmatched.map(field => `
                    <div class="breakdown-item" style="opacity: 0.5;">
                        <div class="breakdown-item-header">
                            <span class="breakdown-item-field">${field}</span>
                            <span class="no-match">—</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    setupModal() {
        const overlay = document.getElementById('modalOverlay');
        const closeBtn = document.getElementById('modalClose');
        const infoBtn = document.getElementById('formulaInfo');
        
        infoBtn.addEventListener('click', () => overlay.classList.add('visible'));
        closeBtn.addEventListener('click', () => overlay.classList.remove('visible'));
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.classList.remove('visible');
        });
    }
    
    setupViewToggles() {
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentView = btn.dataset.view;
            });
        });
    }
    
    showToast(message) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.classList.add('visible');
        setTimeout(() => toast.classList.remove('visible'), 2000);
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new SearchTunerApp();
});
