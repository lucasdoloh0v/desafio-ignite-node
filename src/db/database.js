import { table } from 'node:console';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';

const dbPath = new URL('database.json', import.meta.url);

export class Database {
  #database = {};

  constructor() {
    fs.readFile(dbPath, 'utf-8')
      .then((data) => {
        this.#database = JSON.parse(data);
      })
      .catch(() => {
        this.#persist();
      });
  }

  #persist() {
    fs.writeFile(dbPath, JSON.stringify(this.#database));
  }

  select(table, search) {
    let data = this.#database[table] ?? [];

    if (search) {
      data = data.filter(row => {
        return Object.entries(search).some(([key, value]) => {
          if (!value) return true

          return row[key].includes(value)
        })
      })
    }

    return data;
  }

  insert(table, data) {
    const dataToInsert = {
      id: randomUUID(),
      ...data,
      created_at: new Date(),
      updated_at: new Date(),
    };

    if (!Array.isArray(this.#database[table])) {
      this.#database[table] = [dataToInsert];
      this.#persist();
      return;
    }

    this.#database[table].push(dataToInsert);
    this.#persist();

    return dataToInsert;
  }

  update(table, id, data) {
    const rowIndex = this.#database[table].findIndex((row) => row.id === id);

    if (rowIndex === -1) {
      throw new Error('id inexistente');
      return;
    }
    const row = this.#database[table][rowIndex];
    this.#database[table][rowIndex] = {
      ...row,
      ...data,
      updated_at: new Date(),
    };
    this.#persist();
  }

  delete(table, id) {
    const rowIndex = this.#database[table].findIndex((row) => row.id === id);

    if (rowIndex === -1) {
      throw new Error('id inexistente');
      return;
    }

    this.#database[table].splice(rowIndex, 1);
    this.#persist();
  }
}
