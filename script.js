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

    const getElement = function (field) {
        return _board[field]
    }

    const checkIfWin = function () {
        for (let i = 0; i < _dimension; i++) {
            // check rows
            const row = _board.slice(i * _dimension, (i + 1) * _dimension);

            if (row.every(v => v === row[0]) && !row.some(v => v == '')) {
                const cells = Array.from({ length: _dimension }, (x, index) => index + (i * _dimension));
                return [row[0], cells]
            };

            // check cols
            const col = [];
            for (let j = 0; j < _dimension; j++) {
                const pos = (i + _dimension * j)
                col.push(_board[pos]);
            }
            if (col.every(v => v === col[0]) && !col.some(v => v == '')) {
                const cells = Array.from({ length: _dimension }, (x, index) => (index * _dimension) + i);
                return [col[0], cells]

            };
        }
        // check diagonals
        const ldiag = Array.from({ length: _dimension }, (x, i) => i * (_dimension + 1));
        const rdiag = Array.from({ length: _dimension }, (x, i) => (_dimension - 1) * (i + 1));

        const ldiag_values = ldiag.map((j) => { return _board[j] });
        const rdiag_values = rdiag.map((j) => { return _board[j] });

        if (ldiag_values.every(v => v == ldiag_values[0]) && !ldiag_values.some(v => v == '')) { return [ldiag_values[0], ldiag] }
        if (rdiag_values.every(v => v == rdiag_values[0]) && !rdiag_values.some(v => v == '')) { return [rdiag_values[0], rdiag] }
        return false;
    }
    const checkIfTie = function () {
        if (!_board.some(v => v === '')) { return true };
        return false
    }

    const clear_board = function () {
        _board.forEach((val, index) => { _board[index] = '' })

    }
    return { place_mark, getElement, checkIfWin, checkIfTie, clear_board }

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

    InitBoard();

    const NewGame = function () {
        _board.clear_board();
        _game_over = false;
        _current_player = _player_list[0];
        _player_text.textContent = `Current player: Player ${_current_player.getId()} (${_current_player.getSymbol()})`;
        _board_cells.forEach(c => { c.classList.remove("winning-cell") });
        RenderBoard();
    }

    const RenderBoard = function () {
        for (let i = 0; i < 9; i++) {
            _board_cells[i].textContent = _board.getElement(i)
        }
    }

    NewGame()
    document.querySelector('#new-game').addEventListener('click', NewGame);

    const MarkWinnersCells = function (cells) {
        cells_to_mark = cells.map((i) => { return _board_cells[i] });
        cells_to_mark.forEach((cell) => { cell.classList.add("winning-cell") });
    }

    const Move = function (field) {
        _symbol = _current_player.getSymbol()
        if (_board.place_mark(field, _symbol) && !_game_over) {
            RenderBoard();
            const _win_message = _board.checkIfWin()
            if (_win_message) {
                _player_text.textContent = `The winner is: Player ${_current_player.getId()} (${_current_player.getSymbol()})`
                _game_over = true;
                MarkWinnersCells(_win_message[1])

            }
            else if (_board.checkIfTie()) {
                _player_text.textContent = `Tie! No winner this time`;
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

})()