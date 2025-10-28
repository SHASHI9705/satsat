import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Laptop, 
  BookOpen, 
  Shirt, 
  Armchair, 
  Code, 
  GraduationCap,
  Headphones,
  Calculator
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

const categories = [
  {
    id: 'electronics',
    name: 'Electronics',
    icon: Laptop,
    count: 284,
    gradient: 'bg-brand',
    items:['Laptops', 'Phones', 'Accessories', 'Smartwatches', 'Headphones']

  },
  {
    id: 'books',
    name: 'Books & Academic',
    icon: BookOpen,
    count: 512,
    gradient: 'bg-brand',
    items:['Textbooks', 'Study Guides', 'Notebooks', 'Reference Books',]

  },
  {
    id: 'fashion',
    name: 'Fashion & Style',
    icon: Shirt,
    count: 196,
    gradient: 'bg-brand',
    items: ['Clothing', 'Shoes', 'Accessories', 'Bags', 'Watches', 'Jackets']
  },
  {
    id: 'furniture',
    name: 'Furniture & Living',
    icon: Armchair,
    count: 147,
    gradient: 'bg-brand',
    items: ['Desks', 'Chairs', 'Storage', 'Shelves', 'Tables', 'Cabinets']
  },
  {
    id: 'software',
    name: 'Software & Digital',
    icon: Code,
    count: 89,
    gradient: 'bg-brand',
    items: ['Licenses', 'Tools', 'Resources', 'Templates', 'Plugins', 'APIs']
  },
  {
    id: 'tutoring',
    name: 'Tutoring & Services',
    icon: GraduationCap,
    count: 156,
    gradient: 'bg-brand',
    items: ['Math', 'Science', 'Languages',  'Geography', 'Computer Science']
  },
  {
    id: 'audio',
    name: 'Audio & Music',
    icon: Headphones,
    count: 73,
    gradient: 'bg-brand',
    items: ['Headphones', 'Speakers', 'Instruments', 'Microphones']
  },
  {
    id: 'supplies',
    name: 'Study Supplies',
    icon: Calculator,
    count: 201,
    gradient: 'bg-brand',
    items: ['Calculators', 'Stationery', 'Tech', 'Gadgets', 'Printers', 'Software']
  }
];

const categoriesList = [
  'Electronics',
  'Books & Academic',
  'Fashion & Style',
  'Furniture & Living',
  'Software & Digital',
  'Tutoring & Services',
  'Audio & Music',
  'Study Supplies'
];

interface CategoryGridProps {
  onCategorySelect: (categoryId: string) => void;
}

export function CategoryGrid({ onCategorySelect }: CategoryGridProps) {
  const router = useRouter();

  const handleCategoryClick = (categoryId: string) => {
    const categoriesList = [
      'Clothes',
      'Shoes',
      'Books',
      'Tech Products',
      'Electronics',
      'Instruments'
    ];

    const matchedCategory = categoriesList.find(
      (category) => category.toLowerCase() === categoryId.toLowerCase()
    );

    if (matchedCategory) {
      router.push(`/allitems?category=${matchedCategory}`);
    } else {
      router.push(`/allitems?category=Others`);
    }
  };

  return (
    <section className="hidden sm:block py-8 bg-gradient-to-br from-orange-120 to-red-120 dark:from-orange-950/10 dark:to-red-950/10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Browse Categories</h2>
          <p className="text-muted-foreground">Find exactly what you need for campus life</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category) => {
            const IconComponent = category.icon;
            const [randomLabel, setRandomLabel] = useState('');

            useEffect(() => {
              const labels = ['New', 'Special', 'Recent'];
              setRandomLabel(labels[Math.floor(Math.random() * labels.length)]);
            }, []); // Generate random label only once on the client

            return (
              <Card 
                key={category.id}
                className="p-6 border border-black hover:shadow-xl transition-all duration-300 cursor-pointer group hover:scale-105"
                onClick={() => handleCategoryClick(category.name)}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${category.gradient} group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <Badge variant="secondary" className="text-xs border border-black rounded">
                      {randomLabel} {/* Use state for random label */}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    <div className="flex flex-wrap gap-1">
                      {category.items.map((item, index) => (
                        <span 
                          key={index}
                          className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full"
                        >
                          {item.charAt(0).toUpperCase() + item.slice(1)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}