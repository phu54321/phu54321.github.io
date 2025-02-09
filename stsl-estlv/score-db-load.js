function readFileAsUint8Array(file) {
    return new Promise((resolve, error) => {
        const r = new FileReader()
        r.onload = function() {
            resolve(new Uint8Array(r.result))
        }
        r.onerror = error
        r.readAsArrayBuffer(file)
    })
}

const clearTypeMap = {
    // 0: "NoPlay", // send to undefined
    1: "failed",
    2: "assist-easy",
    3: "assist-easy",  // "LightAssistEasy",
    4: "easy",
    5: "normal",
    6: "hard",
    7: "exhard",
    8: "fullcombo",
    9: "perfect", // Perfect
    10: "max", // MAX
}

async function loadDatabase(e) {
    const file = e.target.files[0]
    console.log('loading file', file)
    const fileContent = await readFileAsUint8Array(file)
    const SQL = await initSqlJs()
    const db = new SQL.Database(fileContent)

    const clearMap = {}
    const currentTime = (new Date()).getTime() / 1000
    const exec = db.exec("SELECT sha256, clear, date FROM score")
    const { columns, values } = exec[0]
    for (const [sha256, clear, date] of values) {
        const clearType = clearTypeMap[clear]
        if (clearType != null) {
            clearMap[sha256] = { clearType, date }
        }
    }

    const trs = document.querySelectorAll('#table_int tr[data-sha256]')
    for (const tr of trs) {
        const sha256 = tr.dataset.sha256
        const lastPlayedTd = tr.querySelector('td.last-played')
        if (clearMap[sha256]) {
            const { clearType, date } = clearMap[sha256]
            const lastPlayed = (currentTime - date) / 86400
            tr.classList.add(`clear-${clearType}`)
            if (date != 0) {
                lastPlayedTd.innerHTML = `${lastPlayed | 0}`
            } else {
                lastPlayedTd.innerHTML = ''
            }
        } else {
            tr.className = ""
            lastPlayedTd.innerHTML = ""
        }
    }
}

addEventListener("load", () => {
    document.getElementById("dbInput").addEventListener("change", loadDatabase)
})