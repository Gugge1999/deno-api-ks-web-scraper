import { Application, Router } from "@oak/oak";

// Kolla

const books = new Map<string, string>();
books.set("1", "The Hound of the Baskervilles");

const router = new Router();
router
  .get("/", (context) => {
    context.response.body = "Hello world asdasd!";
  })
  .get("/book", (context) => {
    context.response.body = Array.from(books.values());
  })
  .get("/book/:id", (context) => {
    console.log("här");
    if (books.has(context?.params?.id)) {
      context.response.body = JSON.stringify({ res: books.get(context.params.id) });
    }
  });

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

console.log("Init web api");

await app.listen({ port: 8000 });
