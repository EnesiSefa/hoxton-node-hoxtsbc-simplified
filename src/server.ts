import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.options("*", cors());
app.use(express.json());

const prisma = new PrismaClient();

const port = 4000;

const SECRET = process.env.SECRET!;

function getToken(id: number) {
  return jwt.sign({ id: id }, SECRET, {
    expiresIn: "2 days",
  });
}

async function getCurrentUser(token: string) {
  // check if the token is valid
  // if it is, return the user this token belongs to

  const decodedData = jwt.verify(token, SECRET);
  const user = await prisma.user.findUnique({
    // @ts-ignore
    where: { id: decodedData.id },
    include: { transactions: true },
  });
  return user;
}

app.get("/users", async (req, res) => {});

app.post("/sign-up", async (req, res) => {
  try {
    const match = await prisma.user.findUnique({
      where: { name: req.body.name },
    });

    if (match) {
      res.status(400).send({ error: "This account already exists." });
    } else {
      const user = await prisma.user.create({
        data: {
          name: req.body.name,
          pin: bcrypt.hashSync(req.body.pin),
        },
        include: { transactions: true },
      });

      res.send({ user: user, token: getToken(user.id) });
    }
  } catch (error) {
    // @ts-ignore
    res.status(400).send({ error: error.message });
  }
});

app.post("/sign-in", async (req, res) => {
  // 1. check if a user with this name actually exists
  const user = await prisma.user.findUnique({
    where: { name: req.body.name },
    include: { transactions: true },
  });
  if (user && bcrypt.compareSync(req.body.pin, user.pin)) {
    // 2. check if the pin matches
    res.send({ user: user, token: getToken(user.id) });
  } else {
    res.status(400).send({ error: "Invalid name/pin combination." });
  }
});

app.get("/validate", async (req, res) => {
  try {
    if (req.headers.authorization) {
      const user = await getCurrentUser(req.headers.authorization);
      // @ts-ignore
      res.send({ user, token: getToken(user.id) });
    }
  } catch (error) {
    // @ts-ignore
    res.status(400).send({ error: error.message });
  }
});

app.get("/transactions", async (req, res) => {
  try {
    // @ts-ignore
    const user = await getCurrentUser(req.headers.authorization);

    res.send(user?.transactions);
  } catch (error) {
    // @ts-ignore
    res.status(400).send({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`App running: http://localhost:${port}`);
});
