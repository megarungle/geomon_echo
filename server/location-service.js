require('dotenv').config()
const { mmmagic } = require('./calcDots')

const PTX = parseFloat(process.env.PTX) // мощность передатчика, dBm ( до 20 dBm (100 МВт) )
const AGTX = parseFloat(process.env.AGTX)// коэффициент усиления антенны на передатчике 
const AGRX = parseFloat(process.env.AGRX) // и приемнике, dBi
const PRX = parseFloat(process.env.PRX) // чувствительность приемника, dBm ( до -100 dBm (0.1pW) )
const FM = parseFloat(process.env.FM) // запас затухания, дБ ( более 14 дБ (нормальный) или более 22 дБ (хороший))
// const F = process.env.F // частота сигнала, MHz
const K = parseFloat(process.env.K) // константа (32.44, когда f в MHz и d в км)



class LocationService {

    static getTrackerCoodrinates(trackers, towers) {

        console.log(Math.pow(10, (((PTX + AGTX + AGRX - PRX - FM) - K - 20 * Math.log10(2442)) / 20)))

        trackers.forEach((tracker) => {
            let tmpMap = new Map(Object.entries(tracker['signals']))
            let points = []
            let count = tmpMap.size
            
            tmpMap.forEach((val1, key1) => {
                tmpMap.forEach((val2, key2) => {
                    if(val1 != val2) {
                        let r1 = Math.pow(10, (((PTX + AGTX + AGRX - PRX - FM) - K - 20 * Math.log10(parseFloat(key1))) / 20))
                        let r2 = Math.pow(10, (((PTX + AGTX + AGRX - PRX - FM) - K - 20 * Math.log10(parseFloat(key2))) / 20))
                        let x1
                        let x2
                        let y1
                        let y2
                        towers.forEach((tower) => {
                            if (key1 == tower['_id']) {
                                x1 = tower['coorX']
                                y1 = tower['coorY']
                            }
                            if (key2 == tower['_id']) {
                                x2 = tower['coorX']
                                y2 = tower['coorY']
                            }
                        })
                        console.log(x1 + ' ' + y1 + ' ' + r1)
                        console.log(x2 + ' ' + y2 + ' ' + r2)
                        mmmagic(x1,y1,r1,x2,y2,r2)
                    }
                })
            })
            
        });
    }
}


module.exports = LocationService