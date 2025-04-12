import { Hono } from 'hono';

const app = new Hono();

app.post('/', (c) => c.json('create a storage item', 201));

app.get('/', (c) => c.json('read all storage items'));

app.patch('/:id', (c) => c.json(`Updating storage item with id: ${c.req.param('id')}`));

app.delete('/:id', (c) => c.json(`Deleting storage item with id: ${c.req.param('id')}`));

export default app;
