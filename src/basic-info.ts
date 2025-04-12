import { Hono } from 'hono';

const app = new Hono();

app.post('/', (c) => c.json('create a basic info', 201));

app.get('/', (c) => c.json('read all basic info'));

app.patch('/:id', (c) => c.json(`Updating basic info with id: ${c.req.param('id')}`));

app.delete('/:id', (c) => c.json(`Deleting basic info with id: ${c.req.param('id')}`));

export default app;
