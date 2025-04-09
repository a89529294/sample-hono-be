import { Hono } from "hono";

const app = new Hono();

app.post("/", (c) => c.json("create a personnel permission", 201));

app.get("/", (c) => c.json("read all personnel permissions"));

app.patch("/:id", (c) =>
  c.json(`Updating personnel permission with id: ${c.req.param("id")}`)
);

app.delete("/:id", (c) =>
  c.json(`Deleting personnel permission with id: ${c.req.param("id")}`)
);

export default app;
