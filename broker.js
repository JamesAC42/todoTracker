const createServer = require('http').createServer;
const fs = require('fs');
const escape = require('validator').escape;
const formidable = require('formidable');
const bcrypt = require('bcrypt');

const _PORT = 5001;
const saltRounds = 10;

const lists = require('./lists.json').lists;

const handler = (req, res) => {
  const url = req.url;
  console.log(url);
  if(req.method.toLowerCase() === "post") {
    switch(url) {
      case '/createAccount':
        createAccount(req, res);
        break;
      case '/signIn':
        signIn(req, res);
        break;
      default:
        res.writeHead(404);
        res.end();
    }
  } else {
    console.log(`GET request for ${url}`);
    res.end();
  }
}

const createAccount = (req, res) => {
  const form = new formidable.IncomingForm();
  res.writeHead(200, {'Content-Type': 'application/json'});
  form.parse(req, (err, fields) => {
    const username = escape(fields.username);
    const password = escape(fields.password);
    let users = require('./users.json');
    for(let user in users.users) {
      if(users.users[user].username === username){
        res.end(JSON.stringify({
          status: "INVALID",
          message: "Username already exists"
        }));
        return;
      }
    }
    let newUser = {};
    newUser.username = username;
    bcrypt.hash(password, saltRounds)
    .then(hash => {
      newUser.password = hash;
      users.users.push(newUser);
      fs.writeFile('./users.json', JSON.stringify(users, null, '  '), 'utf8',
      callback => {
        res.end(JSON.stringify({username}));
      })
    })
  })
}

const signIn = (req, res) => {
  const form = new formidable.IncomingForm();
  res.writeHead(200, {'Content-Type': 'application/json'});
  form.parse(req, (err, fields) => {
    const username = escape(fields.username);
    const password = escape(fields.password);
    const users = require('./users.json');
    let flag = 0;
    for(let user in users.users) {
      let entry = users.users[user];
      if(entry.username === username){
        let hash = entry.password;
        flag = 0;
        bcrypt.compare(password, hash)
        .then(result => {
          if(result){
            res.end(JSON.stringify({username}));
            return;
          }else{
            res.end(JSON.stringify({
              status: "INVALID",
              message: "Invalid username or password"
            }));
            return;
          }
        })
      }
      flag++;
    }
    if(flag === users.users.length) {
      console.log('flag');
      res.end(JSON.stringify({
        status: "INVALID",
        message: "Invalid username or password"
      }));
      return;
    }
  })
}

const server = createServer(handler);
const io = require('socket.io')(server);

io.on('connection', socket => {
  io.emit('update', {lists});
});

io.on('editLists', data => {
  let write = {data};
  io.emit('update', write);
  fs.writeFile('./lists.json', JSON.stringify(write, null, '  '), 'utf8',
  callback => {
    return;
  })
});

server.listen(_PORT);
console.log(`Listening on ${_PORT}...`);