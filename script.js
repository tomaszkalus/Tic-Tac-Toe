const GameBoard = (function () {
    const _dimension = 3;
    const _board = Array(_dimension ** 2).fill('')

    const placeMark = function (field, symbol) {
        if (!_board[field]) {
            _board[field] = symbol;
            return true;
        }
        else { return false }
    };

    const getElement = function (field) {
        return _board[field]
    }

    const getLegalFields = function (board = _board) {
        const indexes = Array.from({ length: board.length }, (x, i) => i);
        return indexes.filter(i => { return board[i] == '' });

    }

    const checkIfWin = function (board = _board) {
        for (let i = 0; i < _dimension; i++) {
            // check rows
            const row = board.slice(i * _dimension, (i + 1) * _dimension);
            if (row.every(v => v === row[0]) && !row.some(v => v == '')) {
                return Array.from({ length: _dimension }, (x, index) => index + (i * _dimension));
            };

            // check cols
            const col = [];
            for (let j = 0; j < _dimension; j++) {
                const pos = (i + _dimension * j)
                col.push(board[pos]);
            }
            if (col.every(v => v === col[0]) && !col.some(v => v == '')) {
                return Array.from({ length: _dimension }, (x, index) => (index * _dimension) + i);
            };
        }
        // check diagonals
        const ldiag = Array.from({ length: _dimension }, (x, i) => i * (_dimension + 1));
        const rdiag = Array.from({ length: _dimension }, (x, i) => (_dimension - 1) * (i + 1));

        const ldiag_values = ldiag.map((j) => { return board[j] });
        const rdiag_values = rdiag.map((j) => { return board[j] });

        if (ldiag_values.every(v => v == ldiag_values[0]) && !ldiag_values.some(v => v == '')) { return ldiag }
        if (rdiag_values.every(v => v == rdiag_values[0]) && !rdiag_values.some(v => v == '')) { return rdiag }

        return false;
    }
    const checkIfTie = function () {
        if (!_board.some(v => v === '')) { return true };
        return false
    }

    const clearBoard = function () {
        _board.forEach((val, index) => { _board[index] = '' })

    }

    const getCopy = () => {
        copy = []
        for (let i = 0; i < 9; i++) {
            copy.push(getElement(i))
        }
        return copy
    }

    const getDimension = function () { return _dimension }
    return { placeMark, getElement, checkIfWin, checkIfTie, clearBoard, getDimension, getLegalFields, getCopy }

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
    const board_container = document.querySelector('#board');

    const game_container = document.querySelector('#game-container');
    const options_container = document.querySelector('#options');
    const difficulty_select = document.querySelector('#difficulty-dropdown')
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

    // Options button
    document.querySelector('#game-options').addEventListener('click', () => {
        game_container.style.display = 'none';
        options_container.style.display = ''
    })

    const InitBoard = function () {

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
        const _player1_name = document.querySelector("#player1").value;
        let _player2_name;
        if (_ai) {
            _ai = difficulty_select.value
            if (_ai == 'random') { _player2_name = '🤡' }
            else if (_ai = 'minimax') { _player2_name = '💀' }
        }
        else { _player2_name = document.querySelector("#player2").value; }

        _player_list = [Player(_player1_name, "X"), Player(_player2_name, "O")];
        document.querySelector('#game-container').style.display = '';
        options_container.style.display = 'none';
        console.log(_ai)
        NewGame();
    }

    document.querySelector('#game-start').addEventListener('click', () => { StartGame(_ai) });

    const updatePlayerText = function () {
        _player_text.textContent = `Current player: ${_current_player.getName()} (${_current_player.getSymbol()})`;

    }
    const NewGame = function () {
        _player_text.classList.remove('info')
        _board.clearBoard();
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

    document.querySelector('#new-game').addEventListener('click', NewGame);

    const MarkWinnersCells = function (cells) {
        cells_to_mark = cells.map((i) => { return _board_cells[i] });
        cells_to_mark.forEach((cell) => { cell.classList.add("winning-cell") });
    }

    const Move = function (field) {
        _symbol = _current_player.getSymbol()
        if (_board.placeMark(field, _symbol) && !_game_over) {
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
                let move;
                if (_ai == 'minimax') {
                    const _copy = _board.getCopy()
                    move = MiniMax(_copy)
                }
                else if (_ai == 'random') {
                    const _legal_fields = _board.getLegalFields()
                    const rand = Math.floor(Math.random() * _legal_fields.length);
                    move = _legal_fields[rand]
                }
                setTimeout(() => Move(move), 100)

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

    const MiniMax = function (board) {

        let player = 'X', opponent = 'O';

        function isMovesLeft(board) {
            if (board.some(v => { v == '' })) { return true }
            return false;
        }

        function evaluate(b, depth) {
            for (let i = 0; i < 3; i++) {
                // check rows
                const row = b.slice(i * 3, (i + 1) * 3);
                if (row[0] == row[1] && row[1] == row[2] && row[0] != '') {
                    if (row[0] == player) {
                        return 10;
                    }
                    else if (row[0] == opponent) {
                        return -10;
                    }
                };
                // check cols
                const col = [b[i], b[i + 3], b[i + 6]]
                if (col[0] == col[1] && col[1] == col[2] && col[0] != '') {
                    if (col[0] == player) {
                        return 10;
                    }
                    else if (col[0] == opponent) {
                        return -10;
                    }
                };
            }
            // check diagonals
            if (b[0] == b[4] && b[4] == b[8] && b[0] != '') {
                if (b[0] == player) {
                    return 10;
                }
                else if (b[0] == opponent) {
                    return -10;
                }
            }
            if (b[2] == b[4] && b[4] == b[6] && b[2] != '') {
                if (b[2] == player) {
                    return 10;
                }
                else if (b[2] == opponent) {
                    return -10;
                }
            }

            return 0;
        }

        function minimax(board, depth, isMax) {
            let score = evaluate(board, depth);

            if (score == 10)
                return score - depth;

            if (score == -10)
                return depth + score;

            if (isMovesLeft(board) == false)
                return 0;

            if (isMax) {
                let best = -1000;
                for (let i = 0; i < 9; i++) {
                    if (board[i] == '') {
                        board[i] = player;
                        best = Math.max(best, minimax(board,
                            depth + 1, !isMax));
                        board[i] = '';
                    }
                }
                return best;
            }

            else {
                let best = -1000;
                for (let i = 0; i < 9; i++) {
                    if (board[i] == '') {
                        board[i] = player;
                        best = Math.max(best, minimax(board,
                            depth + 1, !isMax));
                        board[i] = '';
                    }
                }
                return best;
            }
        }
        function findBestMove(board) {
            let bestVal = -1000;
            let bestMove;
            bestMove = -1;
            for (let i = 0; i < 9; i++) {
                if (board[i] == '') {
                    board[i] = player;
                    let moveVal = minimax(board, 0, false);
                    board[i] = '';
                    if (moveVal > bestVal) {
                        bestMove = i;
                        bestVal = moveVal;
                    }
                }

            }
            return bestMove;
        }
        return findBestMove(board);
    }
})()