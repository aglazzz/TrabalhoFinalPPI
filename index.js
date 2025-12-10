import express from "express";
import cookieParser from "cookie-parser";
import session from "express-session";

const host = "0.0.0.0";
const porta = 3000;

var listaEquipes = [];
var listaJogadores = [];

const server = express();

server.use(session({
    secret:"manu123",
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 30 }
}));

server.use(express.urlencoded({extended: true}));
server.use(cookieParser());

server.get("/", verificarUsuarioLogado, (requisicao, resposta) => {
    let ultimoAcesso = requisicao.cookies?.ultimoAcesso;

    const data = new Date();
    resposta.cookie("ultimoAcesso", data.toLocaleString());
    resposta.setHeader("Content-Type", "text/html");
    resposta.write(`
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="UTF-8">
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet">
                <title>Menu do Sistema</title>
            </head>
            <body>
                <div class="bg-primary text-white py-5 mb-4">
                    <div class="container text-center">
                        <h1 class="display-4 fw-bold">Sistema de Times de League of Legends</h1>
                    </div>
                </div>

                <div class="container">
                    <div class="alert alert-info">
                        <h4 class="alert-heading">Bem-vindo, ${requisicao.session.dadosLogin?.nome || 'Usuário'}!</h4>
                        <p class="mb-0">Último acesso: ${ultimoAcesso || "Primeiro acesso"}</p>
                    </div>

                    <div class="row g-4 mt-4">
                        <div class="col-md-6">
                            <div class="card border-primary">
                                <div class="card-body text-center p-4">
                                    <h5 class="card-title text-primary">🛡️ Cadastrar Equipe</h5>
                                    <a href="/cadastroEquipe" class="btn btn-primary w-100">Acessar</a>
                                </div>
                            </div>
                        </div>
                        
                        <div class="col-md-6">
                            <div class="card border-success">
                                <div class="card-body text-center p-4">
                                    <h5 class="card-title text-success">🎮 Cadastrar Jogador</h5>
                                    <a href="/cadastroJogador" class="btn btn-success w-100">Acessar</a>
                                </div>
                            </div>
                        </div>

                        <div class="col-md-6">
                            <div class="card border-dark">
                                <div class="card-body text-center p-4">
                                    <h5 class="card-title text-dark">🏆 Listar Equipes</h5>
                                    <a href="/listarEquipes" class="btn btn-dark w-100">Acessar</a>
                                </div>
                            </div>
                        </div>

                        <div class="col-md-6">
                            <div class="card border-warning">
                                <div class="card-body text-center p-4">
                                    <h5 class="card-title text-warning">📋 Listar Jogadores</h5>
                                    <a href="/listarJogadores" class="btn btn-warning w-100">Acessar</a>
                                </div>
                            </div>
                        </div>

                        <div class="col-md-12">
                            <a href="/logout" class="btn btn-danger w-100 mt-4">Sair do Sistema</a>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    `);

    resposta.end();
});

server.get("/cadastroEquipe", verificarUsuarioLogado, (requisicao, resposta) => {
    resposta.send(`
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="UTF-8">
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet">
                <title>Cadastro de Equipe</title>
            </head>
            <body>
                <div class="container">
                    <h1 class="text-center border m-3 p-3 bg-light">Cadastro de Equipe</h1>
                    <form method="POST" action="/adicionarEquipe" class="row g-3 m-3 p-3 bg-light">
                        
                        <div class="col-md-6">
                            <label class="form-label">Nome da Equipe</label>
                            <input type="text" class="form-control" name="nomeEquipe">
                        </div>

                        <div class="col-md-6">
                            <label class="form-label">Capitão</label>
                            <input type="text" class="form-control" name="capitao">
                        </div>

                        <div class="col-md-6">
                            <label class="form-label">Contato</label>
                            <input type="text" class="form-control" name="contato">
                        </div>

                        <div class="col-12">
                            <button class="btn btn-primary" type="submit">Cadastrar</button>
                            <a class="btn btn-secondary" href="/">Voltar</a>
                        </div>

                    </form>
                </div>
            </body>
        </html>
    `);
});

