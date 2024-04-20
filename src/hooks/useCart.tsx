import { Product } from '@/types/product';
import { useEffect, useState } from 'react';

const saveProducts = (products: Product[]) => {
  localStorage.setItem('products', JSON.stringify(products));
};

export function useCart() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState({});

  useEffect(() => {
    try {
      const storedProducts = localStorage.getItem('prducts');
      if (!storedProducts) {
        setProducts([]);
      } else {
        const parseProducts = JSON.parse(storedProducts);
        setProducts(parseProducts);
      }
    } catch (e) {
      setError({
        error: e,
        message:
          'что-то пошло не так при возвращении состояния корзины из localStorage',
      });
    }
  }, []);

  const totalPrice = () => {
    return products.reduce(
      (total, product) => (total += Number(product.price)),
      0
    );
  };

  const addToCart = (product: Product) => {
    const updatedProducts = [...products, product];
    setProducts(updatedProducts);
    saveProducts(updatedProducts);
  };

  const removeFromCart = (item: Product) => {
    const updatedProducts = products.filter(
      (product) => product.title === item.title
    );
    setProducts(updatedProducts);
    saveProducts(updatedProducts);
  };

  const clearCart = () => {
    setProducts([]);
    saveProducts([]);
  };

  return {
    products,
    totalPrice,
    addToCart,
    removeFromCart,
    clearCart,
    error,
  };
}
