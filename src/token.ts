import jwt from "jsonwebtoken";

// A secure way to SIGN a message
// Still easy to decode, so don't put anything sensible
// But, we can trust that the message is valid

const secret = "secret";
const token = jwt.sign({ id: 1, name: "Enesi", pin: 1234 }, secret);

const result = jwt.verify(token, secret);
const decode = jwt.decode(token)
//@ts-ignore
console.log(`your name is ${result.name}`);
