import express from "express"
import cors from "cors"
import gamesRouter from "./routes/games.routes.js"
import customersRouter from "./routes/customers.routes.js"
import rentalsRouter from "./routes/rentals.routes.js"
import dotenv from "dotenv"

const app = express()
app.use(cors())
app.use(express.json())
app.use(gamesRouter)
app.use(customersRouter)
app.use(rentalsRouter)
dotenv.config()

const PORT = 5000
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`))