import type { NextApiRequest, NextApiResponse } from "next";
import { MongoClient, ObjectId } from "mongodb";

// MongoDB connection URI and database name
const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

if (!uri) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

if (!dbName) {
  throw new Error(
    "Please define the MONGODB_DB environment variable inside .env.local"
  );
}

//@ts-ignore
let cached = global.mongo;

if (!cached) {
  //@ts-ignore
  cached = global.mongo = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = MongoClient.connect(uri as string).then((client) => {
      return { client, db: client.db(dbName) };
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
//@ts-ignore
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function searchHeirlooms(query: string, getAll: boolean) {
  const { db } = await connectToDatabase();
  const collection = db.collection("heirloom");

  if (getAll) {
    return await collection.find({}).toArray();
  } else {
    const sanitizedQuery = escapeRegExp(query);
    return await collection
      .find({
        $or: [
          { title: new RegExp(sanitizedQuery, "i") },
          { description: new RegExp(sanitizedQuery, "i") },
        ],
      })
      .toArray();
  }
}

//@ts-ignore
async function addHeirloom(heirloomData) {
  const { db } = await connectToDatabase();
  const collection = db.collection("heirloom");
  return await collection.insertOne(heirloomData);
}

//@ts-ignore
async function updateHeirloom(id, heirloomData) {
  const { db } = await connectToDatabase();
  const collection = db.collection("heirloom");

  // Remove the _id field from the heirloomData object
  const { _id, ...updatedData } = heirloomData;

  return await collection.updateOne(
    { _id: new ObjectId(id) },
    { $set: updatedData }
  );
}
//@ts-ignore
async function deleteHeirloom(id) {
  const { db } = await connectToDatabase();
  const collection = db.collection("heirloom");
  return await collection.deleteOne({ _id: new ObjectId(id) });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === "GET") {
      const query = req.query.q as string;
      const getAll = req.query.all === "true";
      const results = await searchHeirlooms(query, getAll);
      res.status(200).json(results);
    } else if (req.method === "POST") {
      const heirloomData = req.body;
      const result = await addHeirloom(heirloomData);
      res.status(201).json(result.ops[0]);
    } else if (req.method === "PUT") {
      try {
        const heirloomId = req.query.id as string;
        const heirloomData = req.body;
        const result = await updateHeirloom(heirloomId, heirloomData);
        if (result.modifiedCount === 0) {
          return res.status(404).json({ message: "Heirloom not found" });
        }
        res.status(200).json({ message: "Heirloom updated successfully" });
      } catch (error) {
        console.error("Error updating heirloom:", error);
        res.status(500).json({ message: "Internal Server Error" });
      }
    } else if (req.method === "DELETE") {
      const heirloomId = req.query.id as string;
      const result = await deleteHeirloom(heirloomId);
      if (result.deletedCount === 0) {
        return res.status(404).json({ message: "Heirloom not found" });
      }
      res.status(200).json({ message: "Heirloom deleted successfully" });
    } else {
      res.status(405).end(); // Method Not Allowed
    }
  } catch (error) {
    //@ts-ignore
    res.status(500).json({ message: error.message });
  }
}
