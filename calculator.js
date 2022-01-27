const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '(', ')']
const operators = ['+', '-', '*', '/', '.']

function num(e) {
    if(screen.innerText == '0')
        screen.innerText = ''
    screen.innerText += e
}

function op(e) {
    if(e == '=')
        cacl()
    else{
        let text = screen.innerText
        let last = text.charAt(text.length - 1)
        if(operators.some(e => e == last))
            backspace()
        screen.innerText += e
        
        screen.innerText = screen.innerText.replace('++', '+')
    }
}

function backspace() {
    screen.innerText = screen.innerText.slice(0, -1)
    if(screen.innerText == '')
        clear_screen()
}

function clear_screen() {
    screen.innerText = '0'
}

function cacl() {
    let result = eval(screen.innerText)
    screen.innerText = result;
}