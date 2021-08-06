const qs = (a) => document.querySelector(a);
var worker = new Worker('scripts/factorize.js');

let working = false;

window.onload = function() {
    qs('#fbtn').onclick = function() {
        if(!working) {
            let rawstr = qs('#intinput').value;
            qs('#fbtn').innerText = 'Stop';
            qs('#engines_on').style.display = 'block';
            qs('#engines_off').style.display = 'none';
            qs('#wwoutput').innerText = 'Calculating...';
            worker.postMessage(rawstr);
            working = true;
        } else {
            working = false;
            location.reload();
        }
    }
}

worker.onmessage = function(e) {
    working = false;
    qs('#fbtn').innerText = 'Factorize';
    qs('#engines_on').style.display = 'none';
    qs('#engines_off').style.display = 'block';
    qs('#wwoutput').innerText = e.data;
}