server.post("/adicionarEquipe", verificarUsuarioLogado, (req, res) => {
    const { nomeEquipe, capitao, contato } = req.body;

    if (nomeEquipe && capitao && contato) {
        listaEquipes.push({ nomeEquipe, capitao, contato });
        res.redirect("/listarEquipes");
        return;
    }

    let conteudo = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet">
            <title>Cadastro Equipe</title>
        </head>
        <body>
        <div class="container">
            <h1 class="text-center border m-3 p-3 bg-light">Cadastro de Equipe</h1>
            <form method="POST" action="/adicionarEquipe" class="row g-3 m-3 p-3 bg-light">
    `;

    conteudo += `
        <div class="col-md-6">
            <label class="form-label">Nome da Equipe</label>
            <input type="text" class="form-control" name="nomeEquipe" value="${nomeEquipe || ""}">
    `;

    if (!nomeEquipe) {
        conteudo += `<p class="text-danger">Informe o nome da equipe.</p>`;
    }

    conteudo += `</div>`;

    conteudo += `
        <div class="col-md-6">
            <label class="form-label">Capitão</label>
            <input type="text" class="form-control" name="capitao" value="${capitao || ""}">
    `;

    if (!capitao) {
        conteudo += `<p class="text-danger">Informe o capitão.</p>`;
    }

    conteudo += `</div>`;

    conteudo += `
        <div class="col-md-6">
            <label class="form-label">Contato</label>
            <input type="text" class="form-control" name="contato" value="${contato || ""}">
    `;

    if (!contato) {
        conteudo += `<p class="text-danger">Informe o contato.</p>`;
    }

    conteudo += `
        </div>
        <div class="col-12">
            <button class="btn btn-primary" type="submit">Cadastrar</button>
            <a class="btn btn-secondary" href="/">Voltar</a>
        </div>
        </form></div></body></html>
    `;

    res.send(conteudo);
});

server.get("/listarEquipes", verificarUsuarioLogado, (req, res) => {
    let conteudo = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet">
            <title>Lista de Equipes</title>
        </head>
        <body>
        <div class="container">
            <h1 class="text-center border m-3 p-3 bg-light">Lista de Equipes</h1>

            <table class="table table-striped table-hover">
                <thead>
                    <tr>
                        <th>Equipe</th>
                        <th>Capitão</th>
                        <th>Contato</th>
                    </tr>
                </thead>
                <tbody>
    `;

    for (let i = 0; i < listaEquipes.length; i++) {
        conteudo += `
            <tr>
                <td>${listaEquipes[i].nomeEquipe}</td>
                <td>${listaEquipes[i].capitao}</td>
                <td>${listaEquipes[i].contato}</td>
            </tr>
        `;
    }

    conteudo += `
                </tbody>
            </table>
            <a class="btn btn-secondary m-3" href="/">Voltar</a>
        </div>
        </body>
        </html>
    `;

    res.send(conteudo);
});

