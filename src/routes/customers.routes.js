import { Router } from "express"
import { getCustomers, getCustomersById, insertCustomers } from "../controllers/customers.controllers.js"
import validateSchema from "../middlewares/validateSchemas.middlewares.js"
import { customerSchema } from "../schemas/customers.schemas.js"

const customersRouter = Router()

customersRouter.get("/customers", getCustomers)
customersRouter.get("/customers/:id", getCustomersById)
customersRouter.post("/customers", validateSchema(customerSchema), insertCustomers)
customersRouter.put("/customers/:id", validateSchema(customerSchema), getCustomersById)

export default customersRouter