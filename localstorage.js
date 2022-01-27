class LocalStorage {
    constructor() {

    }

    get(item) {
        let value = localStorage.getItem(item)
        if(value.includes('{') || value.includes('['))
            value = JSON.parse(value)
        
        return value
    }

    set(item, value) {
        if(typeof value === 'object')
            value = JSON.stringify(value)

        return localStorage.setItem(item, value)
    }
}