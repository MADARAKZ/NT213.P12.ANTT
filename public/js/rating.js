function calcRate(r) { const f = Math.floor(r); const half = (r % f) ? 'half'
    : ''; const id = 'star' + f + half; if (document.getElementById(id)) {
    document.getElementById(id).checked = true; } }