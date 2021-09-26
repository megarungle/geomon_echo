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

    static async getTrackerCoodrinates(trackers, towers) {

        let avg_points = new Map()
        for (const tracker of trackers) {
            let tmpMap = new Map(Object.entries(tracker['signals']))
            let points = []

            
            for (const [key1, val1] of tmpMap) {
                for (const [key2, val2] of tmpMap) {
                    if(val1 != val2) {
                        // let r1 = await Math.pow(10, (((PTX + AGTX + AGRX - PRX - FM) - K - 20 * Math.log10(parseFloat(val1))) / 20))
                        // let r2 = await Math.pow(10, (((PTX + AGTX + AGRX - PRX - FM) - K - 20 * Math.log10(parseFloat(val2))) / 20))
                        let r1 = Math.sqrt(30.16) 
                        let r2 = Math.sqrt(47.05)
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
                        points = points.concat(mmmagic(x1,y1,r1,x2,y2,r2))
                    }
                }
            }
            let count = parseFloat(points.length)
            let Xs = 0.0, Ys = 0.0
            for (const point of points) {
                Xs+=parseFloat(point.x)
                Ys+=parseFloat(point.y)
            }
            avg_points.set( tracker['_id'], new Point(Xs / count, Ys / count))
        }
        return avg_points
    }
}

function Point(x, y) {
    this.x = x
    this.y = y
}


module.exports = LocationService