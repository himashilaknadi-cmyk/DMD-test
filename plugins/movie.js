// plugins/movie.js
const axios = require('axios');
const cheerio = require('cheerio');

const movie = {
    name: 'movie',
    commands: [
        'movie', 'mv', 'film', 'films',
        'cinesubz', 'baiscope', 'sinhalasub',
        'piratelk', 'cineru', 'filmizill',
        'lankafilm', 'sinhalafilm'
    ],

    async execute({ sock, msg, from, arg, config, command, db }) {
        if (!arg) {
            const siteList = [
                'cinesubz', 'baiscope', 'sinhalasub', 
                'piratelk', 'cineru', 'filmizill', 'lankafilm'
            ];
            
            let text = `🎬 *DULANTHA MD MOVIE COMMANDS*\n\n`;
            text += `📌 *Search All Sites:*\n`;
            text += `${config.PREFIX}movie <name>\n\n`;
            text += `📌 *Search Specific Site:*\n`;
            siteList.forEach(site => {
                text += `${config.PREFIX}${site} <name>\n`;
            });
            text += `\n> DULANTHA MD`;
            
            return sock.sendMessage(from, { text }, { quoted: msg });
        }

        const searchQuery = arg;
        const useButtons = db?.settings?.button !== false; // Default: buttons ON

        // Site mapping
        const siteMap = {
            'cinesubz': { name: '🎬 CineSubz', func: searchCinesubz, color: '🔵' },
            'baiscope': { name: '🎥 Baiscope', func: searchBaiscope, color: '🟢' },
            'sinhalasub': { name: '📺 Sinhala Subz', func: searchSinhalaSubz, color: '🟡' },
            'piratelk': { name: '🏴‍☠️ PirateLK', func: searchPirateLK, color: '⚫' },
            'cineru': { name: '🎞️ CineRu', func: searchCineRu, color: '🟣' },
            'filmizill': { name: '🎬 Filmizill', func: searchFilmizill, color: '🔴' },
            'lankafilm': { name: '🇱🇰 Lanka Film', func: searchLankaFilm, color: '🟠' }
        };

        try {
            if (command === 'movie' || command === 'mv' || command === 'film' || command === 'films') {
                // Search ALL sites
                await sock.sendMessage(from, { 
                    text: `🔍 *Searching ALL Lanka film sites for "${searchQuery}"...*\n\n⏳ Please wait 10-15 seconds...` 
                });

                let allResults = [];
                let activeSites = 0;

                for (const [key, site] of Object.entries(siteMap)) {
                    try {
                        const results = await site.func(searchQuery);
                        if (results.length > 0) {
                            allResults.push({
                                source: site.name,
                                color: site.color,
                                key: key,
                                movies: results.slice(0, 5)
                            });
                            activeSites++;
                        }
                    } catch (e) {
                        console.log(`${site.name} failed:`, e.message);
                    }
                }

                if (allResults.length === 0) {
                    return sock.sendMessage(from, { 
                        text: '❌ *No movies found!*\n\nTry:\n• Different spelling\n• English name\n• Search specific site' 
                    });
                }

                if (useButtons) {
                    // ============ BUTTON MODE ============
                    // Save results for button handling
                    if (!global.movieResults) global.movieResults = {};
                    global.movieResults[from] = allResults;

                    // Create quality selection buttons
                    const qualityButtons = [
                        { buttonId: 'quality_all', buttonText: { displayText: '📥 ALL RESULTS' }, type: 1 },
                        { buttonId: 'quality_720p', buttonText: { displayText: '🎯 720p HD' }, type: 1 },
                        { buttonId: 'quality_1080p', buttonText: { displayText: '🎯 1080p FHD' }, type: 1 },
                        { buttonId: 'quality_480p', buttonText: { displayText: '🎯 480p SD' }, type: 1 },
                        { buttonId: 'quality_4k', buttonText: { displayText: '🎯 4K UHD' }, type: 1 }
                    ];

                    // Site selection buttons
                    const siteButtons = allResults.slice(0, 3).map((result, i) => ({
                        buttonId: `site_${result.key}`,
                        buttonText: { displayText: `${result.color} ${result.source}` },
                        type: 1
                    }));

                    let summary = `🎬 *SEARCH RESULTS: "${searchQuery}"*\n\n`;
                    summary += `📊 Found on *${activeSites}* sites\n`;
                    summary += `📑 Total: *${allResults.reduce((sum, r) => sum + r.movies.length, 0)}* movies\n\n`;
                    summary += `━━━━━━━━━━━━━━━━━━\n`;
                    
                    allResults.forEach((result, idx) => {
                        summary += `${result.color} *${result.source}* (${result.movies.length} found)\n`;
                        result.movies.slice(0, 2).forEach((m, i) => {
                            summary += `  ${idx+1}.${i+1} ${m.title.substring(0, 40)}\n`;
                        });
                        summary += `\n`;
                    });
                    
                    summary += `━━━━━━━━━━━━━━━━━━\n`;
                    summary += `📌 *Select site below for full list*\n`;
                    summary += `📌 *Or select quality to filter downloads*\n`;
                    summary += `> DULANTHA MD`;

                    await sock.sendMessage(from, {
                        image: allResults[0]?.movies[0]?.img ? { url: allResults[0].movies[0].img } : undefined,
                        caption: summary,
                        footer: 'DULANTHA MD | Movie Bot',
                        buttons: [...siteButtons, ...qualityButtons],
                        headerType: 4
                    }, { quoted: msg });

                } else {
                    // ============ TEXT MODE (Non-Button) ============
                    let text = `🎬 *SEARCH RESULTS: "${searchQuery}"*\n\n`;
                    text += `📊 Found on *${activeSites}* sites\n\n`;
                    
                    allResults.forEach((result, idx) => {
                        text += `━━━ ${result.source} ━━━\n`;
                        result.movies.forEach((m, i) => {
                            text += `*${idx+1}.${i+1}* ${m.title}\n`;
                            text += `📊 Quality: ${m.quality || 'HD'}\n`;
                            if (m.size) text += `📦 ${m.size}\n`;
                            text += `🔗 ${m.link}\n\n`;
                        });
                    });
                    
                    text += `━━━━━━━━━━━━━━━━━━━━━━\n`;
                    text += `📌 *Reply with:*\n`;
                    text += `• Number (e.g., 1.2) for details\n`;
                    text += `• "quality 1080p" to filter\n`;
                    text += `• Site name for specific results\n`;
                    text += `> DULANTHA MD`;

                    await sock.sendMessage(from, { text }, { quoted: msg });
                }

            } else if (siteMap[command]) {
                // Search specific site
                const site = siteMap[command];
                await sock.sendMessage(from, { 
                    text: `🔍 *Searching ${site.name} for "${searchQuery}"...*` 
                });

                const results = await site.func(searchQuery);

                if (results.length === 0) {
                    return sock.sendMessage(from, { 
                        text: `❌ *No results on ${site.name}!*\n\nTry: ${config.PREFIX}movie ${searchQuery} (all sites)` 
                    });
                }

                if (useButtons) {
                    // Save for button handling
                    if (!global.movieSiteResults) global.movieSiteResults = {};
                    global.movieSiteResults[from] = {
                        site: site.name,
                        movies: results
                    };

                    // Create quality buttons
                    const qualityButtons = results.slice(0, 5).map((m, i) => ({
                        buttonId: `download_${i}`,
                        buttonText: { displayText: `📥 ${m.title.substring(0, 25)}` },
                        type: 1
                    }));

                    // Add quality filter buttons
                    qualityButtons.push(
                        { buttonId: `filter_720p`, buttonText: { displayText: '🎯 720p' }, type: 1 },
                        { buttonId: `filter_1080p`, buttonText: { displayText: '🎯 1080p' }, type: 1 },
                        { buttonId: `filter_480p`, buttonText: { displayText: '🎯 480p' }, type: 1 }
                    );

                    let caption = `${site.color} *${site.name} RESULTS: "${searchQuery}"*\n\n`;
                    results.forEach((m, i) => {
                        caption += `*${i+1}.* ${m.title}\n`;
                        caption += `📊 Quality: ${m.quality || 'Check link'}\n`;
                        if (m.size) caption += `📦 Size: ${m.size}\n`;
                        caption += `\n`;
                    });
                    caption += `━━━━━━━━━━━━━━━━━━\n`;
                    caption += `📌 *Click movie name to get download links*\n`;
                    caption += `📌 *Or filter by quality below*\n`;
                    caption += `> DULANTHA MD`;

                    await sock.sendMessage(from, {
                        image: results[0]?.img ? { url: results[0].img } : undefined,
                        caption,
                        footer: `DULANTHA MD | ${site.name}`,
                        buttons: qualityButtons,
                        headerType: 4
                    }, { quoted: msg });

                } else {
                    let text = `${site.color} *${site.name} RESULTS: "${searchQuery}"*\n\n`;
                    results.forEach((m, i) => {
                        text += `*${i+1}.* ${m.title}\n`;
                        text += `📊 Quality: ${m.quality || 'Check link'}\n`;
                        if (m.size) text += `📦 Size: ${m.size}\n`;
                        text += `🔗 ${m.link}\n\n`;
                    });
                    text += `━━━━━━━━━━━━━━━━━━\n`;
                    text += `📌 *Reply with a number for download links*\n`;
                    text += `> DULANTHA MD`;

                    await sock.sendMessage(from, { text }, { quoted: msg });
                }
            }

        } catch (e) {
            console.log('Movie search error:', e);
            await sock.sendMessage(from, { text: `❌ *Error: ${e.message}*\nPlease try again later.` });
        }
    },

    // ============ BUTTON HANDLER ============
    async onButton({ sock, msg, from, buttonId, config, db }) {
        const useButtons = true;

        // Handle quality filter buttons
        if (buttonId.startsWith('quality_')) {
            const quality = buttonId.replace('quality_', '');
            const allResults = global.movieResults?.[from];
            
            if (!allResults) {
                return sock.sendMessage(from, { text: '❌ *Session expired! Please search again.*' });
            }

            if (quality === 'all') {
                // Show all results
                let text = `🎬 *ALL RESULTS*\n\n`;
                allResults.forEach((result, idx) => {
                    text += `━━━ ${result.source} ━━━\n`;
                    result.movies.forEach((m, i) => {
                        text += `*${idx+1}.${i+1}* ${m.title}\n🔗 ${m.link}\n\n`;
                    });
                });
                text += `> DULANTHA MD`;
                await sock.sendMessage(from, { text });
            } else {
                // Filter by quality
                let text = `🎬 *FILTERED: ${quality.toUpperCase()} QUALITY*\n\n`;
                let found = false;
                
                allResults.forEach((result) => {
                    const filtered = result.movies.filter(m => 
                        (m.quality || '').toLowerCase().includes(quality.toLowerCase()) ||
                        m.title.toLowerCase().includes(quality.toLowerCase())
                    );
                    
                    if (filtered.length > 0) {
                        found = true;
                        text += `━━━ ${result.source} ━━━\n`;
                        filtered.forEach((m, i) => {
                            text += `*${i+1}.* ${m.title}\n`;
                            text += `📊 ${m.quality || quality}\n`;
                            text += `🔗 ${m.link}\n\n`;
                        });
                    }
                });
                
                if (!found) {
                    text += `❌ No ${quality.toUpperCase()} quality movies found!\n`;
                }
                
                text += `> DULANTHA MD`;
                await sock.sendMessage(from, { text });
            }
        }

        // Handle site-specific buttons
        if (buttonId.startsWith('site_')) {
            const siteKey = buttonId.replace('site_', '');
            const allResults = global.movieResults?.[from];
            
            if (!allResults) {
                return sock.sendMessage(from, { text: '❌ *Session expired! Please search again.*' });
            }

            const siteResult = allResults.find(r => r.key === siteKey);
            if (siteResult) {
                let text = `${siteResult.color} *${siteResult.source}*\n\n`;
                siteResult.movies.forEach((m, i) => {
                    text += `*${i+1}.* ${m.title}\n`;
                    text += `📊 ${m.quality || 'HD'}\n`;
                    if (m.size) text += `📦 ${m.size}\n`;
                    text += `🔗 ${m.link}\n\n`;
                });
                text += `> DULANTHA MD`;

                // Also create download buttons for each movie
                const downloadButtons = siteResult.movies.slice(0, 3).map((m, i) => ({
                    buttonId: `getlink_${siteKey}_${i}`,
                    buttonText: { displayText: `📥 DL ${m.title.substring(0, 20)}` },
                    type: 1
                }));

                await sock.sendMessage(from, {
                    text,
                    footer: `DULANTHA MD | ${siteResult.source}`,
                    buttons: downloadButtons.length > 0 ? downloadButtons : undefined
                });
            }
        }

        // Handle download link buttons
        if (buttonId.startsWith('download_') || buttonId.startsWith('getlink_')) {
            const parts = buttonId.split('_');
            const index = parseInt(parts[parts.length - 1]);
            const siteKey = parts.length > 2 ? parts[1] : null;
            
            let movies;
            if (siteKey) {
                const allResults = global.movieResults?.[from];
                const siteResult = allResults?.find(r => r.key === siteKey);
                movies = siteResult?.movies;
            } else {
                const siteResults = global.movieSiteResults?.[from];
                movies = siteResults?.movies;
            }

            if (movies && movies[index]) {
                const movie = movies[index];
                await sock.sendMessage(from, { text: `⏳ *Fetching download links for:* ${movie.title}...` });

                try {
                    const downloadLinks = await getDownloadLinks(movie.link);
                    
                    if (downloadLinks.length > 0) {
                        let text = `📥 *DOWNLOAD LINKS*\n\n🎬 ${movie.title}\n\n`;
                        text += `━━━━━━━━━━━━━━━━━━\n`;
                        downloadLinks.slice(0, 5).forEach((dl, i) => {
                            text += `*${i+1}.* ${dl.type}\n`;
                            text += `📦 Quality: ${dl.quality || 'HD'}\n`;
                            text += `📏 Size: ${dl.size || 'N/A'}\n`;
                            text += `🔗 ${dl.link}\n\n`;
                        });
                        text += `━━━━━━━━━━━━━━━━━━\n`;
                        text += `📌 *Click links to download*\n`;
                        text += `> DULANTHA MD`;

                        await sock.sendMessage(from, { text });
                    } else {
                        await sock.sendMessage(from, { 
                            text: `🔗 *Direct Link:*\n\n${movie.link}\n\n> Open in browser to see download options\n> DULANTHA MD` 
                        });
                    }
                } catch (e) {
                    await sock.sendMessage(from, { 
                        text: `🔗 *Direct Link:*\n\n${movie.link}\n\n> DULANTHA MD` 
                    });
                }
            }
        }

        // Handle filter buttons
        if (buttonId.startsWith('filter_')) {
            const quality = buttonId.replace('filter_', '');
            const siteResults = global.movieSiteResults?.[from];
            
            if (!siteResults) {
                return sock.sendMessage(from, { text: '❌ *Session expired! Please search again.*' });
            }

            const filtered = siteResults.movies.filter(m => 
                (m.quality || '').toLowerCase().includes(quality.toLowerCase()) ||
                m.title.toLowerCase().includes(quality.toLowerCase())
            );

            if (filtered.length > 0) {
                let text = `🎬 *${siteResults.site} - ${quality.toUpperCase()}*\n\n`;
                filtered.forEach((m, i) => {
                    text += `*${i+1}.* ${m.title}\n`;
                    text += `📊 ${m.quality || quality}\n`;
                    text += `🔗 ${m.link}\n\n`;
                });
                text += `> DULANTHA MD`;
                await sock.sendMessage(from, { text });
            } else {
                await sock.sendMessage(from, { 
                    text: `❌ No ${quality.toUpperCase()} quality found!\nTry different quality filter.` 
                });
            }
        }
    }
};

