import path from 'node:path';
import { fileURLToPath } from 'node:url';
import NeDB from 'nedb';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new NeDB({
    filename: path.join(__dirname, '../db/user.db'),
    autoload: true,
});
const stagKey = '__stag_key__';

export default {
    getUserSecret(username) {
        return new Promise((resolve, reject) => {
            db.find(
                { username },
                (err, docs) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(docs[0]?.secret || null);
                    }
                },
            )
        });
    },
    setUserSecret(username, secret) {
        return new Promise((resolve, reject) => {
            db.insert(
                { username, secret },
                (err, docs) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(docs);
                    }
                },
            )
        });
    },
    removeUserSecret(username) {
        return new Promise((resolve, reject) => {
            db.remove(
                { username },
                (err, docs) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(docs);
                    }
                },
            )
        });
    },
    getStag(username) {
        return this.getUserSecret(`${stagKey} ${username}`);
    },
    setStag(username, secret) {
        return this.setUserSecret(`${stagKey} ${username}`, secret);
    },
    removeStag(username) {
        return this.removeUserSecret(`${stagKey} ${username}`);
    },
};