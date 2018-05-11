'use strict';

const https = require('https');
const async = require('async');
const path  = require('path');
const dns   = require('dns');
const fs    = require('fs');
const ip    = require('ip');

let prefix = (new Date()).getDate() + '-' + (new Date()).getHours();

let base = {
    "ips": (fs.existsSync(path.join(__dirname, 'ips' + prefix + '.json')))
        ? JSON.parse((fs.readFileSync(path.join(__dirname, 'ips' + prefix + '.json'), 'utf8')))
        : [],
    "domains": (fs.existsSync(path.join(__dirname, 'domains' + prefix + '.json')))
        ? JSON.parse((fs.readFileSync(path.join(__dirname, 'domains' + prefix + '.json'), 'utf8')))
        : []
};

module.exports = check_rkn;

function check_rkn(check_data, callback) {
    let type = typeof check_data !== 'object'
        ? ip.isV4Format(check_data) ? 'ip' : 'domain'
        : false;
    check_data = typeof check_data === 'object' ? check_data : [check_data];
    if (!base.ips.length || !base.domains.length) {
        clear();
        get('ips', err => {
            if (err) return callback(err);
            get('domains', err => {
                if (err) return callback(err);
                base['ips'] = (fs.existsSync(path.join(__dirname, 'ips' + prefix + '.json')))
                    ? JSON.parse((fs.readFileSync(path.join(__dirname, 'ips' + prefix + '.json'), 'utf8')))
                    : [];
                base['domains'] = (fs.existsSync(path.join(__dirname, 'domains' + prefix + '.json')))
                    ? JSON.parse((fs.readFileSync(path.join(__dirname, 'domains' + prefix + '.json'), 'utf8')))
                    : [];
                check(check_data, type, (err, res) => {
                    callback(err, res);
                })
            })
        })
    }
    else {
        check(check_data, type, (err, res) => {
            callback(err, res);
        })
    }
}

function check(check_data, type, callback) {
    async.forEachOf(check_data, function (value, key, callback) {
        if (!ip.isV4Format(value)) {
            dns.resolve4(value, (err, addresses) => {
                if (err) {
                    check_data.splice(key, 1, {
                        "domain": value,
                        "error": err.code,
                        "ips": []
                    });
                }
                else {
                    check_data.splice(key, 1, {
                        "domain": value,
                        "block": !!(base.domains.filter(d => d === value)).length,
                        "ips": addresses.map(address => {
                            return {
                                "ip": address,
                                "block": !!(base.ips.filter(i =>
                                    ip.cidrSubnet(i.indexOf('/')+1?i:i+'/32').contains(address))).length
                            }
                        })
                    });
                }
                callback()
            })
        }
        else {
            check_data.splice(key, 1, {
                "ip": value,
                "block": !!(base.ips.filter(i =>
                    ip.cidrSubnet(i.indexOf('/')+1?i:i+'/32').contains(value))).length
            });
            callback()
        }
    }, function () {
        if (type) {
            if (type === 'ip') {
                check_data = check_data[0].block;
            }
            else {
                check_data = check_data[0].block || !!(check_data[0].ips.filter(d => d.block)).length
            }
        }
        callback(null, check_data)
    })
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

function clear() {
    (fs.readdirSync(path.join(__dirname))).forEach(function (f) {
        if (!!~f.search(/domains|ips/) && !~f.indexOf(prefix)) {
            fs.unlinkSync(path.join(__dirname, f));
        }
    });
}