server.get("/cadastroJogador", verificarUsuarioLogado, (req, res) => {

    let options = `<option value="">Selecione...</option>`;
    for (let i = 0; i < listaEquipes.length; i++) {
        options += `<option value="${i}">${listaEquipes[i].nomeEquipe}</option>`;
    }

    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet">
            <title>Cadastro de Jogador</title>
        </head>
        <body>
        <div class="container">
            <h1 class="text-center border m-3 p-3 bg-light">Cadastro de Jogador</h1>

            <form method="POST" action="/adicionarJogador" class="row g-3 m-3 p-3 bg-light">
                
                <div class="col-md-6">
                    <label class="form-label">Nome do Jogador</label>
                    <input type="text" class="form-control" name="nomeJogador">
                </div>

                <div class="col-md-6">
                    <label class="form-label">Nickname</label>
                    <input type="text" class="form-control" name="nickname">
                </div>

                <div class="col-md-6">
                    <label class="form-label">Função</label>
                    <select name="funcao" class="form-control">
                        <option value="">Selecione</option>
                        <option value="Top">Top</option>
                        <option value="Jungle">Jungle</option>
                        <option value="Mid">Mid</option>
                        <option value="ADC">ADC</option>
                        <option value="Suporte">Suporte</option>
                    </select>
                </div>

                <div class="col-md-6">
                    <label class="form-label">Elo</label>
                    <input type="text" class="form-control" name="elo">
                </div>

                <div class="col-md-6">
                    <label class="form-label">Gênero</label>
                    <input type="text" class="form-control" name="genero">
                </div>

                <div class="col-md-6">
                    <label class="form-label">Equipe</label>
                    <select name="equipeIndex" class="form-control">
                        ${options}
                    </select>
                </div>

                <div class="col-12">
                    <button class="btn btn-primary">Cadastrar</button>
                    <a href="/" class="btn btn-secondary">Voltar</a>
                </div>

            </form>
        </div>
        </body>
        </html>
    `);
});

server.post("/adicionarJogador", verificarUsuarioLogado, (req, res) => {

    const { nomeJogador, nickname, funcao, elo, genero, equipeIndex } = req.body;

    const faltando = !nomeJogador || !nickname || !funcao || !elo || !genero || equipeIndex === "";

    if (!faltando) {

        const idx = parseInt(equipeIndex);
        const equipeExiste = listaEquipes[idx];

        if (equipeExiste) {

            let jogadoresDaEquipe = [];
            for (let j = 0; j < listaJogadores.length; j++) {
                if (listaJogadores[j].equipeIndex == idx) {
                    jogadoresDaEquipe.push(listaJogadores[j]);
                }
            }

            if (jogadoresDaEquipe.length < 5) {
                listaJogadores.push({
                    nomeJogador,
                    nickname,
                    funcao,
                    elo,
                    genero,
                    equipeIndex: idx
                });

                res.redirect("/listarJogadores");
                return;

            } else {
                
                return res.send(`
                    <h1>Essa equipe já possui 5 jogadores!</h1>
                    <a href="/cadastroJogador" class="btn btn-secondary">Voltar</a>
                `);
            }
        }
    }

    let options = `<option value="">Selecione...</option>`;
    for (let i = 0; i < listaEquipes.length; i++) {
        options += `<option value="${i}" ${equipeIndex == i ? "selected" : ""}>${listaEquipes[i].nomeEquipe}</option>`;
    }

    let conteudo = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet">
            <title>Cadastro Jogador</title>
        </head>
        <body>
        <div class="container">
            <h1 class="text-center border m-3 p-3 bg-light">Cadastro de Jogador</h1>

            <form method="POST" action="/adicionarJogador" class="row g-3 m-3 p-3 bg-light">

    `;

    function erro(campo) {
        if (!campo) {
            return `<p class="text-danger">Campo obrigatório.</p>`;
        }
        return "";
    }

    conteudo += `
        <div class="col-md-6">
            <label class="form-label">Nome do Jogador</label>
            <input type="text" class="form-control" name="nomeJogador" value="${nomeJogador || ""}">
            ${erro(nomeJogador)}
        </div>

        <div class="col-md-6">
            <label class="form-label">Nickname</label>
            <input type="text" class="form-control" name="nickname" value="${nickname || ""}">
            ${erro(nickname)}
        </div>

        <div class="col-md-6">
            <label class="form-label">Função</label>
            <select name="funcao" class="form-control">
                <option value="">Selecione</option>
                <option ${funcao==="Top"?"selected":""}>Top</option>
                <option ${funcao==="Jungle"?"selected":""}>Jungle</option>
                <option ${funcao==="Mid"?"selected":""}>Mid</option>
                <option ${funcao==="ADC"?"selected":""}>ADC</option>
                <option ${funcao==="Suporte"?"selected":""}>Suporte</option>
            </select>
            ${erro(funcao)}
        </div>

        <div class="col-md-6">
            <label class="form-label">Elo</label>
            <input type="text" class="form-control" name="elo" value="${elo || ""}">
            ${erro(elo)}
        </div>

        <div class="col-md-6">
            <label class="form-label">Gênero</label>
            <input type="text" class="form-control" name="genero" value="${genero || ""}">
            ${erro(genero)}
        </div>

        <div class="col-md-6">
            <label class="form-label">Equipe</label>
            <select name="equipeIndex" class="form-control">
                ${options}
            </select>
            ${erro(equipeIndex)}
        </div>

        <div class="col-12">
            <button class="btn btn-primary">Cadastrar</button>
            <a href="/" class="btn btn-secondary">Voltar</a>
        </div>

        </form></div></body></html>
    `;

    res.send(conteudo);
});

