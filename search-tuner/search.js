// ========================================
// Search Engine with Configurable Scoring
// Implements BM25 + Field Boosting + Match Type Multipliers
// ========================================

class SearchEngine {
    constructor() {
        // Default field weights
        this.fieldWeights = {
            name: 100,
            category: 80,
            tags: 60,
            description: 40,
            reviews: 20
        };
        
        // Default match type multipliers
        this.matchMultipliers = {
            exact: 1.5,
            prefix: 1.2,
            contains: 1.0,
            fuzzy: 0.7
        };
        
        // BM25 parameters
        this.bm25Params = {
            k1: 1.2,  // Term frequency saturation (1.2-2.0 typical)
            b: 0.75   // Length normalization (0-1)
        };
        
        // Document stats for BM25
        this.avgDocLength = 0;
        this.docCount = 0;
        this.termDocFreq = new Map(); // term -> doc count containing term
    }
    
    // Initialize with documents for BM25 calculations
    initialize(documents) {
        this.docCount = documents.length;
        let totalLength = 0;
        this.termDocFreq.clear();
        
        documents.forEach(doc => {
            const text = this._getDocumentText(doc).toLowerCase();
            const terms = this._tokenize(text);
            totalLength += terms.length;
            
            // Count unique terms per document
            const uniqueTerms = new Set(terms);
            uniqueTerms.forEach(term => {
                this.termDocFreq.set(term, (this.termDocFreq.get(term) || 0) + 1);
            });
        });
        
        this.avgDocLength = totalLength / this.docCount;
    }
    
    // Get all searchable text from a document
    _getDocumentText(doc) {
        return [
            doc.name || '',
            doc.category || '',
            (doc.tags || []).join(' '),
            doc.description || '',
            (doc.reviews || []).join(' ')
        ].join(' ');
    }
    
    // Simple tokenizer
    _tokenize(text) {
        return text.toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(t => t.length > 1);
    }
    
    // Calculate IDF (Inverse Document Frequency)
    _calculateIDF(term) {
        const docFreq = this.termDocFreq.get(term.toLowerCase()) || 0;
        if (docFreq === 0) return 0;
        
        // BM25 IDF formula
        return Math.log((this.docCount - docFreq + 0.5) / (docFreq + 0.5) + 1);
    }
    
    // Calculate BM25 score for a term in a field
    _calculateBM25(fieldText, query) {
        const fieldTokens = this._tokenize(fieldText);
        const queryTokens = this._tokenize(query);
        const docLength = fieldTokens.length;
        
        if (docLength === 0) return 0;
        
        let score = 0;
        const termFreq = new Map();
        
        // Count term frequencies
        fieldTokens.forEach(token => {
            termFreq.set(token, (termFreq.get(token) || 0) + 1);
        });
        
        // Calculate BM25 for each query term
        queryTokens.forEach(queryTerm => {
            const tf = termFreq.get(queryTerm) || 0;
            if (tf === 0) return;
            
            const idf = this._calculateIDF(queryTerm);
            const { k1, b } = this.bm25Params;
            
            // BM25 formula
            const numerator = tf * (k1 + 1);
            const denominator = tf + k1 * (1 - b + b * (docLength / this.avgDocLength));
            
            score += idf * (numerator / denominator);
        });
        
        return score;
    }
    
    // Determine match type and score
    _getMatchType(fieldValue, query) {
        const fieldLower = fieldValue.toLowerCase();
        const queryLower = query.toLowerCase();
        
        // Exact match
        if (fieldLower === queryLower) {
            return { type: 'exact', multiplier: this.matchMultipliers.exact };
        }
        
        // Word-level exact match (for multi-word fields)
        const fieldWords = fieldLower.split(/\s+/);
        if (fieldWords.includes(queryLower)) {
            return { type: 'exact', multiplier: this.matchMultipliers.exact };
        }
        
        // Prefix match
        if (fieldLower.startsWith(queryLower)) {
            return { type: 'prefix', multiplier: this.matchMultipliers.prefix };
        }
        
        // Word starts with query
        if (fieldWords.some(w => w.startsWith(queryLower))) {
            return { type: 'prefix', multiplier: this.matchMultipliers.prefix };
        }
        
        // Contains match
        if (fieldLower.includes(queryLower)) {
            return { type: 'contains', multiplier: this.matchMultipliers.contains };
        }
        
        // Fuzzy match (Levenshtein distance)
        for (const word of fieldWords) {
            if (this._levenshteinDistance(word, queryLower) <= 2) {
                return { type: 'fuzzy', multiplier: this.matchMultipliers.fuzzy };
            }
        }
        
        return null;
    }
    
