const GameBoard = (function () {
    const _dimension = 3;
    const _board = Array(_dimension ** 2).fill('')

    const place_mark = function (field, symbol) {
        if (!_board[field]) {
            _board[field] = symbol;
            return true;
        }
        else { return false }
    };

    const getElement = function (field) {
        return _board[field]
    }

    const getLegalFields = function () {
        const indexes = Array.from({ length: _board.length }, (x, i) => i);
        return indexes.filter(i => { return _board[i] == '' });

    }

    const checkIfWin = function () {
        for (let i = 0; i < _dimension; i++) {
            // check rows
            const row = _board.slice(i * _dimension, (i + 1) * _dimension);

            if (row.every(v => v === row[0]) && !row.some(v => v == '')) {
                return Array.from({ length: _dimension }, (x, index) => index + (i * _dimension));
            };

            // check cols
            const col = [];
            for (let j = 0; j < _dimension; j++) {
                const pos = (i + _dimension * j)
                col.push(_board[pos]);
            }
            if (col.every(v => v === col[0]) && !col.some(v => v == '')) {
                return Array.from({ length: _dimension }, (x, index) => (index * _dimension) + i);
            };
        }
        // check diagonals
        const ldiag = Array.from({ length: _dimension }, (x, i) => i * (_dimension + 1));
        const rdiag = Array.from({ length: _dimension }, (x, i) => (_dimension - 1) * (i + 1));

        const ldiag_values = ldiag.map((j) => { return _board[j] });
        const rdiag_values = rdiag.map((j) => { return _board[j] });

        if (ldiag_values.every(v => v == ldiag_values[0]) && !ldiag_values.some(v => v == '')) { return ldiag }
        if (rdiag_values.every(v => v == rdiag_values[0]) && !rdiag_values.some(v => v == '')) { return rdiag }

        return false;
    }
    const checkIfTie = function () {
        if (!_board.some(v => v === '')) { return true };
        return false
    }

    const clear_board = function () {
        _board.forEach((val, index) => { _board[index] = '' })

    }

    const getDimension = function () { return _dimension }
    return { place_mark, getElement, checkIfWin, checkIfTie, clear_board, getDimension, getLegalFields }

})()

const Player = function (name, symbol) {
    const _symbol = symbol;
    const _name = name;
    const getSymbol = function () { return _symbol };
    const getName = function () { return _name }
    return { getSymbol, getName }
}

// Game module
const Game = (function () {
    const _board = GameBoard;
    const _board_cells = [];
    const _player_text = document.querySelector('#player');
    let _player_list;
    let _ai;

    // 1v1/AI switch
    document.querySelector('sl-radio-group').addEventListener('sl-change', e => {
        const _val = e.target.value;
        if (_val == '1v1') {
            _ai = false;
            document.querySelector('#player2').style.display = '';
            document.querySelector('#difficulty-settings').style.display = 'none';

        }
        else {
            _ai = true;
            document.querySelector('#player2').style.display = 'none';
            document.querySelector('#difficulty-settings').style.display = '';
        }
    })

    const InitBoard = function () {
        const board_container = document.querySelector('#board');
        for (let i = 0; i < _board.getDimension() ** 2; i++) {
            const cell = document.createElement("div");
            cell.setAttribute('class', 'cell');
            cell.setAttribute('data-id', i);
            cell.addEventListener('click', (event) => {
                field = event.target.getAttribute('data-id');
                UserMove(field);
            })
            board_container.appendChild(cell);
            _board_cells.push(cell);
        };
    }

    InitBoard();

    const StartGame = function () {
        // _ai = !!document.querySelector('#difficulty-dropdown').value;
        const _player1_name = document.querySelector("#player1").value;
        let _player2_name;
        if (_ai) { _player2_name = '🤡' }
        else { _player2_name = document.querySelector("#player2").value; }

        _player_list = [Player(_player1_name, "X"), Player(_player2_name, "O")];
        document.querySelector('#game-container').removeAttribute('hidden');
        document.querySelector('#options').setAttribute('hidden', '');
        NewGame();
    }

    document.querySelector('#game-start').addEventListener('click', StartGame);

    const updatePlayerText = function () {
        _player_text.textContent = `Current player: ${_current_player.getName()} (${_current_player.getSymbol()})`;

    }
    const NewGame = function () {
        _player_text.classList.remove('info')
        _board.clear_board();
        _game_over = false;
        _current_player = _player_list[0];
        updatePlayerText();
        _board_cells.forEach(c => {
            c.classList.remove("winning-cell")
            c.classList.add('clickable');
        });
        RenderBoard();
    }

    const RenderBoard = function () {
        for (let i = 0; i < _board.getDimension() ** 2; i++) {
            _board_cells[i].textContent = _board.getElement(i)
        }
    }

    // NewGame()
    document.querySelector('#new-game').addEventListener('click', NewGame);

    const MarkWinnersCells = function (cells) {
        cells_to_mark = cells.map((i) => { return _board_cells[i] });
        cells_to_mark.forEach((cell) => { cell.classList.add("winning-cell") });
    }

    const Move = function (field) {
        _symbol = _current_player.getSymbol()
        if (_board.place_mark(field, _symbol) && !_game_over) {
            RenderBoard();
            const _winning_cells = _board.checkIfWin()
            if (_winning_cells) {
                _player_text.textContent = `The winner is: ${_current_player.getName()} (${_current_player.getSymbol()})`
                _player_text.classList.add('info')
                _game_over = true;
                MarkWinnersCells(_winning_cells)

            }
            else if (_board.checkIfTie()) {
                _player_text.classList.add('info')
                _player_text.textContent = `Tie! No winner this time`;
                _game_over = true;
            }
            else { SwitchPlayer() }

            _board_cells[field].classList.remove('clickable')
            return true;
        }
        return false;
    }

    const UserMove = function (field) {
        if (Move(field)) {
            if (_ai) {
                const _legal_fields = _board.getLegalFields()
                const rand = Math.floor(Math.random() * _legal_fields.length);
                setTimeout(() => Move(_legal_fields[rand]), 100)
            }
        }
    }

    const SwitchPlayer = function () {
        if (_current_player == _player_list[0]) {
            _current_player = _player_list[1]
        }
        else { _current_player = _player_list[0] }
        updatePlayerText();
    }

    const MiniMax = (function(){

        let _board_copy = []

        const _getBoardCopy = () => {
            _board_copy = []
            for(let i=0; i<9; i++){
                _board_copy.push(_board[i])
            }
        }

        const evaluate = function(){
            const win = checkIfWin();
            if(win){
                if(_board.getElement[win[0]] = 'x'){
                    return 10
                }
                else{return -10}
            }
            return 0
        }

        const minimax = function(board, depth, index){
            let score = evaluate(_board);
            if (score==10){return score}
            if (score == -10){return score}
            if (_board.getLegalFields.length = 0){return 0}
            const isMax = _current_player = _player_list[2]
            if (isMax){
                let best = -1000;
                
                for(let i=0; i<9; i++){
                    if(!_board[i]){
                        Move(i)

                        best = Math.max(best, minimax(_board, depth+1, !isMax));

                    }
                }

            }
            else{
                let best = 1000;
                for(let i=0; i<9; i++){
                    if(!_board[i]){
                        Move(i)
                        best = Math.max(best, minimax(_board, depth+1, !isMax));

                    }
                }
            }
        }

        return {evaluate}
    })()

})()