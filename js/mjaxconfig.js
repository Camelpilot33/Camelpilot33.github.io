MathJax = {
    tex: {
        inlineMath: [['$', '$'],['\\(','\\)']],
        tags:"ams",
        packages: { '[+]': ['empheq'] }
    },
    svg: {
        fontCache: 'global'
    },
    options: {
        skipHtmlTags: [
            'script', 'noscript', 'style', 'textarea', 'pre',
            'code', 'annotation', 'annotation-xml'
        ],
    },
    loader: { load: ['[tex]/empheq'] }
};
(function () {
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js';
    script.async = true;
    document.head.appendChild(script);
    console.log('%c[Mathjax] Started', 'font-size:20px')
})();
