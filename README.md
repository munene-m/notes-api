## Deno x Hono Notes API

Simple notes api that saves notes to json file

- Install dependencies

```
deno install
```

- To start the server run the following command

```
deno task dev
```

- To create a note make a POST request to `http://localhost:8000/create-note` with the following req body:

```
{
    "title": "Example title",
    "content": "Example content"
}
```

- To get all notes make a GET request to `http://localhost:8000/notes`

- To get a single note make a GET request to `http://localhost:8000/notes/:id`
