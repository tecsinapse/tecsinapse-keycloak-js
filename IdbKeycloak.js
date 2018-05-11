import * as idb from 'idb';

const IDB_NAME = 'tecsinapse-keycloak-token';
const OBJECT_STORE_NAME = 'token';

const dbPromise = idb.open(IDB_NAME, 1, upgradeDB => {
    upgradeDB.createObjectStore(OBJECT_STORE_NAME);
});

const IdbKeycloak = {
    get(key) {
        return dbPromise.then(db => {
            return db.transaction(OBJECT_STORE_NAME)
                .objectStore(OBJECT_STORE_NAME)
                .get(key);
        });
    },
    set(key, val) {
        return dbPromise.then(db => {
            const tx = db.transaction(OBJECT_STORE_NAME, 'readwrite');
            tx.objectStore(OBJECT_STORE_NAME).put(val, key);
            return tx.complete;
        });
    },
    delete(key) {
        return dbPromise.then(db => {
            const tx = db.transaction(OBJECT_STORE_NAME, 'readwrite');
            tx.objectStore(OBJECT_STORE_NAME).delete(key);
            return tx.complete;
        });
    },
    clear() {
        return dbPromise.then(db => {
            const tx = db.transaction(OBJECT_STORE_NAME, 'readwrite');
            tx.objectStore(OBJECT_STORE_NAME).clear();
            return tx.complete;
        });
    },
};