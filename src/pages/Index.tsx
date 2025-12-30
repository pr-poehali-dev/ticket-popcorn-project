import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';

type Theme = 'light' | 'dark' | 'cinema';

interface Movie {
  id: number;
  title: string;
  subtitle: string;
  poster: string;
  price: number;
  date: string;
  rating: string;
  duration: string;
  hasDrinks: boolean;
  plot: string;
  director: string;
  cast: string[];
}

interface User {
  phone: string;
  name: string;
}

interface Purchase {
  id: number;
  movieTitle: string;
  date: string;
  seats: string;
  total: number;
  timestamp: string;
}

interface Seat {
  id: number;
  row: number;
  number: number;
  occupied: boolean;
}

const movies: Movie[] = [
  {
    id: 1,
    title: 'Мотоцикл в окне 1',
    subtitle: 'Оригинальная история',
    poster: 'https://cdn.poehali.dev/projects/dc30abc2-9a8c-4606-a4dc-24cd36fd238e/files/945d2c72-f0ea-42f0-a9aa-8a7ed91cd133.jpg',
    price: 350,
    date: '1 января 2026',
    rating: '12+',
    duration: '124 мин',
    hasDrinks: false,
    plot: 'Загадочный мотоцикл появляется в витрине магазина каждую ночь, хотя днём его там нет. Молодой механик Алекс решает раскрыть эту тайну и попадает в водоворот невероятных событий. Ему предстоит разгадать секрет, который изменит его жизнь навсегда. Психологический триллер о границах реальности и силе человеческого восприятия.',
    director: 'Андрей Смирнов',
    cast: ['Данила Козловский', 'Светлана Ходченкова', 'Константин Хабенский']
  },
  {
    id: 2,
    title: 'Мотоцикл в окне: DLC',
    subtitle: 'Эпическое продолжение',
    poster: 'https://cdn.poehali.dev/projects/dc30abc2-9a8c-4606-a4dc-24cd36fd238e/files/ec719e67-127a-4f9b-8092-aa2cc9505490.jpg',
    price: 650,
    date: '1 января 2026',
    rating: '16+',
    duration: '145 мин',
    hasDrinks: true,
    plot: 'Спустя год после разгадки тайны мотоцикла, Алекс сталкивается с новой угрозой. Древняя организация охотится за артефактом, связанным с мотоциклом. Теперь ему предстоит объединиться со старыми врагами, чтобы спасти мир от надвигающейся катастрофы. Масштабный экшн-блокбастер с потрясающими спецэффектами и головокружительными трюками на мотоциклах.',
    director: 'Андрей Смирнов',
    cast: ['Данила Козловский', 'Светлана Ходченкова', 'Александр Петров', 'Юлия Пересильд']
  }
];

const generateSeats = (): Seat[] => {
  const seats: Seat[] = [];
  let id = 0;
  for (let row = 1; row <= 8; row++) {
    for (let number = 1; number <= 10; number++) {
      seats.push({
        id: id++,
        row,
        number,
        occupied: Math.random() > 0.7
      });
    }
  }
  return seats;
};

