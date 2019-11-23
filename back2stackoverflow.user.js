// ==UserScript==
// @name         Back2stackoverflow
// @version      0.1.5
// @description  Redirect to stackoverflow.com from machine-translated sites
// @namespace    taraflex
// @author       taraflex.red@gmail.com
// @downloadURL  https://raw.githubusercontent.com/Taraflex/Back2stackoverflow/master/back2stackoverflow.user.js
// @updateURL    https://raw.githubusercontent.com/Taraflex/Back2stackoverflow/master/back2stackoverflow.user.js
// @grant        GM_xmlhttpRequest
// @match        https://stackoverflow.com/search?back2stackoverflow=*
// @match        http://qaru.site/questions/*
// @match        https://qaru.site/questions/*
// @match        http://askdev.info/questions/*
// @match        https://askdev.info/questions/*
// @match        https://ubuntugeeks.com/questions/*
// @match        http://programmerz.ru/questions/*
// @match        https://programmerz.ru/questions/*
// @match        http://www.4answered.com/questions/*
// @match        https://www.4answered.com/questions/*
// @match        http://4answered.com/questions/*
// @match        https://4answered.com/questions/*
// @match        https://code-examples.net/*/q/*
// @match        http://code.i-harness.com/*/q/*
// @match        https://code.i-harness.com/*/q/*
// @match        http://quabr.com/*/*
// @match        https://quabr.com/*/*
// @match        https://stackovernet.com/*/q/*
// @match        https://*.stackovernet.com/*/q/*
// @match        https://stackoverrun.com/*/q/*
// @match        https://qna.one/*
// @match        https://qa-help.ru/questions/*
// @match        https://exceptionshub.com/*
// @match        https://kotaeta.com/*
// @match        https://ciupacabra.com/*
// @match        https://de-vraag.com/*
// @match        https://switch-case.ru/*
// @match        https://switch-case.com/*
// @match        https://es.switch-case.com/*
// @match        https://pt.switch-case.com/*
// @match        https://de.switch-case.com/*
// @match        https://bn.switch-case.com/*
// @match        https://ar.switch-case.com/*
// @match        https://answer-id.com/*
// @match        https://while-do.com/*
// @match        https://365airsoft.com/*/questions/*
// @match        https://codeday.me/*/*
// @match        https://publish.codeday.me/post/*
// @match        https://issue.life/questions/*
// @match        https://*.coredump.biz/questions/*
// @match        http://www.code-adviser.com/detail_*
// @match        https://www.code-adviser.com/detail_*
// @match        https://ask-ubuntu.ru/questions/*
// @match        https://stackru.com/questions/*
// @match        https://xbuba.com/questions/*
// @match        http://web-answers.ru/*/*
// @match        https://web-answers.ru/*/*
// @match        https://sprosi.pro/questions/*
// @match        https://askvoprosy.com/voprosy/*
// @match        https://stackanswers.net/questions/*
// @match        https://codengineering.ru/q/*
// @match        https://overcoder.net/q/*
// @match        https://coderquestion.ru/q/*
// @match        http://qacode.ru/questions/*
// @match        https://progaide.com/question/*
// @match        http://stackz.ru/en/*/*
// @match        http://stackz.ru/ru/*/*
// @match        https://www.it-swarm.net/*/*
// @match        https://bonprog.com/question/*
// @match        https://bestecode.com/question/*
// @match        https://progexact.com/question/*
// @match        https://rstopup.com/*
// @match        https://profikoder.com/question/*
// @match        https://itranslater.com/qa/details/*
// @match        https://www.itranslater.com/qa/details/*
// @match        http://ru.voidcc.com/question/*
// @match        https://ru.voidcc.com/question/*
// @match        http://v-resheno.ru/*
// @match        https://v-resheno.ru/*
// @match        https://src-bin.com/*/q/*
// @match        https://intellipaat.com/community/*/*
// @match        https://oipapio.com/question-*
// @match        https://www.oipapio.com/question-*
// @match        https://askdev.ru/q/*
// @match        https://vike.io/*/*/*
// ==/UserScript==

