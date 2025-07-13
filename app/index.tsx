import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Player {
  id: string;
  name: string;
  score: number;
}

interface GameType {
  id: string;
  name: string;
  description: string;
}

const gameTypes: GameType[] = [
  { id: 'hearts', name: 'Hearts', description: 'Lowest score wins' },
  { id: 'spades', name: 'Spades', description: 'Highest score wins' },
  { id: 'rummy', name: 'Rummy', description: 'First to target score' },
  { id: 'poker', name: 'Poker', description: 'Chip counting' },
  { id: 'custom', name: 'Custom', description: 'Your own rules' },
];

export default function ScoreTracker() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [selectedGameType, setSelectedGameType] = useState<GameType>(gameTypes[0]);
  const [round, setRound] = useState(1);
  const [gameStarted, setGameStarted] = useState(false);

  const addPlayer = () => {
    if (newPlayerName.trim() === '') {
      Alert.alert('Error', 'Please enter a player name');
      return;
    }
    
    if (players.some(player => player.name.toLowerCase() === newPlayerName.toLowerCase())) {
      Alert.alert('Error', 'Player name already exists');
      return;
    }

    const newPlayer: Player = {
      id: Date.now().toString(),
      name: newPlayerName.trim(),
      score: 0,
    };

    setPlayers([...players, newPlayer]);
    setNewPlayerName('');
  };

  const removePlayer = (playerId: string) => {
    Alert.alert(
      'Remove Player',
      'Are you sure you want to remove this player?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => setPlayers(players.filter(p => p.id !== playerId))
        },
      ]
    );
  };

  const updateScore = (playerId: string, change: number) => {
    setPlayers(players.map(player => 
      player.id === playerId 
        ? { ...player, score: Math.max(0, player.score + change) }
        : player
    ));
  };

  const startGame = () => {
    if (players.length < 2) {
      Alert.alert('Error', 'You need at least 2 players to start a game');
      return;
    }
    setGameStarted(true);
  };

  const resetGame = () => {
    Alert.alert(
      'Reset Game',
      'Are you sure you want to reset all scores?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: () => {
            setPlayers(players.map(player => ({ ...player, score: 0 })));
            setRound(1);
          }
        },
      ]
    );
  };

  const newGame = () => {
    Alert.alert(
      'New Game',
      'Start a new game? This will clear all players and scores.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'New Game', 
          style: 'destructive',
          onPress: () => {
            setPlayers([]);
            setRound(1);
            setGameStarted(false);
          }
        },
      ]
    );
  };

  const getWinner = () => {
    if (players.length === 0) return null;
    
    if (selectedGameType.id === 'hearts') {
      return players.reduce((min, player) => 
        player.score < min.score ? player : min
      );
    } else {
      return players.reduce((max, player) => 
        player.score > max.score ? player : max
      );
    }
  };

  const winner = getWinner();

  if (!gameStarted) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.setupContainer}>
          <View style={styles.header}>
            <Ionicons name="trophy" size={48} color="#F59E0B" />
            <Text style={styles.title}>Card Game Score Tracker</Text>
            <Text style={styles.subtitle}>Set up your game</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Game Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gameTypeContainer}>
              {gameTypes.map((gameType) => (
                <TouchableOpacity
                  key={gameType.id}
                  style={[
                    styles.gameTypeCard,
                    selectedGameType.id === gameType.id && styles.selectedGameType
                  ]}
                  onPress={() => setSelectedGameType(gameType)}
                >
                  <Text style={[
                    styles.gameTypeName,
                    selectedGameType.id === gameType.id && styles.selectedGameTypeName
                  ]}>
                    {gameType.name}
                  </Text>
                  <Text style={[
                    styles.gameTypeDescription,
                    selectedGameType.id === gameType.id && styles.selectedGameTypeDescription
                  ]}>
                    {gameType.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Players ({players.length})</Text>
            
            <View style={styles.addPlayerContainer}>
              <TextInput
                style={styles.playerInput}
                placeholder="Enter player name"
                value={newPlayerName}
                onChangeText={setNewPlayerName}
                onSubmitEditing={addPlayer}
                maxLength={20}
              />
              <TouchableOpacity style={styles.addButton} onPress={addPlayer}>
                <Ionicons name="add" size={24} color="white" />
              </TouchableOpacity>
            </View>

            {players.map((player) => (
              <View key={player.id} style={styles.playerSetupCard}>
                <Text style={styles.playerSetupName}>{player.name}</Text>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removePlayer(player.id)}
                >
                  <Ionicons name="close" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.startButton, players.length < 2 && styles.disabledButton]}
            onPress={startGame}
            disabled={players.length < 2}
          >
            <Text style={styles.startButtonText}>Start Game</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.gameHeader}>
        <View style={styles.gameInfo}>
          <Text style={styles.gameTitle}>{selectedGameType.name}</Text>
          <Text style={styles.roundText}>Round {round}</Text>
        </View>
        <View style={styles.gameActions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => setRound(round + 1)}>
            <Ionicons name="play-forward" size={20} color="#2563EB" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={resetGame}>
            <Ionicons name="refresh" size={20} color="#F59E0B" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={newGame}>
            <Ionicons name="home" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.playersContainer}>
        {players.map((player, index) => (
          <View key={player.id} style={[
            styles.playerCard,
            winner?.id === player.id && styles.winnerCard
          ]}>
            <View style={styles.playerInfo}>
              <Text style={[
                styles.playerName,
                winner?.id === player.id && styles.winnerName
              ]}>
                {player.name}
                {winner?.id === player.id && (
                  <Ionicons name="trophy" size={16} color="#F59E0B" style={{ marginLeft: 8 }} />
                )}
              </Text>
              <Text style={[
                styles.playerScore,
                winner?.id === player.id && styles.winnerScore
              ]}>
                {player.score}
              </Text>
            </View>
            
            <View style={styles.scoreControls}>
              <TouchableOpacity
                style={styles.scoreButton}
                onPress={() => updateScore(player.id, -1)}
              >
                <Ionicons name="remove" size={24} color="white" />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.scoreButton}
                onPress={() => updateScore(player.id, -5)}
              >
                <Text style={styles.scoreButtonText}>-5</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.scoreButton}
                onPress={() => updateScore(player.id, 5)}
              >
                <Text style={styles.scoreButtonText}>+5</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.scoreButton}
                onPress={() => updateScore(player.id, 1)}
              >
                <Ionicons name="add" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  setupContainer: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  gameTypeContainer: {
    marginBottom: 8,
  },
  gameTypeCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    minWidth: 140,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  selectedGameType: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  gameTypeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  selectedGameTypeName: {
    color: '#2563EB',
  },
  gameTypeDescription: {
    fontSize: 12,
    color: '#6B7280',
  },
  selectedGameTypeDescription: {
    color: '#3B82F6',
  },
  addPlayerContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  playerInput: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginRight: 12,
  },
  addButton: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerSetupCard: {
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  playerSetupName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  removeButton: {
    padding: 4,
  },
  startButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  gameHeader: {
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  gameInfo: {
    flex: 1,
  },
  gameTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  roundText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  gameActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  playersContainer: {
    flex: 1,
    padding: 20,
  },
  playerCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  winnerCard: {
    borderColor: '#F59E0B',
    backgroundColor: '#FFFBEB',
  },
  playerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  playerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  winnerName: {
    color: '#D97706',
  },
  playerScore: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  winnerScore: {
    color: '#F59E0B',
  },
  scoreControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scoreButton: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});