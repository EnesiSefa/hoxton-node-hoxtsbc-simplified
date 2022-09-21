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

app.post("/sign-up", async (req, res) => {
  const user = await prisma.user.create({
    data: { name: req.body.name, pin: bcrypt.hashSync(req.body.pin) },
  });
  res.send(user);
});

app.post("/sign-in", async (req, res) => {
  const user = await prisma.user.findUnique({ where: { name: req.body.name } });
  if (user && bcrypt.compareSync(req.body.pin, user.pin)) {
    res.send(user);
  } else {
    res.status(400).send({ error: "name/pin not correct" });
  }
});

app.get("/validate", async (req, res) => {});

app.get("/transactions", async (req, res) => {});

app.listen(port, () => {
  console.log(`App running: http://localhost:${port}`);
});