server.get("/listarJogadores", verificarUsuarioLogado, (req, res) => {

    let conteudo = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet">
            <title>Lista de Jogadores</title>
        </head>
        <body>
        <div class="container">
            <h1 class="text-center border m-3 p-3 bg-light">Jogadores por Equipe</h1>
    `;

    for (let i = 0; i < listaEquipes.length; i++) {

        conteudo += `
            <h3 class="mt-4">${listaEquipes[i].nomeEquipe} - Capitão: ${listaEquipes[i].capitao}</h3>
            <ul class="list-group">
        `;

        let encontrou = false;

        for (let j = 0; j < listaJogadores.length; j++) {
            if (listaJogadores[j].equipeIndex == i) {
                encontrou = true;
                conteudo += `
                    <li class="list-group-item">
                        ${listaJogadores[j].nomeJogador} - ${listaJogadores[j].nickname}
                        (${listaJogadores[j].funcao}, ${listaJogadores[j].elo}, ${listaJogadores[j].genero})
                    </li>
                `;
            }
        }

        if (!encontrou) {
            conteudo += `<li class="list-group-item text-muted">Nenhum jogador cadastrado.</li>`;
        }

        conteudo += `</ul>`;
    }

    conteudo += `
        <a class="btn btn-secondary m-3" href="/">Voltar</a>
        </div></body></html>
    `;

    res.send(conteudo);
});

server.get("/login", (requisicao, resposta) => {
    resposta.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet">
        </head>
        <body>
        <div class="container w-25">
            <form action='/login' method='POST' class="row g-3">
                <fieldset class="border p-2">
                    <legend class="mb-3">Autenticação do Sistema</legend>

                    <label class="form-label">Usuário:</label>
                    <input type="text" class="form-control" name="usuario">

                    <label class="form-label">Senha:</label>
                    <input type="password" class="form-control" name="senha">

                    <button class="btn btn-primary mt-3">Login</button>
                </fieldset>
            </form>
        </div>
        </body>
        </html>
    `);
});


server.post("/login", (req, res) => {
    const { usuario, senha } = req.body;

    if (usuario === "admin" && senha === "admin") {
        req.session.dadosLogin = {
            nome: "Administrador",
            logado: true
        };
        res.redirect("/");
        return;
    }

    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet">
        </head>
        <body>
        <div class="container w-25">
            <form action='/login' method='POST' class="row g-3">
                <fieldset class="border p-2">
                    <legend class="mb-3">Autenticação do Sistema</legend>

                    <label class="form-label">Usuário:</label>
                    <input type="text" class="form-control" name="usuario">

                    <label class="form-label">Senha:</label>
                    <input type="password" class="form-control" name="senha">

                    <button class="btn btn-primary mt-3">Login</button>
                </fieldset>
                <p class="text-danger mt-2">Usuário ou senha inválidos!</p>
            </form>
        </div>
        </body>
        </html>
    `);
});


server.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.clearCookie("connect.sid");
        res.redirect("/login");
    });
});

function verificarUsuarioLogado(requisicao, resposta, proximo){
    if (requisicao.session.dadosLogin?.logado) {
        proximo();
    } else {
        resposta.redirect("/login");
    }
}

server.listen(porta, host, () => {
    console.log(`Servidor executando em http://${host}:${porta}`);
});
