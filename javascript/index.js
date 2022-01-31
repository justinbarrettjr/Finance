const MONTH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const SYNC_URL = 'http://10.0.0.12/sync/wallet.php'
let wallet_container
let screen
let drag
let last_drag
let drag_start
let drag_offset
let drag_enabled = false
let spending_chart_type = 'doughnut'
let cashflow_chart = 'line'
let data = new Data()

let categories = [
    new Category('Unkown', '#7F8C8D', 'fa-question'),
    new Category('Income', '#27AE60', 'fa-coins'),
    new Category('Food', '#E67E22', 'fa-utensils'),
    new Category('Gas', '#8E44AD', 'fa-gas-pump'),
    new Category('Debt', '#E74C3C', 'fa-credit-card'),
    new Category('Bills', '#C0392B', 'fa-money-bill'),
    new Category('Shopping', '#3498DB', 'fa-bag-shopping'),
    new Category('Other', '#7F8C8D', 'fa-bars'),
    new Category('Transfer', '#7F8C8D', 'fa-right-left'),
    new Category('Car Insurance', '#7E44AD', 'fa-car'),
    new Category('Vehicle Maintenance', '#7844AD', 'fa-wrench'),
]

function init() {

    // Color Picker
    $("#picker").drawrpalette().on("preview.drawrpalette",function(event,hexcolor){
        $("#wallet_editing").css('background', hexcolor)
    }).on("cancel.drawrpalette",function(event,hexcolor){
        $("#wallet_editing").css('background', hexcolor)
    }).on("choose.drawrpalette",function(event,hexcolor){
        // console.debug("choose: " + hexcolor);
    })


    // console.log(localStorage.wallets)
    screen = document.querySelector("#screen")

    const category_div = document.querySelector('#categories')
    categories.forEach(x => {
        // `<i class="fa-solid ${categories[1].icon}"></i>`
        let div = document.createElement('div')
        div.innerHTML = `
        <span style="color: ${x.color}; background: #191919;">
        <i class="fa-light ${x.icon}"></i>
        </span>
        ${x.name}`
        category_div.append(div)
    })

    // sync_data()
    data.check_sync()

    // Load Wallets
    data.load()

    // new_wallet_button()

    select_all_wallets()
    
    resize()
}

function resize() {
    let width = window.outerWidth
    let height = window.outerHeight
    if(window.innerWidth < width) width = window.innerWidth
    if(window.innerHeight < height) height = window.innerHeight
    height = height - document.querySelector('#balance').offsetTop - 213
    
    $('#transactions').css('width', `${width}px`)
    $('#transactions').css('height', `${height}px`)

    $('#stats').css('width', `${width}px`)
    $('#stats').css('height', `${height}px`)
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


function navigation(tab) {
    document.querySelector('#tab1').classList.remove('active')
    document.querySelector('#tab2').classList.remove('active')
    document.querySelector('#tab3').classList.remove('active')
    document.querySelector('#tab4').classList.remove('active')
    document.querySelector('#tab1').style.color = 'white'
    document.querySelector('#tab2').style.color = 'white'
    document.querySelector('#tab3').style.color = 'white'
    document.querySelector('#tab4').style.color = 'white'

    let color = default_color
    if(selected_wallet != null)
        color = wallets[selected_wallet].color

    $('#history').css('display', 'none')
    $('#spending').css('display', 'none')

    switch(tab) {
        case 'tab1':
            document.querySelector('#tab1').classList.add('active')
            $('#history').css('display', 'block')
        break
        case 'tab2':
            document.querySelector('#tab2').classList.add('active')
            $('#spending').css('display', 'block')
        break
        case 'tab3':
            document.querySelector('#tab3').classList.add('active')
        break
        case 'tab4':
            document.querySelector('#tab4').classList.add('active')
        break
    }

    $('.active').css('color', color)
}

function open_popup(id, editing = false, name = null, amount = null, new_wallet = null, category = null, record_id = null, wallet = null) {

    if(editing == false){
        document.querySelector('#new_record_name').value = ''
        document.querySelector('#screen').innerText = 0
        document.querySelector('#new_record_wallet').value = 0
        document.querySelector('#new_record_category').value = 1
        document.querySelector('#plusmin').innerHTML = '-'
        // document.querySelector('#new_record').style.background = '#0d75eb'
        // document.querySelector('#equals').style.background = '#0d75eb'
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
        // document.querySelector('#new_record').style.background = '#52a831'
        // document.querySelector('#equals').style.background = '#52a831'
        document.querySelector("#submit_changes").onclick = function() { edit_record(wallet, record_id) }
    }
    document.querySelector(id).style.display = 'block'
}

function close_popup(id) {
    data.save()
    document.querySelector(id).style.display = 'none'
}

function set_theme_color(color) {
    $('.green').css('color', color)
    $.each($('.fa-coins'), function( index, value ) {
        console.log(`index: ${index}, value: ${value}`)
        value.parentElement.style.color = color
    });
    $('#add_record').css('background', color)
    $('#balance #value').css('color', color)
    $('.active').css('color', color)
    $('#new_record').css('background', color)
    $('#equals').css('background', color)
    $('.income').css('color', color)
}