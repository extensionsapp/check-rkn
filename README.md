# Check IP or domain in RKN blocking.

<p align="center"><img src="https://raw.githubusercontent.com/extensionsapp/check-rkn/master/logo.png"></p>

### Installation
```
npm i check-rkn
```

### Usage

```javascript
const rkn = require('check-rkn');

rkn(['105.28.12.143', '104.28.12.143'], (err, res) => {
    console.log(res)
});
// [ { ip: '105.28.12.143', block: false },
//   { ip: '104.28.12.143', block: true  } ]

rkn('104.28.12.143', (err, res) => {
    console.log(res)
});
// true

rkn(['google.com', 'linkedin.com'], (err, res) => {
    console.log(res)
});
// [ { ip: 'google.com', block: false },
//   { ip: 'linkedin.com', block: true  } ]

rkn('linkedin.com', (err, res) => {
    console.log(res)
});
// true
```

© 2018 ExtensionsApp