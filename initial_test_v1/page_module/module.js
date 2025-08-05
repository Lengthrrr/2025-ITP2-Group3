const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

const name = urlParams.get('module');
console.log(`Loading module: "${name}"`)

function getMipdata(mipfileName) {
    // console

}