// ============ SITE SCRAPERS ============
async function searchCinesubz(query) {
    try {
        const response = await axios.get(`https://cinesubz.co/?s=${encodeURIComponent(query)}`, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
            timeout: 15000
        });
        const $ = cheerio.load(response.data);
        const results = [];
        
        $('article').each((i, el) => {
            const title = $(el).find('.entry-title a').text().trim();
            const link = $(el).find('.entry-title a').attr('href');
            const img = $(el).find('img').attr('src');
            const date = $(el).find('.entry-date').text().trim();
            const qualityEl = $(el).find('.quality, .resolution, .entry-content strong').text().trim();
            
            if (title && link) {
                results.push({ title, link, img, date, quality: qualityEl || 'HD' });
            }
        });
        return results;
    } catch (e) { return []; }
}

async function searchBaiscope(query) {
    try {
        const response = await axios.get(`https://baiscope.lk/?s=${encodeURIComponent(query)}`, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
            timeout: 15000
        });
        const $ = cheerio.load(response.data);
        const results = [];
        
        $('article, .post, .movie-item, .grid-item').each((i, el) => {
            const title = $(el).find('h2 a, .title a, .entry-title a').text().trim();
            const link = $(el).find('h2 a, .title a, .entry-title a').attr('href');
            const img = $(el).find('img').attr('src') || $(el).find('img').attr('data-src');
            const quality = $(el).find('.quality, .resolution, .quality-tag').text().trim();
            const size = $(el).find('.size, .file-size').text().trim();
            
            if (title && link) {
                results.push({ title, link, img, quality: quality || 'HD', size });
            }
        });
        return results;
    } catch (e) { return []; }
}

