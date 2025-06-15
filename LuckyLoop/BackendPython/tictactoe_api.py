# tictactoe_api.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Tuple
import math

app = FastAPI()

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GameState(BaseModel):
    board: List[List[Optional[str]]]
    currentPlayer: str
    
class Move(BaseModel):
    row: int
    col: int
    player: str

class TicTacToeGame:
    def __init__(self):
        self.board = [[None for _ in range(3)] for _ in range(3)]
        self.current_player = 'X'  # Humano es X, IA es O
    
    # Revisar quien gana
    def check_winner(self, board):
        # Revisar filas
        for row in board:
            if row[0] == row[1] == row[2] and row[0] is not None:
                return row[0]
        
        # Revisar columnas
        for col in range(3):
            if board[0][col] == board[1][col] == board[2][col] and board[0][col] is not None:
                return board[0][col]
        
        # Revisar diagonales
        if board[0][0] == board[1][1] == board[2][2] and board[0][0] is not None:
            return board[0][0]
        if board[0][2] == board[1][1] == board[2][0] and board[0][2] is not None:
            return board[0][2]
        
        return None
    
    # Ver si el tablero esta lleno
    def is_board_full(self, board):
        for row in board:
            if None in row:
                return False
        return True
    
    # Devuelve todos los movimientos posibles
    def get_available_moves(self, board):
        moves = []
        for i in range(3):
            for j in range(3):
                if board[i][j] is None:
                    moves.append((i, j))
        return moves
    
    def minimax(self, board, depth, is_maximizing):
        winner = self.check_winner(board)
        
        # Casos base
        if winner == 'O':  # IA gana
            return 10 - depth
        elif winner == 'X':  # Humano gana
            return depth - 10
        elif self.is_board_full(board):  # Empate
            return 0
        
        if is_maximizing:
            max_eval = -math.inf
            for row, col in self.get_available_moves(board):
                board[row][col] = 'O'
                eval = self.minimax(board, depth + 1, False)
                board[row][col] = None
                max_eval = max(max_eval, eval)
            return max_eval
        else:
            min_eval = math.inf
            for row, col in self.get_available_moves(board):
                board[row][col] = 'X'
                eval = self.minimax(board, depth + 1, True)
                board[row][col] = None
                min_eval = min(min_eval, eval)
            return min_eval
    
    def get_best_move(self, board):
        best_move = None
        best_value = -math.inf
        
        for row, col in self.get_available_moves(board):
            board[row][col] = 'O'
            move_value = self.minimax(board, 0, False)
            board[row][col] = None
            
            if move_value > best_value:
                best_value = move_value
                best_move = (row, col)
        
        return best_move

# Instancia global del juego
game = TicTacToeGame()

@app.post("/api/tictactoe/new-game")
async def new_game():
    global game
    game = TicTacToeGame()
    return {
        "board": game.board,
        "currentPlayer": game.current_player,
        "message": "Nuevo juego iniciado"
    }

@app.post("/api/tictactoe/make-move")
async def make_move(move: Move):
    global game
    
    # Validar movimiento
    if game.board[move.row][move.col] is not None:
        raise HTTPException(status_code=400, detail="Casilla ocupada")
    
    # Hacer movimiento del jugador
    game.board[move.row][move.col] = move.player
    
    # Verificar si el jugador ganó
    winner = game.check_winner(game.board)
    if winner:
        return {
            "board": game.board,
            "winner": winner,
            "gameOver": True,
            "message": f"¡{winner} ha ganado!"
        }
    
    # Verificar empate
    if game.is_board_full(game.board):
        return {
            "board": game.board,
            "winner": None,
            "gameOver": True,
            "message": "¡Empate!"
        }
    
    # Movimiento de la IA
    ai_move = game.get_best_move(game.board)
    if ai_move:
        game.board[ai_move[0]][ai_move[1]] = 'O'
        
        # Verificar si la IA ganó
        winner = game.check_winner(game.board)
        if winner:
            return {
                "board": game.board,
                "winner": winner,
                "gameOver": True,
                "aiMove": {"row": ai_move[0], "col": ai_move[1]},
                "message": "¡La IA ha ganado!"
            }
        
        # Verificar empate después del movimiento de la IA
        if game.is_board_full(game.board):
            return {
                "board": game.board,
                "winner": None,
                "gameOver": True,
                "aiMove": {"row": ai_move[0], "col": ai_move[1]},
                "message": "¡Empate!"
            }
    
    return {
        "board": game.board,
        "currentPlayer": game.current_player,
        "gameOver": False,
        "aiMove": {"row": ai_move[0], "col": ai_move[1]} if ai_move else None
    }

@app.get("/api/tictactoe/status")
async def get_game_status():
    global game
    winner = game.check_winner(game.board)
    game_over = winner is not None or game.is_board_full(game.board)
    
    return {
        "board": game.board,
        "currentPlayer": game.current_player,
        "winner": winner,
        "gameOver": game_over
    }

# Para ejecutar: uvicorn tictactoe_api:app --reload --port 8001