let wallets = []
let selected_wallet = null
const default_color = '#27AE60'

class Wallet {
    constructor(param = {}) {
        this.div
        this.name = 'New Wallet'
        this.color = default_color
        this.type
        this.balance = 0.00
        this.initial_balance = this.balance
        this.records = []
        this.id = wallets.length
        
        let parameters = ['name', 'color', 'type', 'balance', 'initial_balance', 'records']
        parameters.forEach(x => { if(param[x] != null) this[x] = param[x] })
        
        this.print()
        wallets.push(this)
    }

    set_balance(new_balance) {
        this.balance = new_balance
        this.balance_div.innerText = parse_USD(this.balance)
    }

    add_balance(addition) { 
        this.set_balance(parseFloat(this.balance) + parseFloat(addition))
    }
    
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
        icon.classList.add('fa-duotone')
        icon.classList.add('fa-wallet')
        icon.classList.add('icon')
        this.title_span.classList.add('title')
        this.balance_div.classList.add('balance')

        this.div.onclick = function() {
            that.select()
        }

        this.div.oncontextmenu = function(e) {
            e.preventDefault()
            edit_wallet(that)
        }

        this.div.append(icon)
        this.div.append(details)
        details.append(this.title_span)
        details.append(this.balance_div)
        // document.querySelector('#wallets #container').append(this.div)
        document.querySelector('#wallets #container').insertBefore(this.div, document.querySelector('#wallets #container #new'))
        this.update()

        let option = document.createElement('option')
        option.value = this.id
        option.innerText = this.name
        document.querySelector('#new_record_wallet').append(option)
        
     }

     update() {
        this.title_span.innerText = this.name
        this.balance_div.innerText = parse_USD(this.balance)
        this.div.style.background = this.color
     }

     select() {
        selected_wallet = this.id
        // Select Wallet
        wallets.forEach(wallet => {
            wallet.div.style.background = '#555'
            wallet.div.onclick = function() { wallet.select() }
        })
        this.div.style.background = this.color
        this.div.onclick = function() { select_all_wallets() }
        // for(let i = 1; i < 10; i++){
        //     try{
        //         document.querySelector(`card:nth-child(${i}n)`).style.borderLeft = `1px solid ${this.color}`
        //     }catch(err) {}
        // }
        // $('body').css('border-left', `1px solid ${this.color}`)

        update_cards({records: this.records, balance: this.balance, color: this.color, initial_balance: this.initial_balance})

        let that = this
        set_theme_color(this.color)
     }

     edit() {
         
     }

     delete() {
         wallets[this.id] = null
         save_data()
         window.location.reload()
     }
}

class Category {
    constructor(name, color, icon = 'fa-coins') {
        this.name = name
        this.color = color
        this.icon = icon
    }

    print_icon() {
        // <i class="fa-solid ${categories[1].icon}"></i>
        let icon = document.createElement('i')
        icon.classList.add('fa-solid')
        icon.classList.add(this.icon)
        return icon
    }
}


function new_wallet_button() {
    let div = document.createElement('div')
    let icon = document.createElement('i')
    let title = document.createElement('span')

    div.classList.add('wallet')
    div.id = 'new'
    icon.classList.add('fa-solid')
    icon.classList.add('fa-wallet')
    icon.classList.add('icon')
    title.classList.add('title')

    div.onclick = function() {
        
    }

    title.innerText = '+ New Wallet'
    // balance_div.innerText = '$'+balance
    // div.append(icon)
    div.onclick = function() { create_wallet() }
    div.append(title)
    document.querySelector('#wallets #container').append(div)
}

function create_wallet() {
    let w = new Wallet()
    w.edit()
    edit_wallet(w)
}

function edit_wallet(wallet, func = 'open') {
    let wallet_name = document.querySelector('#wallet_name')
    let wallet_balance = document.querySelector('#wallet_balance')
    let wallet_color = document.querySelector('#picker')
    if(func == 'open'){
        open_popup(`#edit_wallet`)
        wallet_name.value = wallet.name
        document.querySelector("#wallet_editing .title").innerText = wallet.name
        wallet_balance.value = wallet.balance
        document.querySelector("#wallet_editing .balance").innerText = parse_USD(wallet.balance)
        wallet_color.value = wallet.color
        $("#wallet_editing").css('background', wallet.color)
        document.querySelector('#submit_wallet_edit').onclick = (function() {
            edit_wallet(wallet, 'confirm')
        })
        document.querySelector('#delete_wallet').onclick = (function() {
            wallet.delete()
        })
    }else if(func == 'confirm') {
        wallet.name = wallet_name.value
        wallet.balance = wallet_balance.value
        wallet.color = wallet_color.value
        close_popup(`#edit_wallet`)
        wallet.update()
    }
}

function select_all_wallets() {
    // $('.active').css('color', default_color)
    // $('body').css('border-left', `1px solid transparent`)
    selected_wallet = null
    set_theme_color(default_color)
    $('#balance #value').css('color', 'white')
    let balance = 0
    let records = []
    wallets.forEach(wallet => {
        // console.log(wallet.balance)
        balance += parseFloat(wallet.balance)
        // console.log(balance)
        wallet.records.forEach(record => {
            records.push(record)
        })
    })
    
    records.sort((a, b) => (a.time > b.time) ? 1 : -1)
    
    update_cards({records: records, balance: balance})

    
    wallets.forEach(wallet => {
        wallet.div.style.background = wallet.color
        wallet.div.onclick = function() { wallet.select() }
    })
    for(let i = 1; i < 10; i++){
        try{
            document.querySelector(`card:nth-child(${i}n)`).style.borderLeft = `1px solid transparent`
        }catch(err) {}
    }
}