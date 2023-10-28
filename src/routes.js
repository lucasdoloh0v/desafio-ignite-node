import { Database } from './db/database.js';
import { buildRoutePath } from './utils/build-route-path.js';

const database = new Database();

export const routes = [
  {
    method: 'GET',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      const { search } = req.query;

      const tasks = database.select('tasks', {
        title: search,
        description: search
      })

      return res.end(JSON.stringify(tasks));
    },
  },
  {
    method: 'POST',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      const { title, description } = req.body;

      if (!title) {
        return res
          .writeHead(400)
          .end(JSON.stringify({ message: 'title is required' }));
      }

      if (!description) {
        return res
          .writeHead(400)
          .end(JSON.stringify({ message: 'description is required' }));
      }

      const task = {
        title,
        description,
        completed_at: null,
      };

      const taskInserted = database.insert('tasks', task);

      return res.writeHead(201).end(JSON.stringify(taskInserted));
    },
  },
  {
    method: 'PUT',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params;
      const { body } = req;

      if (!body.title && !body.description) {
        return res
          .writeHead(400)
          .end(JSON.stringify({ message: 'title or description is required' }));
      }

      try {
        database.update('tasks', id, body);
        return res.end();
      } catch (error) {
        return res
          .writeHead(400)
          .end(JSON.stringify({ message: error.message }));
      }
    },
  },
  {
    method: 'DELETE',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params;

      try {
        database.delete('tasks', id);
        return res.writeHead(204).end();
      } catch (error) {
        return res
          .writeHead(400)
          .end(JSON.stringify({ message: error.message }));
      }
    },
  },
];
