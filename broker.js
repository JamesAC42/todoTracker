const createServer = require('http').createServer;
const fs = require('fs');
const escape = require('validator').escape;
const formidable = require('formidable');
const bcrypt = require('bcrypt');

const _PORT = 5001;
const saltRounds = 10;

let lists = require('./lists.json').lists;

/*
  list item form
  {
    "username": "",
    "color": "",
    "itemsPending": [],
    "itemsCompleted": []
  }
  maybe typescript next time...
*/

const handler = (req, res) => {
  const url = req.url;
  if(req.method.toLowerCase() === "post") {
    switch(url) {
      case '/createAccount':
        createAccount(req, res);
        break;
      case '/signIn':
        signIn(req, res);
        break;
      case '/editLists':
        editLists(req, res);
        break;
      case '/editListUser':
        editListUser(req, res);
        break;
      default:
        res.writeHead(500);
        res.end();
    }
  } else {
    switch(url) {
      case '/listToJson':
        fs.createReadStream('./listToJson.html').pipe(res).once('end', () => {
          res.end();
        });
        break;
      default:
        res.writeHead(404);
        res.end();
    }
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
      res.end(JSON.stringify({
        status: "INVALID",
        message: "Invalid username or password"
      }));
      return;
    }
  })
}

const editLists = (req, res) => {
  const form = new formidable.IncomingForm();
  form.parse(req, (err, fields) => {
    let l = fields.lists;
    lists = l;
    io.emit('update', {lists});
    res.writeHead(200, {"Content-Type": "application/json"});
    res.end(JSON.stringify({success:true}));
  })
}

const editListUser = (req, res) => {
  const form = new formidable.IncomingForm();
  form.parse(req, (err, fields) => {
    let item = fields.item;
    let newLists = [...lists];
    for(let i in newLists){
      if(newLists[i].username === item.username){
        newLists.splice(i, 1, item);
      }
    }
    lists = newLists;
    io.emit('update', {lists});
    res.writeHead(200, {"Content-Type": "application/json"});
    res.end(JSON.stringify({success:true}));
  })
}

const server = createServer(handler);
const io = require('socket.io')(server);

io.on('connection', socket => {
  io.emit('update', {lists});
});

server.listen(_PORT);
console.log(`Listening on ${_PORT}...`);