const Index = () => {
  const [theme, setTheme] = useState<Theme>('cinema');
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [seats] = useState<Seat[]>(generateSeats());
  const [popcornCount, setPopcornCount] = useState(0);
  const [drinkCount, setDrinkCount] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [phoneInput, setPhoneInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [purchases, setPurchases] = useState<Purchase[]>([]);

  useEffect(() => {
    const savedUser = localStorage.getItem('cinema_user');
    const savedPurchases = localStorage.getItem('cinema_purchases');
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedPurchases) setPurchases(JSON.parse(savedPurchases));
  }, []);

  const toggleSeat = (seatId: number) => {
    const seat = seats.find(s => s.id === seatId);
    if (seat?.occupied) return;

    setSelectedSeats(prev =>
      prev.includes(seatId)
        ? prev.filter(id => id !== seatId)
        : [...prev, seatId]
    );
  };

  const calculateTotal = () => {
    if (!selectedMovie) return 0;
    const ticketsCost = selectedSeats.length * selectedMovie.price;
    const popcornCost = popcornCount * 150;
    const drinksCost = drinkCount * 100;
    return ticketsCost + popcornCost + drinksCost;
  };

  const handlePurchase = () => {
    if (selectedSeats.length === 0) return;
    if (!user) {
      setShowAuth(true);
      return;
    }

    const seatsStr = selectedSeats.map(id => {
      const seat = seats.find(s => s.id === id);
      return `${seat?.row}/${seat?.number}`;
    }).join(', ');

    const newPurchase: Purchase = {
      id: Date.now(),
      movieTitle: selectedMovie?.title || '',
      date: selectedMovie?.date || '',
      seats: seatsStr,
      total: calculateTotal(),
      timestamp: new Date().toLocaleString('ru-RU')
    };

    const updatedPurchases = [...purchases, newPurchase];
    setPurchases(updatedPurchases);
    localStorage.setItem('cinema_purchases', JSON.stringify(updatedPurchases));

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setSelectedMovie(null);
      setSelectedSeats([]);
      setPopcornCount(0);
      setDrinkCount(0);
    }, 4000);
  };

  const handleAuth = () => {
    if (!phoneInput || !nameInput) return;
    const newUser = { phone: phoneInput, name: nameInput };
    setUser(newUser);
    localStorage.setItem('cinema_user', JSON.stringify(newUser));
    setShowAuth(false);
    setPhoneInput('');
    setNameInput('');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('cinema_user');
    setShowProfile(false);
  };

  const applyTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    document.documentElement.classList.remove('light', 'dark', 'theme-cinema');
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (newTheme === 'cinema') {
      document.documentElement.classList.add('theme-cinema');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon name="Film" size={32} className="text-primary" />
              <h1 className="text-3xl font-bold text-glow">Моё кино</h1>
            </div>

            <nav className="hidden md:flex items-center gap-6">
              <a href="#" className="hover-glow font-medium">Главная</a>
              <a href="#" className="hover-glow font-medium">Афиша</a>
              <a href="#" className="hover-glow font-medium">О кино</a>
              <a href="#" className="hover-glow font-medium">Билеты</a>
              {user && (
                <button onClick={() => setShowProfile(true)} className="hover-glow font-medium">
                  Профиль
                </button>
              )}
            </nav>

            <div className="flex items-center gap-2">
              {user ? (
                <Button variant="outline" size="sm" onClick={() => setShowProfile(true)}>
                  <Icon name="User" size={18} className="mr-2" />
                  {user.name}
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setShowAuth(true)}>
                  <Icon name="LogIn" size={18} className="mr-2" />
                  Войти
                </Button>
              )}
              <Separator orientation="vertical" className="h-8 mx-2" />
              <Button
                variant={theme === 'cinema' ? 'default' : 'outline'}
                size="sm"
                onClick={() => applyTheme('cinema')}
                className="hover-glow"
              >
                Обычная
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                size="sm"
                onClick={() => applyTheme('dark')}
                className="hover-glow"
              >
                Тёмная
              </Button>
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                size="sm"
                onClick={() => applyTheme('light')}
                className="hover-glow"
              >
                Светлая
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <section className="mb-16 text-center animate-fade-in">
          <h2 className="text-5xl font-bold mb-4 text-glow">
            Добро пожаловать в Моё кино
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Откройте для себя незабываемые кинематографические впечатления
          </p>
        </section>

        <section>
          <h3 className="text-3xl font-bold mb-8 text-center hover-glow">
            🎬 Сейчас в прокате
          </h3>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {movies.map((movie) => (
              <Card
                key={movie.id}
                className="overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-scale-in cursor-pointer"
                onClick={() => setSelectedMovie(movie)}
              >
                <div className="relative h-96 overflow-hidden">
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <Badge className="bg-primary text-primary-foreground">
                      {movie.rating}
                    </Badge>
                    <Badge variant="secondary">
                      {movie.duration}
                    </Badge>
                  </div>
                </div>
                
                <CardHeader>
                  <CardTitle className="text-2xl hover-glow">{movie.title}</CardTitle>
                  <CardDescription className="text-base">{movie.subtitle}</CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">{movie.plot}</p>
                  
                  <div className="text-xs space-y-1">
                    <p><strong>Режиссёр:</strong> {movie.director}</p>
                    <p><strong>В ролях:</strong> {movie.cast.join(', ')}</p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon name="Calendar" size={20} />
                      <span className="font-medium">{movie.date}</span>
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      {movie.price} ₽
                    </div>
                  </div>
                  
                  <Button className="w-full hover-glow" size="lg">
                    <Icon name="Ticket" size={20} className="mr-2" />
                    Купить билеты
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <Dialog open={!!selectedMovie} onOpenChange={() => setSelectedMovie(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl text-glow">
              {selectedMovie?.title}
            </DialogTitle>
            <DialogDescription>
              Выберите места и дополнения для просмотра
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="seats" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="seats">Выбор мест</TabsTrigger>
              <TabsTrigger value="extras">Попкорн и напитки</TabsTrigger>
            </TabsList>

            <TabsContent value="seats" className="space-y-6">
              <div className="bg-muted p-4 rounded-lg text-center mb-6">
                <Icon name="Monitor" size={40} className="mx-auto mb-2 text-primary" />
                <p className="font-bold">ЭКРАН</p>
              </div>

              <div className="space-y-2">
                {Array.from({ length: 8 }, (_, rowIndex) => (
                  <div key={rowIndex} className="flex justify-center gap-2">
                    <span className="w-8 text-center font-bold text-muted-foreground">
                      {rowIndex + 1}
                    </span>
                    {seats
                      .filter(seat => seat.row === rowIndex + 1)
                      .map(seat => (
                        <Button
                          key={seat.id}
                          variant={
                            selectedSeats.includes(seat.id)
                              ? 'default'
                              : seat.occupied
                              ? 'destructive'
                              : 'outline'
                          }
                          size="sm"
                          className="w-10 h-10 p-0"
                          disabled={seat.occupied}
                          onClick={() => toggleSeat(seat.id)}
                        >
                          {seat.number}
                        </Button>
                      ))}
                  </div>
                ))}
              </div>

              <div className="flex justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 border-2 border-primary bg-primary rounded"></div>
                  <span>Выбрано</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 border-2 border-border rounded"></div>
                  <span>Свободно</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-destructive rounded"></div>
                  <span>Занято</span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="extras" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>🍿</span>
                    Попкорн
                  </CardTitle>
                  <CardDescription>150 ₽ за порцию</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPopcornCount(Math.max(0, popcornCount - 1))}
                  >
                    <Icon name="Minus" size={20} />
                  </Button>
                  <span className="text-2xl font-bold w-12 text-center">{popcornCount}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPopcornCount(popcornCount + 1)}
                  >
                    <Icon name="Plus" size={20} />
                  </Button>
                </CardContent>
              </Card>

              {selectedMovie?.hasDrinks && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span>🥤</span>
                      Напитки
                    </CardTitle>
                    <CardDescription>100 ₽ за напиток (только для DLC)</CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setDrinkCount(Math.max(0, drinkCount - 1))}
                    >
                      <Icon name="Minus" size={20} />
                    </Button>
                    <span className="text-2xl font-bold w-12 text-center">{drinkCount}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setDrinkCount(drinkCount + 1)}
                    >
                      <Icon name="Plus" size={20} />
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  Билеты: {selectedSeats.length} × {selectedMovie?.price} ₽
                </p>
                <p className="text-sm text-muted-foreground">
                  Попкорн: {popcornCount} × 150 ₽
                </p>
                {selectedMovie?.hasDrinks && (
                  <p className="text-sm text-muted-foreground">
                    Напитки: {drinkCount} × 100 ₽
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Итого:</p>
                <p className="text-3xl font-bold text-primary">{calculateTotal()} ₽</p>
              </div>
            </div>
            
            <Button
              className="w-full hover-glow"
              size="lg"
              disabled={selectedSeats.length === 0}
              onClick={handlePurchase}
            >
              <Icon name="ShoppingCart" size={20} className="mr-2" />
              Купить билеты
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="max-w-md text-center">
          <div className="space-y-6 py-8">
            <div className="animate-scale-in">
              <Icon name="CheckCircle2" size={80} className="mx-auto text-primary text-glow" />
            </div>
            <DialogTitle className="text-3xl text-glow">
              Билет(ы) куплены!
            </DialogTitle>
            <DialogDescription className="text-lg">
              Ожидайте кино<br />
              <span className="font-bold text-primary">1 января 2026 год</span>
            </DialogDescription>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Билеты: {selectedSeats.length} шт.</p>
              <p>Места: {selectedSeats.map(id => {
                const seat = seats.find(s => s.id === id);
                return `${seat?.row}/${seat?.number}`;
              }).join(', ')}</p>
              {popcornCount > 0 && <p>Попкорн: {popcornCount} шт.</p>}
              {drinkCount > 0 && <p>Напитки: {drinkCount} шт.</p>}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAuth} onOpenChange={setShowAuth}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl text-glow">Регистрация</DialogTitle>
            <DialogDescription>
              Введите ваши данные для продолжения покупки
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Имя</Label>
              <Input
                id="name"
                placeholder="Введите ваше имя"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Номер телефона</Label>
              <Input
                id="phone"
                placeholder="+7 (___) ___-__-__"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
              />
            </div>
            <Button 
              className="w-full hover-glow" 
              size="lg"
              onClick={handleAuth}
              disabled={!phoneInput || !nameInput}
            >
              <Icon name="UserPlus" size={20} className="mr-2" />
              Зарегистрироваться
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showProfile} onOpenChange={setShowProfile}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl text-glow">Профиль пользователя</DialogTitle>
            <DialogDescription>
              Ваши данные и история покупок
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="User" size={24} />
                  Личные данные
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Имя</p>
                  <p className="font-medium text-lg">{user?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Телефон</p>
                  <p className="font-medium text-lg">{user?.phone}</p>
                </div>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="mt-4"
                  onClick={handleLogout}
                >
                  <Icon name="LogOut" size={16} className="mr-2" />
                  Выйти
                </Button>
              </CardContent>
            </Card>

            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Icon name="History" size={24} />
                История покупок
              </h3>
              
              {purchases.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    <Icon name="ShoppingBag" size={48} className="mx-auto mb-4 opacity-50" />
                    <p>У вас пока нет покупок</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {purchases.slice().reverse().map((purchase) => (
                    <Card key={purchase.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-lg">{purchase.movieTitle}</CardTitle>
                        <CardDescription>{purchase.timestamp}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-muted-foreground">Дата сеанса</p>
                            <p className="font-medium">{purchase.date}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Места</p>
                            <p className="font-medium">{purchase.seats}</p>
                          </div>
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Итого</span>
                          <span className="text-xl font-bold text-primary">{purchase.total} ₽</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <footer className="border-t border-border mt-20 py-8 bg-card/30">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p className="hover-glow">© 2026 Моё кино. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;