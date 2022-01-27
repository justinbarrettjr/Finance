let wallets = []
let selected_wallet = 0

class Wallet {
    constructor(param = {}) {
        this.div
        this.name = 'New Wallet'
        this.color = '#0e76ff'
        this.type
        this.balance = 0.00
        this.initial_balance = this.balance
        this.records = []
        this.id = wallets.length
        
        let parameters = ['name', 'color', 'type', 'balance', 'initial_balance', 'records']
        parameters.forEach(x => { if(param[x] != null) this[x] = param[x] })
        
        this.print()
        wallets.push(this)
        let balance_div
    }

    set_balance(new_balance) {
        this.balance = new_balance
        this.balance_div.innerText = parse_USD(this.balance)
    }

    add_balance(addition) { this.set_balance(this.balance + addition) }
    
    add_record(name, amount, time, category) {
        let record = new Record(name, amount, time, category, this.records.length, this.id)
        this.add_balance(amount)
        this.records.push(record)
    }

     print() {
        let that = this

        this.div = document.createElement('div')
        let icon = document.createElement('i')
        let details = document.createElement('div')
        this.title_span = document.createElement('span')
        this.balance_div = document.createElement('span')

        this.div.classList.add('wallet')
        this.div.style.background = this.color
        icon.classList.add('fa-solid')
        icon.classList.add('fa-wallet')
        icon.classList.add('icon')
        this.title_span.classList.add('title')
        this.balance_div.classList.add('balance')

        this.div.onclick = function() {
            that.select()
        }

        this.div.oncontextmenu = function(e) {
            e.preventDefault()
            open_popup('#edit_wallet')
        }

        this.title_span.innerText = this.name
        this.balance_div.innerText = parse_USD(this.balance)
        this.div.append(icon)
        this.div.append(details)
        details.append(this.title_span)
        details.append(this.balance_div)
        // document.querySelector('#wallets #container').append(this.div)
        document.querySelector('#wallets #container').insertBefore(this.div, document.querySelector('#wallets #container #new'))
     }

     select() {
        selected_wallet = this.id
        // Select Wallet
        wallets.forEach(wallet => {
            wallet.div.style.background = '#555'
            wallet.div.onclick = function() { wallet.select() }
        })
        this.div.onclick = function() { select_all_wallets() }
        this.div.style.background = this.color
        for(let i = 1; i < 10; i++){
            try{
                document.querySelector(`card:nth-child(${i}n)`).style.borderLeft = `1px solid ${this.color}`
            }catch(err) {}
        }

        
        update_cards({records: this.records, balance: this.balance, color: this.color, initial_balance: this.initial_balance})

     }

     edit() {
         
     }
}

class Category {
    constructor(name, color, icon = 'fa-coins') {
        this.name = name
        this.color = color
        this.icon = icon
    }
}

class Record {
    constructor(name, amount, time, category, id, wallet) {
        this.name = name
        this.amount = amount
        this.time = time
        this.category = category
        this.id = id
        this.wallet = wallet
    }
}