async function searchSinhalaSubz(query) {
    try {
        const response = await axios.get(`https://sinhalasubz.net/?s=${encodeURIComponent(query)}`, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
            timeout: 15000
        });
        const $ = cheerio.load(response.data);
        const results = [];
        
        $('article, .post').each((i, el) => {
            const title = $(el).find('h2 a, .entry-title a').text().trim();
            const link = $(el).find('h2 a, .entry-title a').attr('href');
            const img = $(el).find('img').attr('src');
            const size = $(el).find('.size, .file-size').text().trim();
            
            if (title && link) results.push({ title, link, img, size, quality: 'Sinhala Sub' });
        });
        return results;
    } catch (e) { return []; }
}

async function searchPirateLK(query) {
    try {
        const response = await axios.get(`https://piratelk.live/?s=${encodeURIComponent(query)}`, {
            headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 15000
        });
        const $ = cheerio.load(response.data);
        const results = [];
        
        $('.post, article, .movie-card').each((i, el) => {
            const title = $(el).find('.post-title a, h2 a').text().trim();
            const link = $(el).find('.post-title a, h2 a').attr('href');
            const img = $(el).find('img').attr('src');
            if (title && link) results.push({ title, link, img, quality: 'HD' });
        });
        return results;
    } catch (e) { return []; }
}

