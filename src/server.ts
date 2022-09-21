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

const prisma = new PrismaClient({ log: ["error", "info", "query", "warn"] });

const port = 4000;

app.post("/sign-up", async (req, res) => {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { name: req.body.name },
    });
    if (existingUser) {
      res.status(400).send({ error: "user already exists" });
    } else {
      const user = await prisma.user.create({
        data: { name: req.body.name, pin: bcrypt.hashSync(req.body.pin) },
      });
      res.send(user);
    }
  } catch (error) {
    //@ts-ignore
    res.status(400).send({ error: error.message });
  }
});
app.get("/users", async (req, res) => {
  const users = await prisma.user.findMany({ include: { transactions: true } });
  res.send(users);
});

app.post("/sign-in", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { name: req.body.name },
    });
    if (user && bcrypt.compareSync(req.body.pin, user.pin)) {
      res.send(user);
    }
  } catch (error) {
    res.status(400).send({ error: "name/pin not correct" });
  }
});

app.listen(port, () => {
  console.log(`App running: http://localhost:${port}`);
});
