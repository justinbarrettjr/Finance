function update_cards(param = {}){
    let records = param.records
    let balance = param.balance
    let initial_balance = param.initial_balance
    let color = param.color

    print_balance(balance)
    print_transactions(records)
    print_charts(records, color, initial_balance)
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
}



function print_charts(records, color = default_color, initial_balance = 0) {
    reset_chart('myChart', 'details')
    reset_chart('myChart2', 'spending_chart')
    reset_chart('myChart3', 'stats')

    function reset_chart(chart_id, container) {
        document.getElementById(chart_id).remove()
        div = document.createElement('canvas')
        div.id = chart_id
        document.getElementById(container).append(div)
    }


    let balance = initial_balance
    let arr = [balance]
    let last_day
    let labels = ['0']
    let this_day

    // Get Balance History Chart Data
    records.forEach(record => {
        balance += record.amount
        this_day = new Date(record.time).getDate()

        let d = new Date(record.time)
        // console.log(d.getHours())
        // console.log(d.getDate())
        console.log(this_day-last_day)
        if(this_day - last_day > 1){
            for(let i = 0; i < this_day - last_day; i++){
                last_day++
                labels.push(`${MONTH[d.getMonth()]}-${last_day}`)
                arr.push(arr[arr.length-1])
            }
        }
        
        if(this_day == last_day){
            arr[arr.length-1] = balance
        }else{
            // console.log(`this: ${this_day}, last: ${last_day}`)
            arr.push(balance)
            labels.push(`${MONTH[d.getMonth()]}-${d.getDate()}`)
            // console.log(`${MONTH[d.getMonth()]}-${d.getDate()}`)
        }

        last_day = this_day
    })

    // Add a day to labels for projection
    for(let i = 2; i < 3; i++){
        // let d = new Date(this_day + (86400000 * i))
        // labels.push(`${MONTH[d.getMonth()]}-${d.getDate()}`)
        labels.push('next_day')
    }

    // Calculate Projection
    let projection = []
    let avg = (arr[arr.length-1] - arr[0]) / (arr.length-1)
    for(let i = 0; i < (arr.length + 1); i++){
        projection[i] = avg * i
    }

    // Calculate Cashflow
    let cashflow = [0]
    for(let i = 1; i < arr.length; i++){
        cashflow.push(arr[i] - arr[i-1])
    }


    
    let myChart = new Chart( document.getElementById('myChart'),
        {
            type: cashflow_chart,
            data: {
                labels: labels,
                datasets: [{
                    label: 'Balance',
                    backgroundColor: color+'15',
                    borderColor: color,
                    data: arr,
                    fill: true,
                    tension: 0.3
                    }
                    ,{
                    label: 'Projection',
                    backgroundColor: '#151515',
                    borderColor: '#151515',
                    data: projection,
                    borderDash: [3, 3],
                    fill: false
                    }
                ]
            },
            options: {
                scales: {
                    x: { 
                        grid: { color: 'transparent' },
                        ticks: { color: 'transparent' } 
                    },
                    y: { 
                        grid: { 
                            color: 'transparent' 
                        },
                        ticks: { color: 'transparent' } 
                    }
                },
                plugins: { legend: { display: false }, },
                elements: { point:{ radius: 0 } }
            }
        });

        let cashflow_labels = [...labels]
        cashflow_labels.splice(0, 1)
        cashflow_labels.splice(cashflow_labels.length-1, 1)
        cashflow.splice(0, 1)

    let myChart3 = new Chart( document.getElementById('myChart3'),
        {
            type: 'bar',
            data: {
                labels: cashflow_labels,
                datasets: [{
                    label: 'Cash-Flow',
                    backgroundColor: (context) => {
                        if(context.raw > 0) return color
                        else return '#E74C3C'
                    } ,
                    borderColor: 'transparent',
                    data: cashflow,
                    fill: false,
                    }
                ]
            },
            options: {
                scales: {
                    x: { 
                        grid: { color: 'transparent' },
                        ticks: { color: '#777' } 
                    },
                    y: { 
                        grid: { 
                            color: '#151515'
                        },
                        ticks: { color: '#777' } 
                    }
                },
                plugins: { legend: { display: false } },
                elements: { point:{ radius: 0 } }
            }
        });
        

        


    // Spending by Category Chart
    balance = initial_balance

    let label_id = [];
    records.forEach(record => {
        if(record.category != 1 && record.category != 8)
            label_id.push(record.category)
    })
    function onlyUnique(value, index, self) { return self.indexOf(value) === index; }
    label_id = label_id.filter(onlyUnique)
    
    labels = []
    let colors = []
    for(let i = 0; i < label_id.length; i++){
        console.log(`${i}: ${categories[label_id[i]].name}`)
            labels.push(categories[label_id[i]].name)
            colors.push(categories[label_id[i]].color)
    }
    let table_data = []

    let i = 0
    label_id.forEach(x => {
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

    myChart = new Chart(document.getElementById('myChart2'),
        {
            type: spending_chart_type,
            data: {
                labels: labels,
                datasets: [{
                  label: 'Spending by category',
                  data: table_data,
                  backgroundColor: colors,
                  hoverOffset: 4
                }]
              },
            options: {
                plugins: {
                    legend: {
                        labels: {color: '#ccc'},
                    }
                }
            }
        });
}