async function searchCineRu(query) {
    try {
        const response = await axios.get(`https://cineru.lk/?s=${encodeURIComponent(query)}`, {
            headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 15000
        });
        const $ = cheerio.load(response.data);
        const results = [];
        
        $('article, .post').each((i, el) => {
            const title = $(el).find('h2 a, .entry-title a').text().trim();
            const link = $(el).find('h2 a, .entry-title a').attr('href');
            const img = $(el).find('img').attr('src');
            const quality = $(el).find('.quality, .resolution').text().trim();
            if (title && link) results.push({ title, link, img, quality: quality || 'HD' });
        });
        return results;
    } catch (e) { return []; }
}

async function searchFilmizill(query) {
    try {
        const response = await axios.get(`https://filmizill.xyz/?s=${encodeURIComponent(query)}`, {
            headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 15000
        });
        const $ = cheerio.load(response.data);
        const results = [];
        
        $('article, .post, .grid-item').each((i, el) => {
            const title = $(el).find('h2 a, .title a').text().trim();
            const link = $(el).find('h2 a, .title a').attr('href');
            const img = $(el).find('img').attr('src') || $(el).find('img').attr('data-src');
            const quality = $(el).find('.quality-tag, .resolution').text().trim();
            if (title && link) results.push({ title, link, img, quality: quality || 'HD' });
        });
        return results;
    } catch (e) { return []; }
}

