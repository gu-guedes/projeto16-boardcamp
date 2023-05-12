import { Router } from "express"
import { getGames, insertGame } from "../controllers/games.controllers.js"
import validateSchema from "../middlewares/validateSchemas.middlewares.js"
import { gameSchema } from "../schemas/games.schemas.js"

const gamesRouter = Router()

gamesRouter.get("/games", getGames)
gamesRouter.post("/games", validateSchema(gameSchema), insertGame)

export default gamesRouter