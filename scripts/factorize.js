/* Skripta za faktorizaciju velikih integera
 * koristiti kao WebWorker (input = integer, output = array integera)
 * napisao Fran R.
 */

importScripts('dtable.js');

/* Kako bi se skripta mogla zaustaviti izvana */
let STOPMESSAGE = false;

/* matematicke funkcije
 * potrebne za program
 */

function gcd(a, b) {
    if(a < b) {
        let tmp = a;
        a = b;
        b = tmp;
    }
    while(b != 0n) {
        let tmp = b;
        b = a % b;
        a = tmp;
    }
    return a;
}

function abs(x) {
    if(x < 0n) return -x;
    return x;
}

function randint(n) {
    let limit = 1000000000000000000;
    if(limit > Number(n)) limit = Number(n);
    return BigInt(Math.floor(Math.random() * limit));
}

/* implementacija faktorizacije integera
 * rhoovim algoritmom i divide and conquer
 */

// NT = non-trivial (faktori osim n i 1)
function getNTFactor(n) {
    // psr = pseudorandom generator
    // param = pocetna vrijednost za x i y
    // psrk = pseudorandom koeficijenti
    let psrk = [randint(n), randint(n), randint(n)];
    let psr = (x) => (x*x*psrk[0] + x*psrk[1] + psrk[2]) % n;
    let param = randint(n);
    // a i b su pointeri Floyd's cycle finding problema
    let a = param;
    let b = param;
    // p ce kasnije biti ne-trivijalni faktor od n
    let p = 1n;
    while(p == 1n) {
        if(STOPMESSAGE) {
            STOPMESSAGE = false;
            throw Error('Stopped');
        }
        a = psr(a);
        b = psr(psr(b));
        p = gcd(abs(a - b), n);
    }
    // (*1) ako p = n znaci da ne-trivijalni faktor nije pronaden
    return p;
}

function factorizeRecursive(n, arr) {
    // ako je n manji od 2^16, koristi lookup table
    if(n < 65536) {
        n = Number(n);
        while(n != 1) {
            arr.push(n / dtable[n]);
            n = dtable[n];
        }
        return;
    }
    // pozovi getNTFactor vise puta
    // u slucaju n (*1) kako bi se minimizirala
    // vjerojatnost pogreske
    let p = n;
    for(let i = 0; i < 4 && p == n; i++) {
        p = getNTFactor(n);
    }
    if(p == n) {
        arr.push(p);
    } else {
        factorizeRecursive(p, arr);
        factorizeRecursive(n / p, arr);
    }
}

/* WebWorker API */
onmessage = function(evm) {
    let arr = [];
    try {
        let num = BigInt(evm.data);
        if(num <= 0) throw Error('Not positive');
        factorizeRecursive(num, arr);
        postMessage(`The prime factors of ${evm.data} are ${arr.join(', ')}`);
    } catch(e) {
        postMessage(`${e.stack}\n"${evm.data}" is not a positive integer!`);
    }
}
