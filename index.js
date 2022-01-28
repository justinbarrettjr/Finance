const MONTH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const SYNC_URL = 'http://10.0.0.12/sync/wallet.php'
let wallet_container
let screen
let drag
let last_drag
let drag_start
let drag_offset
let drag_enabled = false

let categories = [
    new Category('Unkown', '#7F8C8D', 'fa-question'),
    new Category('Income', '#27AE60', 'fa-coins'),
    new Category('Food', '#E67E22', 'fa-utensils'),
    new Category('Gas', '#8E44AD', 'fa-gas-pump'),
    new Category('Debt', '#E74C3C', 'fa-credit-card'),
    new Category('Bills', '#C0392B', 'fa-money-bill'),
    new Category('Shopping', '#3498DB', 'fa-bag-shopping'),
    new Category('Other', '#7F8C8D', 'fa-bars'),
    new Category('Transfer', '#7F8C8D', 'fa-right-left')
]

function init() {
    // Color Picker
    $("#picker").drawrpalette().on("preview.drawrpalette",function(event,hexcolor){
        $("#wallet_editing").css('background', hexcolor)
    }).on("cancel.drawrpalette",function(event,hexcolor){
        $("#wallet_editing").css('background', hexcolor)
    }).on("choose.drawrpalette",function(event,hexcolor){
        console.debug("choose: " + hexcolor);
    })


    console.log(localStorage.wallets)
    screen = document.querySelector("#screen")

    const category_div = document.querySelector('#categories')
    categories.forEach(x => {
        // `<i class="fa-solid ${categories[1].icon}"></i>`
        let div = document.createElement('div')
        div.innerHTML = `
        <span style="background: ${x.color};">
        <i class="fa-solid ${x.icon}"></i>
        </span>
        ${x.name}`
        category_div.append(div)
    })

    // sync_data()
    sync_status_check()

    // Load Wallets
    if(localStorage.getItem('wallets') != null){
        let arr = JSON.parse(localStorage.getItem('wallets'))
        arr.forEach(x => {
            if(x != null){
                let w = new Wallet({
                    name: x.name,
                    color: x.color,
                    type: x.type,
                    records: x.records,
                    balance: x.balance,
                    initial_balance: x.initial_balance
                })
            }
        })
    }
        
    for(let i = 1; i < categories.length; i++){
        let option = document.createElement('option')
        option.value = i
        console.log(categories[i].print_icon())
        option.innerText = `${categories[i].name}`
        document.querySelector('#new_record_category').append(option)
    }

    // new_wallet_button()

    select_all_wallets()
}

function resize() {

}

// Transaction Edit/Delete Drag
document.ontouchmove = function(e) {
    drag_move(e)
}

document.onmousemove = function(e) {
    drag_move(e)
}

function drag_move(e) {
    let touch_position

    if(e.type == 'mousemove')
        touch_position = e.clientX
    else
        touch_position = e.targetTouches[0].clientX

    if(!drag_enabled) {
        const BUFFER = 15
        try{
            if(touch_position < drag_start.x - BUFFER || touch_position > drag_start.x + BUFFER)
                drag_enabled = true
        }catch(err){}
    }

    if(drag != null && drag_enabled){
        let card_width = document.querySelector('card').offsetWidth

        if(e.type == 'mousedown' || e.type == 'mousemove')
            drag_offset = e.clientX - drag_start.x
        else
            drag_offset = e.targetTouches[0].clientX - drag_start.x

        if(drag_offset > 60)
            drag_offset = 60
        if(drag_offset < -60)
            drag_offset = -60
        
        if(drag_offset > 0){
            drag.style.right = '0'
            drag.style.left = drag_offset + 'px'
        }else{
            drag.style.left = '0'
            drag.style.right = -drag_offset + 'px'
        }
        
    }
}

function drag_transaction_record(e, that, id, wallet) {
    // e.preventDefault()
    drag_offset = 0
    if(last_drag != null){
        last_drag.style.left = '0'
        last_drag.style.right = '0'
    }
    drag = that
    if(e.type == 'touchstart')
        drag_start = {x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY}
    else
        drag_start = {x: e.clientX, y: e.clientY}
}

function drag_stop() {
    drag_enabled = false
    if(drag_offset > 55){
        drag.style.left = '60px'
    }else if(drag_offset < -55){
        drag.style.right = '60px'
    }else{
        drag_offset = 0
        drag.style.left = '0'
        drag.style.right = '0'
    }

    last_drag = drag
    drag = null
}

function delete_record(id, wallet) {
    let record = wallets[wallet].records
    last_drag.parentElement.remove()
    wallets[wallet].add_balance(-record[id].amount)
    record.splice(id, 1)
    save_data()
}



