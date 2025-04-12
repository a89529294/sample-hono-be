import { Hono } from 'hono';
import { hasPermission } from './helpers/auth.js';

const app = new Hono();

app.post('/', (c) => c.json('create a production', 201));

app.get('/', async (c) => {
  // Get user from context (set by authentication middleware)
  const user = c.get('user');

  console.log(user);

  // Check if user has permission to read production data
  const hasReadPermission = await hasPermission(user.id, 'production:read');

  if (!hasReadPermission) {
    return c.json(
      {
        success: false,
        error: 'Permission denied',
        message: "You don't have permission to access production data",
      },
      403,
    );
  }

  // If user has permission, return the data
  return c.json({
    success: true,
    message: 'read all production',
    data: [], // Replace with actual production data
  });
});

app.patch('/:id', (c) => c.json(`Updating production with id: ${c.req.param('id')}`));

app.delete('/:id', (c) => c.json(`Deleting production with id: ${c.req.param('id')}`));

export default app;