    // Levenshtein distance for fuzzy matching
    _levenshteinDistance(str1, str2) {
        const m = str1.length;
        const n = str2.length;
        
        // Quick checks
        if (m === 0) return n;
        if (n === 0) return m;
        if (Math.abs(m - n) > 2) return 999; // Too different
        
        const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
        
        for (let i = 0; i <= m; i++) dp[i][0] = i;
        for (let j = 0; j <= n; j++) dp[0][j] = j;
        
        for (let i = 1; i <= m; i++) {
            for (let j = 1; j <= n; j++) {
                const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
                dp[i][j] = Math.min(
                    dp[i - 1][j] + 1,      // deletion
                    dp[i][j - 1] + 1,      // insertion
                    dp[i - 1][j - 1] + cost // substitution
                );
            }
        }
        
        return dp[m][n];
    }
    
    // Score a single document
    scoreDocument(doc, query) {
        const breakdown = {};
        let totalScore = 0;
        
        // 1. Score name field
        if (doc.name) {
            const matchInfo = this._getMatchType(doc.name, query);
            if (matchInfo) {
                const bm25Score = this._calculateBM25(doc.name, query);
                const fieldScore = this.fieldWeights.name * matchInfo.multiplier * Math.max(bm25Score, 0.5);
                
                breakdown.name = {
                    fieldWeight: this.fieldWeights.name,
                    matchType: matchInfo.type,
                    matchMultiplier: matchInfo.multiplier,
                    bm25Score: bm25Score.toFixed(3),
                    fieldScore: fieldScore.toFixed(2),
                    matchedText: doc.name
                };
                totalScore += fieldScore;
            }
        }
        
        // 2. Score category field
        if (doc.category) {
            const matchInfo = this._getMatchType(doc.category, query);
            if (matchInfo) {
                const bm25Score = this._calculateBM25(doc.category, query);
                const fieldScore = this.fieldWeights.category * matchInfo.multiplier * Math.max(bm25Score, 0.5);
                
                breakdown.category = {
                    fieldWeight: this.fieldWeights.category,
                    matchType: matchInfo.type,
                    matchMultiplier: matchInfo.multiplier,
                    bm25Score: bm25Score.toFixed(3),
                    fieldScore: fieldScore.toFixed(2),
                    matchedText: doc.category
                };
                totalScore += fieldScore;
            }
        }
        
        // 3. Score tags (best matching tag)
        if (doc.tags && doc.tags.length > 0) {
            let bestTagScore = 0;
            let bestTagBreakdown = null;
            
            for (const tag of doc.tags) {
                const matchInfo = this._getMatchType(tag, query);
                if (matchInfo) {
                    const bm25Score = this._calculateBM25(tag, query);
                    const fieldScore = this.fieldWeights.tags * matchInfo.multiplier * Math.max(bm25Score, 0.5);
                    
                    if (fieldScore > bestTagScore) {
                        bestTagScore = fieldScore;
                        bestTagBreakdown = {
                            fieldWeight: this.fieldWeights.tags,
                            matchType: matchInfo.type,
                            matchMultiplier: matchInfo.multiplier,
                            bm25Score: bm25Score.toFixed(3),
                            fieldScore: fieldScore.toFixed(2),
                            matchedText: tag
                        };
                    }
                }
            }
            
            if (bestTagBreakdown) {
                breakdown.tags = bestTagBreakdown;
                totalScore += bestTagScore;
            }
        }
        
        // 4. Score description
        if (doc.description) {
            const descLower = doc.description.toLowerCase();
            const queryLower = query.toLowerCase();
            
            if (descLower.includes(queryLower)) {
                const bm25Score = this._calculateBM25(doc.description, query);
                const fieldScore = this.fieldWeights.description * this.matchMultipliers.contains * Math.max(bm25Score, 0.3);
                
                breakdown.description = {
                    fieldWeight: this.fieldWeights.description,
                    matchType: 'contains',
                    matchMultiplier: this.matchMultipliers.contains,
                    bm25Score: bm25Score.toFixed(3),
                    fieldScore: fieldScore.toFixed(2),
                    matchedText: this._extractMatchContext(doc.description, query)
                };
                totalScore += fieldScore;
            }
        }
        
        // 5. Score reviews
        if (doc.reviews && doc.reviews.length > 0) {
            let reviewMatches = 0;
            let matchedReviewTexts = [];
            
            for (const review of doc.reviews) {
                if (review.toLowerCase().includes(query.toLowerCase())) {
                    reviewMatches++;
                    matchedReviewTexts.push(this._extractMatchContext(review, query));
                }
            }
            
            if (reviewMatches > 0) {
                const bm25Score = this._calculateBM25(doc.reviews.join(' '), query);
                // Boost for multiple review mentions (diminishing returns)
                const reviewBoost = Math.min(1 + (reviewMatches * 0.2), 2.0);
                const fieldScore = this.fieldWeights.reviews * this.matchMultipliers.contains * Math.max(bm25Score, 0.3) * reviewBoost;
                
                breakdown.reviews = {
                    fieldWeight: this.fieldWeights.reviews,
                    matchType: 'contains',
                    matchMultiplier: this.matchMultipliers.contains,
                    bm25Score: bm25Score.toFixed(3),
                    fieldScore: fieldScore.toFixed(2),
                    matchCount: reviewMatches,
                    reviewBoost: reviewBoost.toFixed(2),
                    matchedTexts: matchedReviewTexts
                };
                totalScore += fieldScore;
            }
        }
        
        return {
            document: doc,
            totalScore: totalScore,
            breakdown: breakdown
        };
    }
    
