const GameBoard = (function(){
    const _board = 
    ['','','',
    '','','',
    '','',''];

    const place_mark = function(field, symbol){
        if(!_board[field]){
            _board[field] = symbol;
        }
        else{console.log("Field is already occupied!")}
    };

    const showBoard = function(){
        let output = "";
        for(let i=0; i<_board.length; i++){
            const sym = _board[i]
            output += (sym ? sym: '-') + '\t';
            if((i+1) % 3 == 0){output += '\n'}
        }
        return output;
    };

    return{place_mark, showBoard}
    
})()

GameBoard.place_mark(2, 'X')
console.log(GameBoard.showBoard());
GameBoard.place_mark(3, 'O');
console.log(GameBoard.showBoard());
GameBoard.place_mark(3, 'X');
console.log(GameBoard.showBoard());