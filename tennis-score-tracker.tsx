import React, { useState, useEffect } from 'react';
import { Plus, Smile, History } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const TennisScoreTracker = () => {
  // Extended state
  const [player1, setPlayer1] = useState({ name: 'Jones', totalGames: 24, totalSets: 4 });
  const [player2, setPlayer2] = useState({ name: 'Klüter', totalGames: 26, totalSets: 4 });
  const [matches, setMatches] = useState([]);
  const [weather, setWeather] = useState({ temp: '4°', condition: 'Cloudy' });
  const [showCustomize, setShowCustomize] = useState(false);
  const [showScoreEdit, setShowScoreEdit] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Color presets for random daily selection
  const colorPairs = [
    { color1: '#4169E1', color2: '#FFFF00' }, // Royal Blue & Yellow
    { color1: '#FF6B6B', color2: '#4ECDC4' }, // Coral & Turquoise
    { color1: '#96CEB4', color2: '#FFEEAD' }, // Sage & Cream
    { color1: '#9B59B6', color2: '#2ECC71' }, // Purple & Green
    { color1: '#E74C3C', color2: '#3498DB' }  // Red & Blue
  ];

  // Get daily color pair
  const getDailyColors = () => {
    const today = new Date().toISOString().split('T')[0];
    const seed = parseInt(today.replace(/-/g, ''));
    const index = seed % colorPairs.length;
    return colorPairs[index];
  };

  const [colors, setColors] = useState(getDailyColors());

  // Weather API integration
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Using browser's geolocation API
        navigator.geolocation.getCurrentPosition(async (position) => {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code`
          );
          const data = await response.json();
          
          // Convert weather code to condition text
          const getCondition = (code) => {
            if (code <= 3) return 'Clear';
            if (code <= 48) return 'Cloudy';
            if (code <= 67) return 'Rain';
            return 'Snow';
          };

          setWeather({
            temp: `${Math.round(data.current.temperature_2m)}°`,
            condition: getCondition(data.current.weather_code)
          });
        });
      } catch (error) {
        console.error('Weather fetch failed:', error);
      }
    };

    fetchWeather();
  }, []);

  // Calculate totals from match history
  const calculateTotals = (matches) => {
    return matches.reduce((acc, match) => ({
      player1Games: acc.player1Games + match.player1Games,
      player1Sets: acc.player1Sets + match.player1Sets,
      player2Games: acc.player2Games + match.player2Games,
      player2Sets: acc.player2Sets + match.player2Sets
    }), { player1Games: 0, player1Sets: 0, player2Games: 0, player2Sets: 0 });
  };

  // Handle new match submission
  const handleMatchSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newMatch = {
      date: new Date().toISOString(),
      player1Games: parseInt(formData.get('player1Games')),
      player1Sets: parseInt(formData.get('player1Sets')),
      player2Games: parseInt(formData.get('player2Games')),
      player2Sets: parseInt(formData.get('player2Sets'))
    };

    setMatches(prev => [...prev, newMatch]);
    const totals = calculateTotals([...matches, newMatch]);
    
    setPlayer1(prev => ({
      ...prev,
      totalGames: totals.player1Games,
      totalSets: totals.player1Sets
    }));
    
    setPlayer2(prev => ({
      ...prev,
      totalGames: totals.player2Games,
      totalSets: totals.player2Sets
    }));

    setShowScoreEdit(false);
  };

  // Get current date in required format
  const getCurrentDate = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    return `${days[now.getDay()]} ${now.getDate()} ${months[now.getMonth()]}`;
  };

  const formatMatchDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Top Bar */}
      <div className="bg-black text-white px-4 py-2 flex justify-between items-center text-sm">
        <span>{getCurrentDate()}</span>
        <span>{`${weather.temp} ${weather.condition}`}</span>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Player 1 */}
        <div className="flex-1 flex flex-col items-center justify-center p-8" style={{ backgroundColor: colors.color1 }}>
          <div className="text-4xl font-mono mb-4 text-white">{player1.name}</div>
          <div className="text-8xl font-bold relative text-white">
            {player1.totalGames}
            <span className="absolute -right-6 top-0 text-2xl">{player1.totalSets}</span>
          </div>
        </div>

        {/* Player 2 */}
        <div className="flex-1 flex flex-col items-center justify-center p-8" style={{ backgroundColor: colors.color2 }}>
          <div className="text-4xl font-mono mb-4 text-blue-600">{player2.name}</div>
          <div className="text-8xl font-bold relative text-blue-600">
            {player2.totalGames}
            <span className="absolute -right-6 top-0 text-2xl">{player2.totalSets}</span>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-white text-black px-4 py-2 flex justify-between items-center">
        <div className="flex gap-4">
          <Dialog open={showScoreEdit} onOpenChange={setShowScoreEdit}>
            <DialogTrigger>
              <Plus className="h-6 w-6" />
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Match Result</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleMatchSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm">{player1.name} Games</label>
                  <Input type="number" name="player1Games" defaultValue={0} min="0" />
                  <label className="block text-sm">{player1.name} Sets</label>
                  <Input type="number" name="player1Sets" defaultValue={0} min="0" />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm">{player2.name} Games</label>
                  <Input type="number" name="player2Games" defaultValue={0} min="0" />
                  <label className="block text-sm">{player2.name} Sets</label>
                  <Input type="number" name="player2Sets" defaultValue={0} min="0" />
                </div>
                <Button type="submit" className="w-full">Add Match</Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={showHistory} onOpenChange={setShowHistory}>
            <DialogTrigger>
              <History className="h-6 w-6" />
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Match History</DialogTitle>
              </DialogHeader>
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left p-2">Date</th>
                      <th className="text-center p-2">{player1.name}</th>
                      <th className="text-center p-2">{player2.name}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matches.map((match, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-2">{formatMatchDate(match.date)}</td>
                        <td className="text-center p-2">
                          {match.player1Games} ({match.player1Sets})
                        </td>
                        <td className="text-center p-2">
                          {match.player2Games} ({match.player2Sets})
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Dialog open={showCustomize} onOpenChange={setShowCustomize}>
          <DialogTrigger>
            <Smile className="h-6 w-6" />
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Customize</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="names">
              <TabsList className="w-full">
                <TabsTrigger value="names" className="flex-1">Names</TabsTrigger>
                <TabsTrigger value="colors" className="flex-1">Colors</TabsTrigger>
              </TabsList>
              <TabsContent value="names">
                <form className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm">Player 1 Name</label>
                    <Input
                      value={player1.name}
                      onChange={(e) => setPlayer1(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm">Player 2 Name</label>
                    <Input
                      value={player2.name}
                      onChange={(e) => setPlayer2(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <Button type="submit" className="w-full">Save Names</Button>
                </form>
              </TabsContent>
              <TabsContent value="colors">
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">
                    Colors change automatically each day. You can preview tomorrow's colors here:
                  </p>
                  <div className="flex gap-4">
                    <div
                      className="w-20 h-20 rounded"
                      style={{ backgroundColor: colorPairs[(colorPairs.indexOf(colors) + 1) % colorPairs.length].color1 }}
                    />
                    <div
                      className="w-20 h-20 rounded"
                      style={{ backgroundColor: colorPairs[(colorPairs.indexOf(colors) + 1) % colorPairs.length].color2 }}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default TennisScoreTracker;
