# Check IP or domain in RKN blocking.

<p align="center"><img src="https://raw.githubusercontent.com/extensionsapp/check-rkn/master/logo.png"></p>

### Installation
```
npm i check-rkn
```

### Usage

```javascript
const rkn = require('check-rkn');

// Check list IPs
rkn(['216.58.214.110', '108.174.10.10'], (err, res) => {
    console.log(res)
});
// [ { ip: '216.58.214.110', block: false },
//   { ip: '108.174.10.10', block: true  } ]

// Check one IP
rkn('108.174.10.10', (err, res) => {
    console.log(res)
});
// true

// Check list domains
rkn(['google.com', 'linkedin.com'], (err, res) => {
    console.log(res)
});
// [ { ip: 'google.com', block: false, ips: [ { ip: '216.58.214.110',  block: false } ] },
//   { ip: 'linkedin.com', block: true, ips: [ { ip: '108.174.10.10',  block: true } ] } ]

// Check one domain (and IP)
rkn('linkedin.com', (err, res) => {
    console.log(res)
});
// true
```

© 2018 ExtensionsApp