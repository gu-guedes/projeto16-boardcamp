import { db } from "../database/database.config.js"
import dayjs from "dayjs"
export async function getRentals(req, res) {
    try {
        const rentals = await db.query(`SELECT rentals.*,
        customers.name AS customer_name,
        games.name AS game_name
        FROM rentals
        JOIN customers ON rentals."customerId" = customers.id
        JOIN games ON rentals."gameId" = games.id;`)
        const rentalsList = rentals.rows.map(rent => ({
            ...rent,
            customer: {
                id: rent.customerId,
                name: rent.customer_name
            },
            game: {
                id: rent.gameId,
                name: rent.game_name
            }


        }))
        rentalsList.map(rent => (delete rent.customer_name))
        rentalsList.map(rent => (delete rent.game_name))
        rentalsList.map(rent => (rent.rentDate = dayjs(rent.rentDate).format('YYYY-MM-DD')))
        rentalsList.map(rent => {
            if(rent.returnDate !== null){
                rent.returnDate = dayjs(rent.returnDate).format('YYYY-MM-DD')
            }})
           // rentalsList.map(rent => (rent.returnDate = dayjs(rent.returnDate).format('YYYY-MM-DD')))
       // }

        res.send(rentalsList)



    } catch (err) {
        res.status(500).send(err.message)
    }
}

export async function insertRentals(req, res) {
    const { customerId, gameId, daysRented } = req.body
    const rentDate = dayjs().format("YYYY-MM-DD")
    const returnDate = null
    const delayFee = null

    try {

        const gameFound = await db.query(`SELECT * FROM games WHERE id=$1;`, [gameId])
        if (!gameFound) return res.sendStatus(400)

        const customerFound = await db.query(`SELECT * FROM customers WHERE id=$1;`, [customerId])
        if (!customerFound) return res.sendStatus(400)

        const gameChance = await db.query(`SELECT * FROM games WHERE id=$1;`, [gameId])
        const pricePerDay = gameChance.rows[0].pricePerDay
        const stockTotal = gameChance.rows[0].stockTotal
        const originalPrice = daysRented * pricePerDay

        const gameAvailable = await db.query(`SELECT * FROM rentals WHERE "gameId"=$1;`, [gameId])

        if (gameAvailable.rows.length >= stockTotal) return res.sendStatus(400)


        await db.query(`INSERT INTO rentals ("customerId", "gameId", "rentDate", "daysRented", "returnDate", "originalPrice", "delayFee") VALUES ($1, $2, $3, $4, $5, $6, $7);`,
            [customerId, gameId, rentDate, daysRented, returnDate, originalPrice, delayFee])
        res.sendStatus(201)


    } catch (err) {
        res.status(500).send(err.message)
    }
}
export async function finalizeRentals(req, res) {
    const { id } = req.params
    const dateNow = dayjs().format("YYYY-MM-DD")
    try {
        const rent = await db.query(`SELECT * FROM rentals WHERE id=$1;`, [id])
        if (!rent.rows[0]) return res.sendStatus(404)

        if (rent.rows[0].returnDate !== null) return res.sendStatus(400)

        const date1 = dayjs(dateNow)
        const dateExpire = dayjs(rent.rows[0].rentDate).add(rent.rows[0].daysRented, 'day')
        let lateDays = date1.diff(dateExpire, 'day')
        console.log(lateDays)
        const pricePerDay = rent.rows[0].originalPrice / rent.rows[0].daysRented
        if (lateDays < 0) { lateDays = 0 }
        const delayFee = lateDays * pricePerDay
        console.log(delayFee)

        await db.query(`UPDATE rentals SET "returnDate" = $1, "delayFee" = $2 WHERE id=$3;`, [dateNow, delayFee, id])
        res.sendStatus(200)

    } catch (err) {
        res.status(500).send(err.message)
    }
}
export async function deleteRentals(req, res) {
    const { id } = req.params

    try {
        const rent = await db.query(`SELECT * FROM rentals WHERE id=$1;`, [id])
        if (!rent.rows[0]) return res.sendStatus(404)


        if (rent.rows[0].returnDate === null) return res.sendStatus(400)

        await db.query(`DELETE FROM rentals WHERE id=$1;`, [id])
        res.sendStatus(200)


    } catch (err) {
        res.status(500).send(err.message)
    }
}
