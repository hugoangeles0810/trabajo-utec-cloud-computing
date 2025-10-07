'use client';

import { useState, useRef, useEffect } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { cn } from '@/lib/utils';

interface SearchSuggestion {
  id: string;
  title: string;
  type: 'product' | 'category' | 'brand';
  image?: string;
}

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
  suggestions?: SearchSuggestion[];
  isLoading?: boolean;
}

export function SearchBar({
  placeholder = 'Buscar productos, marcas, categorías...',
  className,
  onSearch,
  suggestions = [],
  isLoading = false,
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Mock suggestions for demonstration
  const mockSuggestions: SearchSuggestion[] = [
    { id: '1', title: 'PlayStation 5', type: 'product' },
    { id: '2', title: 'Xbox Series X', type: 'product' },
    { id: '3', title: 'Nintendo Switch', type: 'product' },
    { id: '4', title: 'Consolas', type: 'category' },
    { id: '5', title: 'Sony', type: 'brand' },
    { id: '6', title: 'Microsoft', type: 'brand' },
    { id: '7', title: 'Gaming Headsets', type: 'category' },
    { id: '8', title: 'SteelSeries Arctis', type: 'product' },
  ];

  const displaySuggestions = suggestions.length > 0 ? suggestions : mockSuggestions;
  const filteredSuggestions = displaySuggestions.filter(suggestion =>
    suggestion.title.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 8);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowSuggestions(value.length > 0);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || filteredSuggestions.length === 0) {
      if (e.key === 'Enter') {
        handleSearch();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionClick(filteredSuggestions[selectedIndex]);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.title);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    onSearch?.(suggestion.title);
  };

  const handleSearch = () => {
    if (query.trim()) {
      onSearch?.(query.trim());
      setShowSuggestions(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setShowSuggestions(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const getSuggestionIcon = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'product':
        return '🛍️';
      case 'category':
        return '📁';
      case 'brand':
        return '🏷️';
      default:
        return '🔍';
    }
  };

  const getSuggestionTypeLabel = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'product':
        return 'Producto';
      case 'category':
        return 'Categoría';
      case 'brand':
        return 'Marca';
      default:
        return '';
    }
  };

  return (
    <div className={cn('relative', className)}>
      <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="relative">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={handleInputChange}
            onFocus={() => {
              setIsFocused(true);
              if (query.length > 0) {
                setShowSuggestions(true);
              }
            }}
            onKeyDown={handleKeyDown}
            className={cn(
              'pl-10 pr-12 py-3 border-2 transition-all duration-200',
              isFocused
                ? 'border-primary-500 shadow-lg'
                : 'border-gray-300 hover:border-gray-400'
            )}
          />
          
          {/* Clear button */}
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}
          
          {/* Search button */}
          <Button
            type="submit"
            disabled={!query.trim() || isLoading}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 px-4 py-2"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              'Buscar'
            )}
          </Button>
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
        >
          <div className="py-2">
            {filteredSuggestions.map((suggestion, index) => (
              <button
                key={suggestion.id}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className={cn(
                  'w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center space-x-3',
                  selectedIndex === index && 'bg-primary-50 border-r-2 border-primary-500'
                )}
              >
                <span className="text-lg">{getSuggestionIcon(suggestion.type)}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {suggestion.title}
                  </div>
                  <div className="text-sm text-gray-500">
                    {getSuggestionTypeLabel(suggestion.type)}
                  </div>
                </div>
              </button>
            ))}
          </div>
          
          {/* Footer with search tip */}
          <div className="border-t border-gray-100 px-4 py-2 bg-gray-50">
            <div className="text-xs text-gray-500">
              Presiona <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">↵</kbd> para buscar
            </div>
          </div>
        </div>
      )}

      {/* No results message */}
      {showSuggestions && query.length > 0 && filteredSuggestions.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="px-4 py-3 text-center text-gray-500">
            <div className="text-sm">No se encontraron resultados para "{query}"</div>
            <div className="text-xs mt-1">Intenta con otros términos de búsqueda</div>
          </div>
        </div>
      )}
    </div>
  );
}
