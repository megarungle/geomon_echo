require('dotenv').config()
const express = require("express");
const MongoClient = require("mongodb").MongoClient;
// const userRouter = require('./routers/user-router')
// const trackerRouter = require('./routers/tracker-router')
const LocationService = require('./location-service')

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(userRouter)
// app.use(trackerRouter)


const URI = process.env.DB_CONNECT;
const PORT = process.env.PORT


const mongoClient = new MongoClient(URI, { useNewUrlParser: true, useUnifiedTopology: true });
let dbClient;
let colTrackers;
let colUsers;
let colTowers;

mongoClient.connect(function(err, client){
    if(err) return console.log(err);
    dbClient = client;
    colTrackers = client.db("mydb").collection("trackers");
	colUsers = client.db("mydb").collection("users");
    colTowers = client.db("mydb").collection("towers");
    app.listen(PORT, () => console.log(`server has been started on port ${PORT}`));
});


// Internal
async function getAllTrackers(trackerIds) {
    let trackers = await new Promise(
        async(resolve, reject) => {
            colTrackers.find({_id : {$in : trackerIds}}).toArray( function(err, result) {
                if(err) reject(err)
                resolve(result)
            })
        }
    )
    return trackers
}


async function getAllTowers() {
    let towers = await new Promise(
        async(resolve, reject) => {
            colTowers.find({}).toArray( function(err, result) {
                if(err) reject(err)
                resolve(result)
            })
        }
    )
    return towers
}


async function getField(collection, id, field_name) {
    let user = await new Promise(
        async(resolve, reject) => {
            collection.find({_id : id}).toArray(function(err, result) {
                if(err) reject(err)
                resolve(result)
            })
        }
    )
    return user[0][field_name]
}


app.get('/internal/clearCollection', (req, res) => {
    colTrackers.deleteMany({})
    colTowers.deleteMany({})
    res.status(200).json('collection has been cleared')
})


// Towers and pigs (fuck them all)

app.post('/addTower', (req, res) => {
    const {id, coorX, coorY} = req.body
    colTowers.countDocuments({_id : req.body.id}).then( async(count) => {
        if (count == 0) {
            colTowers.insertOne({_id : id, coorX, coorY})
            res.status(200).json('created')
        } else {
            colTowers.updateOne(
                {_id : id},
                { $set : {'coorX' : coorX, 'coorY' : coorY }})
            res.status(200).json('updated')
        }
    })
})

app.post('/createAndUpdate', (req, res) => {
    const {id, signals} = req.body
    colTrackers.countDocuments({_id : req.body.id}).then( async(count) => {
        if (count == 0) {
            colTrackers.insertOne({_id : id, signals})
            res.status(200).json('created')
        } else {
            let signalsMap = new Map(Object.entries(signals))

            
            let tmp = new Map(Object.entries(await getField(colTrackers, id, 'signals')))

            signalsMap.forEach((val, key) => {
                tmp.set(key, val)
            })

            colTrackers.updateOne(
                {_id : id},
                { $set : {'signals' : tmp}})

            res.status(200).json('updated')
        }
    })
})


//User
app.post('/addTracker', (req, res) => {
    const {id, tracker} = req.body
    colUsers.updateOne(
        {_id : id},
        { $push : { 'trackers' : tracker}})
    res.status(200).json('tracker added')
})


app.post('/addPerimeter', async (req, res) => {
    const {id, perimeters} = req.body

    perimeters.forEach((object) => {
        colUsers.updateOne(
            {_id : id},
            { $push : { 'perimeter' : {'x' : object['x'], 'y' : object['y']} }})
    })

    res.status(200).json('perimeters added')
})


app.post('/getTrackers', async (req, res) => {
    const {id} = req.body
    let trackersIds = await getField(colUsers, id, 'trackers')
    let trackers = await getAllTrackers(trackersIds)
    let towers = await getAllTowers()
    let result = await LocationService.getTrackerCoodrinates(trackers, towers)
    res.status(200).json( Object.fromEntries(result))
})

process.on("SIGINT", () => {
    dbClient.close();
    process.exit();
});
