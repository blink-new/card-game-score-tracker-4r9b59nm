import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { Label } from './components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './components/ui/dialog'
import { Badge } from './components/ui/badge'
import { Separator } from './components/ui/separator'
import { Plus, Minus, Users, Trophy, RotateCcw, Play } from 'lucide-react'

interface Player {
  id: string
  name: string
}

interface RoundScore {
  playerId: string
  score: number
}

interface Round {
  id: string
  number: number
  scores: RoundScore[]
  total: number
}

interface Game {
  id: string
  name: string
  players: Player[]
  rounds: Round[]
  createdAt: Date
}

function App() {
  const [games, setGames] = useState<Game[]>([])
  const [currentGame, setCurrentGame] = useState<Game | null>(null)
  const [players, setPlayers] = useState<Player[]>([
    { id: '1', name: 'Alice' },
    { id: '2', name: 'Bob' },
    { id: '3', name: 'Charlie' },
    { id: '4', name: 'Diana' }
  ])
  
  // Game creation state
  const [isCreateGameOpen, setIsCreateGameOpen] = useState(false)
  const [newGameName, setNewGameName] = useState('')
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([])
  const [newPlayerName, setNewPlayerName] = useState('')
  
  // Round scoring state
  const [currentRoundScores, setCurrentRoundScores] = useState<{ [playerId: string]: number }>({})

  const createGame = () => {
    if (!newGameName.trim() || selectedPlayers.length < 2) return

    const newGame: Game = {
      id: Date.now().toString(),
      name: newGameName,
      players: selectedPlayers,
      rounds: [],
      createdAt: new Date()
    }

    setGames([...games, newGame])
    setCurrentGame(newGame)
    setIsCreateGameOpen(false)
    setNewGameName('')
    setSelectedPlayers([])
    
    // Initialize current round scores
    const initialScores: { [playerId: string]: number } = {}
    selectedPlayers.forEach(player => {
      initialScores[player.id] = 0
    })
    setCurrentRoundScores(initialScores)
  }

  const addPlayer = () => {
    if (!newPlayerName.trim()) return

    const newPlayer: Player = {
      id: Date.now().toString(),
      name: newPlayerName
    }

    setPlayers([...players, newPlayer])
    setNewPlayerName('')
  }

  const togglePlayerSelection = (player: Player) => {
    setSelectedPlayers(prev => 
      prev.find(p => p.id === player.id)
        ? prev.filter(p => p.id !== player.id)
        : [...prev, player]
    )
  }

  const updateRoundScore = (playerId: string, change: number) => {
    setCurrentRoundScores(prev => ({
      ...prev,
      [playerId]: (prev[playerId] || 0) + change
    }))
  }

  const finishRound = () => {
    if (!currentGame) return

    const roundScores: RoundScore[] = Object.entries(currentRoundScores).map(([playerId, score]) => ({
      playerId,
      score
    }))

    const roundTotal = roundScores.reduce((sum, rs) => sum + rs.score, 0)

    const newRound: Round = {
      id: Date.now().toString(),
      number: currentGame.rounds.length + 1,
      scores: roundScores,
      total: roundTotal
    }

    const updatedGame = {
      ...currentGame,
      rounds: [...currentGame.rounds, newRound]
    }

    setCurrentGame(updatedGame)
    setGames(games.map(g => g.id === currentGame.id ? updatedGame : g))
    
    // Reset round scores
    const resetScores: { [playerId: string]: number } = {}
    currentGame.players.forEach(player => {
      resetScores[player.id] = 0
    })
    setCurrentRoundScores(resetScores)
  }

  const getPlayerTotalScore = (playerId: string): number => {
    if (!currentGame) return 0
    return currentGame.rounds.reduce((total, round) => {
      const playerScore = round.scores.find(s => s.playerId === playerId)
      return total + (playerScore?.score || 0)
    }, 0)
  }

  const getWinner = (): Player | null => {
    if (!currentGame || currentGame.rounds.length === 0) return null
    
    let highestScore = -Infinity
    let winner: Player | null = null
    
    currentGame.players.forEach(player => {
      const totalScore = getPlayerTotalScore(player.id)
      if (totalScore > highestScore) {
        highestScore = totalScore
        winner = player
      }
    })
    
    return winner
  }

  const resetGame = () => {
    if (!currentGame) return
    
    const resetGame = {
      ...currentGame,
      rounds: []
    }
    
    setCurrentGame(resetGame)
    setGames(games.map(g => g.id === currentGame.id ? resetGame : g))
    
    // Reset round scores
    const resetScores: { [playerId: string]: number } = {}
    currentGame.players.forEach(player => {
      resetScores[player.id] = 0
    })
    setCurrentRoundScores(resetScores)
  }

  if (!currentGame) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Card Game Score Tracker</h1>
            <p className="text-gray-600">Track scores across rounds for any card game</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Create New Game */}
            <Card className="border-2 border-dashed border-blue-300 hover:border-blue-400 transition-colors">
              <CardContent className="p-6 text-center">
                <Dialog open={isCreateGameOpen} onOpenChange={setIsCreateGameOpen}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="w-full">
                      <Play className="mr-2 h-5 w-5" />
                      Create New Game
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Create New Game</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="gameName">Game Name</Label>
                        <Input
                          id="gameName"
                          value={newGameName}
                          onChange={(e) => setNewGameName(e.target.value)}
                          placeholder="e.g., Friday Night Hearts"
                        />
                      </div>
                      
                      <div>
                        <Label>Select Players (minimum 2)</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {players.map(player => (
                            <Button
                              key={player.id}
                              variant={selectedPlayers.find(p => p.id === player.id) ? "default" : "outline"}
                              size="sm"
                              onClick={() => togglePlayerSelection(player)}
                            >
                              {player.name}
                            </Button>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="newPlayer">Add New Player</Label>
                        <div className="flex gap-2">
                          <Input
                            id="newPlayer"
                            value={newPlayerName}
                            onChange={(e) => setNewPlayerName(e.target.value)}
                            placeholder="Player name"
                          />
                          <Button onClick={addPlayer} size="sm">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <Button 
                        onClick={createGame} 
                        className="w-full"
                        disabled={!newGameName.trim() || selectedPlayers.length < 2}
                      >
                        Start Game
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            {/* Recent Games */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Recent Games
                </CardTitle>
              </CardHeader>
              <CardContent>
                {games.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No games yet</p>
                ) : (
                  <div className="space-y-2">
                    {games.slice(-5).reverse().map(game => (
                      <div
                        key={game.id}
                        className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => setCurrentGame(game)}
                      >
                        <div className="font-medium">{game.name}</div>
                        <div className="text-sm text-gray-500">
                          {game.players.length} players • {game.rounds.length} rounds
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  const winner = getWinner()
  const hasCurrentRoundScores = Object.values(currentRoundScores).some(score => score !== 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{currentGame.name}</h1>
            <p className="text-gray-600">Round {currentGame.rounds.length + 1}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setCurrentGame(null)}>
              Back to Games
            </Button>
            <Button variant="outline" onClick={resetGame}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset Game
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Current Round Scoring */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Current Round Scoring
                  <Badge variant="secondary">Round {currentGame.rounds.length + 1}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  {currentGame.players.map(player => (
                    <div key={player.id} className="p-4 border rounded-lg">
                      <div className="text-center mb-3">
                        <h3 className="font-medium">{player.name}</h3>
                        <div className="text-2xl font-bold text-blue-600">
                          {currentRoundScores[player.id] || 0}
                        </div>
                      </div>
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateRoundScore(player.id, -1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateRoundScore(player.id, -5)}
                        >
                          -5
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateRoundScore(player.id, 5)}
                        >
                          +5
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateRoundScore(player.id, 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 text-center">
                  <div className="text-sm text-gray-600 mb-2">
                    Round Total: {Object.values(currentRoundScores).reduce((sum, score) => sum + score, 0)}
                  </div>
                  <Button 
                    onClick={finishRound}
                    disabled={!hasCurrentRoundScores}
                    className="w-full sm:w-auto"
                  >
                    Finish Round
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Player Totals & Game Info */}
          <div className="space-y-6">
            {/* Total Scores */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Total Scores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentGame.players
                    .map(player => ({
                      ...player,
                      totalScore: getPlayerTotalScore(player.id)
                    }))
                    .sort((a, b) => b.totalScore - a.totalScore)
                    .map((player, index) => (
                      <div key={player.id} className="flex items-center justify-between p-2 rounded">
                        <div className="flex items-center gap-2">
                          {index === 0 && winner?.id === player.id && (
                            <Trophy className="h-4 w-4 text-yellow-500" />
                          )}
                          <span className="font-medium">{player.name}</span>
                        </div>
                        <Badge variant={index === 0 ? "default" : "secondary"}>
                          {player.totalScore}
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Game Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Game Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Players:</span>
                  <span className="font-medium">{currentGame.players.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rounds Played:</span>
                  <span className="font-medium">{currentGame.rounds.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Leader:</span>
                  <span className="font-medium">{winner?.name || 'None'}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Round History */}
        {currentGame.rounds.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Round History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Round</th>
                      {currentGame.players.map(player => (
                        <th key={player.id} className="text-center p-2">{player.name}</th>
                      ))}
                      <th className="text-center p-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentGame.rounds.map(round => (
                      <tr key={round.id} className="border-b">
                        <td className="p-2 font-medium">Round {round.number}</td>
                        {currentGame.players.map(player => {
                          const score = round.scores.find(s => s.playerId === player.id)?.score || 0
                          return (
                            <td key={player.id} className="text-center p-2">
                              <Badge variant={score > 0 ? "default" : score < 0 ? "destructive" : "secondary"}>
                                {score > 0 ? '+' : ''}{score}
                              </Badge>
                            </td>
                          )
                        })}
                        <td className="text-center p-2">
                          <Badge variant="outline">{round.total}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default App