import express from "express";
import cookieParser from "cookie-parser";
import session from "express-session";

const host = "0.0.0.0";
const porta = 3000;

const server = express();

server.use(session({
    secret:"manu123",
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 30 }
}));

server.use(express.urlencoded({extended: true}));
server.use(cookieParser());

server.listen(porta, host, () => {
    console.log(`Servidor executando em http://${host}:${porta}`);
});