    // Extract context around a match
    _extractMatchContext(text, query, contextLength = 50) {
        const lowerText = text.toLowerCase();
        const lowerQuery = query.toLowerCase();
        const idx = lowerText.indexOf(lowerQuery);
        
        if (idx === -1) return text.substring(0, contextLength) + '...';
        
        const start = Math.max(0, idx - 20);
        const end = Math.min(text.length, idx + query.length + 30);
        
        let result = '';
        if (start > 0) result += '...';
        result += text.substring(start, end);
        if (end < text.length) result += '...';
        
        return result;
    }
    
    // Main search function
    search(query, documents, limit = 50) {
        if (!query || query.trim().length === 0) {
            return [];
        }
        
        const startTime = performance.now();
        
        // Score all documents
        const scoredResults = documents
            .map(doc => this.scoreDocument(doc, query))
            .filter(result => result.totalScore > 0)
            .sort((a, b) => b.totalScore - a.totalScore)
            .slice(0, limit);
        
        // Normalize scores (0-100 scale based on top result)
        const maxScore = scoredResults.length > 0 ? scoredResults[0].totalScore : 1;
        scoredResults.forEach(result => {
            result.normalizedScore = (result.totalScore / maxScore) * 100;
        });
        
        const endTime = performance.now();
        
        return {
            results: scoredResults,
            query: query,
            totalMatches: scoredResults.length,
            searchTime: (endTime - startTime).toFixed(2)
        };
    }
    
    // Update configuration
    setFieldWeight(field, weight) {
        if (this.fieldWeights.hasOwnProperty(field)) {
            this.fieldWeights[field] = weight;
        }
    }
    
    setMatchMultiplier(matchType, multiplier) {
        if (this.matchMultipliers.hasOwnProperty(matchType)) {
            this.matchMultipliers[matchType] = multiplier;
        }
    }
    
    setBM25Param(param, value) {
        if (this.bm25Params.hasOwnProperty(param)) {
            this.bm25Params[param] = value;
        }
    }
    
    // Get current configuration
    getConfig() {
        return {
            fieldWeights: { ...this.fieldWeights },
            matchMultipliers: { ...this.matchMultipliers },
            bm25Params: { ...this.bm25Params }
        };
    }
    
    // Reset to defaults
    reset() {
        this.fieldWeights = {
            name: 100,
            category: 80,
            tags: 60,
            description: 40,
            reviews: 20
        };
        
        this.matchMultipliers = {
            exact: 1.5,
            prefix: 1.2,
            contains: 1.0,
            fuzzy: 0.7
        };
        
        this.bm25Params = {
            k1: 1.2,
            b: 0.75
        };
    }
}

// Export
window.SearchEngine = SearchEngine;
