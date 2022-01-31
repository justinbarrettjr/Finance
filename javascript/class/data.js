class Data {
    constructor() {
        
    }

    save() {
        localStorage.setItem('wallets', JSON.stringify(wallets))
        this.sync()
    }

    load() {
        console.debug('load data')
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
            // console.log(categories[i].print_icon())
            option.innerText = `${categories[i].name}`
            document.querySelector('#new_record_category').append(option)
        }
    }

    sync() {
        $.post(SYNC_URL, {data: localStorage.getItem('wallets')}, function(data, status){
            localStorage.setItem('last_sync', data)
            show_sync_badge()
            // console.log('syncing data')
        });

        

        function show_sync_badge() {
            const badge = document.querySelector('#sync_badge')
            badge.style.opacity = 1
            setTimeout(function(){ badge.style.opacity = .3 }, 500)
            setTimeout(function(){ badge.style.opacity = 1 }, 1000)
            setTimeout(function(){ badge.style.opacity = .3 }, 1500)
            setTimeout(function(){ badge.style.opacity = 0 }, 1700)
        }
    }

    check_sync() {
        let that = this
        $.post(SYNC_URL, {status_check: true}, function(data, status){
            if(localStorage.getItem('last_sync') < data){
                that.download_sync(data)
            }else
                that.sync()
        });
    }

    download_sync(time_stamp) {
        $.post(SYNC_URL, {download: true}, function(data, status){
            localStorage.setItem('wallets', data)
            localStorage.setItem('last_sync', time_stamp)
            location.reload()
            // console.log(data)
        });
    }
}