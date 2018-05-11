'use strict';

const https = require('https');
const path  = require('path');
const fs    = require('fs');
const ip    = require('ip');

let prefix = (new Date()).getDate() + '-' + (new Date()).getHours();

const base = {
    "ips": (fs.existsSync(path.join(__dirname, 'ips' + prefix + '.json')))
        ? JSON.parse((fs.readFileSync(path.join(__dirname, 'ips' + prefix + '.json'), 'utf8')))
        : [],
    "domains": (fs.existsSync(path.join(__dirname, 'domains' + prefix + '.json')))
        ? JSON.parse((fs.readFileSync(path.join(__dirname, 'domains' + prefix + '.json'), 'utf8')))
        : []
};

module.exports = check_rkn;

function check_rkn(check_data, callback) {
    let type = (typeof check_data === 'object' && check_data[0])
        ? (ip.isV4Format(check_data[0]))
            ? 'ips'
            : 'domains'
        : (ip.isV4Format(check_data))
            ? 'ips'
            : 'domains';
    if (!base[type].length) {
        clear();
        get(type, err => {
            if (err) return callback(err);
            base[type] = (fs.existsSync(path.join(__dirname, type + prefix + '.json')))
                ? JSON.parse((fs.readFileSync(path.join(__dirname, type + prefix + '.json'), 'utf8')))
                : [];
            check(type, check_data, base[type], (err, res) => {
                callback(err, res);
            })
        })
    }
    else {
        check(type, check_data, base[type], (err, res) => {
            callback(err, res);
        })
    }
}

function get(type, callback) {
    https.get('https://api.reserve-rbl.ru/api/v2/' + type + '/json', response => {
        let data = '';
        response.on('data', chunk => {
            data += chunk;
        });
        response.on('end', () => {
            fs.writeFile(
                path.join(__dirname, type + prefix + '.json'),
                decodeURIComponent(JSON.stringify(JSON.parse(data)))
                    .replace(/\\/g, '')
                    .replace('"[', '[')
                    .replace(']"', ']')
                    .replace(/\*\./g, ''),
                err => callback(err)
            );
        });
    })
        .on('error', err => {
            callback(err)
        });
}

function check(type, check_data, data, callback) {
    if (typeof check_data === 'object') {
        if (type === 'ips') {
            callback(null, check_data.map(check_d => {
                let res = data.filter(d => ip.cidrSubnet(d.indexOf('/')+1?d:d+'/32').contains(check_d));
                return {"ip": check_d, "block": !!res.length}
            }));
        }
        else {
            callback(null, check_data.map(check_d => {
                let res = data.filter(d => d === check_d);
                return {"domain": check_d, "block": !!res.length}
            }));
        }
    }
    else {
        if (type === 'ips') {
            let res = data.filter(d => ip.cidrSubnet(d.indexOf('/')+1?d:d+'/32').contains(check_data));
            callback(null, !!res.length);
        }
        else {
            let res = data.filter(d => d === check_data);
            callback(null, !!res.length);
        }
    }
}

function clear() {
    (fs.readdirSync(path.join(__dirname))).forEach(function (f) {
        if (!!~f.search(/domains|ips/) && !~f.indexOf(prefix)) {
            fs.unlinkSync(path.join(__dirname, f));
        }
    });
}