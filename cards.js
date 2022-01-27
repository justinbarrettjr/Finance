function update_cards(param = {}){
    let records = param.records
    let balance = param.balance
    let initial_balance = param.initial_balance
    let color = param.color

    print_balance(balance)
    print_transactions(records)
    print_balance_history(records, color, initial_balance)
    print_spending(records, color, initial_balance)
}

function print_balance(balance) {
    const balance_value = document.querySelector('#details #balance #value')

    balance_value.innerText = `${parse_USD(balance)}`
}

function print_transactions(records) {
    const transactions_div = document.querySelector('#transactions')

    transactions_div.innerHTML = ''
    
    records.forEach(record => {
        print_record(transactions_div, record)
    })

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
        div.innerHTML = `
        <div class='icon left' onclick='delete_record("${record.id}", "${record.wallet}")'><i class="fa-solid fa-trash-can"></i></div>
        <div class='icon right' onclick='open_popup("#new_record", true, "${record.name}", ${record.amount}, ${record.wallet}, ${record.category}, ${record.id}, ${record.wallet})'><i class="fa-solid fa-pen"></i></div>

        <div class='transaction' ontouchstart='drag_transaction_record(event, this)' ontouchend='drag_stop()' onmousedown='drag_transaction_record(event, this)' onmouseup='drag_stop()'>
        <div class='category_icon' style='background: ${categories[record.category].color}'>
            <i class="fa-solid ${categories[record.category].icon}"></i>
        </div>
        <div style='display: inline-block;'>
            <span>
            <span style='display: inline-block; margin-left: 5px;'>
                <span class='name'>${record.name}</span>
                <span class='category'>${categories[record.category].name}</span>
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
}

function print_balance_history(records, color = 'white', initial_balance = 0) {
    document.getElementById('myChart').remove()
    let div = document.createElement('canvas')
    div.id = 'myChart'
    document.querySelector('#balance_history').append(div)

    let balance = initial_balance
    let arr = [balance]
    let last_day
    let labels = ['0']

    records.forEach(record => {
        balance += record.amount
        let this_day = new Date(record.time)
        this_day.setUTCHours(0,0,0,0)
        this_day = this_day.getTime()

        let d = new Date(record.time)
        if(this_day == last_day){
            arr[arr.length-1] = balance
            // labels[labels.length-1] = (`${MONTH[d.getMonth()]}-${d.getDate()}`)
        }else{
            arr.push(balance)
            labels.push(`${MONTH[d.getMonth()]}-${d.getDate()}`)
        }
        last_day = this_day
    })
    
    let data = {
        labels: labels,
        datasets: [{
        label: 'Money',
        backgroundColor: color,
        borderColor: color,
        data: arr,
        fill: false
        }]
    };
    
    let config = {
        type: 'line',
        data: data,
        options: {}
    };
    
    let myChart = new Chart(
        document.getElementById('myChart'),
        config
    );
}

function print_spending(records, color = 'white', initial_balance = 0) {
    document.getElementById('myChart2').remove()
    let div = document.createElement('canvas')
    div.id = 'myChart2'
    document.querySelector('#spending div').append(div)

    let balance = initial_balance
    let arr = [balance]
    records.forEach(record => {
        balance += record.amount
        arr.push(balance)
    })

    let label_id = [];
    records.forEach(record => {
        label_id.push(record.category)
    })
    function onlyUnique(value, index, self) { return self.indexOf(value) === index; }
    label_id = label_id.filter(onlyUnique)
    
    let labels = []
    let colors = []
    for(let i = 0; i < label_id.length; i++){
        // if(i != 1 && i != 8){
            labels.push(categories[label_id[i]].name)
            colors.push(categories[label_id[i]].color)
        // }
    }
    let table_data = []

    let i = 0
    label_id.forEach(x => {
        // if(i == 0 || i == 8) i++
        records.forEach(y => {
            if(y.category == x){
                if(table_data[i] == null) table_data[i] = 0
                let amount = y.amount
                if(amount < 0) amount *= -1
                else amount = 0
                if(y.category == 8)
                    amount = 0
                table_data[i] += amount
            }
        })
        i++
    })

    console.log(table_data)
    
    let data = {
        labels: labels,
        datasets: [{
          label: 'My First Dataset',
          data: table_data,
          backgroundColor: colors,
          hoverOffset: 4
        }]
      };
    
    let config = {
        type: 'doughnut',
        data: data,
        options: {}
    };
    
    let myChart = new Chart(
        document.getElementById('myChart2'),
        config
    );
}