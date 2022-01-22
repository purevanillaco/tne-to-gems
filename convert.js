const { readFileSync, writeFileSync } = require('fs');
const { exit } = require('process');
const YAML = require('yaml')
let filePath, host, port, database, username, password, tablePrefix, data;

for (var i = 2; i < process.argv.length; i++) {
    const val = process.argv[i];
    switch (i) {
        case 2:
            filePath = val
            break;
        case 3:
            host = val
            break;
        case 4:
            port = Number(val)
            break;
        case 5:
            database = val
            break;
        case 6:
            username = val
            break;
        case 7:
            password = val
            break;
        case 8:
            tablePrefix = val
            break;
        default:
            throw new Error("unknown param: " + i)
    }
}

if (!filePath) throw new Error("missing path")
if (!host) throw new Error("missing host")
if (!port) throw new Error("missing port")
if (!database) throw new Error("missing database")
if (!username) throw new Error("missing username")
if (!password) throw new Error("missing password")

let currency;
let decimal;
try {
    data = YAML.parse(readFileSync(filePath, {
        encoding: 'utf8'
    }))
    if (!('currencies' in data)) throw new Error("no currencies configured (unknown config section)")
    for (const currencyId in data.currencies) {
        if (Object.hasOwnProperty.call(data.currencies, currencyId)) {
            currency = currencyId
            decimal = data.currencies[currencyId].decimalsupported
            break;
        }
    }
    if (!currency) throw new Error("no currencies configured")
} catch (error) {
    throw new Error("invalid path or yaml data: " + error.message)
}

const knex = require('knex')({
    client: 'mysql2',
    connection: {
        host: host,
        port: port,
        user: username,
        password: password,
        database: database
    }
});

const usersTable = `${tablePrefix}_USERS`;
const balanceTable = `${tablePrefix}_BALANCES`;
let imported = 0;

console.log("reading balances")
knex(`${tablePrefix}_BALANCES`)
    .join(usersTable, `${balanceTable}.uuid`, '=', `${usersTable}.uuid`)
    .select(`${balanceTable}.uuid`, `${balanceTable}.balance`, `${usersTable}.display_name`).then((balances) => {
        console.log(`got ${balances.length} balances`)
        balances.forEach(balance => {
            const bal = decimal ? Number(balance.balance) : Math.floor(Number(balance.balance));
            if (bal > 0) {
                imported++;
                let currencyobj = {}
                currencyobj[currency] = bal
                data.accounts[balance.uuid] = {
                    nickname: balance.display_name,
                    uuid: balance.uuid,
                    payable: true,
                    balances: currencyobj
                }
            }
        });
        console.log(`imported ${imported} balances (skipped null/0 bals)`)

        console.log(`exporting`)
        writeFileSync(`${String(filePath).replace('.yml', '')}.imported.yml`, YAML.stringify(data), {
            encoding: 'utf8'
        })
        console.log(`exported, replace data.yml with data.yml.converted whenever you are ready to make the switch. if you want to use mysql, start your server and execute /currency convert\nquiquelhappy@purevanilla.co`)
        process.exit(1)
    })