async function searchLankaFilm(query) {
    try {
        const response = await axios.get(`https://lankafilm.net/?s=${encodeURIComponent(query)}`, {
            headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 15000
        });
        const $ = cheerio.load(response.data);
        const results = [];
        
        $('article, .post').each((i, el) => {
            const title = $(el).find('h2 a, .entry-title a').text().trim();
            const link = $(el).find('h2 a, .entry-title a').attr('href');
            const img = $(el).find('img').attr('src');
            if (title && link) results.push({ title, link, img, quality: 'HD' });
        });
        return results;
    } catch (e) { return []; }
}

// ============ DOWNLOAD LINK EXTRACTOR ============
async function getDownloadLinks(url) {
    try {
        const response = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 15000
        });
        const $ = cheerio.load(response.data);
        const links = [];
        
        // Google Drive links
        $('a[href*="drive.google.com"]').each((i, el) => {
            links.push({ type: '📦 Google Drive', link: $(el).attr('href'), quality: 'HD' });
        });
        
        // Mega links
        $('a[href*="mega.nz"]').each((i, el) => {
            links.push({ type: '📦 Mega', link: $(el).attr('href'), quality: 'HD' });
        });
        
        // MediaFire links
        $('a[href*="mediafire.com"]').each((i, el) => {
            links.push({ type: '📦 MediaFire', link: $(el).attr('href'), quality: 'HD' });
        });
        
        // Direct download links
        $('a[href*="download"], a[class*="download"], a[id*="download"]').each((i, el) => {
            const link = $(el).attr('href');
            const text = $(el).text().trim() || 'Direct Download';
            if (link && !links.find(l => l.link === link)) {
                links.push({ type: `📥 ${text}`, link, quality: 'HD' });
            }
        });
        
        // Extract quality from page
        const qualityText = $('body').text();
        if (qualityText.includes('1080p')) links.forEach(l => l.quality = '1080p FHD');
        else if (qualityText.includes('720p')) links.forEach(l => l.quality = '720p HD');
        else if (qualityText.includes('480p')) links.forEach(l => l.quality = '480p SD');
        else if (qualityText.includes('4K')) links.forEach(l => l.quality = '4K UHD');
        
        return links;
    } catch (e) {
        return [{ type: '🔗 Direct Link', link: url, quality: 'Check site' }];
    }
}

