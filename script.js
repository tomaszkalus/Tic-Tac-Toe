// GameBoard Module
const GameBoard = (function () {
    const _dimension = 3
    const _board = Array(_dimension ** 2).fill('')

    const place_mark = function (field, symbol) {
        if (!_board[field]) {
            _board[field] = symbol;
            return true;
        }
        else { return false }
    };

    const showBoard = function () {
        let output = "";
        for (let i = 0; i < _board.length; i++) {
            const sym = _board[i]
            output += (sym ? sym : '-') + '\t';
            if ((i + 1) % 3 == 0) { output += '\n' }
        }
        console.log(output)
    };

    const getElement = function (field) {
        return _board[field]
    }

    const checkIfWin = function () {
        for (let i = 0; i < _dimension; i++) {
            // check rows
            const row = _board.slice(i * _dimension, (i + 1) * _dimension);
            if (row.every(v => v === row[0]) && !row.some(v => v == '')) { return [row[0], [i * _dimension, 'row']] };

            // check cols
            const col = [];
            for (let j = 0; j < _dimension; j++) {
                const pos = (i + _dimension * j)
                col.push(_board[pos]);
            }
            if (col.every(v => v === col[0]) && !col.some(v => v == '')) { return [col[0], [i, 'col']] };
        }
        const ldiag = [];
        const rdiag = [];
        for (let i = 0; i < _dimension; i++) {
            ldiag.push(_board[i * (_dimension + 1)]);
            rdiag.push(_board[(_dimension - 1) * (i + 1)]);
        }
        if (ldiag.every(v => v === ldiag[0]) && !ldiag.some(v => v == '')) { return [ldiag[0], [0, 'diag']] }
        if (rdiag.every(v => v === rdiag[0]) && !rdiag.some(v => v == '')) { return [rdiag[0], [_dimension - 1, 'diag']] }
        return false;
    }
    const checkIfTie = function () {
        if (!_board.some(v => v === '')) { return true };
        return false
    }

    const clear_board = function () {
        _board.forEach((val, index) => { _board[index] = '' })

    }
    return { place_mark, showBoard, getElement, checkIfWin, checkIfTie, clear_board }

})()

const Player = function (id, symbol) {
    const _id = id
    const _symbol = symbol;
    const getSymbol = function () { return _symbol };
    const getId = function () { return _id }
    return { getSymbol, getId }
}

// Game module
const Game = (function () {
    const _board = GameBoard;
    const _player_list = [Player(1, "X"), Player(2, "O")];
    let _game_over = false;
    let _current_player = _player_list[0];
    const _board_cells = [];
    const _player_text = document.querySelector('#player');
    const _info = document.querySelector('#game-info');


    const InitBoard = function () {
        const board_container = document.querySelector('#board');
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement("div");
            cell.setAttribute('class', 'cell');
            cell.setAttribute('data-id', i);
            cell.addEventListener('click', (event) => {
                field = event.target.getAttribute('data-id');
                Move(field);
            })
            board_container.appendChild(cell);
            _board_cells.push(cell);
        };

    }

    const NewGame = function () {
        _board.clear_board();
        _game_over = false;
        _current_player = _player_list[0];
        _info.textContent = '';
        RenderBoard();
    }
    document.querySelector('#new-game').addEventListener('click', NewGame);

    const RenderBoard = function () {
        for (let i = 0; i < 9; i++) {
            _board_cells[i].textContent = _board.getElement(i)
        }
    }
    const Move = function (field) {
        _symbol = _current_player.getSymbol()
        if (_board.place_mark(field, _symbol) && !_game_over) {
            RenderBoard();
            if (_board.checkIfWin()) {
                _info.textContent = `The winner is: Player ${_current_player.getId()} (${_current_player.getSymbol()})`
                _game_over = true;
            }
            else if (_board.checkIfTie()) {
                _info.textContent = `Tie! No winner this time`;
                _game_over = true;
            }
            else { SwitchPlayer() }
        }
    }

    const SwitchPlayer = function () {
        if (_current_player == _player_list[0]) {
            _current_player = _player_list[1]
        }
        else { _current_player = _player_list[0] }
        _player_text.textContent = `Current player: Player ${_current_player.getId()} (${_current_player.getSymbol()})`;
    }

    return {
        InitBoard,
        RenderBoard
    }

})()

Game.InitBoard();
Game.RenderBoard();

