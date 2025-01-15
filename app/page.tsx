'use client'

import Image from "next/image";
import { Beer, ShoppingCart, X, Trash2, Wrench, Car, Bike, Code, Cog, Guitar, Music, MessageSquare, Send, Clock, Shield, User, UserCircle2 } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

type Service = {
  id: number;
  title: string;
  price: number;
  description: string;
  image: string;
}

type Review = {
  id: number;
  name: string;
  image: 'male' | 'female';
  comment: string;
  rating: number;
  service: string;
};

type Message = {
  role: 'user' | 'assistant';
  content: string;
}

export default function Home() {
  const [cart, setCart] = useState<Service[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [flyingItems, setFlyingItems] = useState<{
    id: number;
    top: number;
    left: number;
    targetTop: number;
    targetLeft: number;
  }[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [discount, setDiscount] = useState(0);

  const services: Service[] = [
    { 
      id: 1, 
      title: 'Oil Change', 
      price: 8, 
      description: 'Because your car deserves better than cooking oil!', 
      image: '/OilChange.png' 
    },
    { 
      id: 2, 
      title: 'Dirt Bike Maintenance', 
      price: 7, 
      description: 'Keep your bike dirty on the trails, but clean in the engine! 🏍️', 
      image: '/DirtBike.png' 
    },
    { 
      id: 3, 
      title: 'Bike Tire Fix', 
      price: 6, 
      description: 'No more excuses for skipping leg day!', 
      image: '/BikeTire.png' 
    },
    { 
      id: 4, 
      title: 'Wheel Rotation', 
      price: 4, 
      description: 'Like musical chairs, but for your tires!', 
      image: '/WheelRotation.png' 
    },
    { 
      id: 5, 
      title: 'Guitar Lessons', 
      price: 2, 
      description: 'Anyway, here\'s Wonderwall...', 
      image: '/Guitar.png' 
    },
    { 
      id: 6, 
      title: 'Pau Code Lessons', 
      price: 1, 
      description: 'Learn to code or learn to cry trying!', 
      image: '/Code.png' 
    },
  ]

  const reviews: Review[] = [
    {
      id: 1,
      name: "Sarah Chen",
      image: "female",
      comment: "Traded 2 beers for guitar lessons. Now I can play 'Wonderwall' in 3 different keys! My roommates are thrilled (they're not).",
      rating: 5,
      service: "Guitar Lessons"
    },
    {
      id: 2,
      name: "Marcus Rodriguez",
      image: "male",
      comment: "Got my bike fixed for 6 beers. Best deal ever! Though I'm pretty sure my bike now makes motorcycle sounds... 🏍️",
      rating: 5,
      service: "Bike Tire Fix"
    },
    {
      id: 3,
      name: "Aisha Patel",
      image: "female",
      comment: "Learned to code for just 1 beer! Still debugging my first 'Hello World', but hey, at least I'm debugging with style! 😎",
      rating: 5,
      service: "Pau Code Lessons"
    },
    {
      id: 4,
      name: "Jake Thompson",
      image: "male",
      comment: "Oil change for 8 beers? My car now purrs like a kitten... that's been drinking beer. 10/10 would recommend! 🚗",
      rating: 5,
      service: "Oil Change"
    },
    {
      id: 5,
      name: "Luna Kim",
      image: "female",
      comment: "Got my wheel rotation done. Now my car does perfect donuts in the parking lot. Not sure if that's related, but I'm not complaining! 🌪️",
      rating: 5,
      service: "Wheel Rotation"
    },
    {
      id: 6,
      name: "Dave Mitchell",
      image: "male",
      comment: "My dirt bike's running so smooth after maintenance, it's practically a clean bike now. Identity crisis incoming! 🏁",
      rating: 5,
      service: "Dirt Bike Maintenance"
    }
  ];

  const addToCart = (service: Service, event: React.MouseEvent) => {
    const buttonRect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const cartButton = document.querySelector('.cart-button')?.getBoundingClientRect();
    
    if (cartButton) {
      setFlyingItems(prev => [...prev, {
        id: Date.now(),
        top: buttonRect.top,
        left: buttonRect.left,
        targetTop: cartButton.top,
        targetLeft: cartButton.left
      }]);

      setTimeout(() => {
        setFlyingItems(prev => prev.filter(item => item.id !== Date.now()));
        setCart(prev => [...prev, service]);
      }, 1000);
    }
  };

  const removeFromCart = (id: number) => {
    const indexToRemove = cart.findIndex(item => item.id === id);
    if (indexToRemove !== -1) {
      const newCart = [...cart.slice(0, indexToRemove), ...cart.slice(indexToRemove + 1)];
      setCart(newCart);
    }
  };

  const getDiscountedPrice = (price: number) => {
    return Math.max(1, price - discount); // Minimum price of 1 beer
  };

  const totalBeers = cart.reduce((sum, item) => sum + getDiscountedPrice(item.price), 0);

  useEffect(() => {
    const updateCartPosition = () => {
      const cartButton = document.querySelector('.cart-button')?.getBoundingClientRect();
      if (cartButton) {
        document.documentElement.style.setProperty('--cart-top', `${cartButton.top}px`);
        document.documentElement.style.setProperty('--cart-left', `${cartButton.left}px`);
      }
    };

    updateCartPosition();
    window.addEventListener('resize', updateCartPosition);
    return () => window.removeEventListener('resize', updateCartPosition);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          fullContent += chunk;
          
          if (fullContent.includes('DISCOUNT:') && discount === 0) {
            setDiscount(2); // Apply 2 beer discount
          }

          setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            lastMessage.content = fullContent;
            return newMessages;
          });
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const renderPrice = (price: number) => {
    const discountedPrice = getDiscountedPrice(price);
    return (
      <span className="text-3xl font-bold text-blue-500 flex items-center">
        {price !== discountedPrice && (
          <span className="line-through text-blue-300 text-xl mr-2">
            {price}
          </span>
        )}
        {discountedPrice} <Beer className="ml-1 w-6 h-6" />
      </span>
    );
  };

  const renderCartItemPrice = (price: number) => {
    const discountedPrice = getDiscountedPrice(price);
    return (
      <p className="text-blue-500 flex items-center">
        {price !== discountedPrice && (
          <span className="line-through text-blue-300 text-sm mr-2">
            {price}
          </span>
        )}
        {discountedPrice} <Beer className="inline w-4 h-4 ml-1" />
      </p>
    );
  };

  return (
    <div className="grid grid-rows-[auto_1fr_auto] min-h-screen bg-blue-50 font-[family-name:var(--font-geist-sans)]">
      <header className="bg-blue-500 text-white py-4 shadow-lg sticky top-0 z-10">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl md:text-4xl font-bold flex items-center">
            <Beer className="mr-2" />
            Friends for Cheaper
          </h1>
          <button 
            onClick={() => setIsCartOpen(true)}
            className="cart-button bg-white text-blue-500 hover:bg-blue-50 font-bold py-2 px-4 rounded-full flex items-center transition-all duration-300 hover:scale-105 active:scale-95"
            aria-label="Open cart"
          >
            <ShoppingCart className="mr-2" />
            <span className="hidden sm:inline">Cart</span> ({cart.length})
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <p className="text-xl text-center mb-8 text-blue-600">Where friendship is measured in hops and services!</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div key={service.id} className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl animate-fadeIn">
              <div className="relative">
                <div className="absolute inset-0 shadow-[inset_0_0_50px_rgba(0,0,0,0.5)] pointer-events-none z-10 rounded-t-lg" />
                <Image
                  src={service.image}
                  alt={service.title}
                  width={400}
                  height={200}
                  className="w-full h-48 object-cover border-4 border-white rounded-t-lg"
                />
              </div>
              <div className="p-6">
                <h2 className="text-2xl font-semibold mb-2 text-blue-600">{service.title}</h2>
                <p className="text-blue-500 mb-4">{service.description}</p>
                <div className="flex justify-between items-center">
                  {renderPrice(service.price)}
                  <button 
                    onClick={(event) => addToCart(service, event)}
                    className="bg-blue-400 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-full flex items-center transition-all duration-300 hover:scale-105 active:scale-95"
                  >
                    <ShoppingCart className="mr-2" />
                    Order for a brew!
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <section className="container mx-auto px-4 py-12 bg-white">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-12">How It Works</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <ShoppingCart className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-xl font-bold text-blue-600">1. Choose & Checkout</h3>
            <p className="text-blue-600">
              Browse our services, add them to your cart, and complete the checkout process. 
              Simple as ordering a round of beers!
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-xl font-bold text-blue-600">2. Get Invoice</h3>
            <p className="text-blue-600">
              We'll send you an email with the invoice detailing your services and the 
              exact number of beers needed. No complicated math here!
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Beer className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-xl font-bold text-blue-600">3. Grab the Brews</h3>
            <p className="text-blue-600">
              Head to your favorite store and pick up the agreed-upon beers. 
              Remember: quality matters, just like our services!
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Wrench className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-xl font-bold text-blue-600">4. Service Time</h3>
            <p className="text-blue-600">
              Come over with your brews, and we'll get to work! Whether it's fixing your bike 
              or teaching you code, we've got you covered.
            </p>
          </div>
        </div>

        <div className="mt-12 bg-blue-50 p-6 rounded-lg">
          <h3 className="text-xl font-bold text-blue-600 mb-4 text-center">🍺 Important Notes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <Beer className="w-6 h-6 text-blue-500" />
              </div>
              <p className="text-blue-600">
                All beers must be unopened and of reasonable quality. No one likes warm beer 
                or sketchy brands!
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <MessageSquare className="w-6 h-6 text-blue-500" />
              </div>
              <p className="text-blue-600">
                Communication is key! We'll keep you updated throughout the process via email 
                or chat.
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <Clock className="w-6 h-6 text-blue-500" />
              </div>
              <p className="text-blue-600">
                Services are by appointment only. We'll schedule a time that works for both 
                parties.
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <Shield className="w-6 h-6 text-blue-500" />
              </div>
              <p className="text-blue-600">
                All services come with our "Satisfaction or Double Beer Back" guarantee! 
                (Terms and conditions apply)
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12 bg-blue-50">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-8">Request for Service</h2>
        <div className="max-w-2xl mx-auto">
          <div className="bg-white p-8 rounded-lg shadow-xl">
            <p className="text-blue-600 mb-6 text-center">
              Don't see what you need? Tell us about your project and we'll let you know how many beers it'll cost! 🍺
            </p>
            
            <form className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="name" className="block text-blue-600 font-semibold">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full p-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="block text-blue-600 font-semibold">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full p-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  placeholder="john@example.com"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="service-type" className="block text-blue-600 font-semibold">
                  Type of Service
                </label>
                <select
                  id="service-type"
                  className="w-full p-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white"
                >
                  <option value="">Select a service type</option>
                  <option value="mechanical">Mechanical Work</option>
                  <option value="coding">Programming/Coding</option>
                  <option value="music">Music Related</option>
                  <option value="other">Other (specify below)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="block text-blue-600 font-semibold">
                  Tell us about your project
                </label>
                <textarea
                  id="description"
                  rows={5}
                  className="w-full p-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  placeholder="Describe what you need help with... The more details, the better we can estimate the beer cost! 🍺"
                ></textarea>
              </div>

              <div className="space-y-2">
                <label htmlFor="preferred-time" className="block text-blue-600 font-semibold">
                  Preferred Time Frame
                </label>
                <select
                  id="preferred-time"
                  className="w-full p-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white"
                >
                  <option value="">Select preferred time frame</option>
                  <option value="asap">As soon as possible</option>
                  <option value="this-week">This week</option>
                  <option value="next-week">Next week</option>
                  <option value="this-month">This month</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white font-bold py-3 px-4 rounded-full hover:bg-blue-600 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Submit Request
                </button>
              </div>
            </form>

            <div className="mt-6 text-sm text-blue-500 text-center">
              <p>We'll get back to you within 24 hours with a beer quote! 🍺</p>
              <p className="mt-2">
                For urgent requests, feel free to{" "}
                <button 
                  onClick={() => setIsChatOpen(true)}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  chat with us
                </button>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12 bg-white">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-8">Our Story</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <p className="text-lg text-blue-600">
              Born in a college dorm room, Friends for Cheaper started when a group of engineering students realized they could trade their skills for brews. What began as a simple "I'll fix your bike for a beer" deal quickly evolved into a community of skilled friends helping each other out.
            </p>
            <p className="text-lg text-blue-600">
              Today, we're proud to offer a wide range of services, from mechanical repairs to coding lessons, all priced in the universal currency of friendship: beer! 🍺
            </p>
            <div className="flex gap-4 pt-4">
              <div className="text-center">
                <h3 className="text-3xl font-bold text-blue-500">500+</h3>
                <p className="text-blue-600">Happy Friends</p>
              </div>
              <div className="text-center">
                <h3 className="text-3xl font-bold text-blue-500">1000+</h3>
                <p className="text-blue-600">Services Traded</p>
              </div>
              <div className="text-center">
                <h3 className="text-3xl font-bold text-blue-500">2000+</h3>
                <p className="text-blue-600">Beers Earned</p>
              </div>
            </div>
          </div>
          <div className="relative h-[400px] rounded-lg overflow-hidden shadow-xl">
            <Image
              src="/Friends.png"
              alt="Our workshop"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12 bg-blue-100">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-8">Meet the Founders</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="relative h-64 mb-4 rounded-lg overflow-hidden">
              <Image
                src="/alex.jpg"
                alt="Alex 'Finger Master' Garton"
                fill
                className="object-cover"
              />
            </div>
            <h3 className="text-xl font-bold text-blue-600 mb-2">Alex "Finger Master" Garton</h3>
            <p className="text-blue-500 mb-2">Chief Guitar Officer</p>
            <p className="text-blue-600">
              Guitar virtuoso who trades riffs for sips. Known for teaching power chords 
              with the power of beer. Beer preference: IPA
            </p>
            <div className="mt-4 flex gap-2">
              <Guitar className="w-6 h-6 text-blue-500" />
              <Music className="w-6 h-6 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="relative h-64 mb-4 rounded-lg overflow-hidden">
              <Image
                src="/charles.jpg"
                alt="Charles 'The Man' Rausch"
                fill
                className="object-cover"
              />
            </div>
            <h3 className="text-xl font-bold text-blue-600 mb-2">Charles "The Man" Rausch</h3>
            <p className="text-blue-500 mb-2">Chief Innovation Officer</p>
            <p className="text-blue-600">
              AI researcher who built an algorithm to optimize beer-to-code ratios. 
              Still debugging the hangover prediction model. Beer preference: Sour Ale
            </p>
            <div className="mt-4 flex gap-2">
              <Code className="w-6 h-6 text-blue-500" />
              <Beer className="w-6 h-6 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="relative h-64 mb-4 rounded-lg overflow-hidden">
              <Image
                src="/gavin.jpg"
                alt="Gavin 'Motor' Weber"
                fill
                className="object-cover"
              />
            </div>
            <h3 className="text-xl font-bold text-blue-600 mb-2">Gavin "Motor" Weber</h3>
            <p className="text-blue-500 mb-2">Chief Mechanical Officer</p>
            <p className="text-blue-600">
              Former aerospace engineer who decided fixing bikes for beer was more fun than building rockets. 
              Known for turning rusty bikes into chrome-plated dreams. Beer preference: Stout
            </p>
            <div className="mt-4 flex gap-2">
              <Wrench className="w-6 h-6 text-blue-500" />
              <Car className="w-6 h-6 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="relative h-64 mb-4 rounded-lg overflow-hidden">
              <Image
                src="/aiden.jpg"
                alt="Aiden 'Monkey' Theocheung"
                fill
                className="object-cover"
              />
            </div>
            <h3 className="text-xl font-bold text-blue-600 mb-2">Aiden "Monkey" Theocheung</h3>
            <p className="text-blue-500 mb-2">Chief Problem Solver</p>
            <p className="text-blue-600">
              Former IT support who realized beer fixes more problems than turning it off and on again. 
              Specializes in hardware repairs and beer hardware. Beer preference: Porter
            </p>
            <div className="mt-4 flex gap-2">
              <Wrench className="w-6 h-6 text-blue-500" />
              <Cog className="w-6 h-6 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="relative h-64 mb-4 rounded-lg overflow-hidden">
              <Image
                src="/nate.jpg"
                alt="Nate 'Big Train' Greco"
                fill
                className="object-cover"
              />
            </div>
            <h3 className="text-xl font-bold text-blue-600 mb-2">Nate "Big Train" Greco</h3>
            <p className="text-blue-500 mb-2">Chief Code Officer</p>
            <p className="text-blue-600">
              Once debugged an entire codebase for a six-pack. Claims to dream in JavaScript. 
              Has a pet rubber duck named Boolean. Beer preference: Pale Ale
            </p>
            <div className="mt-4 flex gap-2">
              <Code className="w-6 h-6 text-blue-500" />
              <Cog className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12 bg-blue-50">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-8">What Our Friends Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <div 
              key={review.id} 
              className="bg-white p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 flex items-center justify-center bg-blue-100 rounded-full mr-4">
                  <UserCircle2 
                    className={`w-8 h-8 ${review.image === 'female' ? 'text-pink-400' : 'text-blue-400'}`}
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-600">{review.name}</h3>
                  <p className="text-blue-400 text-sm">{review.service}</p>
                </div>
              </div>
              <div className="flex mb-2">
                {[...Array(review.rating)].map((_, i) => (
                  <Beer 
                    key={i} 
                    className="w-4 h-4 text-blue-400" 
                  />
                ))}
              </div>
              <p className="text-blue-600 italic">"{review.comment}"</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="bg-blue-500 text-white py-4">
        <div className="container mx-auto px-4 text-center">
          <p className="text-lg">Remember: Friends don't let friends pay full price!</p>
          <p className="text-sm mt-2">© 2023 Friends for Cheaper. All rights reserved. Please drink responsibly.</p>
          <div className="flex gap-6 flex-wrap items-center justify-center mt-4">
            <a
              className="flex items-center gap-2 hover:underline hover:underline-offset-4"
              href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/file.svg"
                alt="File icon"
                width={16}
                height={16}
              />
              Learn
            </a>
            <a
              className="flex items-center gap-2 hover:underline hover:underline-offset-4"
              href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/window.svg"
                alt="Window icon"
                width={16}
                height={16}
              />
              Examples
            </a>
            <a
              className="flex items-center gap-2 hover:underline hover:underline-offset-4"
              href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/globe.svg"
                alt="Globe icon"
                width={16}
                height={16}
              />
              Go to nextjs.org →
            </a>
          </div>
        </div>
      </footer>

      {isCartOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end animate-fadeIn">
          <div className="bg-white w-full max-w-md h-full flex flex-col animate-slideIn">
            <div className="p-6 border-b border-blue-50">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-blue-600">Your Cart</h2>
                <button 
                  onClick={() => setIsCartOpen(false)} 
                  className="text-blue-400 hover:text-blue-500 p-2 hover:bg-blue-50 rounded-full transition-colors"
                  aria-label="Close cart"
                >
                  <X />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <ShoppingCart className="w-16 h-16 text-blue-200" />
                  <p className="text-blue-600">Your cart is empty. Add some brews!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div 
                      key={item.id} 
                      className="flex justify-between items-center p-3 bg-blue-50 rounded-lg transition-all duration-300 hover:bg-blue-100 animate-fadeIn"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 relative rounded-full overflow-hidden bg-blue-100">
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold text-blue-600">{item.title}</h3>
                          {renderCartItemPrice(item.price)}
                        </div>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id)} 
                        className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition-all duration-300"
                        aria-label={`Remove ${item.title} from cart`}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-blue-100 p-6 bg-white">
                <div className="mb-4 flex justify-between items-center">
                  <span className="text-blue-600">
                    Total
                    {discount > 0 && (
                      <span className="text-sm ml-2 text-green-500">
                        (Charles discount applied!)
                      </span>
                    )}
                  </span>
                  <span className="text-2xl font-bold text-blue-800 flex items-center">
                    {totalBeers} <Beer className="ml-2 w-6 h-6" />
                  </span>
                </div>
                <button className="w-full bg-blue-400 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center">
                  <ShoppingCart className="mr-2 w-5 h-5" />
                  Checkout and Brew!
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {flyingItems.map(item => (
        <div
          key={item.id}
          className="fixed z-50 pointer-events-none"
          style={{
            top: item.top,
            left: item.left,
            animation: `moveToCart 1s cubic-bezier(0.4, 0, 0.2, 1) forwards`
          }}
        >
          <style jsx>{`
            @keyframes moveToCart {
              0% {
                transform: scale(1) rotate(0deg);
                opacity: 1;
              }
              50% {
                transform: translate(
                  ${(item.targetLeft - item.left) / 2}px,
                  ${(item.targetTop - item.top) / 2}px
                ) scale(1.5) rotate(180deg);
                opacity: 0.8;
              }
              100% {
                transform: translate(
                  ${item.targetLeft - item.left}px,
                  ${item.targetTop - item.top}px
                ) scale(0) rotate(360deg);
                opacity: 0;
              }
            }
          `}</style>
          <Beer className="w-6 h-6 text-blue-600" />
        </div>
      ))}

      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-4 right-4 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-all duration-300 z-40"
        aria-label="Open chat"
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {isChatOpen && (
        <div className="fixed bottom-20 right-4 w-96 h-[500px] bg-white rounded-lg shadow-xl z-40 flex flex-col">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-bold text-blue-600">Chat with us</h3>
            <button
              onClick={() => setIsChatOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-blue-500 text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 p-3 rounded-lg rounded-bl-none">
                  Typing...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-black"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading}
                className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}