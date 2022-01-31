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

function edit_record(wallet, record_id) {
    let record = wallets[wallet].records[record_id]
    
    
    let name = document.querySelector('#new_record_name').value
    let amount = parseFloat(document.querySelector('#screen').innerText)
    let new_wallet = document.querySelector('#new_record_wallet').value
    let category = document.querySelector('#new_record_category').value

    wallets[wallet].add_balance(amount - record.amount)
    // console.log(record)
    record.name = name
    record.amount = amount
    record.wallet = new_wallet
    record.category = category

    // console.log(record)

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

function print_record(container, record) {
    let color = 'green'
    let amount = record.amount
    let negative = ''
    if(record.amount < 0){
        color = 'red'
    }
    let d = new Date(record.time)
    let time = `${MONTH[d.getMonth()]}-${d.getDate()} ${d.getFullYear()}`
    let div = document.createElement('div')
    div.classList.add('transaction_container')
    
    let is_income = ''
    if(record.category == 1) is_income = ' income'
    
    let name = record.name
    if(name == '') name = categories[record.category].name
    
    div.innerHTML = `
    <div class='icon left' onclick='delete_record("${record.id}", "${record.wallet}")'><i class="fa-solid fa-trash-can"></i></div>
    <div class='icon right' onclick='open_popup("#new_record", true, "${record.name}", ${record.amount}, ${record.wallet}, ${record.category}, ${record.id}, ${record.wallet})'><i class="fa-solid fa-pen"></i></div>

    <div class='transaction' ontouchstart='drag_transaction_record(event, this)' ontouchend='drag_stop()' onmousedown='drag_transaction_record(event, this)' onmouseup='drag_stop()'>
    <div class='category_icon' style='background: #151515; color: ${categories[record.category].color}'>
        <i class="fa-light ${categories[record.category].icon}"></i>
    </div>
    <div style='display: inline-block;'>
        <span>
        <span style='display: inline-block; margin-left: 5px;'>
            <span class='name'>${name}</span>
            <span class='category${is_income}' style='color: ${categories[record.category].color}'>${categories[record.category].name}</span>
        </span>
    </div>
    <div style='float: right;'>
        <span class='amount ${color}'>${parse_USD(amount)}</span> 
        <span class='time'>${time}</span>
    </div>
    </div>
    `

    div.oncontextmenu = function(e) {
        e.preventDefault()
    }

    container.prepend(div)
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
    data.save()
}