(async () => {
    'use strict';

    /**
     * @param {string} bgcolor
     * @param {string} link
     */
    async function promtRedirect(bgcolor, link) {
        const dialog = document.createElement('div');
        try {
            document.body.appendChild(dialog);
            const shadowRoot = dialog.attachShadow ?
                dialog.attachShadow({ mode: 'open' }) :
                //@ts-ignore
                dialog.createShadowRoot && dialog.createShadowRoot();
            if (!shadowRoot) {
                throw 'Shadow dom required!';
            }
            shadowRoot.innerHTML = `
<style>
:host{
    position: fixed;
    bottom: 0;
    z-index: 16777271; 
    width: 100%; 
    color: white;
    background-color: ${bgcolor};
}
.m{
    padding: 14px;
    font-family: Ubuntu,Segoe UI,Optima,Trebuchet MS,-apple-system,BlinkMacSystemFont,sans-serif;
    font-size: 14px;
}
#close-btn{
    float: right;
    cursor: pointer;
}
a{
    color: white;
}
.search-icon{
    font-size: 24px;
    line-height: 0;
    text-decoration: none;
}
</style>
<div class="m">[ Back2stackoverflow ] <a id="ok-btn" href="#">Try to find the original question?<a href="#" class="search-icon"> ⌕<a></a><span id="close-btn">✖</button></span>`;
            shadowRoot.querySelector('#ok-btn').href = shadowRoot.querySelector('.search-icon').href = link;
            await new Promise((_, reject) => {
                //shadowRoot.querySelector('#ok-btn').addEventListener('click', reject);
                shadowRoot.querySelector('#close-btn').addEventListener('click', reject);
            });
        } finally {
            document.body.removeChild(dialog);
        }
    }

    /**
     * @param {string} q
     */
    async function yaTranslate(q) {
        q = dropMarks(q);
        if (!q) {
            return null;
        }
        //todo гугл переводчик вставляет пробелы где не нужно, исследовать вокруг каких знаков стоит удалять пробелы
        q = q.replace(/ \/ /g, '/');
        q = 'https://api.browser.yandex.ru/dictionary/translate?statLang=en&targetLang=en&text=' + encodeURIComponent(q)
        try {
            //dosn't work in chrome
            return await fetch(q, { mode: 'no-cors', credentials: 'omit' })
                .then(r => r.json())
                .then(r => r.text);
        } catch (_) {
            //works only in tampermonkey
            return new Promise((resolve, reject) => {
                //@ts-ignore
                GM_xmlhttpRequest({
                    url: q,
                    responseType: 'json',
                    anonymous: true,
                    onload: (xhr) => {
                        if (xhr.status === 200) {
                            resolve(xhr.response.text)
                        } else {
                            reject(xhr)
                        }
                    },
                    onerror: reject
                })
            })
        }
    }

    function lastPathPart() {
        return location.pathname.split('/').filter(Boolean).slice(-1)[0];
    }

    /**
     * @param {string} q
     * @param {Date} [before]
     * @param {Date} [after]
     * @param {string[]} [tags]
     */
    function findByApi(q, before, after, tags) {
        q = dropMarks(q);
        return q && fetch(
            `https://api.stackexchange.com/2.2/search?page=1&pagesize=1&order=desc&sort=relevance&intitle=${encodeURIComponent(q)}&site=stackoverflow` +
            (after ? '&fromdate=' + (after.getTime() / 1000 - 120 | 0) : '') +
            (before ? '&todate=' + (before.getTime() / 1000 + 120 | 0) : '') +
            (Array.isArray(tags) && tags.length > 0 ? '&tagged=' + encodeURIComponent(tags.join(';')) : '')
            , { credentials: 'omit' })
            .then(r => r.json())
            .then(r => r.items && r.items[0] && r.items[0].link);
    }

    /**
     * @param {string} selector
     */
    function textContent(selector) {
        const e = document.querySelector(selector);
        return e ? e.textContent.trim() || null : null
    }

    /**
     * @param {string} s
     * @param {boolean} [real]
     */
    function toSearch(s, real) {
        s = dropMarks(s);
        return s ? `https://stackoverflow.com/search?back2stackoverflow=${+!!real}&q=` + encodeURIComponent(s) : null;
    }

    /**
     * @param {string} s
     * @param {number} [radix]
     */
    function byNumber(s, radix) {
        const n = parseInt(s, radix);
        return n > 0 ? 'https://stackoverflow.com/questions/' + n : null;
    }

    /**
    * @param {string} s
    */
    function dropMarks(s) {
        //todo closed in other langs
        return s && s.replace(/\[(duplikować|duplicado|duplicar|duplikat|dublicate|duplicate|дубликат|закрыто|closed)\]\s*$/i, '').trim();
    }

    /**
     * @param {string} s
     */
    function normalize(s) {
        return s && ' ' + s.toLowerCase() + ' '
    }

    let auxiliaryRe = null;
    /**
     * @param {string} s
     */
    function removeAuxiliary(s) {
        return s && s.replace(auxiliaryRe || (auxiliaryRe = new RegExp([
            'a', 'an', 'the',
            //Conjunctions http://englishgu.ru/soyuzyi-v-angliyskom-yazyike-tablitsa-spisok/
            //https://7esl.com/english-conjunctions/
            'according to', 'after', 'against', 'also', 'although', 'and', 'as far as', 'as if', 'as long as', 'as much as', 'as soon as', 'as though', 'as well as', 'as', 'assuming that', 'at last', 'at least', 'because of', 'because', 'before', 'beyond', 'both', 'but', 'by the time', 'either', 'even if', 'even though', 'for', 'from now on', 'from time to time', 'how', 'however', 'if', 'in case', 'in order', 'in spite of', 'in terms of', 'lest', 'like', 'meanwhile', 'moreover', 'neither', 'nevertheless', 'no matter how', 'no matter what', 'no matter when', 'no matter where', 'no matter who', 'no matter why', 'nor', 'not so as', 'not yet', 'now that', 'on behalf of', 'on condition', 'on the contrary', 'on the other hand', 'once', 'only if', 'or', 'otherwise', 'owing to', 'provided that', 'rather than', 'since', 'so that', 'so', 'still', 'than', 'that is why', 'that', 'therefore', 'though', 'thus', 'till', 'unless', 'unlike', 'until', 'what', 'whatever', 'when', 'whenever', 'where', 'whereas', 'wherever', 'whether', 'which', 'whichever', 'while', 'who', 'whoever', 'whom', 'whomever', 'whose', 'with', 'within', 'without', 'yet',
            //some of Preposition https://www.englishclub.com/grammar/prepositions-list.htm
            //https://www.talkenglish.com/vocabulary/top-50-prepositions.aspx
            'aboard', 'about', 'above', 'across', 'after', 'against', 'along', 'amid', 'among', 'anti', 'around', 'at', 'behind', 'below', 'beneath', 'beside', 'besides', 'beyond', 'but', 'by', 'concerning', 'considering', 'despite', 'down', 'during', 'excepting', 'excluding', 'following', 'for', 'from', 'in', 'including', 'inside', 'into', 'of', 'off', 'on', 'onto', 'opposite', 'out', 'outside', 'over', 'past', 'per', 'regarding', 'since', 'than', 'through', 'throughout', 'to', 'toward', 'towards', 'under', 'underneath', 'unlike', 'until', 'up', 'upon', 'versus', 'via', 'within', 'without',
            //some of https://7esl.com/interjections-exclamations/
            'aah', 'ah', 'aha', 'ahem', 'alas', 'argh', 'aw', 'aww', 'bah', 'behold', 'bingo', 'boo', 'bravo', 'brr', 'dear', 'duh', 'eek', 'eh', 'er', 'eww', 'gah', 'gee', 'grr', 'hah', 'hello', 'hey', 'hi', 'hmm', 'huh', 'hullo', 'humph', 'hurrah', 'meh', 'mhm', 'muahaha', 'nuh-uh', 'oh', 'ooh', 'ooh-la-la', 'oomph', 'oops', 'ouch', 'oww', 'oy', 'pew', 'pff', 'phew', 'psst', 'sheesh', 'shh', 'shoo', 'tsk-tsk', 'uh-hu', 'uh-oh', 'uh-uh', 'uhh', 'um', 'umm', 'wee', 'well', 'whoa', 'wow', 'yahoo', 'yay', 'yeah', 'yikes', 'yippee', 'yoo-hoo', 'yuck', 'yuh-uh', 'zing',
            //modals
            'can', 'could', 'be able to', 'may', 'might', 'shall', 'should', 'must', 'have to', 'will', 'would',
        ].sort((a, b) => b.length - a.length).map(w => `\\W${w}(?!\\w)`).join('|'), 'g')), ' ');
    }

    /**
    * @param {string} s
    */
    function onlyAlphanum(s) {
        return s && s.replace(/[^a-z0-9]+/gi, '');
    }

    /**
     * @param {Function[]} fns
     */
    function pipe(...fns) {
        return (v) => {
            for (let f of fns) {
                v = f(v);
            }
            return v;
        }
    }

    /**
     * @param {string} s
     * @return {HTMLElement[]}
     */
    function all(s) {
        return Array.prototype.slice.call(document.querySelectorAll(s));
    }

    /**
     * @param {string} s
     * @return {string[]}
     */
    function allTexts(s) {
        return all(s).map(a => a.textContent.trim())
    }

    if (location.href.startsWith('https://stackoverflow.com/search?back2stackoverflow=')) {
        const searchParams = new URLSearchParams(location.search);
        const prepare = +searchParams.get('back2stackoverflow') ? pipe(dropMarks, normalize, onlyAlphanum) : pipe(dropMarks, normalize, removeAuxiliary, onlyAlphanum);
        const q = searchParams.get('q');
        const preparedQ = prepare(q);
        const link = preparedQ && all('.result-link a')
            //@ts-ignore
            .find(link => link.href.indexOf('/' + q, 36) !== -1 || preparedQ.startsWith(prepare(link.textContent.replace(/^\s*(Q|A):/, ''))));
        if (link) {
            try {
                //@ts-ignore
                history.replaceState(null, null, link.href);
            } catch (e) { }
            //@ts-ignore
            return link.href;
        }
    }

    const host = location.hostname.split('.').slice(-2).join('.');
    switch (host) {
        case 'askdev.ru':
            let askdev = textContent('.block_share span') ? textContent('h1') : null;
            if (askdev) {
                askdev = await yaTranslate(askdev);
                return (await findByApi(askdev, null, null, allTexts('.block_taxonomies a'))) || promtRedirect('#970f1b', toSearch(askdev));
            }
            return;
        case 'vike.io':
            let vike = textContent('h1');
            if (vike) {
                vike = await yaTranslate(vike.replace(/[^–]+–\s/, ''));
                const d = new Date(document.querySelector('.question-box .author__date').getAttribute('datetime'));
                return (await findByApi(vike, d, d, allTexts('.tags__item--blue'))) || promtRedirect('#09c199', toSearch(vike));
            }
            return;
        case 'intellipaat.com':
            return findByApi(
                textContent('h1'),
                new Date(document.querySelector('.qa-q-view-main time').getAttribute('datetime')),
                null,
                allTexts('.qa-q-view-main .qa-tag-link')
            );
        case 'oipapio.com':
            const oipapio = textContent('h1').split(' - ');
            const tag = oipapio.shift();
            return findByApi(oipapio.join(' - '), null, null, [tag]);
        case 'v-resheno.ru':
            return textContent('.linkurl > b');
        case 'src-bin.com':
        case 'i-harness.com':
        case 'code-examples.net':
            return byNumber(lastPathPart(), 16);
        case 'quabr.com':
            return byNumber(location.pathname.split('/', 2)[1]);
        case 'profikoder.com':
        case 'progexact.com':
        case 'bestecode.com':
        case 'bonprog.com':
        case 'progaide.com':
        case 'coderquestion.ru':
        case 'coredump.biz':
        case 'issue.life':
        case 'xbuba.com':
            return byNumber(location.pathname.split('/', 3)[2]);
        case 'exceptionshub.com':
            if (!/\.html$/.test(location.pathname)) {
                return;
            }//отсутствие break - не ошибка
        case 'codengineering.ru':
        case 'stackanswers.net':
        case 'askvoprosy.com':
            return toSearch(lastPathPart().replace(/(-closed|-duplicate)?(-\d+)?(\.html)?$/, ''), true);
        case 'stackz.ru':
            const enLink = document.querySelector('a[href^="/en/' + location.pathname.split('/', 3)[2] + '/"]');
            if (enLink) {
                //@ts-ignore
                return enLink.href;
            }
            return toSearch(textContent('h1'), true);
        case 'codeday.me':
            if (location.hostname.startsWith('publish.')) {
                //@ts-ignore
                return all('.panel-body a')[1].href;
            }
        default:
            const cssSelectors = {
                'qaru.site': '.question-text > a[href*="stackoverflow.com/questions/"]',
                'askdev.info': '.question-text > a[href*="stackoverflow.com/questions/"]',
                'ubuntugeeks.com': '.question-text > a[href*="askubuntu.com/questions/"]',

                'qa-help.ru': 'a.uncolored-text[href*="stackoverflow.com/questions/"]',//встречаются вопросы с ru.stackoverflow.com
                'programmerz.ru': '.source-share-link',
                '4answered.com': '.view_body span a',
                'qna.one': '.page-container-question .source-share-block a',
                '365airsoft.com': '.origin > a',
                'codeday.me': '.article-es-url > a',
                'code-adviser.com': '.meta_data a',
                'web-answers.ru': '.source > a',
                'sprosi.pro': '#qsource > a',
                'overcoder.net': '.info_outlink',
                'qacode.ru': '.question-info .cc-link',
                'it-swarm.net': '.gat[data-cat="q-source"]',
                'rstopup.com': '.td-post-content .origlink > a',
                'itranslater.com': '.body > div:last-child > a',
                'voidcc.com': '.source > a',

                'stackru.com': '.q-source',
                'ask-ubuntu.ru': '.q-source',

                'stackoverrun.com': '.post-meta a',
                'stackovernet.com': '.post-meta a',

                'kotaeta.com': '.footer_question.mt-3 > a',
                'ciupacabra.com': '.footer_question.mt-3 > a',
                'de-vraag.com': '.footer_question.mt-3 > a',
                'switch-case.ru': '.footer_question.mt-3 > a',
                'switch-case.com': '.footer_question.mt-3 > a',
                'es.switch-case.com': '.footer_question.mt-3 > a',
                'pt.switch-case.com': '.footer_question.mt-3 > a',
                'de.switch-case.com': '.footer_question.mt-3 > a',
                'bn.switch-case.com': '.footer_question.mt-3 > a',
                'ar.switch-case.com': '.footer_question.mt-3 > a',
                'answer-id.com': '.footer_question.mt-3 > a',
                'while-do.com': '.footer_question.mt-3 > a'
            };
            const link = cssSelectors[host] && document.querySelector(cssSelectors[host]);
            return link ? link.href : null;
    }

})().then(u => u && (location.href = u)).catch(console.error.bind(console));