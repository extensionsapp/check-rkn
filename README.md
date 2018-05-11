# Check blocking RKN domain or IP.

<p align="center"><img src="https://raw.githubusercontent.com/extensionsapp/check-rkn/master/logo.jpg"></p>

### Install
`npm i check-rkn`

### How to use

```
const rkn = reqire('check-rkn');

rkn(['105.28.12.143', '104.28.12.143'], (err, res) => {
    console.log(res));
});
// [ { ip: '105.28.12.143', block: false },
//   { ip: '104.28.12.143', block: true  } ]

rkn('104.28.12.143', (err, res) => {
    console.log(res));
});
// true

rkn(['google.com', 'linkedin.com'], (err, res) => {
    console.log(res));
});
// [ { ip: 'google.com', block: false },
//   { ip: 'linkedin.com', block: true  } ]

rkn('linkedin.com', (err, res) => {
    console.log(res));
});
// true
```

© 2018 ExtensionsApp