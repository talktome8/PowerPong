// Tournament Manager for 3-Player Mode
class TournamentManager {
    constructor() {
        this.players = [
            { id: 1, name: 'Player 1', color: CONFIG.COLORS.PLAYER1, wins: 0, losses: 0, points: 0 },
            { id: 2, name: 'Player 2', color: CONFIG.COLORS.PLAYER2, wins: 0, losses: 0, points: 0 },
            { id: 3, name: 'Player 3', color: CONFIG.COLORS.PLAYER3, wins: 0, losses: 0, points: 0 }
        ];
        this.matches = [];
        this.currentMatchIndex = 0;
        this.tournamentComplete = false;
        this.generateMatches();
    }
    
    generateMatches() {
        // Round-robin: each player plays against each other
        this.matches = [
            { player1: this.players[0], player2: this.players[1], winner: null },
            { player1: this.players[1], player2: this.players[2], winner: null },
            { player1: this.players[0], player2: this.players[2], winner: null }
        ];
        
        // Additional battles based on performance
        this.finalBattles = [];
    }
    
    getCurrentMatch() {
        if (this.currentMatchIndex < this.matches.length) {
            return this.matches[this.currentMatchIndex];
        }
        
        // After round-robin, generate special battles
        if (this.finalBattles.length === 0 && !this.tournamentComplete) {
            this.generateFinalBattles();
        }
        
        const finalIndex = this.currentMatchIndex - this.matches.length;
        if (finalIndex < this.finalBattles.length) {
            return this.finalBattles[finalIndex];
        }
        
        return null;
    }
    
    recordMatchResult(winnerId) {
        const match = this.getCurrentMatch();
        if (!match) return;
        
        // Record winner
        if (match.player1.id === winnerId) {
            match.winner = match.player1;
            match.player1.wins++;
            match.player1.points += 3;
            match.player2.losses++;
        } else {
            match.winner = match.player2;
            match.player2.wins++;
            match.player2.points += 3;
            match.player1.losses++;
        }
        
        this.currentMatchIndex++;
        
        // Check if tournament is complete
        if (this.currentMatchIndex >= this.matches.length + this.finalBattles.length) {
            this.tournamentComplete = true;
        }
    }
    
    generateFinalBattles() {
        // Sort players by points
        const sorted = [...this.players].sort((a, b) => b.points - a.points);
        
        // 1st place (Champion)
        const champion = sorted[0];
        const runner = sorted[1];
        const third = sorted[2];
        
        // Special battle: 2nd and 3rd place players team up for bonus match
        // Then winner faces champion
        if (runner.points !== third.points) {
            // Battle for 2nd place
            this.finalBattles.push({
                player1: runner,
                player2: third,
                winner: null,
                title: '🥈 Battle for 2nd Place'
            });
        }
        
        // Championship match
        this.finalBattles.push({
            player1: champion,
            player2: runner,
            winner: null,
            title: '🏆 Championship Match'
        });
        
        // If there's a clear winner, add a revenge match
        if (champion.wins === 2 && runner.wins === 1) {
            this.finalBattles.push({
                player1: champion,
                player2: third,
                winner: null,
                title: '⚔️ Grudge Match'
            });
        }
    }
    
    getStandings() {
        return [...this.players].sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            return b.wins - a.wins;
        });
    }
    
    getTournamentStatus() {
        const total = this.matches.length + this.finalBattles.length;
        return {
            current: this.currentMatchIndex + 1,
            total: total,
            complete: this.tournamentComplete
        };
    }
    
    getWinner() {
        if (!this.tournamentComplete) return null;
        return this.getStandings()[0];
    }
    
    reset() {
        this.players.forEach(p => {
            p.wins = 0;
            p.losses = 0;
            p.points = 0;
        });
        this.currentMatchIndex = 0;
        this.tournamentComplete = false;
        this.finalBattles = [];
        this.generateMatches();
    }
}
