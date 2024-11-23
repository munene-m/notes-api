import { Hono, type Context } from "@hono/hono";

const app = new Hono();

interface Note {
  id?: string;
  title: string;
  content: string;
}
function validateNote(note: any): note is Note {
  return (
    typeof note === "object" &&
    note !== null &&
    typeof note.title === "string" &&
    typeof note.content === "string" &&
    note.title.trim().length > 0 &&
    note.content.trim().length > 0
  );
}

const filePath = "./notes.json";

async function saveToFile(note: Note): Promise<void> {
  try {
    let notes: Note[] = [];

    try {
      const fileContent = await Deno.readTextFile(filePath);
      notes = JSON.parse(fileContent);
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        console.log("File does not exist, creating new one...");
        await Deno.writeTextFile(filePath, JSON.stringify([], null, 2));
      } else {
        throw error;
      }
    }
    notes.push(note);
    await Deno.writeTextFile(filePath, JSON.stringify(notes, null, 2));
    console.log("new note saved to file");
  } catch (err) {
    console.error("Error saving note to file:", err);
    throw err;
  }
}

app.get("/", (c: Context) => {
  return c.text("Welcome to not3s");
});

app.post("/create-note", async (c: Context) => {
  try {
    const body = await c.req.json();
    if (!validateNote(body)) {
      return c.json({ error: "Invalid request body" }, 400);
    }
    const note: Note = body;
    note.id = crypto.randomUUID();
    await saveToFile(note);

    return c.json({ message: "Note created successfully", note }, 201);
  } catch (error) {
    console.error("Error creating note:", error);
    return c.json({ error: "Invalid JSON or bad request" }, 400);
  }
});

app.get("/notes", async (c: Context) => {
  try {
    const notes = await Deno.readTextFile(filePath);
    const parsedNotes: Note[] = JSON.parse(notes);
    return c.json(parsedNotes);
  } catch (err) {
    console.error("Error fetching notes:", err);
    return c.json({ error: "Failed to fetch notes" }, 500);
  }
});

app.get("/notes/:id", async (c: Context) => {
  const id = c.req.param("id");
  try {
    const notes = await Deno.readTextFile(filePath);
    const parsedNotes: Note[] = JSON.parse(notes);
    const note = parsedNotes.find((n) => n.id === id);
    if (!note) {
      return c.json({ error: "Note not found" }, 404);
    }
    return c.json(note);
  } catch (err) {
    console.error("Error fetching note:", err);
    return c.json({ error: "Failed to fetch note" }, 500);
  }
});
Deno.serve(app.fetch);