// ============ DOWNLOAD & SEND WITH GROUP SETTINGS ============
async function downloadAndSend(sock, from, url, fileName, msg, db) {
    try {
        // Get group settings if available (from .apply command)
        let detailCrdText = 'DULANTHA MD';
        let filePrefix = 'DULANTHA_MD';
        
        if (db?.groups?.[from]) {
            const groupSettings = db.groups[from].settings;
            if (groupSettings.fileName) filePrefix = groupSettings.fileName;
            if (groupSettings.detailCrd) detailCrdText = groupSettings.detailCrd;
        }
        
        // Build final file name with custom prefix
        const cleanFileName = fileName.replace(/[^a-zA-Z0-9_]/g, '_');
        const prefixClean = filePrefix.replace(/\s+/g, '_');
        const finalFileName = fileName.includes(prefixClean) 
            ? fileName 
            : `${prefixClean}_${cleanFileName}`;
        
        // Notify user
        await sock.sendMessage(from, { 
            text: `📥 *Downloading Your File...*\n\n⏳ Please wait, file is being processed...\n\n📁 *File:* \`${finalFileName}.mp4\`\n\n> ${detailCrdText}` 
        }, { quoted: msg });

        // Send file
        await sock.sendMessage(from, {
            document: { url: url },
            mimetype: 'video/mp4',
            fileName: `${finalFileName}.mp4`,
            caption: `🎬 *${finalFileName.replace(/_/g, ' ')}*\n\n✅ *Download Complete!*\n\n> ${detailCrdText}`
        }, { quoted: msg });

    } catch (e) {
        console.log('Download error:', e);
        await sock.sendMessage(from, { 
            text: `❌ *Direct download failed!*\n\n🔗 *Use this link to download:*\n${url}\n\n> DULANTHA MD` 
        }, { quoted: msg });
    }
}

module.exports = movie;