function parse_USD(number) {
    let usd = (Math.round(number * 100) / 100).toFixed(2)
    if(usd < 0){
        usd = (Math.round(-usd * 100) / 100).toFixed(2)
        usd = `-$${usd}`
    }else
        usd = `$${usd}`
    return usd
}

function toggle_neg() {
    const neg_div = document.querySelector('#plusmin')
    if(neg_div.innerHTML == '-')
        neg_div.innerText = '+'
    else
        neg_div.innerText = '-'
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
    $('#add_record').css('background', default_color)
    $('#balance #value').css('color', 'white')
    let balance = 0
    let records = []
    wallets.forEach(wallet => {
        console.log(wallet.balance)
        balance += parseFloat(wallet.balance)
        console.log(balance)
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

function open_popup(id, editing = false, name = null, amount = null, new_wallet = null, category = null, record_id = null, wallet = null) {

    if(editing == false){
        document.querySelector('#new_record_name').value = ''
        document.querySelector('#screen').innerText = 0
        document.querySelector('#new_record_wallet').value = 0
        document.querySelector('#new_record_category').value = 1
        document.querySelector('#plusmin').innerHTML = '-'
        document.querySelector('#new_record').style.background = '#0d75eb'
        document.querySelector('#equals').style.background = '#0d75eb'
        document.querySelector("#submit_changes").onclick = function() { add_record() }
    }else{
        document.querySelector('#new_record_name').value = name
        if(editing.amount < 0){
            editing.amount *= -1
            document.querySelector('#plusmin').innerHTML = '-'
        }else
            document.querySelector('#plusmin').innerHTML = '+'

        document.querySelector('#screen').innerText = amount
        document.querySelector('#new_record_wallet').value = new_wallet
        document.querySelector('#new_record_category').value = category
        document.querySelector('#new_record').style.background = '#52a831'
        document.querySelector('#equals').style.background = '#52a831'
        document.querySelector("#submit_changes").onclick = function() { edit_record(wallet, record_id) }
    }
    document.querySelector(id).style.display = 'block'
}

function close_popup(id) {
    save_data()
    document.querySelector(id).style.display = 'none'
}

function edit_record(wallet, record_id) {
    let record = wallets[wallet].records[record_id]
    
    let name = document.querySelector('#new_record_name').value
    let amount = parseFloat(document.querySelector('#screen').innerText)
    let new_wallet = document.querySelector('#new_record_wallet').value
    let category = document.querySelector('#new_record_category').value

    wallets[wallet].add_balance(amount - record.amount)
    console.log(record)
    record.name = name
    record.amount = amount
    record.wallet = new_wallet
    record.category = category

    console.log(record)

    close_popup('#new_record')
    select_all_wallets()
}

function add_record() {
    let name = document.querySelector('#new_record_name').value
    let amount = parseFloat(document.querySelector('#screen').innerText)
    let wallet = document.querySelector('#new_record_wallet').value
    let category = document.querySelector('#new_record_category').value

    if(document.querySelector('#plusmin').innerHTML == '-')
        amount *= -1

    wallets[wallet].add_record(name, amount, Date.now(), category)
    // console.log({name: name, amount: amount, wallet: wallet, category: category})

    close_popup('#new_record')
    // wallets[wallet].select()
    select_all_wallets()
}




// Data Management
function save_data() {
    localStorage.setItem('wallets', JSON.stringify(wallets))
    sync_data()
}

function sync_data() {
    $.post(SYNC_URL, {data: localStorage.getItem('wallets')}, function(data, status){
        localStorage.setItem('last_sync', data)
        show_sync_badge()
        console.log('syncing data')
      });
}

function show_sync_badge() {
    const badge = document.querySelector('#sync_badge')
    badge.style.opacity = 1
    setTimeout(function(){ badge.style.opacity = .3 }, 500)
    setTimeout(function(){ badge.style.opacity = 1 }, 1000)
    setTimeout(function(){ badge.style.opacity = .3 }, 1500)
    setTimeout(function(){ badge.style.opacity = 0 }, 1700)
}

function sync_status_check() {
    $.post(SYNC_URL, {status_check: true}, function(data, status){
        if(localStorage.getItem('last_sync') < data){
            download_sync(data)
        }else
            sync_data()
      });
}

function download_sync(time_stamp) {
    $.post(SYNC_URL, {download: true}, function(data, status){
        localStorage.setItem('wallets', data)
        localStorage.setItem('last_sync', time_stamp)
        location.reload()
        // console.log(data)
      });
}