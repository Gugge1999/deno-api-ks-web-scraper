import { Application, Router } from "@oak/oak";
import { oakCors } from "@tajpouria/cors";
import apiStatusRoutes from "./src/routes/api-status.ts";

const books = new Map<string, string>();
books.set("1", "The Hound of the Baskervilles");

// TODO: Kolla på https://github.com/asad-mlbd/deno-api-starter-oak

const router = new Router();

router
  .get("/book/:id", (context) => {
    console.log("här");
    if (books.has(context?.params?.id)) {
      context.response.body = JSON.stringify({ res: books.get(context.params.id) });
    }
  });

const app = new Application();

app.use(oakCors());

//OBS: Lägg märke till routes() med parenteser
app.use(apiStatusRoutes.routes());
app.use(apiStatusRoutes.allowedMethods());

console.log("Init web api");

await app.listen({ port: 3000 });
