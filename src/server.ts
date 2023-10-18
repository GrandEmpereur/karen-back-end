import * as dotenv from "dotenv";
import Koa from "koa";
import cors from "@koa/cors";
import path from "path";
import mainRoute from "./routes/main";

dotenv.config({
    path: path.resolve(
        process.cwd(),
        process.env.NODE_ENV === "development" ? ".env.development" : ".env"
    ),
})

async function main(): Promise<void> {
    const app = await createApp()
    const port = process.env.PORT || 4200
    app.listen(port)
    console.log(`Listening on port http://localhost:${port}`)
}

async function createApp(): Promise<Koa> {
    const app = new Koa()
    app.use(cors())
    app.use(mainRoute.routes())
    return app
}

main()
